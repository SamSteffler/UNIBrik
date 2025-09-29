<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
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
    <div class="logo" @click="goToHome">UNI Brik</div>

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
        <img :src="profileImageUrl" alt="Foto de perfil" class="avatar-img" />
        <span class="profile-label">Meu Perfil</span>
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
.profile-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.profile-avatar .avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0,0,0,0.08);
  background: #f5f5f5;
}

.profile-label {
  line-height: 1;
}
</style>
