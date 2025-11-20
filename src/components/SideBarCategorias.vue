<template>
  <div class="sidebar">
    <ul>
      <li v-for="categoria in categorias" :key="categoria">
        <a @click="filterByCategory(categoria)">
          <span>{{ categoria }}</span>
          <span class="arrow">➜</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const categorias = [
  "Livros", 
  "Eletrônicos", 
  "Móveis", 
  "Roupas", 
  "Materiais", 
  "Serviços"
]

function filterByCategory(categoria) {
  router.push({
    path: '/search',
    query: { category: categoria }
  })
}
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
  border-bottom: 2px solid #0000001e;;
  font-size: 16px;
}

.sidebar li:first-child {
  border-top: none; 
  padding-top: 0; 
  margin-top: -5px;
}

.sidebar li:last-child {
  border-bottom: none; 
  padding-bottom: 0; 
  margin-bottom: -20px;
}

.sidebar li a {
  display: flex;
  justify-content: space-between; /* texto à esquerda, seta no limite direito */
  align-items: center;
  width: 100%; /* ocupa toda a largura da caixa */
  padding: 8px 5px;
  text-decoration: none;
  color: #004451;
  transition: transform 0.1s ease-in-out;
  cursor: pointer;
}

.sidebar li a:hover {
  transform: scale(1.05);
}

.arrow {
  font-weight: bold;
  margin-right: 8px;
  color: #0097b2;
}
</style>
