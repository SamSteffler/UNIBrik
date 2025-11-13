<template>
  <div class="my-ads">
    <div class="header">
      <h2 class="h2">{{ isAdmin ? 'Lista de Anúncios' : 'Meus Anúncios' }}</h2>
      <button @click="goCreate" class="create-button">Novo anúncio</button>
    </div>

    <div v-if="loading">Carregando...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="results.length === 0 && !loading">
      Nenhum anúncio encontrado. Crie um novo anúncio para começar!
    </div>

    <div class="cards">
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService, { userState } from '../services/authService';
import { url } from '../services/api';
import CardAnuncio from '../components/CardAnuncio.vue';

const router = useRouter();
const results = ref([]);
const loading = ref(false);
const error = ref(null);

// ✅ Detecta se é admin/supervisor
const isAdmin = computed(() => {
  const user = authService.userState.user;
  return user && (user.role === 'admin' || user.role === 'supervisor');
});

function goCreate() {
  router.push('/products/create');
}

async function load() {
  if (!userState.user) {
    error.value = 'Você precisa estar logado.';
    return;
  }
  loading.value = true;
  error.value = null;

  try {
    // 🔄 Mantém o mesmo endpoint antigo, que funcionava
    const res = await fetch(url(`/api/my-products?seller_id=${userState.user.id}`));
    const data = await res.json();
    const items = data.results || [];

    // Garante que os anúncios tenham imagens
    const withImages = await Promise.all(
      items.map(async (it) => {
        if (it.images && it.images.length) return it;
        try {
          const ir = await fetch(url(`/api/products/${it.id}/images`));
          const idata = await ir.json();
          return { ...it, images: idata.images || [] };
        } catch {
          return it;
        }
      })
    );

    results.value = withImages;
  } catch (e) {
    console.error(e);
    error.value = 'Erro ao carregar anúncios.';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.h2 {
  font-size: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.create-button {
  background: #0097b2;
  font-family: 'Plus Jakarta Sans', Times, serif !important;
  font-weight: bold;
  font-size: 0.8rem;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.create-button:hover {
  transform: scale(1.05);
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

::v-deep(.card) {
  background-color: #f2f2f2;
  height: 120px;
  width: 350px;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.cards > ::v-deep(.card):hover {
  transform: scale(1.05);
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.error {
  color: #d63031;
}
</style>
