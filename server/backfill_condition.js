
/*
------------- backfill_condition.js -------------
Script para preencher a coluna 'condition' em products
onde estiver vazia ou nula
Requer que a coluna 'condition' ja exista na tabela products

Uso: node wipe_products.js
*/


const db = require('./database.js');
require('./products.js');

const DEFAULT_CONDITION = 'Usado';

db.serialize(() => {
  db.get("SELECT COUNT(*) AS cnt FROM products WHERE condition IS NULL OR condition = ''", (err, row) => {
    if (err) {
      console.error('Error checking products for missing condition:', err.message);
      process.exit(1);
    }

    const missing = row ? row.cnt : 0;
    console.log(`Products with missing condition before update: ${missing}`);

    if (missing === 0) {
      console.log('No rows to update. Exiting.');
      process.exit(0);
    }

    db.run("UPDATE products SET condition = ? WHERE condition IS NULL OR condition = ''", [DEFAULT_CONDITION], function (updErr) {
      if (updErr) {
        console.error('Error updating products:', updErr.message);
        process.exit(1);
      }

      console.log(`Updated ${this.changes} rows to condition='${DEFAULT_CONDITION}'.`);

      db.get("SELECT COUNT(*) AS cnt FROM products WHERE condition IS NULL OR condition = ''", (err2, row2) => {
        if (err2) {
          console.error('Error re-checking products:', err2.message);
          process.exit(1);
        }
        console.log(`Products with missing condition after update: ${row2.cnt}`);
        process.exit(0);
      });
    });
  });
});
