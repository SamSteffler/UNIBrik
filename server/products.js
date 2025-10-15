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
  location TEXT DEFAULT 'UFSM' CHECK(location IN ('UFSM', 'Em casa', 'A combinar')),
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

// --- Favorites helpers ---
function ensureFavoritesTable() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    )`, (err) => {
      if (err) {
        console.log('Could not create favorites table:', err.message);
      } else {
        console.log("Tabela 'favorites' criada ou já existente.");
      }
    });
    db.run(`CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id)`, (err) => {
      if (err) console.log('Could not create index on favorites(user_id):', err.message);
    });
    db.run(`CREATE INDEX IF NOT EXISTS idx_favorites_product ON favorites(product_id)`, (err) => {
      if (err) console.log('Could not create index on favorites(product_id):', err.message);
    });
  });
}

// idempotent create
function createFavorite(user_id, product_id, cb) {
  const sql = `INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)`;
  db.run(sql, [user_id, product_id], function(err) {
    if (err) return cb(err);
    // check whether row exists (either newly inserted or existed)
    db.get('SELECT 1 FROM favorites WHERE user_id = ? AND product_id = ?', [user_id, product_id], (err, row) => {
      if (err) return cb(err);
      cb(null, !!row);
    });
  });
}

function deleteFavorite(user_id, product_id, cb) {
  db.run('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [user_id, product_id], function(err) {
    if (err) return cb(err);
    cb(null, { deleted: this.changes });
  });
}

function isFavorited(user_id, product_id, cb) {
  db.get('SELECT 1 FROM favorites WHERE user_id = ? AND product_id = ? LIMIT 1', [user_id, product_id], (err, row) => {
    if (err) return cb(err);
    cb(null, !!row);
  });
}

function getFavoritesByUser(user_id, limit = 50, offset = 0, cb) {
  const sql = `SELECT p.* FROM favorites f JOIN products p ON p.id = f.product_id WHERE f.user_id = ? ORDER BY f.created_at DESC LIMIT ? OFFSET ?`;
  db.all(sql, [user_id, limit, offset], (err, rows) => {
    if (err) return cb(err);
    if (!rows || rows.length === 0) return cb(null, rows);
    let remaining = rows.length; let firstErr = null;
    rows.forEach(r => {
      getImages(r.id, (gErr, images) => {
        if (gErr && !firstErr) firstErr = gErr;
        r.images = images || [];
        remaining--;
        if (remaining === 0) cb(firstErr, rows);
      });
    });
  });
}

// --- Images helpers ---
// We'll store image paths in a simple images table linked to products
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.log('Could not create product_images table:', err.message);
    } else {
      console.log("Tabela 'product_images' criada ou já existente.");
    }
  });
});

function addImages(product_id, paths, cb) {
  if (!paths || paths.length === 0) return cb(null);
  const placeholders = paths.map(() => '(?, ?)').join(',');
  // We'll insert one-by-one to keep it simple
  let done = 0; let firstErr = null;
  paths.forEach(p => {
    db.run('INSERT INTO product_images (product_id, path) VALUES (?, ?)', [product_id, p], function(err) {
      if (err && !firstErr) firstErr = err;
      done++;
      if (done === paths.length) cb(firstErr);
    });
  });
}

function getImages(product_id, cb) {
  db.all('SELECT path FROM product_images WHERE product_id = ? ORDER BY created_at ASC', [product_id], (err, rows) => {
    if (err) return cb(err);
    cb(null, (rows || []).map(r => r.path));
  });
}

function removeImage(product_id, path, cb) {
  db.run('DELETE FROM product_images WHERE product_id = ? AND path = ?', [product_id, path], function(err) {
    if (err) return cb(err);
    cb(null, { deleted: this.changes });
  });
}


// Get product by id, including seller name from users table when available
function getProductById(id, cb) {
  const sql = `SELECT p.*, u.name AS seller_name, u.public_id AS seller_public_id
               FROM products p
               LEFT JOIN users u ON u.id = p.seller_id
               WHERE p.id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err || !row) return cb(err, row);
    // attach images
    getImages(row.id, (imgErr, images) => {
      if (!imgErr) row.images = images || [];
      cb(null, row);
    });
  });
}

