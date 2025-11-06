<template>
  <div class="product-page">
    <div v-if="loading">Carregando...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="product" class="product-card">
        <div class="image">
          <template v-if="selectedImage">
            <img :src="selectedImage" alt="Produto" />
          </template>
          <span v-else>📦</span>

          <!-- gallery abaixo da imagem principal -->
          <div v-if="product && product.images && product.images.length" class="gallery">
            <div class="thumbs">
              <button v-for="(img,i) in product.images" :key="img"
                      class="thumb-btn"
                      :class="{active: selectedImage === img}"
                      @click="selectImage(img)">
                <img :src="img" alt="thumb" />
              </button>
            </div>
          </div>
        </div>

        <div class="info">
          <div class="title-row">
            <h1>{{ product.title }}</h1>
          </div>
          <p class="price"> <strong v-if="product.price === 0">Grátis</strong><span v-else>R$ {{ product.price }}</span></p>
          <p class="muted">{{ product.condition }} | {{ product.category }} | {{ product.location }}</p>
          <p class="desc">{{ product.description }}</p>
          <p class="anuncio">Anúncio criado em: {{ formatDate(product.created_at) }}</p>
          <p class="vendedor">Vendedor: {{ product.seller_name || product.seller_id }}</p>
          
          <!-- Status Warning Banners -->
          <div v-if="product.status === 'pending'" class="status-warning pending">
            <span class="icon">⚠️</span>
            <div class="warning-content">
              <strong>Aprovação Pendente</strong>
              <p v-if="isAdmin">Este anúncio está aguardando aprovação de um administrador.</p>
              <p v-else>Este anúncio está aguardando aprovação e ficará visível após revisão.</p>
            </div>
          </div>
          
          <div v-if="product.status === 'blocked'" class="status-warning blocked">
            <span class="icon">🚫</span>
            <div class="warning-content">
              <strong>Anúncio Bloqueado</strong>
              <p v-if="isAdmin">Este anúncio foi bloqueado e não está visível para usuários.</p>
              <p v-else>Este anúncio foi bloqueado por um administrador.</p>
            </div>
          </div>

          <!-- Admin Action Buttons -->
          <div v-if="isAdmin" class="admin-actions">
            <h3>Ações do Administrador</h3>
            <div class="admin-buttons">
              <button 
                v-if="product.status === 'pending'" 
                @click="approveProduct" 
                class="admin-btn approve-btn"
              >
                ✓ Aprovar Anúncio
              </button>
              <button 
                v-if="product.status === 'pending' || product.status === 'allowed'" 
                @click="blockProduct" 
                class="admin-btn block-btn"
              >
                🚫 Bloquear Anúncio
              </button>
              <button 
                v-if="product.status === 'blocked'" 
                @click="approveProduct" 
                class="admin-btn approve-btn"
              >
                ✓ Desbloquear e Aprovar
              </button>
              <button 
                @click="deleteProduct" 
                class="admin-btn delete-btn"
              >
                🗑️ Excluir Anúncio
              </button>
            </div>
          </div>
          
          <!-- Edit Button for Owner -->
          <button 
            v-if="isOwner" 
            class="edit-product-btn"
            @click="goToEdit"
          >
            ✏️ Editar esse anúncio
          </button>
          
          <!-- Contact Seller Button -->
          <button 
            v-if="userState.user && product.seller_id !== userState.user.id" 
            class="contact-seller-btn"
            @click="openChat"
          >
            💬 Conversar com vendedor
          </button>
        </div>
        
        <button class="star" :class="{active: favorited}" @click="toggleFavorite">
          <span v-if="favorited">★</span>
          <span v-else>☆</span>
        </button>
    </div>

    <!-- Chat Popup -->
    <ChatPopup
      v-model:isOpen="chatOpen"
      :productId="product?.id"
      :counterpartId="product?.seller_id"
      :product="product"
      :counterpart="{ 
        name: product?.seller_name, 
        picture: null 
      }"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { url } from '../services/api';
import { userState } from '../services/authService';
import ChatPopup from '../components/ChatPopup.vue';

const route = useRoute();
const router = useRouter();
const id = route.params.id;

const product = ref(null);
const loading = ref(true);
const error = ref(null);
const favorited = ref(false);
const selectedImage = ref(null);
const chatOpen = ref(false);

const isOwner = computed(() => {
  return userState.user && product.value && userState.user.id === product.value.seller_id;
});

const isAdmin = computed(() => {
  return userState.user && (userState.user.role === 'admin' || userState.user.role === 'supervisor');
});

