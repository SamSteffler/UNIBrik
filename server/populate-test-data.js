// Script para popular o banco com dados de teste
const db = require('./database.js');
const products = require('./products.js');

// Dados de teste para popular o banco
const testProducts = [
  {
    title: 'Notebook Dell Inspiron',
    condition: 'Usado - bom',
    category: 'Eletrônicos',
    description: 'Notebook Dell em ótimo estado, ideal para estudos',
    price: 1500,
    seller_id: 1,
    location: 'UFSM'
  },
  {
    title: 'Livro de Cálculo I',
    condition: 'Usado - como novo',
    category: 'Livros',
    description: 'Livro de Cálculo I em perfeito estado',
    price: 80,
    seller_id: 1,
    location: 'UFSM'
  },
  {
    title: 'Mesa de Estudos',
    condition: 'Usado',
    category: 'Móveis',
    description: 'Mesa de madeira para estudos, muito resistente',
    price: 200,
    seller_id: 1,
    location: 'Em casa'
  },
  {
    title: 'Smartphone Samsung',
    condition: 'Novo',
    category: 'Eletrônicos',
    description: 'Smartphone novo na caixa, nunca usado',
    price: 800,
    seller_id: 1,
    location: 'UFSM'
  },
  {
    title: 'Cadeira de Escritório',
    condition: 'Usado - bom',
    category: 'Móveis',
    description: 'Cadeira ergonômica para escritório',
    price: 150,
    seller_id: 1,
    location: 'A combinar'
  },
  {
    title: 'Calculadora Científica HP',
    condition: 'Grátis',
    category: 'Eletrônicos',
    description: 'Calculadora científica funcionando perfeitamente',
    price: 0,
    seller_id: 1,
    location: 'UFSM'
  }
];

console.log('Populando banco com dados de teste...');

// Primeiro, vamos verificar se já existem produtos
db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
  if (err) {
    console.error('Erro ao verificar produtos:', err);
    return;
  }
  
  console.log(`Produtos existentes no banco: ${row.count}`);
  
  if (row.count === 0) {
    console.log('Banco vazio, adicionando produtos de teste...');
    
    let completed = 0;
    testProducts.forEach((product, index) => {
      products.createProduct(product, (err, result) => {
        if (err) {
          console.error(`Erro ao criar produto ${index + 1}:`, err);
        } else {
          console.log(`✓ Produto criado: ${result.title} (ID: ${result.id})`);
        }
        
        completed++;
        if (completed === testProducts.length) {
          console.log('\n=== DADOS DE TESTE ADICIONADOS ===');
          console.log('Execute o teste novamente para ver os resultados!');
          process.exit(0);
        }
      });
    });
  } else {
    console.log('Banco já possui produtos. Listando produtos existentes:');
    
    db.all('SELECT id, title, category, price, location FROM products LIMIT 10', (err, rows) => {
      if (err) {
        console.error('Erro ao listar produtos:', err);
        return;
      }
      
      rows.forEach(p => {
        console.log(`- ID ${p.id}: ${p.title} (${p.category}) - R$ ${p.price} - ${p.location}`);
      });
      
      console.log('\n=== DADOS JÁ EXISTEM ===');
      process.exit(0);
    });
  }
});