// Basic search (simple LIKE-based fallback). For better results, use full-text or external engine.
function searchProducts(q, limit = 20, cb) {
  const finishWithRows = (err, rows) => {
    if (err) return cb(err);
    // attach images to each row
    if (!rows || rows.length === 0) return cb(null, rows);
    let remaining = rows.length; let firstErr = null;
    rows.forEach(r => {
      getImages(r.id, (gErr, images) => {
        if (gErr && !firstErr) firstErr = gErr;
        r.images = images || [];
        remaining--;
        if (remaining === 0) cb(firstErr, rows);
      });
    });
  };

  if (!q || q.trim() === '') {
    return db.all('SELECT * FROM products ORDER BY created_at DESC LIMIT ?', [limit], finishWithRows);
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
      return db.all(sql, params, finishWithRows);
    }

    if (rows && rows.length > 0) return finishWithRows(null, rows);

    // Fallback: simple LIKE-based search
    const pattern = `%${q}%`;
    const sql = `SELECT * FROM products WHERE title LIKE ? OR condition LIKE ? OR description LIKE ? ORDER BY created_at DESC LIMIT ?`;
    const params = [pattern, pattern, pattern, limit];
    db.all(sql, params, finishWithRows);
  });
}

module.exports = {
  createProduct,
  getProductById,
  searchProducts,
  // Return products for a given seller
  getProductsBySeller: function(seller_id, cb) {
    db.all('SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC', [seller_id], (err, rows) => {
      if (err) return cb(err);
      if (!rows || rows.length === 0) return cb(null, rows);
      let remaining = rows.length; let firstErr = null;
      rows.forEach(r => {
        getImages(r.id, (gErr, images) => {
          if (gErr && !firstErr) firstErr = gErr;
          r.images = images || [];
          remaining--;
          if (remaining === 0) cb(firstErr, rows);
        });
      });
    });
  }
};

// Return free products (price == 0)
module.exports.getFreeProducts = function(limit = 12, cb) {
  db.all('SELECT * FROM products WHERE price = 0 ORDER BY created_at DESC LIMIT ?', [limit], (err, rows) => {
    if (err) return cb(err);
    if (!rows || rows.length === 0) return cb(null, rows);
    let remaining = rows.length; let firstErr = null;
    rows.forEach(r => {
      getImages(r.id, (gErr, images) => {
        if (gErr && !firstErr) firstErr = gErr;
        r.images = images || [];
        remaining--;
        if (remaining === 0) cb(firstErr, rows);
      });
    });
  });
};

// Update a product by id
module.exports.updateProduct = function(id, data, cb) {
  const { title, condition, category, description, price, location } = data;
  const sql = `UPDATE products SET title = ?, condition = ?, category = ?, description = ?, price = ?, location = ? WHERE id = ?`;
  const params = [title, condition, category, description, price, location, id];
  db.run(sql, params, function(err) {
    if (err) return cb(err);
    db.get('SELECT * FROM products WHERE id = ?', [id], cb);
  });
};

// Delete a product by id
module.exports.deleteProduct = function(id, cb) {
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) return cb(err);
    // rows affected: this.changes
    cb(null, { deleted: this.changes });
  });
};

// Favorites exports
module.exports.createFavorite = createFavorite;
module.exports.deleteFavorite = deleteFavorite;
module.exports.isFavorited = isFavorited;
module.exports.getFavoritesByUser = getFavoritesByUser;

// Export image helpers
module.exports.addImages = addImages;
module.exports.getImages = getImages;
module.exports.removeImage = removeImage;

// Ensure favorites table exists on startup (after products table is ready)
db.serialize(() => {
  ensureFavoritesTable();
});