function goToEdit() {
  router.push(`/product/${id}/edit`);
}

async function approveProduct() {
  if (!confirm('Aprovar este anúncio?')) return;
  try {
    const res = await fetch(url(`/api/admin/approve-product/${id}`), {
      method: 'POST',
      headers: { 'x-admin-id': String(userState.user.id) }
    });
    if (!res.ok) throw new Error('Erro ao aprovar produto');
    alert('Anúncio aprovado com sucesso!');
    // Reload the product to show updated status
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert(err.message || 'Erro ao aprovar anúncio');
  }
}

async function blockProduct() {
  if (!confirm('Bloquear este anúncio? Ele não ficará visível para outros usuários.')) return;
  try {
    const res = await fetch(url(`/api/admin/block-product/${id}`), {
      method: 'POST',
      headers: { 'x-admin-id': String(userState.user.id) }
    });
    if (!res.ok) throw new Error('Erro ao bloquear produto');
    alert('Anúncio bloqueado com sucesso!');
    // Reload the product to show updated status
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert(err.message || 'Erro ao bloquear anúncio');
  }
}

async function deleteProduct() {
  if (!confirm('Tem certeza que deseja EXCLUIR este anúncio permanentemente? Esta ação não pode ser desfeita.')) return;
  try {
    const res = await fetch(url(`/api/products/${id}`), { method: 'DELETE' });
    const ct = res.headers.get('content-type') || '';
    let data;
    if (ct.includes('application/json')) {
      data = await res.json();
    } else {
      data = { text: await res.text() };
    }
    if (!res.ok) {
      throw new Error((data && data.error) || data.text || 'Erro ao deletar produto');
    }
    alert('Anúncio excluído com sucesso!');
    router.push('/my-ads');
  } catch (err) {
    console.error(err);
    alert(err.message || 'Erro ao excluir anúncio');
  }
}

