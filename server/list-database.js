const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'unibrik.db');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database successfully\n');
});

console.log('\n═══════════════════════════════════════════════════════════════════════════════');
console.log('                           DATABASE CONTENTS                                    ');
console.log('═══════════════════════════════════════════════════════════════════════════════\n');

// First, let's check what tables exist
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
  if (err) {
    console.error('❌ Error fetching tables:', err);
    return;
  }
  console.log('📋 Available tables:', tables.map(t => t.name).join(', '));
  console.log('');
});

// Function to format table output
function printTable(title, rows, columns) {
  if (rows.length === 0) {
    console.log(`\n📋 ${title}: No records found\n`);
    return;
  }

  console.log(`\n📋 ${title} (${rows.length} records):`);
  console.log('─'.repeat(120));
  
  // Print header
  const header = columns.map(col => String(col).padEnd(15)).join(' | ');
  console.log(header);
  console.log('─'.repeat(120));
  
  // Print rows
  rows.forEach(row => {
    const rowStr = columns.map(col => {
      let val = row[col];
      if (val === null || val === undefined) val = 'NULL';
      return String(val).padEnd(15).substring(0, 15);
    }).join(' | ');
    console.log(rowStr);
  });
  
  console.log('─'.repeat(120) + '\n');
}

// Query all users
db.all('SELECT * FROM users', [], (err, users) => {
  if (err) {
    console.error('❌ Error fetching users:', err.message);
    console.log('ℹ️  This might mean the users table doesn\'t exist yet. Try running the server first.\n');
    users = [];
  }
  
  if (users && users.length > 0) {
    const userColumns = ['id', 'public_id', 'name', 'email', 'role', 'approved', 'google_sub'];
    printTable('USERS', users, userColumns);
    
    // Show full details for each user
    if (users.length > 0) {
      console.log('\n👤 Detailed User Information:');
      users.forEach((user, idx) => {
        console.log(`\n  User ${idx + 1}:`);
        console.log(`    ID: ${user.id} | Public ID: ${user.public_id || 'N/A'}`);
        console.log(`    Name: ${user.name}`);
        console.log(`    Email: ${user.email}`);
        console.log(`    Role: ${user.role || 'user'} | Approved: ${user.approved ? 'Yes' : 'No'}`);
        console.log(`    Google Sub: ${user.google_sub || 'N/A'}`);
        console.log(`    Address: ${user.street || 'N/A'}, ${user.neighborhood || 'N/A'}, ${user.city || 'N/A'}`);
      });
      console.log('\n');
    }
  } else if (!err) {
    console.log('\n📋 USERS: No records found\n');
  }
  
  // Query all products
  db.all('SELECT * FROM products', [], (err, products) => {
    if (err) {
      console.error('❌ Error fetching products:', err.message);
      console.log('ℹ️  This might mean the products table doesn\'t exist yet. Try running the server first.\n');
      products = [];
    }
    
    if (products && products.length > 0) {
      const productColumns = ['id', 'title', 'price', 'condition', 'category', 'status', 'seller_id', 'location'];
      printTable('PRODUCTS', products, productColumns);
      
      // Show full details for each product
      if (products.length > 0) {
        console.log('\n📦 Detailed Product Information:');
        products.forEach((product, idx) => {
          console.log(`\n  Product ${idx + 1}:`);
          console.log(`    ID: ${product.id}`);
          console.log(`    Title: ${product.title}`);
          console.log(`    Price: R$ ${product.price} | Condition: ${product.condition}`);
          console.log(`    Category: ${product.category} | Location: ${product.location}`);
          console.log(`    Status: ${product.status || 'pending'} | Approved: ${product.approved || 0}`);
          console.log(`    Seller ID: ${product.seller_id}`);
          console.log(`    Description: ${product.description ? product.description.substring(0, 80) + '...' : 'N/A'}`);
          console.log(`    Images: ${product.images || 'None'}`);
          console.log(`    Created: ${product.created_at || 'N/A'}`);
        });
        console.log('\n');
      }
    } else if (!err) {
      console.log('\n📦 PRODUCTS: No records found\n');
    }
    
    // Get summary statistics only if tables exist
    if (!err || (users && products)) {
    db.get('SELECT COUNT(*) as total FROM users', [], (err, userCount) => {
      db.get('SELECT COUNT(*) as total FROM products', [], (err, productCount) => {
        db.get('SELECT COUNT(*) as total FROM products WHERE status = "pending"', [], (err, pendingCount) => {
          db.get('SELECT COUNT(*) as total FROM products WHERE status = "allowed"', [], (err, allowedCount) => {
            db.get('SELECT COUNT(*) as total FROM products WHERE status = "blocked"', [], (err, blockedCount) => {
              db.get('SELECT COUNT(*) as total FROM users WHERE role = "admin"', [], (err, adminCount) => {
                db.get('SELECT COUNT(*) as total FROM users WHERE role = "supervisor"', [], (err, supervisorCount) => {
                  
                  console.log('\n📊 DATABASE SUMMARY:');
                  console.log('═══════════════════════════════════════════════════════════════════════════════');
                  console.log(`  Total Users: ${userCount?.total || 0}`);
                  console.log(`    - Admins: ${adminCount?.total || 0}`);
                  console.log(`    - Supervisors: ${supervisorCount?.total || 0}`);
                  console.log(`    - Regular Users: ${(userCount?.total || 0) - (adminCount?.total || 0) - (supervisorCount?.total || 0)}`);
                  console.log(`\n  Total Products: ${productCount?.total || 0}`);
                  console.log(`    - Pending: ${pendingCount?.total || 0}`);
                  console.log(`    - Allowed: ${allowedCount?.total || 0}`);
                  console.log(`    - Blocked: ${blockedCount?.total || 0}`);
                  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
                  
                  db.close();
                });
              });
            });
          });
        });
      });
    });
    } else {
      console.log('⚠️  Skipping statistics due to table errors\n');
      db.close();
    }
  });
});
