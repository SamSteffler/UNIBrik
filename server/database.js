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
            name TEXT,
            email TEXT UNIQUE,
            picture TEXT,
            password TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                // Tabela já pode existir
                console.log("Erro ao criar tabela 'users', possivelmente já existe.");
            } else {
                console.log("Tabela 'users' criada ou já existente.");
            }
        });
    }
});

module.exports = db;