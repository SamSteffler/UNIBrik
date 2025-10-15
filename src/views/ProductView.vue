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
        </div>
        
        <button class="star" :class="{active: favorited}" @click="toggleFavorite">
          <span v-if="favorited">★</span>
          <span v-else>☆</span>
        </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { url } from '../services/api';
import { userState } from '../services/authService';
const route = useRoute();
const id = route.params.id;

const product = ref(null);
const loading = ref(true);
const error = ref(null);
const favorited = ref(false);
const selectedImage = ref(null);

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
  const res = await fetch(url(`/api/products/${id}`));
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
  font-size:3rem 
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

</style>
