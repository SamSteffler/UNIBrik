<template>
  <div class="container">
    <div class="main">
      <h2>Produtos gratuitos</h2>
      <div class="visto-antes">
        <div class="cards">
          <CardAnuncio
            v-for="item in freeProducts.slice(0,4)"
            :key="item.id"
            :item="item"
            desc-size="0.75rem"
          />
        </div>
      </div>

      <h2>Adicionados recentemente</h2>
      <div class="interesse-container">
        <div class="cards">
          <CardAnuncio
            v-for="item in recentProducts.slice(0,4)"
            :key="item.id"
            :item="item"
            desc-size="0.75rem"
          />
        </div>
        <div class="explorar-wrapper">
          <a href="#" class="explorar">Explorar Anúncios</a>
        </div>
      </div>
    </div>

    <div class="sidebar-col">
      <h2>Categorias</h2>
      <SideBarCategorias />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CardAnuncio from "../components/CardAnuncio.vue"
import SideBarCategorias from "../components/SideBarCategorias.vue"
import { url } from '../services/api'

const freeProducts = ref([])
const recentProducts = ref([])
const loadingFree = ref(false)
const loadingRecent = ref(false)
const error = ref(null)

async function loadHome() {
  loadingFree.value = true
  loadingRecent.value = true
  try {
    const [freeRes, recentRes] = await Promise.all([
      fetch(url('/api/products/free?limit=12')),
      fetch(url('/api/products/recent?limit=12'))
    ])
    const freeJson = await freeRes.json()
    const recentJson = await recentRes.json()
    freeProducts.value = (freeJson.results || [])
    recentProducts.value = (recentJson.results || [])
  } catch (e) {
    console.error('loadHome', e)
    error.value = 'Erro ao carregar anúncios.'
  } finally {
    loadingFree.value = false
    loadingRecent.value = false
  }
}

onMounted(loadHome)
</script>

<style>

body {
  background-color: #ffffffff;
}

.visto-antes {
  display: flex;
  align-items: center; /* alinha verticalmente ao centro */
  background-color: #f2f2f2;
  border-radius: 40px;
  padding: 8px;
  gap: 0;
}

.visto-antes .cards {
  flex: 1; /* ocupa todo o espaço restante */
  gap: 20px;
  overflow-x: auto; /* mantém a rolagem horizontal se necessário */
}

.interesse-container {
  display: flex;
  align-items: center; /* alinha verticalmente ao centro */
  justify-content: space-between;
  background-color: #f2f2f2;
  border-radius: 40px;
  padding: 8px;
}

.explorar-wrapper {
  flex-shrink: 0; /* impede que o botão encolha */
  display: flex;
  align-items: center;
}

.interesse-container .cards {
  display: flex;
  gap: 20px;
  overflow-x: auto; /* mantém a rolagem horizontal se necessário */
  flex-shrink: 0; /* ocupa só o tamanho necessário */
}

h2 {
  color: #004451;
  margin-bottom: 10px;
}

.container {
  display: flex;
  gap: 40px;
  width: 100%;
  align-items: flex-start;
}

.main {
  flex: 3;
}

.cards {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding: 20px 20px;
}

.cards > *{
  cursor: pointer; /* só o card é clicável */
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.cards > *:hover {
  transform: scale(1.05);
  box-shadow: 5px 5px 10px rgba(0,0,0,0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.explorar {
  display: inline-block;
  background: #F9A825;
  color: black;
  padding: 10px 18px;
  border-radius: 20px;
  text-decoration: none;
  font-weight: bold;
  margin-left: auto;
  margin-right: 26px;
  white-space: nowrap;

  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.explorar:hover {
  transform: scale(1.05);
  box-shadow: 5px 5px 10px rgba(0,0,0,0.2);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

</style>