async function checkFavorite() {
  if (!userState.user) return favorited.value = false;
  try {
    const res = await fetch(url(`/api/users/${userState.user.id}/favorites`));
    if (!res.ok) return favorited.value = false;
    const data = await res.json();
    favorited.value = (data.results || []).some(p => p.id == id);
  } catch (e) {
    console.error('favorite check error', e);
    favorited.value = false;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

onMounted(async () => {
  try {
    const headers = {};
    // Send seller_id header if user is logged in to allow viewing own pending products
    if (userState.user && userState.user.id) {
      headers['x-seller-id'] = String(userState.user.id);
      // Also send admin header if user is admin to access blocked products
      if (userState.user.role === 'admin' || userState.user.role === 'supervisor') {
        headers['x-admin-id'] = String(userState.user.id);
      }
    }
    
    const res = await fetch(url(`/api/products/${id}`), { headers });
    if (!res.ok) throw new Error('Produto não encontrado');
    const data = await res.json();
    product.value = data.product;
    // initialize selected image to first image if present
    if (product.value && product.value.images && product.value.images.length) {
      selectedImage.value = product.value.images[0];
    }
  } catch (err) {
    console.error(err);
    error.value = err.message || 'Erro ao carregar produto';
  } finally {
    loading.value = false;
  }
  await checkFavorite();
});

async function toggleFavorite() {
  if (!userState.user) return alert('Você precisa estar logado para favoritar produtos.');
  if (userState.user.role === 'supervisor') return alert('Contas supervisor não podem favoritar anúncios.');
  const uid = userState.user.id;
  const method = favorited.value ? 'DELETE' : 'POST';
  try {
    // optimistic UI
    favorited.value = !favorited.value;
    const res = await fetch(url(`/api/products/${id}/favorite`), {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: uid })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Erro ao alterar favorito');
    }
  } catch (err) {
    console.error(err);
    favorited.value = !favorited.value; // rollback
    alert(err.message || 'Erro ao favoritar');
  }
}

function selectImage(img) {
  selectedImage.value = img;
}

function openChat() {
  if (!userState.user) {
    alert('Você precisa estar logado para conversar.');
    return;
  }
  chatOpen.value = true;
}
</script>

<style scoped>
.product-page { 
  max-width:900px; 
  margin:2rem auto; 
  padding:1rem 
}

.product-card { 
  position: relative;
  display:flex; 
  object-fit:cover; 
  border-bottom:70px solid #f2f2f2;
  gap:1rem; 
  background: #f2f2f2; 
  padding:1rem; 
  border-radius:20px; 
  box-shadow:0 6px 16px rgba(0,0,0,0.2) 
}

.product-card .image {
  display: flex;
  flex-direction: column; /* força empilhamento vertical */
  align-items: center;
  width:500px; 
  height:375px; 
  background: #f2f2f2; 
  display:block; 
  align-items:center; 
  justify-content:center; 
  border-radius:18px; 
  font-size:3rem;
  position: relative;
}

.product-card .gallery {
  max-width: 900px; 
}

.product-card .thumbs {
  display: flex;
  gap: 0.5rem;
  justify-content: center; /* centraliza as miniaturas */
}

.image img { 
  width: 500px; 
  height: 375px; 
  object-fit:cover; 
  border-radius:18px 
}

.thumb-btn { 
  border: none; 
  padding:0; 
  background: transparent; 
  cursor:pointer; 
  border-radius:6px; 
  overflow:hidden 
}

.thumb-btn img { 
  width:80px; 
  height:60px; 
  object-fit:cover; 
  display:block; 
  border-radius:6px; 
  border:2px solid transparent;
}

.thumb-btn.active img { 
  border-color: #4888b9ff;
  border-width:3px;
}

.title-row {
  display: flex;
  align-items: center;        /* alinha verticalmente o título e o botão */
  justify-content: space-between; /* título à esquerda, botão à direita */
  line-height: 1.5em;
  padding-top: 0.2rem;
  margin-bottom: -15px;
  gap: 0.5rem;                /* espaço entre os dois */
}

.title-row h1 {
  margin: 0;                  /* remove espaçamento padrão */
  font-size: 1.5rem;          /* ajuste opcional */
  flex: 1;                    /* faz o título ocupar o espaço restante */
}

.star {
  background: none;
  border: none;
  position: absolute;
  top: 12px;       /* distância do topo do card */
  right: 20px;
  font-size: 1.8rem;          /* tamanho da estrela */
  cursor: pointer;
  color: #ccc;
  transition: color 0.2s;
}

.star.active {
  color: gold;                /* estrela favoritada */
}

.star:hover {
  transform: scale(1.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  color: gold;                /* destaque ao passar o mouse */
}

.muted { 
  color: #636e72; 
  margin-bottom:0.75rem 
}

.desc { 
  margin-bottom:1rem;
  font-size: 12px;
  margin-left: 10px;
  line-height: 1.6em;
  color: #00445180;
}

.contact-seller-btn {
  margin-top: 16px;
  padding: 12px 24px;
  background: #004451;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.contact-seller-btn:hover {
  background: #003340;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 68, 81, 0.3);
}

.edit-product-btn {
  margin-top: 16px;
  padding: 12px 24px;
  background: #0097b2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  width: 100%;
}

.edit-product-btn:hover {
  background: #007a8f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 151, 178, 0.3);
}

.price { 
  color: #0984e3; 
  font-weight:700; 
  margin-bottom: -10px;
  font-size:22px;
}

.anuncio { 
  position: absolute;
  color: #004451ff; 
  gap:4px;  
  font-size: 12px;
  bottom: -20px;
  right: 25px;
}

.vendedor { 
  position: absolute;
  color: #004451ff; 
  gap:4px;  
  font-size: 12px;
  bottom: -40px;
  right: 25px;
}

.error { 
  color: #d63031 
  }

.pending-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(243, 156, 18, 0.95);
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: bold;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

/* Status Warning Banners */
.status-warning {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.status-warning.pending {
  background: linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%);
  border-left: 4px solid #f39c12;
}

.status-warning.blocked {
  background: linear-gradient(135deg, #ffe0e0 0%, #ffc4c4 100%);
  border-left: 4px solid #d63031;
}

.status-warning .icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.status-warning .warning-content {
  flex: 1;
}

.status-warning .warning-content strong {
  display: block;
  font-size: 1.1rem;
  margin-bottom: 4px;
  color: #004451;
}

.status-warning .warning-content p {
  margin: 0;
  font-size: 0.95rem;
  color: #636e72;
}

/* Admin Actions Section */
.admin-actions {
  background: linear-gradient(135deg, #e8f4f8 0%, #d0e8f0 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  border-left: 4px solid #0097b2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.admin-actions h3 {
  margin: 0 0 16px 0;
  color: #004451;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.admin-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.admin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.approve-btn {
  background: #27ae60;
  color: white;
}

.approve-btn:hover {
  background: #229954;
}

.block-btn {
  background: #e67e22;
  color: white;
}

.block-btn:hover {
  background: #d35400;
}

.delete-btn {
  background: #d63031;
  color: white;
}

.delete-btn:hover {
  background: #c0392b;
}


</style>
