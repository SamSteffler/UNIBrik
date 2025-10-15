<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import logo from '../assets/white-logo-1.png'
import authService from '../services/authService';
import SideMenu from './SideMenu.vue'; // 1. Importe o novo componente
import defaultAvatar from '../assets/default-avatar.svg';

const router = useRouter();
const route = useRoute();

// 2. Crie um estado para controlar a visibilidade do menu
const isMenuOpen = ref(false);

const showSearchBar = computed(() => route.path !== '/profile');

// URL da foto de perfil do Google (ou fallback)
const profileImageUrl = computed(() => {
  const user = authService.userState.user || {};
  return user.picture || user.photoURL || defaultAvatar;
});

const goToHome = () => {
  router.push('/');
}
const searchQuery = ref('');
const submitSearch = () => {
  const query = searchQuery.value.trim();
  if (query) {
    router.push({ name: 'search', query: { q: query } });
    searchQuery.value = '';
  }
};
</script>

<template>
  <header class="app-header">
    <div class="logo" @click="goToHome">
      <img :src="logo" alt="Logo" />
    </div>

    <div v-if="showSearchBar" class="search-bar">
      <input
      type="text"
      placeholder="TV 50 polegadas..."
      class="search-input"
      v-model="searchQuery"
      @keyup.enter="submitSearch"
      />
      <button class="search-button" @click="submitSearch">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
      </svg>
      </button>
    </div>
   

    <div class="user-area">
      <RouterLink v-if="!authService.userState.isLoggedIn" to="/login" class="profile-button">
        Login ou Cadastre-se
      </RouterLink>
      <RouterLink v-else to="/profile" class="profile-button profile-avatar">
        <img :src="profileImageUrl" alt="Foto de perfil" class="avatar-img"><span class="profile-label">Meu Perfil</span>
      </RouterLink>

      
      <button class="menu-toggle" @click="isMenuOpen = true">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
        </svg>
      </button>
    </div>
  </header>

  <SideMenu :is-open="isMenuOpen" @close="isMenuOpen = false" />
</template>

<style scoped>

.app-header {
  /* 1. DEFINE A COR DE FUNDO */
  background-color: #0097b2; /* Exemplo: Azul Claro Vibrante (a cor do seu tema) */

  /* 2. MUDA A COR DO TEXTO para contrastar com o fundo */
  color: #f5f5f5; /* Define a cor do texto/ícones do header como branco */

  /* 3. Ajustes de layout (mantendo o que seria padrão para um header) */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1.5rem; /* Ajuste o padding conforme necessário */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Garante que o texto do logo e os botões/links do perfil sejam brancos */
.app-header .logo,
.app-header .profile-button {
  color: white; /* Garante que o texto seja branco (contraste com o azul) */
  text-decoration: none; /* Remove sublinhado padrão dos links */
  cursor: pointer;
}

.app-header .logo:focus,
.app-header .profile-button:focus {
  outline: none;
  box-shadow: none;
}

/* Logo */
.logo {
  display: flex;
  margin-top: 2px;
  margin-bottom: 2px;
  margin-left: 50px;
  flex-direction: column;
  align-items: center;
}

.logo img {
  width: 120px;
}

.search-bar {
  /* Fundo da barra de pesquisa em si (pode ser diferente do header) */
  background-color: #f5f5f5; 
  border-radius: 20px;
  /* ... outros estilos ... */
}

.search-button svg {
  /* Cor do ícone de pesquisa */
  fill: #0097b2; 
}

.profile-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  background-color: #f5f5f5; 
  justify-content: flex-start;
  width: 105px;
  padding-bottom: 0.4rem;
  padding-top: 0.4rem;
  z-index: 2;
}

.profile-button:hover {
  background-color: #f5f5f5;
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.profile-avatar .avatar-img {
  width: 32px;
  height: 32px;
  margin-left: -15px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0,0,0,0.08);
  background: #f5f5f5;
}

.profile-label {
  line-height: 1;
  color: #004451;
}

.menu-toggle {
  color: white; /* Define a cor do ícone do menu para branco */
  z-index: 1;
}

.menu-toggle:hover {
  outline: none;
  box-shadow: none;
  background-color: #0097b2;
  transform: scale(1.20);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

</style>
