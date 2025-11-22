const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'unibrik.db');
const db = new sqlite3.Database(dbPath);
const imagesDir = path.join(__dirname, '..', 'public', 'images', 'ads');


/*
------------- wipe_products.js -------------
Script para apagar todos os produtos e dados 
relacionados do banco de dados e do disco.
Util para testes ou reiniciar o estado do sistema.

Uso: node wipe_products.js
*/

console.log('>  Starting product and related data wipe...');
console.log('>  This will delete:');
console.log('   - All products');
console.log('   - All product image references (product_images table)');
console.log('   - All chat messages related to products');
console.log('   - Full-text search index (product_fts)');
console.log('   - All product images from disk');
console.log('');


db.serialize(() => {
  // Contabiliza todos os produtos, imagens e mensagens
  db.get('SELECT COUNT(*) as count FROM products', (err, productRow) => {
    if (err) {
      console.error(' ! Error counting products:', err.message);
      return;
    }

    db.get('SELECT COUNT(*) as count FROM product_images', (err, imageRow) => {
      if (err) {
        console.error(' ! Error counting product images:', err.message);
        return;
      }

      db.get('SELECT COUNT(*) as count FROM messages', (err, messageRow) => {
        if (err) {
          console.error(' ! Error counting messages:', err.message);
          return;
        }

        const productCount = productRow.count;
        const imageCount = imageRow.count;
        const messageCount = messageRow.count;

        console.log(`> Found ${productCount} product(s) in database`);
        console.log(`> Found ${imageCount} image reference(s) in database`);
        console.log(`> Found ${messageCount} message(s) in database`);

        if (productCount === 0 && imageCount === 0 && messageCount === 0) {
          console.log('> Database is already empty. Nothing to delete.');
          db.close();
          return;
        }

        console.log('');
        console.log('... Starting deletion process ...');

        // 1. Deleta todas as mensagens relacionadas a produtos
        db.run('DELETE FROM messages', function (err) {
          if (err) {
            console.error(' ! Error deleting messages:', err.message);
          } else {
            console.log(` > Deleted ${this.changes} message(s)`);
          }

          // 2. Deleta todas as referencias de imagens de produtos
          db.run('DELETE FROM product_images', function (err) {
            if (err) {
              console.error(' ! Error deleting product images:', err.message);
            } else {
              console.log(`  > Deleted ${this.changes} image reference(s)`);
            }

            // 3. Deleta todas as entradas da tabela FTS
            db.run('DELETE FROM product_fts', function (err) {
              if (err) {
                console.warn('( ! )  Warning: Could not clear FTS table:', err.message);
              } else {
                console.log(`  > Cleared full-text search index (${this.changes} entries)`);
              }

              // 4. Deleta todos os produtos
              db.run('DELETE FROM products', function (err) {
                if (err) {
                  console.error(' ! Error deleting products:', err.message);
                  db.close();
                  return;
                }

                console.log(`  > Deleted ${this.changes} product(s)`);

                // 5. Reseta os contadores de IDs 
                db.run('DELETE FROM sqlite_sequence WHERE name="products"', (err) => {
                  if (err) {
                    console.warn('( ! )  Warning: Could not reset products counter:', err.message);
                  } else {
                    console.log('  > Reset product ID counter');
                  }

                  db.run('DELETE FROM sqlite_sequence WHERE name="product_images"', (err) => {
                    if (err) {
                      console.warn('( ! )  Warning: Could not reset product_images counter:', err.message);
                    } else {
                      console.log('  > Reset product_images ID counter');
                    }

                    db.run('DELETE FROM sqlite_sequence WHERE name="messages"', (err) => {
                      if (err) {
                        console.warn('( ! )  Warning: Could not reset messages counter:', err.message);
                      } else {
                        console.log('  > Reset message ID counter');
                      }

                      // 6. Deleta as imagens dos produtos salvas
                      deleteProductImages();

                      // 7. Verifica se tudo foi deletado
                      console.log('');
                      console.log('... Verifying deletion ...');

                      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
                        if (err) {
                          console.error(' ! Error verifying products:', err.message);
                        } else {
                          console.log(`<> Products remaining: ${row.count}`);
                        }

                        db.get('SELECT COUNT(*) as count FROM product_images', (err, row) => {
                          if (err) {
                            console.error(' ! Error verifying product images:', err.message);
                          } else {
                            console.log(`<> Image references remaining: ${row.count}`);
                          }

                          db.get('SELECT COUNT(*) as count FROM messages', (err, row) => {
                            if (err) {
                              console.error(' ! Error verifying messages:', err.message);
                            } else {
                              console.log(`<> Messages remaining: ${row.count}`);
                            }

                            console.log('');
                            console.log('  > Product and related data wipe completed successfully!');

                            db.close((err) => {
                              if (err) {
                                console.error(' ! Error closing database:', err.message);
                              }
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

// Deleta todas as imagens de produtos do disco
function deleteProductImages() {
  if (!fs.existsSync(imagesDir)) {
    console.log('( ! )  Images directory does not exist, skipping image deletion');
    return;
  }

  try {
    const folders = fs.readdirSync(imagesDir);
    let deletedCount = 0;
    let fileCount = 0;

    folders.forEach(folder => {
      const folderPath = path.join(imagesDir, folder);

      // Verifica se eh uma pasta
      if (fs.statSync(folderPath).isDirectory()) {
        // Conta quantidade de arquivos
        const files = fs.readdirSync(folderPath);
        fileCount += files.length;

        // Deleta tudo dentro e a pasta
        fs.rmSync(folderPath, { recursive: true, force: true });
        deletedCount++;
      }
    });

    console.log(`  > Deleted ${deletedCount} product folder(s) containing ${fileCount} image(s)`);
  } catch (err) {
    console.error(' ! Error deleting product images:', err.message);
  }
}
