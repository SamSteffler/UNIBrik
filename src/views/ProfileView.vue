<script setup>
import authService from '../services/authService';
import { useRouter } from 'vue-router';

const router = useRouter();
const handleLogout = () => {
  authService.logout();
};

const myAds = () => {
  router.push('/my-ads');
};
const favorites = () => {
  router.push('/favorites');
};
</script>

<template>
  <div v-if="authService.userState.isLoggedIn" class="profile-container">
    <aside class="profile-menu">
      <h3>Minha Conta</h3>
      <ul>
        <li @click="myAds">Meus anúncios</li>
        <li @click="favorites">Favoritos</li>
        <li>Dados cadastrais</li>
        <li class="logout-button" @click="handleLogout">Sair</li>
      </ul>
    </aside>

    <div class="profile-content">
      <h1>Área do Usuário</h1>
      <p>Bem-vindo(a), <strong>{{ authService.userState.user.name }}</strong>!</p>
      <p>Seu e-mail é: {{ authService.userState.user.email }}</p>
      <hr>
      <p>Este é o seu espaço pessoal. O conteúdo principal da página (como formulário de dados ou lista de anúncios) seria exibido aqui.</p>
    </div>
  </div>
</template>