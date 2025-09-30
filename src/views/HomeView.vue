<template>
  <div class="container">
    <div class="main">
      <h2>Você viu antes</h2>
      <div class="visto-antes">
        <div class="cards">
          <CardAnuncio
            v-for="(item, i) in vistosAntes"
            :key="i"
            :titulo="item.titulo"
            :preco="item.preco"
            :descricao="item.descricao"
            :img="item.img"
            :local="item.local"
          />
        </div>
      </div>

      <h2>Talvez você tenha interesse</h2>
      <div class="interesse-container">
        <div class="cards">
          <CardAnuncio
            v-for="(item, i) in interesse"
            :key="i"
            :titulo="item.titulo"
            :preco="item.preco"
            :descricao="item.descricao"
            :img="item.img"
            :local="item.local"
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
import CardAnuncio from "../components/CardAnuncio.vue"
import SideBarCategorias from "../components/SideBarCategorias.vue"

const vistosAntes = [
  { titulo: "Notebook", preco: "R$4000", descricao: "Notebook completo, seminovo e muito bom cuidado, acompanha ...", local: "UFSM", img: "https://via.placeholder.com/150" },
  { titulo: "Escrivaninha", preco: "R$200", descricao: "Escrivaninha em MDF, 150x70cm, quadro de metal", local: "Em casa", img: "https://via.placeholder.com/150" },
  { titulo: "Livros", preco: "Grátis", descricao: "Livros disponíveis para retirada: Cálculo I e II, Termodinâmica...", local: "UFSM", img: "https://via.placeholder.com/150" },
  { titulo: "Jaleco", preco: "R$150", descricao: "Jaleco usado em ótimo estado, apenas remover nome bordado...", local: "UFSM", img: "https://via.placeholder.com/150" }
]

const interesse = [
  { titulo: "Jaleco", preco: "R$150", descricao: "Jaleco usado em ótimo estado, apenas remover nome bordado...", local: "UFSM", img: "https://via.placeholder.com/150" },
  { titulo: "Conjunto material", preco: "R$50", descricao: "Esquadro, transferidor e outras ferramentas para Desenho Indust...", local: "UFSM", img: "https://via.placeholder.com/150" },
  { titulo: "Calculadora", preco: "R$1200", descricao: "Calculadora científica, específica para contas complexas, matém...", local: "A definir", img: "https://via.placeholder.com/150" }
]
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
  margin: 0 16px;
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
  margin: 0 16px;
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
  width: max-content;
}

.main {
  flex: 3;
}

.cards {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding: 16px 0;
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
}
</style>