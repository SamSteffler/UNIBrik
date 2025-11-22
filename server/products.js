/*
------------- products.js -------------
Script para gerenciar produtos no banco de dados

Uso: node products.js
*/


const db = require('./database.js');

// Cria tabela de produtos se nao existir
db.run(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  condition TEXT,
  category TEXT,
  description TEXT,
  price REAL DEFAULT 0,
  seller_id INTEGER,
  location TEXT DEFAULT 'UFSM' CHECK(location IN ('UFSM', 'Em casa', 'A combinar')),
  approved INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'allowed', 'blocked')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) {
        console.log("Erro ao criar tabela 'products'", err.message);
    } else {
        console.log("Tabela 'products' criada ou já existente.");
    }
});

// --- FTS5 setup (tabela para pesquisa por texto) ---
// Funcao para criar e popular a tabela FTS5
// Garante que a tabela FTS5 esteja sincronizada com a tabela products caso haja alteracoes
function setupFts() {
  // Drop table se ela ja existir
  db.run('DROP TABLE IF EXISTS product_fts', (dropErr) => {
    if (dropErr) {
      console.log('Could not drop existing product_fts (continuing):', dropErr.message);
    }

    // Cria tabela virtual FTS
    db.run(`CREATE VIRTUAL TABLE IF NOT EXISTS product_fts USING fts5(title, condition, description);`, (err) => {
      if (err) {
        console.log('FTS5 virtual table could not be created (FTS5 may be unavailable):', err.message);
        return;
      }

      // Limpa e popula a tabela FTS com dados existentes
      db.run('DELETE FROM product_fts', () => {
        db.run(`INSERT INTO product_fts(rowid, title, condition, description) SELECT id, title, condition, description FROM products`, (err) => {
          if (err) {
            console.log('Could not populate product_fts:', err.message);
          } else {
            console.log('product_fts populated from products table.');
          }
        });
      });

      // Recria gatilhos para manter FTS sincronizado
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

// Verifica colunas da tabela products e adiciona 'condition' se faltar - se 'subtitle' existir, copia valores
db.serialize(() => {
  db.all("PRAGMA table_info(products)", (err, cols) => {
    if (err) {
      console.log('Could not inspect products table columns:', err.message);
      // tenta criar FTS mesmo assim
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

        // Se 'subtitle' existir, copia valores para 'condition'
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
      // Procede para configurar FTS
      setupFts();
    }
  });
});

// Insere um novo produto
function createProduct(product, cb) {
  const { title, condition, category, description, price, seller_id, location, approved, status } = product;
  // Valores padrao
  const statusValue = status || 'pending';
  const approvedFlag = approved === undefined ? 1 : (approved ? 1 : 0);
  const sql = `INSERT INTO products (title, condition, category, description, price, seller_id, location, approved, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [title, condition, category, description, price || 0, seller_id || null, location || 'UFSM', approvedFlag, statusValue, new Date().toISOString()];
  db.run(sql, params, function (err) {
    if (err) return cb(err);
    db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err, row) => cb(err, row));
  });
}

// --- Favorites helpers ---
// Cria tabela de favoritos se nao existir
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
    // verifica se coluna ja existia
    db.get('SELECT 1 FROM favorites WHERE user_id = ? AND product_id = ?', [user_id, product_id], (err, row) => {
      if (err) return cb(err);
      cb(null, !!row);
    });
  });
}

// Apaga favorito
function deleteFavorite(user_id, product_id, cb) {
  db.run('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [user_id, product_id], function(err) {
    if (err) return cb(err);
    cb(null, { deleted: this.changes });
  });
}

// Verifica se um produto esta favoritado por um usuario
function isFavorited(user_id, product_id, cb) {
  db.get('SELECT 1 FROM favorites WHERE user_id = ? AND product_id = ? LIMIT 1', [user_id, product_id], (err, row) => {
    if (err) return cb(err);
    cb(null, !!row);
  });
}

// Retorna lista de produtos favoritados por um usuario
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
// Cria tabela de imagens de produtos se nao existir
// Cada imagem esta associada a um produto via product_id
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


// Adiciona imagens a um produto
function addImages(product_id, paths, cb) {
  if (!paths || paths.length === 0) return cb(null);
  const placeholders = paths.map(() => '(?, ?)').join(',');
  
  let done = 0; let firstErr = null;
  paths.forEach(p => {
    db.run('INSERT INTO product_images (product_id, path) VALUES (?, ?)', [product_id, p], function(err) {
      if (err && !firstErr) firstErr = err;
      done++;
      if (done === paths.length) cb(firstErr);
    });
  });
}

// Retorna imagens associadas a um produto
function getImages(product_id, cb) {
  db.all('SELECT path FROM product_images WHERE product_id = ? ORDER BY created_at ASC', [product_id], (err, rows) => {
    if (err) return cb(err);
    cb(null, (rows || []).map(r => r.path));
  });
}

// Remove uma imagem de um produto
function removeImage(product_id, path, cb) {
  db.run('DELETE FROM product_images WHERE product_id = ? AND path = ?', [product_id, path], function(err) {
    if (err) return cb(err);
    cb(null, { deleted: this.changes });
  });
}

// Retorna um produto por id
function getProductById(id, cb) {
  const sql = `SELECT p.*, u.name AS seller_name, u.public_id AS seller_public_id
               FROM products p
               LEFT JOIN users u ON u.id = p.seller_id
               WHERE p.id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err || !row) return cb(err, row);
    // Imagens
    getImages(row.id, (imgErr, images) => {
      if (!imgErr) row.images = images || [];
      cb(null, row);
    });
  });
}

// Pesquisa com filtros avancados
function searchProductsWithFilters(filters, cb) {
  const finishWithRows = (err, rows) => {
    if (err) return cb(err);
    
    // imagens
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

  // Query base dinamica
  let sql = 'SELECT * FROM products WHERE 1=1';
  let params = [];

  // Pesquisa por texto
  if (filters.q && filters.q.trim() !== '') {
    const pattern = `%${filters.q}%`;
    sql += ' AND (title LIKE ? OR condition LIKE ? OR description LIKE ?)';
    params.push(pattern, pattern, pattern);
  }

  // Filtros de preco
  if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice > 0) {
    sql += ' AND price >= ?';
    params.push(filters.minPrice);
  }
  if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice < 5000) {
    sql += ' AND price <= ?';
    params.push(filters.maxPrice);
  }

  // Filtros de categoria
  if (filters.selectedCategories && filters.selectedCategories.length > 0) {
    const placeholders = filters.selectedCategories.map(() => '?').join(',');
    sql += ` AND category IN (${placeholders})`;
    params.push(...filters.selectedCategories);
  }

  // Filtros de localizacao
  if (filters.selectedLocations && filters.selectedLocations.length > 0) {
    const locationMap = {
      'Retirada na UFSM': 'UFSM',
      'Retirada em casa': 'Em casa'
    };
    const mappedLocations = filters.selectedLocations.map(loc => locationMap[loc] || loc);
    const placeholders = mappedLocations.map(() => '?').join(',');
    sql += ` AND location IN (${placeholders})`;
    params.push(...mappedLocations);
  }

  // Filtros de condicao
  if (filters.selectedConditions && filters.selectedConditions.length > 0) {
    const placeholders = filters.selectedConditions.map(() => '?').join(',');
    sql += ` AND condition IN (${placeholders})`;
    params.push(...filters.selectedConditions);
  }

  // Ordenacao
  let orderBy = 'ORDER BY created_at DESC';
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'created_at_asc':
        orderBy = 'ORDER BY created_at ASC';
        break;
      case 'price_asc':
        orderBy = 'ORDER BY price ASC';
        break;
      case 'price_desc':
        orderBy = 'ORDER BY price DESC';
        break;
      case 'title_asc':
        orderBy = 'ORDER BY title ASC';
        break;
      case 'title_desc':
        orderBy = 'ORDER BY title DESC';
        break;
      default:
        orderBy = 'ORDER BY created_at DESC';
    }
  }

  // (apenas produtos permitidos)
  sql += ` AND status = 'allowed' ${orderBy}`;

  // Limite
  const limit = filters.limit || 50;
  sql += ' LIMIT ?';
  params.push(limit);

  console.log('Search SQL:', sql);
  console.log('Search params:', params);

  db.all(sql, params, finishWithRows);
}

