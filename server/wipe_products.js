const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'unibrik.db');
const db = new sqlite3.Database(dbPath);
const imagesDir = path.join(__dirname, '..', 'public', 'images', 'ads');

console.log('🗑️  Starting product and related data wipe...');
console.log('⚠️  This will delete:');
console.log('   - All products');
console.log('   - All product image references (product_images table)');
console.log('   - All chat messages related to products');
console.log('   - Full-text search index (product_fts)');
console.log('   - All product images from disk');
console.log('');

db.serialize(() => {
  // First, get count of products, images, and messages
  db.get('SELECT COUNT(*) as count FROM products', (err, productRow) => {
    if (err) {
      console.error('❌ Error counting products:', err.message);
      return;
    }
    
    db.get('SELECT COUNT(*) as count FROM product_images', (err, imageRow) => {
      if (err) {
        console.error('❌ Error counting product images:', err.message);
        return;
      }
      
      db.get('SELECT COUNT(*) as count FROM messages', (err, messageRow) => {
        if (err) {
          console.error('❌ Error counting messages:', err.message);
          return;
        }
        
        const productCount = productRow.count;
        const imageCount = imageRow.count;
        const messageCount = messageRow.count;
        
        console.log(`📊 Found ${productCount} product(s) in database`);
        console.log(`📊 Found ${imageCount} image reference(s) in database`);
        console.log(`📊 Found ${messageCount} message(s) in database`);
        
        if (productCount === 0 && imageCount === 0 && messageCount === 0) {
          console.log('✅ Database is already empty. Nothing to delete.');
          db.close();
          return;
        }
        
        console.log('');
        console.log('🔄 Starting deletion process...');
        
        // Step 1: Delete all messages related to products
        db.run('DELETE FROM messages', function(err) {
          if (err) {
            console.error('❌ Error deleting messages:', err.message);
          } else {
            console.log(`✅ Deleted ${this.changes} message(s)`);
          }
          
          // Step 2: Delete all product image references
          db.run('DELETE FROM product_images', function(err) {
            if (err) {
              console.error('❌ Error deleting product images:', err.message);
            } else {
              console.log(`✅ Deleted ${this.changes} image reference(s)`);
            }
            
            // Step 3: Delete from FTS table
            db.run('DELETE FROM product_fts', function(err) {
              if (err) {
                console.warn('⚠️  Warning: Could not clear FTS table:', err.message);
              } else {
                console.log(`✅ Cleared full-text search index (${this.changes} entries)`);
              }
              
              // Step 4: Delete all products
              db.run('DELETE FROM products', function(err) {
                if (err) {
                  console.error('❌ Error deleting products:', err.message);
                  db.close();
                  return;
                }
                
                console.log(`✅ Deleted ${this.changes} product(s)`);
                
                // Step 5: Reset auto-increment counters (OPTIONAL - can be removed to avoid ID reuse)
                db.run('DELETE FROM sqlite_sequence WHERE name="products"', (err) => {
                  if (err) {
                    console.warn('⚠️  Warning: Could not reset products counter:', err.message);
                  } else {
                    console.log('✅ Reset product ID counter');
                  }
                  
                  db.run('DELETE FROM sqlite_sequence WHERE name="product_images"', (err) => {
                    if (err) {
                      console.warn('⚠️  Warning: Could not reset product_images counter:', err.message);
                    } else {
                      console.log('✅ Reset product_images ID counter');
                    }
                    
                    db.run('DELETE FROM sqlite_sequence WHERE name="messages"', (err) => {
                      if (err) {
                        console.warn('⚠️  Warning: Could not reset messages counter:', err.message);
                      } else {
                        console.log('✅ Reset message ID counter');
                      }
                      
                      // Step 6: Delete all product images from disk
                      deleteProductImages();
                      
                      // Step 7: Verify deletion
                      console.log('');
                      console.log('🔍 Verifying deletion...');
                      
                      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
                        if (err) {
                          console.error('❌ Error verifying products:', err.message);
                        } else {
                          console.log(`📊 Products remaining: ${row.count}`);
                        }
                        
                        db.get('SELECT COUNT(*) as count FROM product_images', (err, row) => {
                          if (err) {
                            console.error('❌ Error verifying product images:', err.message);
                          } else {
                            console.log(`📊 Image references remaining: ${row.count}`);
                          }
                          
                          db.get('SELECT COUNT(*) as count FROM messages', (err, row) => {
                            if (err) {
                              console.error('❌ Error verifying messages:', err.message);
                            } else {
                              console.log(`📊 Messages remaining: ${row.count}`);
                            }
                            
                            console.log('');
                            console.log('✅ Product and related data wipe completed successfully!');
                            
                            db.close((err) => {
                              if (err) {
                                console.error('❌ Error closing database:', err.message);
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

// Function to recursively delete all product image folders
function deleteProductImages() {
  if (!fs.existsSync(imagesDir)) {
    console.log('⚠️  Images directory does not exist, skipping image deletion');
    return;
  }
  
  try {
    const folders = fs.readdirSync(imagesDir);
    let deletedCount = 0;
    let fileCount = 0;
    
    folders.forEach(folder => {
      const folderPath = path.join(imagesDir, folder);
      
      // Check if it's a directory (product ID folder)
      if (fs.statSync(folderPath).isDirectory()) {
        // Count files in this folder
        const files = fs.readdirSync(folderPath);
        fileCount += files.length;
        
        // Delete the entire folder recursively
        fs.rmSync(folderPath, { recursive: true, force: true });
        deletedCount++;
      }
    });
    
    console.log(`✅ Deleted ${deletedCount} product folder(s) containing ${fileCount} image(s)`);
  } catch (err) {
    console.error('❌ Error deleting product images:', err.message);
  }
}
