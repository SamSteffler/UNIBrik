<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import authService from '../services/authService';

const router = useRouter();
const route = useRoute();

// Computa se a barra de pesquisa deve ser exibida
const showSearchBar = computed(() => route.path !== '/profile');

// Redireciona para a home ao clicar no logo
const goToHome = () => {
  router.push('/');
}
</script>

<template>
  <header class="app-header">
    <div class="logo" @click="goToHome">UNI Brik</div>

    <div v-if="showSearchBar" class="search-bar">
      <input type="text" placeholder="TV 50 polegadas..." class="search-input" />
    </div>

    <div class="user-area">
      <RouterLink v-if="!authService.userState.isLoggedIn" to="/login" class="profile-button">
        Login ou Cadastre-se
      </RouterLink>
      
      <RouterLink v-else to="/profile" class="profile-button">
        Meu Perfil
      </RouterLink>
    </div>
  </header>
</template>