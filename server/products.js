// products.js
// Simple products database handler using the same sqlite connection pattern
const db = require('./database.js');

// Create products table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subtitle TEXT,
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
// Create FTS virtual table and populate it from products
db.run(`CREATE VIRTUAL TABLE IF NOT EXISTS product_fts USING fts5(title, subtitle, description);`, (err) => {
  if (err) {
    console.log('FTS5 virtual table could not be created (FTS5 may be unavailable):', err.message);
    return;
  }

  // Clear and repopulate the FTS table to sync current products
  db.serialize(() => {
    db.run('DELETE FROM product_fts', () => {
      db.run(`INSERT INTO product_fts(rowid, title, subtitle, description) SELECT id, title, subtitle, description FROM products`, (err) => {
        if (err) {
          console.log('Could not populate product_fts:', err.message);
        } else {
          console.log('product_fts populated from products table.');
        }
      });
    });

    // Create triggers to keep product_fts in sync with products
    db.run('DROP TRIGGER IF EXISTS products_ai', () => {
      db.run(`CREATE TRIGGER products_ai AFTER INSERT ON products BEGIN
        INSERT INTO product_fts(rowid, title, subtitle, description) VALUES (new.id, new.title, new.subtitle, new.description);
      END;`);
    });

    db.run('DROP TRIGGER IF EXISTS products_au', () => {
      db.run(`CREATE TRIGGER products_au AFTER UPDATE ON products BEGIN
        DELETE FROM product_fts WHERE rowid = old.id;
        INSERT INTO product_fts(rowid, title, subtitle, description) VALUES (new.id, new.title, new.subtitle, new.description);
      END;`);
    });

    db.run('DROP TRIGGER IF EXISTS products_ad', () => {
      db.run(`CREATE TRIGGER products_ad AFTER DELETE ON products BEGIN
        DELETE FROM product_fts WHERE rowid = old.id;
      END;`);
    });
  });
});

// Insert a new product
function createProduct(product, cb) {
  const { title, subtitle, category, description, price, seller_id, location } = product;
  const sql = `INSERT INTO products (title, subtitle, category, description, price, seller_id, location, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [title, subtitle, category, description, price || 0, seller_id || null, location || 'UFSM', new Date().toISOString()];
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
      const sql = `SELECT * FROM products WHERE title LIKE ? OR subtitle LIKE ? OR description LIKE ? ORDER BY created_at DESC LIMIT ?`;
      const params = [pattern, pattern, pattern, limit];
      return db.all(sql, params, cb);
    }

    if (rows && rows.length > 0) return cb(null, rows);

    // Fallback: simple LIKE-based search
    const pattern = `%${q}%`;
    const sql = `SELECT * FROM products WHERE title LIKE ? OR subtitle LIKE ? OR description LIKE ? ORDER BY created_at DESC LIMIT ?`;
    const params = [pattern, pattern, pattern, limit];
    db.all(sql, params, cb);
  });
}

module.exports = {
  createProduct,
  getProductById,
  searchProducts,
};
