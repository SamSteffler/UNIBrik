<template>
  <div class="card">
    <img :src="img" :alt="titulo" />
    <h3>{{ titulo }}</h3>
    <p class="preco">{{ preco }}</p>
    <p class="desc">{{ descricao }}</p>
  </div>
</template>

<script setup>
defineProps({
  titulo: String,
  preco: String,
  descricao: String,
  img: String
})
</script>

<style scoped>
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  width: 180px;
  flex-shrink: 0;
  padding: 10px;
}

.card img {
  width: 100%;
  border-radius: 8px;
  height: 120px;
  object-fit: cover;
}

.card h3 {
  font-size: 16px;
  margin: 8px 0 4px;
}

.preco {
  font-weight: bold;
  color: #003B46;
}

.desc {
  font-size: 14px;
  color: #444;
}
</style>