// Pesquisa basica por produtos
function searchProducts(q, limit = 20, cb) {
  const finishWithRows = (err, rows) => {
    if (err) return cb(err);
    
    // imagens
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
    return db.all("SELECT * FROM products WHERE status = 'allowed' ORDER BY created_at DESC LIMIT ?", [limit], finishWithRows);
  }

  // Query tokens for FTS5
  const tokens = q.split(/\s+/).map(t => t.replace(/[^\w]/g, '')).filter(Boolean).map(t => t + '*').join(' ');

  const ftsSql = `SELECT p.* FROM product_fts f JOIN products p ON p.id = f.rowid WHERE f MATCH ? AND p.status = 'allowed' LIMIT ?`;
  db.all(ftsSql, [tokens, limit], (err, rows) => {
    if (err) {
      // Fallback se FTS5 der erro
      const pattern = `%${q}%`;
      const sql = `SELECT * FROM products WHERE (title LIKE ? OR condition LIKE ? OR description LIKE ?) AND status = 'allowed' ORDER BY created_at DESC LIMIT ?`;
      const params = [pattern, pattern, pattern, limit];
      return db.all(sql, params, finishWithRows);
    }

    if (rows && rows.length > 0) return finishWithRows(null, rows);

    // Fallback: pesquisa normal
    const pattern = `%${q}%`;
    const sql = `SELECT * FROM products WHERE (title LIKE ? OR condition LIKE ? OR description LIKE ?) AND status = 'allowed' ORDER BY created_at DESC LIMIT ?`;
    const params = [pattern, pattern, pattern, limit];
    db.all(sql, params, finishWithRows);
  });
}

module.exports = {
  createProduct,
  getProductById,
  searchProducts,
  searchProductsWithFilters,

  // Retorna produtos de um vendedor
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

// Retorna produtos gratuitos mais recentes
module.exports.getFreeProducts = function(limit = 12, cb) {
  db.all("SELECT * FROM products WHERE price = 0 AND status = 'allowed' ORDER BY created_at DESC LIMIT ?", [limit], (err, rows) => {
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

// Atualiza um produto por id
module.exports.updateProduct = function(id, data, cb) {
  const { title, condition, category, description, price, location } = data;
  // Quando editado mudar status para 'pending'
  const sql = `UPDATE products SET title = ?, condition = ?, category = ?, description = ?, price = ?, location = ?, status = 'pending' WHERE id = ?`;
  const params = [title, condition, category, description, price, location, id];
  db.run(sql, params, function(err) {
    if (err) return cb(err);
    db.get('SELECT * FROM products WHERE id = ?', [id], cb);
  });
};

// Apaga um produto por id
module.exports.deleteProduct = function(id, cb) {
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) return cb(err);

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

// Inicializa tabela de favoritos
db.serialize(() => {
  ensureFavoritesTable();
});
