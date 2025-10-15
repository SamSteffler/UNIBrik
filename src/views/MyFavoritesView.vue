<template>
  <div class="favorites-page">
    <h2>Meus Favoritos</h2>
    <div v-if="loading">Carregando...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="results.length === 0">Nenhum favorito encontrado. Escolha os seus anúncios favoritos e eles aparecerão aqui!</div>
    <div class="results-grid">
      <CardAnuncio
        v-for="item in results"
        :key="item.id"
        :item="item"
        variant="list"
        desc-size="0.75rem"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { userState } from '../services/authService';
import { url } from '../services/api';
import CardAnuncio from '../components/CardAnuncio.vue'

const results = ref([]);
const loading = ref(false);
const error = ref(null);

async function load() {
  if (!userState.user) { error.value = 'Você precisa estar logado.'; return; }
  loading.value = true; error.value = null;
  try {
    const res = await fetch(url(`/api/users/${userState.user.id}/favorites`));
    const data = await res.json();
    // Ensure each item has images; if backend didn't include them, fetch per-product as a fallback
    const items = data.results || [];
    const withImages = await Promise.all(items.map(async (it) => {
      if (it.images && it.images.length) return it;
      try {
        const ir = await fetch(url(`/api/products/${it.id}/images`));
        const idata = await ir.json();
        return { ...it, images: (idata.images || []) };
      } catch (e) {
        return it;
      }
    }));
    results.value = withImages;
  } catch (e) { console.error(e); error.value = 'Erro ao carregar favoritos.' }
  finally { loading.value = false }
}

onMounted(load);
</script>

<style scoped>
.results-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1rem }
.error { color:#d63031 }
</style>
