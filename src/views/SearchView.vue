<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const query = ref(route.query.q || '');
const results = ref([]);
const loading = ref(false);
const error = ref(null);

function doSearch(q) {
  if (!q || q.trim() === '') {
    results.value = [];
    return;
  }
  loading.value = true;
  error.value = null;
  fetch(`http://localhost:3000/api/products?q=${encodeURIComponent(q)}`)
    .then(res => res.json())
    .then(data => {
      results.value = data.results || data;
    })
    .catch(err => {
      console.error('Search error', err);
      error.value = 'Erro ao buscar produtos.';
    })
    .finally(() => (loading.value = false));
}

function onSearch() {
  // Update URL so Header searches and direct links work
  router.push({ name: 'search', query: { q: query.value } });
}

// React to query changes in the URL (this makes Header -> /search?q=... work)
watch(() => route.query.q, (newQ) => {
  query.value = newQ || '';
  if (query.value) doSearch(query.value);
  else results.value = [];
});

onMounted(() => {
  if (query.value) doSearch(query.value);
});

</script>

<template>
  <div class="search-page">
    <h1>Resultados da Pesquisa - {{ query }}</h1>

    <!-- Search is performed from the header; this view reacts to ?q= in the URL -->

    <div class="status">
      <p v-if="loading">Buscando...</p>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="!loading && !error && results.length === 0">Nenhum resultado encontrado.</p>
    </div>

    <div class="results-grid">
      <div v-for="item in results" :key="item.id" class="result-card">
        <div class="result-image" :aria-hidden="true">📦</div>
        <div class="result-body">
          <h3>{{ item.title }}</h3>
          <p class="muted">{{ item.condition || item.category || '' }}</p>
          <p class="desc">{{ item.description }}</p>
          <p class="price">R$ {{ item.price }} | {{ item.location }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 1rem;
}
.search-box {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.search-box input[type="search"] {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.search-box button {
  padding: 0.75rem 1rem;
  background: #0984e3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.result-card {
  background: white;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.06);
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.result-image {
  width: 64px;
  height: 64px;
  background: #f1f2f6;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:8px;
  font-size:1.5rem;
}
.result-body h3 { margin: 0 0 0.25rem; }
.muted { color: #636e72; font-size:0.9rem; margin:0 0 0.5rem; }
.desc { color:#2d3436; margin:0 0 0.5rem; }
.price { font-weight:700; color:#0984e3 }
.error { color: #d63031; }

@media (max-width:600px){
  .results-grid { grid-template-columns: 1fr; }
}
</style>