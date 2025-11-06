<template>
  <div class="my-ads">
    <div class="header">
        <h2 class="h2">{{ isAdmin ? 'Gerenciar anúncios' : 'Meus anúncios' }}</h2>
        <div style="display:flex;gap:8px;align-items:center">
          <button v-if="isAdmin" @click="filterStatus = 'pending'" :class="['filter-button', {active: filterStatus === 'pending'}]">Pendentes</button>
          <button v-if="isAdmin" @click="filterStatus = 'allowed'" :class="['filter-button', {active: filterStatus === 'allowed'}]">Aprovados</button>
          <button v-if="isAdmin" @click="filterStatus = 'blocked'" :class="['filter-button', {active: filterStatus === 'blocked'}]">Bloqueados</button>
          <button v-if="isAdmin" @click="filterStatus = 'all'" :class="['filter-button', {active: filterStatus === 'all'}]">Todos</button>
          <button v-if="!isAdmin" @click="goCreate" class="create-button">Novo anúncio</button>
        </div>
    </div>

    <div v-if="loading">Carregando...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="cards">
      <div v-for="item in displayedProducts" :key="item.id" style="margin-bottom:12px">
        <CardAnuncio :item="item" variant="list" desc-size="0.75rem" :navigate="true" />
        <div v-if="isAdmin" style="display:flex;gap:8px;margin-top:6px;align-items:center">
          <span class="status-badge" :class="'status-' + item.status">{{ statusLabel(item.status) }}</span>
          <button v-if="item.status !== 'allowed'" @click="approve(item.id)" class="action-button">Aprovar</button>
          <button v-if="item.status !== 'blocked'" @click="blockProduct(item.id)" class="action-button" style="background:#f39c12">Bloquear</button>
          <button @click="del(item.id)" class="action-button" style="background:#d63031">Excluir</button>
        </div>
      </div>
      <div v-if="displayedProducts.length === 0 && !loading">Nenhum anúncio encontrado.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { userState } from '../services/authService';
import { url } from '../services/api';
import CardAnuncio from '../components/CardAnuncio.vue'

const router = useRouter();
const products = ref([]);
const loading = ref(false);
const error = ref(null);
const filterStatus = ref('all'); // 'pending', 'allowed', 'blocked', 'all' - Default to 'all' for admin
const isAdmin = computed(() => userState.user && (userState.user.role === 'admin' || userState.user.role === 'supervisor'));

const displayedProducts = computed(() => {
  if (!isAdmin.value) return products.value;
  if (filterStatus.value === 'all') return products.value;
  return products.value.filter(p => p.status === filterStatus.value);
});

function goCreate() {
  router.push('/products/create');
}

function goEdit(id) {
  router.push({ name: 'product-edit', params: { id } });
}

function statusLabel(status) {
  const labels = {
    'pending': 'Aprovação pendente',
    'allowed': 'Aprovado',
    'blocked': 'Bloqueado'
  };
  return labels[status] || status;
}

async function load() {
  if (!userState.user) {
    error.value = 'Você precisa estar logado para ver seus anúncios.';
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    let endpoint;
    if (isAdmin.value) {
      // Admin: load all products
      endpoint = '/api/admin/products/all';
    } else {
      // Regular user: load own products
      endpoint = `/api/my-products?seller_id=${userState.user.id}`;
    }
    const res = await fetch(url(endpoint), isAdmin.value ? {
      headers: { 'x-admin-id': String(userState.user.id) }
    } : {});
    const data = await res.json();
    products.value = data.results || [];
  } catch (err) {
    console.error(err);
    error.value = 'Erro ao carregar anúncios.';
  } finally {
    loading.value = false;
  }
}

async function approve(id) {
  try {
    await fetch(url(`/api/admin/approve-product/${id}`), { method: 'POST', headers: { 'x-admin-id': String(userState.user.id) } });
    // Update status in list
    const product = products.value.find(p => p.id === id);
    if (product) product.status = 'allowed';
  } catch (e) { console.error(e); }
}

async function blockProduct(id) {
  try {
    await fetch(url(`/api/admin/block-product/${id}`), { method: 'POST', headers: { 'x-admin-id': String(userState.user.id) } });
    const product = products.value.find(p => p.id === id);
    if (product) product.status = 'blocked';
  } catch (e) { console.error(e); }
}

async function del(id) {
  try {
    await fetch(url(`/api/admin/product/${id}`), { method: 'DELETE', headers: { 'x-admin-id': String(userState.user.id) } });
    products.value = products.value.filter(p => p.id !== id);
  } catch (e) { console.error(e); }
}

onMounted(load);
</script>

<style scoped>
.h2{
  color: #004451;
  font-size: 2rem;
}

.header { 
  display:flex; 
  justify-content:space-between; 
  align-items:center; 
}

.create-button { 
  background: #0097b2; 
  font-family: 'Plus Jakarta Sans', Times, serif !important;
  font-weight: bold;
  font-size: 0.8rem;
  color:white; 
  border:none; 
  padding:0.5rem 1rem; 
  border-radius:6px 
}

.create-button:hover {
  transform: scale(1.05); /* aumenta um pouco */
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.2); /* adiciona sombra */
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;
}

.filter-button {
  background: #ddd;
  color: #004451;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
}

.filter-button.active {
  background: #0097b2;
  color: white;
}

.action-button {
  background: #0097b2;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
}

.status-badge {
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  display: inline-block;
}

.status-pending {
  background: #f39c12;
  color: white;
}

.status-allowed {
  background: #27ae60;
  color: white;
}

.status-blocked {
  background: #c0392b;
  color: white;
}

.cards { 
  display:grid; 
  grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); 
  gap:1rem 
}

.muted { 
  color:#636e72 
}

.price { 
  color:#0984e3; 
  font-weight:700 
}

.error { 
  color:#d63031 
}

::v-deep(.card) {
  width: 340px;
  height: 120px;
  background-color: #f2f2f2;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.cards > ::v-deep(.card):hover {
  transform: scale(1.05);
  box-shadow: 5px 5px 10px rgba(0,0,0,0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

</style>
