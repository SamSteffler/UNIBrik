<template>
  <div class="sidebar">
    <h3>Categorias</h3>
    <ul>
      <li v-for="categoria in categorias" :key="categoria">
        <a href="#">{{ categoria }}</a>
        <span class="arrow">➜</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
const categorias = [
  "Livros", 
  "Eletrônicos", 
  "Móveis", 
  "Roupas", 
  "Materiais didáticos", 
  "Serviços", 
  "Aluguel"
]
</script>

<style scoped>
.sidebar {
  background: #f2f2f2;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}

.sidebar h3 {
  margin-bottom: 15px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #ffffff;
  font-size: 15px;
}

.sidebar li a {
  text-decoration: none;
  color: #003B46;
  font-weight: 500;
}

.arrow {
  font-weight: bold;
  color: #00796B;
}
</style>