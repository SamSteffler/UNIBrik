<template>
  <div class="my-ads">
    <div class="header">
      <h2>Meus anúncios</h2>
      <button @click="goCreate" class="create-button">+ Novo anúncio</button>
    </div>

    <div v-if="loading">Carregando...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="cards">
      <div v-for="item in products" :key="item.id" class="card clickable" @click="goEdit(item.id)">
        <div class="card-image">📦</div>
        <div class="card-content">
          <h3>{{ item.title }}</h3>
          <p class="muted">{{ item.condition || item.category }}</p>
          <p class="desc">{{ item.description }}</p>
          <p class="price">R$ {{ item.price }}</p>
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
const products = ref([]);
const loading = ref(false);
const error = ref(null);

function goCreate() {
  router.push('/products/create');
}

function goEdit(id) {
  router.push({ name: 'product-edit', params: { id } });
}

async function load() {
  if (!userState.user) {
    error.value = 'Você precisa estar logado para ver seus anúncios.';
    return;
  }
  loading.value = true;
  error.value = null;
  try {
  const res = await fetch(url(`/api/my-products?seller_id=${userState.user.id}`));
    const data = await res.json();
    products.value = data.results || [];
  } catch (err) {
    console.error(err);
    error.value = 'Erro ao carregar anúncios.';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem }
.create-button { background:#0984e3; color:white; border:none; padding:0.5rem 1rem; border-radius:6px }
.cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1rem }
.card { background:white; padding:1rem; border-radius:10px; box-shadow:0 6px 18px rgba(0,0,0,0.06); display:flex; gap:1rem }
.card-image { width:80px; height:80px; background:#f1f2f6; display:flex; align-items:center; justify-content:center; border-radius:8px }
.muted { color:#636e72 }
.price { color:#0984e3; font-weight:700 }
.error { color:#d63031 }
</style>
