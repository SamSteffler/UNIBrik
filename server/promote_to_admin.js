// promote_to_admin.js
// Usage: node promote_to_admin.js user@example.com
// This script sets role='admin' for the user with the given email (useful to bootstrap an admin account).

const db = require('./database.js');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node promote_to_admin.js <email>');
  process.exit(1);
}

db.run('UPDATE users SET role = ? WHERE email = ?', ['admin', email], function(err) {
  if (err) {
    console.error('Error promoting user:', err.message);
    process.exit(2);
  }
  if (this.changes === 0) {
    console.error('No user found with email', email);
    process.exit(3);
  }
  console.log('User promoted to admin:', email);
  process.exit(0);
});
