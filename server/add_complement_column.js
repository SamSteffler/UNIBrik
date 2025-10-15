// add_complement_column.js
// Script para adicionar a coluna address_complement à tabela users
const db = require('./database.js');

db.serialize(() => {
  // Verifica se a coluna já existe
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
      console.error('Erro ao verificar colunas:', err.message);
      process.exit(1);
    }

    const hasComplement = columns.some(col => col.name === 'address_complement');

    if (hasComplement) {
      console.log('✅ A coluna address_complement já existe na tabela users.');
      process.exit(0);
    }

    // Adiciona a coluna se não existir
    console.log('📝 Adicionando coluna address_complement...');
    db.run("ALTER TABLE users ADD COLUMN address_complement TEXT", (err) => {
      if (err) {
        console.error('❌ Erro ao adicionar coluna:', err.message);
        process.exit(1);
      }

      console.log('✅ Coluna address_complement adicionada com sucesso!');
      process.exit(0);
    });
  });
});
