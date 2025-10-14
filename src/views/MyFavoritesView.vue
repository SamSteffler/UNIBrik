<template>
  <div class="favorites-page">
    <h2>Meus Favoritos</h2>
    <div v-if="loading">Carregando...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="results.length === 0">Nenhum favorito encontrado. Escolha os seus anúncios favoritos e eles aparecerão aqui!</div>
    <div class="results-grid">
        <div v-for="item in results" :key="item.id" class="result-card" @click="goToProduct(item.id)">
        <div class="result-image">📦</div>
        <div class="result-body">
          <h3>{{ item.title }}</h3>
          <p class="muted">{{ item.condition || item.category }}</p>
          <p class="price"><span v-if="item.price===0">Grátis</span><span v-else>R$ {{ item.price }}</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userState } from '../services/authService';
import { url } from '../services/api';

const router = useRouter();
const results = ref([]);
const loading = ref(false);
const error = ref(null);

function goToProduct(id) {
  router.push({ name: 'product', params: { id } });
}

async function load() {
  if (!userState.user) { error.value = 'Você precisa estar logado.'; return; }
  loading.value = true; error.value = null;
  try {
    const res = await fetch(url(`/api/users/${userState.user.id}/favorites`));
    const data = await res.json();
    results.value = data.results || [];
  } catch (e) { console.error(e); error.value = 'Erro ao carregar favoritos.' }
  finally { loading.value = false }
}

onMounted(load);
</script>

<style scoped>
.results-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1rem }
.result-card { background:white; padding:1rem; border-radius:8px; cursor:pointer }
.muted { color:#636e72 }
.price { color:#0984e3 }
.error { color:#d63031 }
</style>
