const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./unibrik.db');

/*
------------- update_product_status.js -------------

Script para atualizar o status de todos os produtos existentes
para 'allowed', assumindo que o sistema utiliza moderacao.

Uso: node update_product_status.js
*/


db.serialize(() => {
  // Verifica se a coluna 'status' existe na tabela 'products'
  db.all("PRAGMA table_info(products)", (err, cols) => {
    if (err) { 
      console.error('Error inspecting products table:', err); 
      process.exit(1); 
    }
    
    const names = (cols || []).map(c => c.name);
    if (!names.includes('status')) {
      console.error('Status column does not exist yet. Run the server first to add it.');
      process.exit(2);
    }

    console.log('Status column exists. Updating existing products...');

    // Atualiza todos os produtos com status NULL ou 'pending' para 'allowed'
    db.run("UPDATE products SET status = 'allowed' WHERE status IS NULL OR status = 'pending'", function(uerr) {
      if (uerr) { 
        console.error('Error updating products:', uerr.message); 
        process.exit(3); 
      }
      
      console.log(`Updated ${this.changes} product(s) to status='allowed'.`);
      
      // Resumo final
      db.all("SELECT status, COUNT(*) as count FROM products GROUP BY status", (qerr, rows) => {
        if (!qerr && rows) {
          console.log('\nCurrent product status distribution:');
          rows.forEach(r => console.log(`  ${r.status}: ${r.count}`));
        }
        db.close();
        console.log('\nDone!');
      });
    });
  });
});
