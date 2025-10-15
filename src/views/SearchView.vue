<script setup>
import { ref, watch, onMounted } from 'vue';
import { url } from '../services/api';
import { useRoute } from 'vue-router';
import CardAnuncio from '../components/CardAnuncio.vue'

const route = useRoute();

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
  fetch(url(`/api/products?q=${encodeURIComponent(q)}`))
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
      <CardAnuncio v-for="item in results" :key="item.id" :item="item" variant="list" />
    </div>
  </div>
</template>

<style scoped>
.search-page {
  max-width: 1000px;
  margin: 1rem auto;
  
}
.search-box {
  display: flex;
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
.result-image img { width:100%; height:100%; object-fit:cover; border-radius:8px }
.result-body h3 { margin: 0 0 0.25rem; }
.muted { color: #636e72; font-size:0.9rem; margin:0 0 0.5rem; }
.desc { color:#2d3436; margin:0 0 0.5rem; }
.price { font-weight:700; color:#0984e3 }
.error { color: #d63031; }

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.results-grid > ::v-deep(.card):hover {
  transform: scale(1.03);
  box-shadow: 5px 5px 10px rgba(0,0,0,0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

::v-deep(.card) {
  background-color: #f2f2f2;
  height: 100px;
  width: 300px;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

::v-deep(.card .title) {
  font-size: 15px; /* tamanho que você quiser */
  display: -webkit-box;         /* necessário para line-clamp */
  -webkit-line-clamp: 1;        /* limita a 2 linhas */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

::v-deep(.card .price) {
  font-size: 14px; /* tamanho que você quiser */
}

::v-deep(.card .desc) {
  margin-top: 10px;
  font-size: 11px; /* tamanho que você quiser */
}


@media (max-width:600px){
  .results-grid { grid-template-columns: 1fr; }
}
</style>