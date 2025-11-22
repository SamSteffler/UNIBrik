// Script para popular o banco com dados variados para teste de filtros
const db = require('./database.js');
const products = require('./products.js');

// Dados de teste mais elaborados
const testProducts = [
  // === ELETRONICOS ===
  {
    title: 'Notebook Dell Inspiron 15',
    condition: 'Usado - bom',
    category: 'Eletrônicos',
    description: 'Notebook Dell com Intel i5, 8GB RAM, SSD 256GB. Ótimo para estudos e trabalho.',
    price: 1500,
    seller_id: 1,
    location: 'UFSM'
  },
  {
    title: 'Notebook Lenovo Ideapad',
    condition: 'Novo',
    category: 'Eletrônicos',
    description: 'Notebook novo na caixa, nunca usado. Intel i7, 16GB RAM, SSD 512GB.',
    price: 3500,
    seller_id: 1,
    location: 'Em casa'
  },
  {
    title: 'Notebook Acer Aspire',
    condition: 'Usado - aceitável',
    category: 'Eletrônicos',
    description: 'Notebook básico para estudos. Algumas marcas de uso mas funciona perfeitamente.',
    price: 800,
    seller_id: 1,
    location: 'UFSM'
  },
  {
    title: 'Mouse Gamer RGB',
    condition: 'Novo',
    category: 'Eletrônicos',
    description: 'Mouse gamer com iluminação RGB, 6 botões programáveis, DPI ajustável.',
    price: 120,
    seller_id: 1,
    location: 'UFSM'
  },
  {
    title: 'Teclado Mecânico',
    condition: 'Usado - como novo',
    category: 'Eletrônicos',
    description: 'Teclado mecânico switches blue, retroiluminado. Quase sem uso.',
    price: 250,
    seller_id: 1,
    location: 'Em casa'
  },
  {
    title: 'Webcam HD 1080p',
    condition: 'Novo',
    category: 'Eletrônicos',
    description: 'Webcam HD para aulas online e reuniões. Microfone embutido.',
    price: 150,
    seller_id: 1,
    location: 'UFSM'
  },
  {
    title: 'Fone de Ouvido Bluetooth',
    condition: 'Usado - bom',
    category: 'Eletrônicos',
    description: 'Fone bluetooth com cancelamento de ruído, bateria dura até 20h.',
    price: 180,
    seller_id: 1,
    location: 'A combinar'
  },
  {
    title: 'Calculadora Científica HP',
    condition: 'Grátis',
    category: 'Eletrônicos',
    description: 'Calculadora científica funcionando perfeitamente. Estou doando.',
    price: 0,
    seller_id: 1,
    location: 'UFSM'
  },

  // === LIVROS ===
  {
    title: 'Livro Cálculo I - Stewart',
    condition: 'Usado - como novo',
    category: 'Livros',
    description: 'Livro de Cálculo volume 1, James Stewart. Sem marcações.',
    price: 80,
    seller_id: 1,
    location: 'UFSM'
  },
  {
    title: 'Livro Álgebra Linear',
    condition: 'Usado - bom',
    category: 'Livros',
    description: 'Livro de Álgebra Linear e suas aplicações. Algumas anotações a lápis.',
    price: 60,
    seller_id: 1,
    location: 'UFSM'
  },
  {
    title: 'Livro Física I - Halliday',
    condition: 'Novo',
    category: 'Livros',
    description: 'Livro novo, ainda com plástico. Nunca usado.',
    price: 120,
    seller_id: 1,
    location: 'Em casa'
  },
  {
    title: 'Livro Programação em Python',
    condition: 'Usado - como novo',
    category: 'Livros',
    description: 'Livro completo sobre Python. Perfeito estado.',
    price: 70,
    seller_id: 1,
    location: 'UFSM'
  },
  {
    title: 'Livros de Romance (3 unidades)',
    condition: 'Usado - aceitável',
    category: 'Livros',
    description: 'Combo com 3 livros de romance. Lombadas um pouco gastas.',
    price: 30,
    seller_id: 1,
    location: 'A combinar'
  },

  // === MÓVEIS ===
  {
    title: 'Mesa de Estudos Branca',
    condition: 'Usado - bom',
    category: 'Móveis',
    description: 'Mesa de madeira pintada de branco, 120x60cm. Muito resistente.',
    price: 200,
    seller_id: 1,
    location: 'Em casa'
  },
  {
    title: 'Mesa para Computador',
    condition: 'Novo',
    category: 'Móveis',
    description: 'Mesa nova para computador com suporte para teclado.',
    price: 350,
    seller_id: 1,
    location: 'Em casa'
  },
  {
    title: 'Cadeira de Escritório Ergonômica',
    condition: 'Usado - como novo',
    category: 'Móveis',
    description: 'Cadeira ergonômica com ajuste de altura e apoio lombar.',
    price: 300,
    seller_id: 1,
    location: 'A combinar'
  },
  {
    title: 'Estante para Livros',
    condition: 'Usado - bom',
    category: 'Móveis',
    description: 'Estante de madeira com 4 prateleiras. Ótimo estado.',
    price: 180,
    seller_id: 1,
    location: 'Em casa'
  },
  {
    title: 'Criado-mudo',
    condition: 'Grátis',
    category: 'Móveis',
    description: 'Criado-mudo pequeno, precisa de uma lixada e pintura.',
    price: 0,
    seller_id: 1,
    location: 'Em casa'
  },

  // === MATERIAIS ===
  {
    title: 'Materiais de Desenho Técnico',
    condition: 'Usado - bom',
    category: 'Materiais',
    description: 'Kit completo: réguas, esquadros, transferidor, compasso.',
    price: 50,
    seller_id: 1,
    location: 'UFSM'
  },
  {
    title: 'Cadernos Universitários (5 un)',
    condition: 'Novo',
    category: 'Materiais',
    description: 'Pack com 5 cadernos universitários 200 folhas cada.',
    price: 40,
    seller_id: 1,
    location: 'UFSM'
  },
  {
    title: 'Materiais de Laboratório',
    condition: 'Usado - como novo',
    category: 'Materiais',
    description: 'Jaleco, óculos de proteção e kit básico de vidraria.',
    price: 90,
    seller_id: 1,
    location: 'UFSM'
  },

  // === ROUPAS ===
  {
    title: 'Moletom Universitário',
    condition: 'Usado - como novo',
    category: 'Roupas',
    description: 'Moletom da UFSM tamanho M, pouco usado.',
    price: 60,
    seller_id: 1,
    location: 'UFSM'
  },
  {
    title: 'Jaqueta Jeans',
    condition: 'Usado - bom',
    category: 'Roupas',
    description: 'Jaqueta jeans tamanho G, bem conservada.',
    price: 80,
    seller_id: 1,
    location: 'A combinar'
  },

  // === SERVICOS ===
  {
    title: 'Aulas Particulares de Cálculo',
    condition: 'Novo',
    category: 'Serviços',
    description: 'Ofereço aulas particulares de Cálculo I, II e III. Experiência de 3 anos.',
    price: 50,
    seller_id: 1,
    location: 'UFSM'
  },
  {
    title: 'Revisão de TCC',
    condition: 'Novo',
    category: 'Serviços',
    description: 'Revisão textual e formatação de TCC nas normas ABNT.',
    price: 100,
    seller_id: 1,
    location: 'A combinar'
  }
];

