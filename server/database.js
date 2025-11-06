// unibrik-backend/database.js

const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = "unibrik.db";

// Conecta-se ou cria o arquivo de banco de dados
const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Não foi possível abrir o banco de dados
        console.error(err.message);
        throw err;
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        // Cria a tabela de usuários se ela não existir
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            public_id TEXT NOT NULL UNIQUE,
            google_sub TEXT UNIQUE, -- ID único do usuário no Google
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            picture TEXT,
            password TEXT,
            
            -- NOVAS COLUNAS ADICIONADAS AQUI --
            birth_date TEXT,
            phone TEXT,
            address_cep TEXT,
            address_street TEXT,
            address_number TEXT,
            address_complement TEXT,
            address_district TEXT,
            address_city TEXT,
            address_uf TEXT,
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                // Tabela já pode existir
                console.log("Erro ao criar tabela 'users'.");
            } else {
                console.log("Tabela 'users' criada ou já existente.");
            }
        });

        // Cria a tabela de mensagens para chat
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            read BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id),
            FOREIGN KEY (sender_id) REFERENCES users(id),
            FOREIGN KEY (receiver_id) REFERENCES users(id)
        )`, (err) => {
            if (err) {
                console.log("Erro ao criar tabela 'messages'.");
            } else {
                console.log("Tabela 'messages' criada ou já existente.");
                // Criar índices para melhorar performance de queries
                db.run(`CREATE INDEX IF NOT EXISTS idx_messages_users ON messages(sender_id, receiver_id)`);
                db.run(`CREATE INDEX IF NOT EXISTS idx_messages_product ON messages(product_id)`);
                db.run(`CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC)`);
            }
        });
    }   
});

module.exports = db;

// Ensure users and products have admin/approval related columns (safe on existing DB)
db.serialize(() => {
    // users: add role and approved columns if missing
    db.all("PRAGMA table_info(users)", (err, cols) => {
        if (err) return console.log('Could not inspect users table:', err.message);
        const names = (cols || []).map(c => c.name);
        if (!names.includes('role')) {
            db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", (addErr) => {
                if (addErr) console.log('Could not add users.role column:', addErr.message);
                else console.log("Added 'role' column to users table (default 'user').");
            });
        }
        if (!names.includes('approved')) {
            db.run("ALTER TABLE users ADD COLUMN approved INTEGER DEFAULT 1", (addErr) => {
                if (addErr) console.log('Could not add users.approved column:', addErr.message);
                else console.log("Added 'approved' column to users table (default 1).");
            });
        }
    });

    // products: add approved and status columns if missing
    db.all("PRAGMA table_info(products)", (err2, pcols) => {
        if (err2) return console.log('Could not inspect products table:', err2.message);
        const pnames = (pcols || []).map(c => c.name);
        if (!pnames.includes('approved')) {
            db.run("ALTER TABLE products ADD COLUMN approved INTEGER DEFAULT 1", (addErr) => {
                if (addErr) console.log('Could not add products.approved column:', addErr.message);
                else console.log("Added 'approved' column to products table (default 1).");
            });
        }
        if (!pnames.includes('status')) {
            db.run("ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'pending'", (addErr) => {
                if (addErr) console.log('Could not add products.status column:', addErr.message);
                else console.log("Added 'status' column to products table (default 'pending').");
            });
        }
    });
});