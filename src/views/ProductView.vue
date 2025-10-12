<template>
  <div class="product-page">
    <div v-if="loading">Carregando...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="product" class="product-card">
      <div class="image">📦</div>
      <div class="info">
        <h1>{{ product.title }}</h1>
        <p class="muted">{{ product.condition }} | {{ product.category }} | {{ product.location }}</p>
        <p class="desc">{{ product.description }}</p>
        <p class="price"> <strong v-if="product.price === 0">Grátis</strong><span v-else>R$ {{ product.price }}</span></p>
        <p class="meta">Anúncio criado em: {{ product.created_at }}</p>
  <p class="meta">Vendedor: {{ product.seller_name || product.seller_id }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
const id = route.params.id;

const product = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const res = await fetch(`http://localhost:3000/api/products/${id}`);
    if (!res.ok) throw new Error('Produto não encontrado');
    const data = await res.json();
    product.value = data.product;
  } catch (err) {
    console.error(err);
    error.value = err.message || 'Erro ao carregar produto';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.product-page { max-width:900px; margin:2rem auto; padding:1rem }
.product-card { display:flex; gap:1rem; background:white; padding:1rem; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.06) }
.image { width:160px; height:160px; background:#f1f2f6; display:flex; align-items:center; justify-content:center; border-radius:8px; font-size:3rem }
.info h1 { margin:0 0 0.5rem }
.muted { color:#636e72; margin-bottom:0.75rem }
.desc { margin-bottom:1rem }
.price { color:#0984e3; font-weight:700; margin-bottom:0.5rem }
.meta { color:#95a5a6; font-size:0.9rem }
.error { color:#d63031 }
</style>
