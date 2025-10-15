// Teste rápido do sistema de filtros
// Execute este arquivo no servidor para testar a API

const products = require('./products.js');

// Teste 1: Busca simples
console.log('=== TESTE 1: Busca simples ===');
products.searchProducts('notebook', 10, (err, results) => {
  if (err) {
    console.error('Erro na busca simples:', err);
  } else {
    console.log(`Encontrados ${results.length} produtos para "notebook"`);
    results.forEach(p => console.log(`- ${p.title} (R$ ${p.price})`));
  }
});

// Teste 2: Busca com filtros
console.log('\n=== TESTE 2: Busca com filtros ===');
const filtros = {
  q: 'livro',
  selectedCategories: ['Livros'],
  minPrice: 0,
  maxPrice: 100,
  sortBy: 'price_asc'
};

products.searchProductsWithFilters(filtros, (err, results) => {
  if (err) {
    console.error('Erro na busca com filtros:', err);
  } else {
    console.log(`Encontrados ${results.length} produtos com filtros:`, filtros);
    results.forEach(p => console.log(`- ${p.title} (R$ ${p.price}) - ${p.category}`));
  }
});

// Teste 3: Filtros múltiplos
console.log('\n=== TESTE 3: Filtros múltiplos ===');
const filtrosMultiplos = {
  selectedCategories: ['Eletrônicos', 'Móveis'],
  selectedLocations: ['Retirada na UFSM'],
  maxPrice: 1000,
  sortBy: 'created_at_desc'
};

products.searchProductsWithFilters(filtrosMultiplos, (err, results) => {
  if (err) {
    console.error('Erro na busca com filtros múltiplos:', err);
  } else {
    console.log(`Encontrados ${results.length} produtos com filtros múltiplos`);
    results.forEach(p => console.log(`- ${p.title} (${p.category}) - ${p.location} - R$ ${p.price}`));
  }
});

console.log('\n=== TESTE CONCLUÍDO ===');
console.log('Se você não viu erros acima, o sistema de filtros está funcionando!');