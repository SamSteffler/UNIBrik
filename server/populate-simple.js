// Script simplificado para popular o banco - aguarda FTS estar pronto
const db = require('./database.js');

const testProducts = [
  // === ELETRÔNICOS ===
  { title: 'Notebook Dell Inspiron 15', condition: 'Usado - bom', category: 'Eletrônicos', description: 'Notebook Dell com Intel i5, 8GB RAM, SSD 256GB. Ótimo para estudos e trabalho.', price: 1500, seller_id: 1, location: 'UFSM' },
  { title: 'Notebook Lenovo Ideapad', condition: 'Novo', category: 'Eletrônicos', description: 'Notebook novo na caixa, nunca usado. Intel i7, 16GB RAM, SSD 512GB.', price: 3500, seller_id: 1, location: 'Em casa' },
  { title: 'Notebook Acer Aspire', condition: 'Usado - aceitável', category: 'Eletrônicos', description: 'Notebook básico para estudos. Algumas marcas de uso mas funciona perfeitamente.', price: 800, seller_id: 1, location: 'UFSM' },
  { title: 'Mouse Gamer RGB', condition: 'Novo', category: 'Eletrônicos', description: 'Mouse gamer com iluminação RGB, 6 botões programáveis, DPI ajustável.', price: 120, seller_id: 1, location: 'UFSM' },
  { title: 'Teclado Mecânico', condition: 'Usado - como novo', category: 'Eletrônicos', description: 'Teclado mecânico switches blue, retroiluminado. Quase sem uso.', price: 250, seller_id: 1, location: 'Em casa' },
  { title: 'Webcam HD 1080p', condition: 'Novo', category: 'Eletrônicos', description: 'Webcam HD para aulas online e reuniões. Microfone embutido.', price: 150, seller_id: 1, location: 'UFSM' },
  { title: 'Fone de Ouvido Bluetooth', condition: 'Usado - bom', category: 'Eletrônicos', description: 'Fone bluetooth com cancelamento de ruído, bateria dura até 20h.', price: 180, seller_id: 1, location: 'A combinar' },
  { title: 'Calculadora Científica HP', condition: 'Grátis', category: 'Eletrônicos', description: 'Calculadora científica funcionando perfeitamente. Estou doando.', price: 0, seller_id: 1, location: 'UFSM' },
  // === LIVROS ===
  { title: 'Livro Cálculo I - Stewart', condition: 'Usado - como novo', category: 'Livros', description: 'Livro de Cálculo volume 1, James Stewart. Sem marcações.', price: 80, seller_id: 1, location: 'UFSM' },
  { title: 'Livro Álgebra Linear', condition: 'Usado - bom', category: 'Livros', description: 'Livro de Álgebra Linear e suas aplicações. Algumas anotações a lápis.', price: 60, seller_id: 1, location: 'UFSM' },
  { title: 'Livro Física I - Halliday', condition: 'Novo', category: 'Livros', description: 'Livro novo, ainda com plástico. Nunca usado.', price: 120, seller_id: 1, location: 'Em casa' },
  { title: 'Livro Programação em Python', condition: 'Usado - como novo', category: 'Livros', description: 'Livro completo sobre Python. Perfeito estado.', price: 70, seller_id: 1, location: 'UFSM' },
  { title: 'Livros de Romance (3 unidades)', condition: 'Usado - aceitável', category: 'Livros', description: 'Combo com 3 livros de romance. Lombadas um pouco gastas.', price: 30, seller_id: 1, location: 'A combinar' },
  // === MÓVEIS ===
  { title: 'Mesa de Estudos Branca', condition: 'Usado - bom', category: 'Móveis', description: 'Mesa de madeira pintada de branco, 120x60cm. Muito resistente.', price: 200, seller_id: 1, location: 'Em casa' },
  { title: 'Mesa para Computador', condition: 'Novo', category: 'Móveis', description: 'Mesa nova para computador com suporte para teclado.', price: 350, seller_id: 1, location: 'Em casa' },
  { title: 'Cadeira de Escritório Ergonômica', condition: 'Usado - como novo', category: 'Móveis', description: 'Cadeira ergonômica com ajuste de altura e apoio lombar.', price: 300, seller_id: 1, location: 'A combinar' },
  { title: 'Estante para Livros', condition: 'Usado - bom', category: 'Móveis', description: 'Estante de madeira com 4 prateleiras. Ótimo estado.', price: 180, seller_id: 1, location: 'Em casa' },
  { title: 'Criado-mudo', condition: 'Grátis', category: 'Móveis', description: 'Criado-mudo pequeno, precisa de uma lixada e pintura.', price: 0, seller_id: 1, location: 'Em casa' },
  // === MATERIAIS ===
  { title: 'Materiais de Desenho Técnico', condition: 'Usado - bom', category: 'Materiais', description: 'Kit completo: réguas, esquadros, transferidor, compasso.', price: 50, seller_id: 1, location: 'UFSM' },
  { title: 'Cadernos Universitários (5 un)', condition: 'Novo', category: 'Materiais', description: 'Pack com 5 cadernos universitários 200 folhas cada.', price: 40, seller_id: 1, location: 'UFSM' },
  { title: 'Materiais de Laboratório', condition: 'Usado - como novo', category: 'Materiais', description: 'Jaleco, óculos de proteção e kit básico de vidraria.', price: 90, seller_id: 1, location: 'UFSM' },
  // === ROUPAS ===
  { title: 'Moletom Universitário', condition: 'Usado - como novo', category: 'Roupas', description: 'Moletom da UFSM tamanho M, pouco usado.', price: 60, seller_id: 1, location: 'UFSM' },
  { title: 'Jaqueta Jeans', condition: 'Usado - bom', category: 'Roupas', description: 'Jaqueta jeans tamanho G, bem conservada.', price: 80, seller_id: 1, location: 'A combinar' },
  // === SERVIÇOS ===
  { title: 'Aulas Particulares de Cálculo', condition: 'Novo', category: 'Serviços', description: 'Ofereço aulas particulares de Cálculo I, II e III. Experiência de 3 anos.', price: 50, seller_id: 1, location: 'UFSM' },
  { title: 'Revisão de TCC', condition: 'Novo', category: 'Serviços', description: 'Revisão textual e formatação de TCC nas normas ABNT.', price: 100, seller_id: 1, location: 'A combinar' }
];

console.log('🗑️  Limpando e populando banco...\n');

// Aguardar a tabela FTS estar pronta
setTimeout(() => {
  db.run('DELETE FROM products', (err) => {
    if (err) {
      console.error('Erro ao limpar:', err);
      return;
    }
    
    console.log('📦 Criando produtos...\n');
    
    // Usar método síncrono serializado
    db.serialize(() => {
      const stmt = db.prepare(`INSERT INTO products (title, condition, category, description, price, seller_id, location, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      
      let count = 0;
      testProducts.forEach(p => {
        stmt.run([p.title, p.condition, p.category, p.description, p.price, p.seller_id, p.location, new Date().toISOString()], function(err) {
          if (!err) {
            count++;
            console.log(`✓ [${count}] ${p.title} - R$ ${p.price}`);
          }
        });
      });
      
      stmt.finalize(() => {
        console.log(`\n✅ ${count} produtos criados!`);
        
        // Mostrar resumo
        db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC', (err, rows) => {
          if (!err) {
            console.log('\n📊 Resumo:');
            rows.forEach(r => console.log(`   ${r.category}: ${r.count}`));
          }
          process.exit(0);
        });
      });
    });
  });
}, 2000);  // Aguardar 2 segundos para FTS estar pronto