<script setup>
import { ref, watch, onMounted } from 'vue';
import { url } from '../services/api';
import { useRoute } from 'vue-router';
import CardAnuncio from '../components/CardAnuncio.vue'
import SearchFilters from '../components/SearchFilters.vue'

const route = useRoute();

const query = ref(route.query.q || '');
const results = ref([]);
const loading = ref(false);
const error = ref(null);
const filters = ref({
  minPrice: 0,
  maxPrice: 5000,
  selectedCategories: [],
  selectedLocations: [],
  selectedConditions: [],
  sortBy: 'created_at_desc'
});

function doSearch(searchQuery = '') {
  loading.value = true;
  error.value = null;
  
  const searchFilters = {
    ...filters.value,
    q: searchQuery || query.value
  };

  console.log('Fazendo busca com filtros:', searchFilters);

  fetch(url('/api/products/search'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(searchFilters)
  })
    .then(res => res.json())
    .then(data => {
      results.value = data.results || [];
      console.log('Resultados da busca:', results.value);
    })
    .catch(err => {
      console.error('Search error', err);
      error.value = 'Erro ao buscar produtos.';
    })
    .finally(() => (loading.value = false));
}

// Modificacao de query na URL
watch(() => route.query.q, (newQ) => {
  query.value = newQ || '';
  doSearch();
});

// Mudanca de categoria na URL
watch(() => route.query.category, (newCategory) => {
  if (newCategory) {
    filters.value.selectedCategories = [newCategory];
    query.value = '';
    doSearch();
  }
}, { immediate: true });


// Lida com mudanca de filtros
function onFiltersChanged(newFilters) {
  filters.value = newFilters;
  console.log('Filtros alterados:', newFilters);
  doSearch();
  doSearch();
}

// Funcao para favoritar (placeholder)
function toggleFavorite(productId) {
  const stored = localStorage.getItem('user');
  const user = stored ? JSON.parse(stored) : null;
  if (!user) return alert('Você precisa estar logado para favoritar produtos.');
  if (user.role === 'supervisor') return alert('Contas supervisor não podem favoritar anúncios.');
  alert('Favoritar/desfavoritar a partir da página do produto por enquanto.');
}

onMounted(() => {
  doSearch();
});

</script>

<template>
  <div class="search-container">
    <!-- Sidebar com Filtros -->
    <aside class="sidebar">
      <SearchFilters 
        v-model="filters" 
        @filtersChanged="onFiltersChanged"
      />
    </aside>

    <!-- Area principal com resultados -->
    <main class="main-content">
      <!-- Status da busca -->
      <div class="search-status">
        <p v-if="loading">Buscando produtos...</p>
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="!loading && !error && results.length === 0 && query">
          Nenhum resultado encontrado para "{{ query }}"
        </p>
        <p v-if="!loading && !error && results.length > 0">
          {{ results.length }} produto{{ results.length !== 1 ? 's' : '' }} encontrado{{ results.length !== 1 ? 's' : '' }}
          {{ query ? ` para "${query}"` : '' }}
        </p>
      </div>

      <!-- Grid de produtos -->
      <div class="products-grid">
        <div
          v-for="item in results"
          :key="item.id"
          class="product-card"
          @click="$router.push(`/product/${item.id}`)"
        >
          <div class="product-image">
            <img 
              v-if="item.images && item.images.length > 0" 
              :src="item.images[0]" 
              :alt="item.title"
            />
            <div v-else class="no-image">📦</div>
          </div>
          
          <div class="product-info">
            <h3 class="product-title">{{ item.title }}</h3>
            <p class="product-price">
              <strong v-if="item.price === 0">Grátis</strong>
              <span v-else>R$ {{ item.price }}</span>
            </p>
            <p class="product-meta">{{ item.condition || item.category }}</p>
            <p class="product-location">{{ item.location }}</p>
          </div>

          <!-- Icone coracao dos favoritos -->
          <button 
            class="favorite-btn"
            :class="{ active: item.favorited }"
            @click.stop="toggleFavorite(item.id)"
          >
            <span class="star" v-if="item.favorited">★</span>
            <span class="star" v-else>☆</span>
          </button>
        </div>
      </div>

      <!-- Loading spinner -->
      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.search-container {
  display: flex;
  gap: 20px;
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.sidebar {
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.search-status {
  margin-bottom: 20px;
  color: #666;
  font-size: 0.95rem;
}

.search-status .error {
  color: #d63031;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product-card {
  background: #F2F2F2;
  border-radius: 15px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.product-image {
  width: 100%;
  height: 160px;
  margin-bottom: 12px;
  border-radius: 15px;
  overflow: hidden;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  font-size: 2rem;
  color: #ccc;
}

.product-info {
  flex: 1;
}

.product-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c9aa0;
  margin: 0 0 6px 0;
}

.product-price strong {
  color: #27ae60;
}

.product-meta {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 4px 0;
}

.product-location {
  font-size: 0.85rem;
  color: #999;
  margin: 0;
}

.favorite-btn {
  background: none;
  border: none;
  position: absolute;
  top: 12px;
  right: 20px;
  font-size: 1.8rem;
  cursor: pointer;
  color: #ccc;
  transition: color 0.2s, transform 0.2s ease;
}

.favorite-btn.active {
  color: gold;
}

.favorite-btn:hover {
  transform: scale(1.2);
  color: gold;
}

.star {
  font-size: inherit;
  color: inherit;
  pointer-events: none;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2c9aa0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsividade */
@media (max-width: 768px) {
  .search-container {
    flex-direction: column;
    padding: 0 15px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .product-card {
    padding: 12px;
  }
  
  .product-image {
    height: 140px;
  }
}
</style>