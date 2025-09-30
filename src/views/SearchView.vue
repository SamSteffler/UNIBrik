<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const searchQuery = ref(route.query.q || '');

</script>
<template>
  <div>
    <h1>Página de Pesquisa de Produtos</h1>
    <p>Aqui seriam exibidos os resultados da busca, com filtros na lateral.</p>
    <p>Esta página também é pública e pode ser acessada sem login.</p>
  </div>
</template>