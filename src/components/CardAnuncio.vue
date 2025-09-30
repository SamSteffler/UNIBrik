<template>
  <div class="card">
    <div class="img-container">
      <img :src="img" :alt="titulo" />
    </div>
    <h3>{{ titulo }}</h3>
    <p class="preco">{{ preco }}</p>
    <p class="desc">{{ descricao }}</p>
    <p class="local">{{ local }}</p>
  </div>
</template>

<script setup>
defineProps({
  titulo: String,
  preco: String,
  descricao: String,
  local: String,
  img: String
})
</script>

<style scoped>
.card {
  background: #ffffffff;
  border-radius: 26px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.0);
  width: 180px;
  flex-shrink: 0;
  padding: 10px;
}

.img-container {
  width: 100%;
  height: 120px;       /* altura fixa do quadrado */
  border-radius: 20px;
  background: #ddd;    /* cor de placeholder se não houver imagem */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.img-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;   /* preenche o espaço mantendo proporção */
}

.card h3 {
  font-size: 16px;
  text-shadow: 0 0 0.5px #004451, 0 0 0.5px #004451;
  margin-top: 8px;
  margin-bottom: 0px;
}

.preco {
  font-weight: 500;
  padding-top: 2px;
  margin: 0;
}

.desc {
  font-size: 9px;
  padding: 0px 8px;
  color: #004451b6;
  margin: 5px 0px;
  margin-bottom: 0;
}

.local {
  font-size: 10px;
  padding: 0px 8px;
  color: #004451;
  margin: 5px 0px;
}

</style>