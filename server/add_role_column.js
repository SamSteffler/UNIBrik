
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./unibrik.db');
db.serialize(() => {
  db.all("PRAGMA table_info(users)", (err, cols) => {
    if (err) { console.error(err); process.exit(1); }
    const names = (cols || []).map(c => c.name);
    if (names.includes('role')) {
      console.log('Column role already exists.');
      db.close();
      return;
    }
    db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", (aerr) => {
      if (aerr) { console.error('Error adding column:', aerr.message); process.exit(2); }
      console.log("Added 'role' column with default 'user'.");
      db.all("SELECT id, email, role FROM users LIMIT 10", (qerr, rows) => {
        if (!qerr) console.log(rows);
        db.close();
      });
    });
  });
});