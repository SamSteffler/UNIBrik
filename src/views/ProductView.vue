<script setup>
import { ref, onMounted } from 'vue';

// Objeto reativo para armazenar os dados do produto.
// Estes dados seriam carregados de uma API/banco de dados.
const product = ref({
  id: '123',
  title: 'Notebook',
  price: '4000.00',
  location: 'Retirada na UFSM',
  condition: 'usado - igual novo',
  description: 'Notebook completo, seminovo e muito bem cuidado, acompanha caixa, carregador, manuais e extensão para drive SATA.',
  specifications: 'Processador i5, 8GB RAM, SSD 256GB, Placa de vídeo GTX 1650.',
  images: [
    'https://via.placeholder.com/600x400.png?text=Imagem+Principal', // Placeholder para a imagem principal
    'https://via.placeholder.com/100.png?text=Thumb+1',
    'https://via.placeholder.com/100.png?text=Thumb+2',
    'https://via.placeholder.com/100.png?text=Thumb+3',
  ],
  seller: {
    name: 'André P. R. Streck',
    contact: '(55) 91234-5678',
    reputation: 4.8 // Conforme o sistema de reputação 
  }
});

// Referência para a imagem principal que está sendo exibida
const mainImage = ref(product.value.images[0]);

// Função para trocar a imagem principal ao clicar em uma miniatura
const changeMainImage = (image) => {
  mainImage.value = image;
};

// Hook do ciclo de vida: a lógica para buscar os dados do produto na API iria aqui.
onMounted(() => {
  // Exemplo: const productId = route.params.id;
  // Exemplo: fetchProduct(productId).then(data => product.value = data);
  console.log('Componente da página de produto montado. Pronto para buscar dados.');
});
</script>

<template>
  <div class="product-view-container">
    <div class="product-gallery">
      <div class="main-image-container">
        <img :src="mainImage" alt="Imagem principal do produto" class="main-image">
      </div>
      <div class="thumbnail-container">
        <img 
          v-for="(image, index) in product.images" 
          :key="index" 
          :src="image" 
          @click="changeMainImage(image)"
          class="thumbnail-image"
          :class="{ active: image === mainImage }"
          alt="Miniatura do produto"
        >
      </div>
    </div>

    <div class="product-details">
      <nav class="breadcrumb">Eletrônicos > Notebooks</nav>
      
      <h1 class="product-title">{{ product.title }}</h1>
      
      <p class="product-price">R$ {{ product.price }}</p>
      
      <div class="product-info-section">
        <h3>Localização</h3>
        <p>{{ product.location }}</p>
      </div>

      <div class="product-info-section">
        <h3>Descrição</h3>
        <p>{{ product.description }}</p>
      </div>
      
      <div class="product-info-section">
        <h3>Especificações</h3>
        <p>{{ product.specifications }}</p>
      </div>
      
      <div class="product-info-section">
        <h3>Estado</h3>
        <p>{{ product.condition }}</p>
      </div>

      <div class="seller-info">
        <h3>Informações do Vendedor</h3>
        <p><strong>Nome:</strong> {{ product.seller.name }}</p>
        <p><strong>Contato:</strong> {{ product.seller.contact }}</p>
        <p><strong>Reputação:</strong> {{ product.seller.reputation }} / 5.0 ★</p>
      </div>

      <div class="actions">
        <button class="contact-button">Entrar em contato</button>
        <button class="favorite-button">♡ Favoritar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-view-container {
  display: flex;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 2rem auto;
  gap: 2rem;
  padding: 1rem;
}

.product-gallery {
  flex: 1;
  min-width: 300px;
}

.main-image-container {
  margin-bottom: 1rem;
}

.main-image {
  width: 100%;
  border-radius: 8px;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.thumbnail-container {
  display: flex;
  gap: 0.5rem;
}

.thumbnail-image {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.thumbnail-image:hover {
  border-color: #ccc;
}

.thumbnail-image.active {
  border-color: #007bff;
}

.product-details {
  flex: 1;
  min-width: 300px;
}

.product-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.product-price {
  font-size: 1.8rem;
  font-weight: bold;
  color: #28a745;
  margin-bottom: 1.5rem;
}

.product-info-section {
  margin-bottom: 1rem;
}

.seller-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-block: 1.5rem;
}

.actions {
  display: flex;
  gap: 1rem;
}

.contact-button, .favorite-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
}

.contact-button {
  background-color: #007bff;
  color: white;
}

.favorite-button {
  background-color: #e9ecef;
  color: #333;
}
</style>