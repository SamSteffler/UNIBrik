// Teste das rotas HTTP da API
const testRoutes = async () => {
  const baseURL = 'http://localhost:3000';
  
  console.log('=== TESTANDO ROTAS DA API ===\n');
  
  // Teste 1: Rota básica
  try {
    console.log('1. Testando rota básica /...');
    const response = await fetch(`${baseURL}/`);
    const data = await response.json();
    console.log('✓ Rota básica funcionando:', data.message);
  } catch (error) {
    console.log('✗ Erro na rota básica:', error.message);
  }
  
  // Teste 2: Busca simples
  try {
    console.log('\n2. Testando busca simples /api/products?q=notebook...');
    const response = await fetch(`${baseURL}/api/products?q=notebook`);
    const data = await response.json();
    console.log(`✓ Busca simples: ${data.results.length} resultados encontrados`);
    if (data.results.length > 0) {
      console.log(`  - Primeiro resultado: ${data.results[0].title}`);
    }
  } catch (error) {
    console.log('✗ Erro na busca simples:', error.message);
  }
  
  // Teste 3: Busca com filtros
  try {
    console.log('\n3. Testando busca com filtros POST /api/products/search...');
    const filters = {
      selectedCategories: ['Eletrônicos'],
      minPrice: 0,
      maxPrice: 1000,
      sortBy: 'price_asc'
    };
    
    const response = await fetch(`${baseURL}/api/products/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters)
    });
    
    const data = await response.json();
    console.log(`✓ Busca com filtros: ${data.results.length} resultados encontrados`);
    data.results.forEach(p => {
      console.log(`  - ${p.title} (${p.category}) - R$ ${p.price}`);
    });
  } catch (error) {
    console.log('✗ Erro na busca com filtros:', error.message);
  }
  
  // Teste 4: Produtos gratuitos
  try {
    console.log('\n4. Testando produtos gratuitos /api/products/free...');
    const response = await fetch(`${baseURL}/api/products/free`);
    const data = await response.json();
    console.log(`✓ Produtos gratuitos: ${data.results.length} encontrados`);
    data.results.forEach(p => {
      console.log(`  - ${p.title} - R$ ${p.price}`);
    });
  } catch (error) {
    console.log('✗ Erro nos produtos gratuitos:', error.message);
  }
  
  // Teste 5: Produtos recentes
  try {
    console.log('\n5. Testando produtos recentes /api/products/recent...');
    const response = await fetch(`${baseURL}/api/products/recent`);
    const data = await response.json();
    console.log(`✓ Produtos recentes: ${data.results.length} encontrados`);
  } catch (error) {
    console.log('✗ Erro nos produtos recentes:', error.message);
  }
  
  console.log('\n=== TESTE DAS ROTAS CONCLUÍDO ===');
  console.log('Se você viu ✓ em todos os testes, as rotas estão funcionando perfeitamente!');
};

// Executar os testes
testRoutes().catch(console.error);