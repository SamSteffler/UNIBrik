// products.js
// Simple products database handler using the same sqlite connection pattern
const db = require('./database.js');

// Create products table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  condition TEXT,
  category TEXT,
  description TEXT,
  price REAL DEFAULT 0,
  seller_id INTEGER,
  location TEXT DEFAULT 'UFSM' CHECK(location IN ('UFSM', 'Em casa')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) {
        console.log("Erro ao criar tabela 'products'", err.message);
    } else {
        console.log("Tabela 'products' criada ou já existente.");
    }
});

// --- FTS5 setup (virtual table for full-text search) ---
// If the FTS schema changed (for example you renamed 'subtitle' -> 'condition'),
// ensure the base table has the expected columns before creating/populating the FTS table.
function setupFts() {
  // Drop old FTS table if it exists (this is safe for a local dev DB)
  db.run('DROP TABLE IF EXISTS product_fts', (dropErr) => {
    if (dropErr) {
      console.log('Could not drop existing product_fts (continuing):', dropErr.message);
    }

    // Create FTS virtual table with the desired columns
    db.run(`CREATE VIRTUAL TABLE IF NOT EXISTS product_fts USING fts5(title, condition, description);`, (err) => {
      if (err) {
        console.log('FTS5 virtual table could not be created (FTS5 may be unavailable):', err.message);
        return;
      }

      // Clear and repopulate the FTS table to sync current products
      db.run('DELETE FROM product_fts', () => {
        db.run(`INSERT INTO product_fts(rowid, title, condition, description) SELECT id, title, condition, description FROM products`, (err) => {
          if (err) {
            console.log('Could not populate product_fts:', err.message);
          } else {
            console.log('product_fts populated from products table.');
          }
        });
      });

      // Recreate triggers to keep product_fts in sync with products
      const triggersSql = `
        DROP TRIGGER IF EXISTS products_ai;
        DROP TRIGGER IF EXISTS products_au;
        DROP TRIGGER IF EXISTS products_ad;

        CREATE TRIGGER products_ai AFTER INSERT ON products BEGIN
          INSERT INTO product_fts(rowid, title, condition, description) VALUES (new.id, new.title, new.condition, new.description);
        END;

        CREATE TRIGGER products_au AFTER UPDATE ON products BEGIN
          DELETE FROM product_fts WHERE rowid = old.id;
          INSERT INTO product_fts(rowid, title, condition, description) VALUES (new.id, new.title, new.condition, new.description);
        END;

        CREATE TRIGGER products_ad AFTER DELETE ON products BEGIN
          DELETE FROM product_fts WHERE rowid = old.id;
        END;
      `;

      db.exec(triggersSql, (trigErr) => {
        if (trigErr) {
          console.log('Could not recreate triggers:', trigErr.message);
        } else {
          console.log('Triggers for product_fts recreated.');
        }
      });
    });
  });
}

// Check products table columns and add 'condition' if missing. If 'subtitle' exists, copy values.
db.serialize(() => {
  db.all("PRAGMA table_info(products)", (err, cols) => {
    if (err) {
      console.log('Could not inspect products table columns:', err.message);
      // still attempt to setup FTS (it may fail)
      return setupFts();
    }

    const names = (cols || []).map(c => c.name);
    if (!names.includes('condition')) {
      console.log("Column 'condition' missing — adding it to products table.");
      db.run("ALTER TABLE products ADD COLUMN condition TEXT", (addErr) => {
        if (addErr) {
          console.log('Could not add condition column:', addErr.message);
          return setupFts();
        }

        // If an older 'subtitle' column exists, copy its values into 'condition'
        if (names.includes('subtitle')) {
          db.run("UPDATE products SET condition = subtitle WHERE condition IS NULL OR condition = ''", (updErr) => {
            if (updErr) console.log('Could not copy subtitle -> condition:', updErr.message);
            setupFts();
          });
        } else {
          setupFts();
        }
      });
    } else {
      // condition exists, proceed with FTS setup
      setupFts();
    }
  });
});

// Insert a new product
function createProduct(product, cb) {
  const { title, condition, category, description, price, seller_id, location } = product;
  const sql = `INSERT INTO products (title, condition, category, description, price, seller_id, location, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [title, condition, category, description, price || 0, seller_id || null, location || 'UFSM', new Date().toISOString()];
  db.run(sql, params, function (err) {
    if (err) return cb(err);
    db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err, row) => cb(err, row));
  });
}

// Get product by id
function getProductById(id, cb) {
  db.get('SELECT * FROM products WHERE id = ?', [id], cb);
}

// Basic search (simple LIKE-based fallback). For better results, use full-text or external engine.
function searchProducts(q, limit = 20, cb) {
  if (!q || q.trim() === '') {
    return db.all('SELECT * FROM products ORDER BY created_at DESC LIMIT ?', [limit], cb);
  }

  // Build a prefix-style FTS query (controller -> controller*) to increase recall
  const tokens = q.split(/\s+/).map(t => t.replace(/[^\w]/g, '')).filter(Boolean).map(t => t + '*').join(' ');

  const ftsSql = `SELECT p.* FROM product_fts f JOIN products p ON p.id = f.rowid WHERE f MATCH ? LIMIT ?`;
  db.all(ftsSql, [tokens, limit], (err, rows) => {
    if (err) {
      // Fallback to LIKE search if FTS isn't available or errors
      const pattern = `%${q}%`;
      const sql = `SELECT * FROM products WHERE title LIKE ? OR condition LIKE ? OR description LIKE ? ORDER BY created_at DESC LIMIT ?`;
      const params = [pattern, pattern, pattern, limit];
      return db.all(sql, params, cb);
    }

    if (rows && rows.length > 0) return cb(null, rows);

    // Fallback: simple LIKE-based search
    const pattern = `%${q}%`;
    const sql = `SELECT * FROM products WHERE title LIKE ? OR condition LIKE ? OR description LIKE ? ORDER BY created_at DESC LIMIT ?`;
    const params = [pattern, pattern, pattern, limit];
    db.all(sql, params, cb);
  });
}

module.exports = {
  createProduct,
  getProductById,
  searchProducts,
  // Return products for a given seller
  getProductsBySeller: function(seller_id, cb) {
    db.all('SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC', [seller_id], cb);
  }
};
