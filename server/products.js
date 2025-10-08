// products.js
// Simple products database handler using the same sqlite connection pattern
const db = require('./database.js');

// Create products table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT,
    description TEXT,
    price REAL DEFAULT 0,
    seller_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location TEXT CHECK(location IN ('UFSM', 'Em casa') DEFAULT 'UFSM'),
)`, (err) => {
    if (err) {
        console.log("Erro ao criar tabela 'products'", err.message);
    } else {
        console.log("Tabela 'products' criada ou já existente.");
    }
});

// Insert a new product
function createProduct(product, cb) {
  const { title, subtitle, description, price, seller_id } = product;
  const sql = `INSERT INTO products (title, subtitle, description, price, seller_id) VALUES (?, ?, ?, ?, ?)`;
  const params = [title, subtitle, description, price || 0, seller_id || null];
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
  const pattern = `%${q}%`;
  const sql = `SELECT * FROM products WHERE title LIKE ? OR subtitle LIKE ? OR description LIKE ? ORDER BY created_at DESC LIMIT ?`;
  const params = [pattern, pattern, pattern, limit];
  db.all(sql, params, cb);
}

module.exports = {
  createProduct,
  getProductById,
  searchProducts,
};