console.log('>  Limpando produtos existentes...');

// Limpar produtos existentes primeiro
db.run('DELETE FROM products', (err) => {
  if (err) {
    console.error('Erro ao limpar produtos:', err);
    return;
  }
  
  console.log('✓ Produtos anteriores removidos');
  console.log('\n> Populando banco com novos dados de teste...\n');
  
  let completed = 0;
  let createdCount = 0;
  
  testProducts.forEach((product, index) => {
    products.createProduct(product, (err, result) => {
      if (err) {
        console.error(`✗ Erro ao criar produto ${index + 1}:`, err);
      } else {
        createdCount++;
        console.log(`✓ [${createdCount}] ${result.title} - R$ ${result.price} (${result.category})`);
      }
      
      completed++;
      if (completed === testProducts.length) {
        console.log('\n' + '='.repeat(60));
        console.log(`> CONCLUÍDO! ${createdCount} produtos criados com sucesso!`);
        console.log('='.repeat(60));
        
        // Mostrar resumo por categoria
        db.all('SELECT category, COUNT(*) as count FROM products GROUP BY category', (err, rows) => {
          if (!err && rows) {
            console.log('\n<> Resumo por Categoria:');
            rows.forEach(r => {
              console.log(`   • ${r.category}: ${r.count} produto(s)`);
            });
          }
          
          // Mostrar resumo por condição
          db.all('SELECT condition, COUNT(*) as count FROM products GROUP BY condition', (err, rows) => {
            if (!err && rows) {
              console.log('\n<>  Resumo por Condição:');
              rows.forEach(r => {
                console.log(`   • ${r.condition}: ${r.count} produto(s)`);
              });
            }
            
            // Mostrar resumo por localização
            db.all('SELECT location, COUNT(*) as count FROM products GROUP BY location', (err, rows) => {
              if (!err && rows) {
                console.log('\n<> Resumo por Localização:');
                rows.forEach(r => {
                  console.log(`   • ${r.location}: ${r.count} produto(s)`);
                });
              }
              
              console.log('\n' + '='.repeat(60));
              console.log('> Banco de dados pronto para testes!');
              console.log('='.repeat(60) + '\n');
              process.exit(0);
            });
          });
        });
      }
    });
  });
});