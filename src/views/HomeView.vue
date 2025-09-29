<template>
  <div class="container">
    <div class="main">
      <h2>Você viu antes</h2>
      <div class="cards">
        <CardAnuncio
          v-for="(item, i) in vistosAntes"
          :key="i"
          :titulo="item.titulo"
          :preco="item.preco"
          :descricao="item.descricao"
          :img="item.img"
        />
      </div>

      <h2>Talvez você tenha interesse</h2>
      <div class="cards">
        <CardAnuncio
          v-for="(item, i) in interesse"
          :key="i"
          :titulo="item.titulo"
          :preco="item.preco"
          :descricao="item.descricao"
          :img="item.img"
        />
      </div>
      <a href="#" class="explorar">Explorar Anúncios</a>
    </div>

    <SideBarCategorias />
  </div>
</template>

<script setup>
import CardAnuncio from "../components/CardAnuncio.vue"
import SideBarCategorias from "../components/SideBarCategorias.vue"

const vistosAntes = [
  { titulo: "Notebook", preco: "R$4000", descricao: "Notebook completo...", img: "https://via.placeholder.com/150" },
  { titulo: "Escrivaninha", preco: "R$200", descricao: "Escrivaninha em MDF...", img: "https://via.placeholder.com/150" },
  { titulo: "Livros", preco: "Grátis", descricao: "Livros disponíveis...", img: "https://via.placeholder.com/150" }
]

const interesse = [
  { titulo: "Jaleco", preco: "R$150", descricao: "Usado, em ótimo estado...", img: "https://via.placeholder.com/150" },
  { titulo: "Conjunto material", preco: "R$50", descricao: "Esquadro, transferidor...", img: "https://via.placeholder.com/150" },
  { titulo: "Calculadora", preco: "R$1200", descricao: "Calculadora científica...", img: "https://via.placeholder.com/150" }
]
</script>

<style>
body {
  background-color: #f0f0f0;
}

.container {
  display: flex;
  gap: 20px;
}

.main {
  flex: 3;
}

.cards {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding: 10px 0;
}

.explorar {
  display: inline-block;
  background: #F9A825;
  color: black;
  padding: 10px 18px;
  border-radius: 20px;
  text-decoration: none;
  font-weight: bold;
  margin-top: 15px;
}
</style>