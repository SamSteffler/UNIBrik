<template>
  <div class="sidebar">
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
  border-radius: 26px;
  margin-top: 9px;
  padding: 15px;
  box-shadow: 0 2px 6px rgba(0,0,0,0);
  width: 200px;
}

.sidebar ul {
  margin-top: 0;
  list-style: none;
  line-height: 2;
  padding: 0;
}

.sidebar li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 5px;
  border-bottom: 2.5px solid #0097b280;
  font-size: 16px;
}

.sidebar li a {
  text-decoration: none;
  color: #004451;
}

.sidebar li:first-child {
  border-top: none;
  padding-top: 0;
  margin-top: 0px;
}

.sidebar li:last-child {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: -15px;
}

.arrow {
  font-weight: bold;
  color: #0097b2;
}
</style>