<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import authService from '../services/authService';

// Prop para controlar a visibilidade do menu a partir do componente pai (Header)
defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

// Evento para notificar o componente pai que o menu deve ser fechado
const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close');
};

const handleLogout = () => {
  handleClose(); // Fecha o menu
  authService.logout(); // Executa o logout
};

const isAdmin = computed(() => {
  const user = authService.userState.user;
  return user && (user.role === 'admin' || user.role === 'supervisor');
});
</script>

<template>
  <transition name="slide-fade">
    <div v-if="isOpen" class="side-menu-container">
      <div class="overlay" @click="handleClose"></div>

      <aside class="menu-panel">
        <header class="menu-header">
          <h3>Menu</h3>
          <button @click="handleClose" class="close-btn">&times;</button>
        </header>

        <nav class="menu-nav">
          <ul>
            <li><RouterLink to="/" @click="handleClose">Página Inicial</RouterLink></li>
            <li><RouterLink to="/search" @click="handleClose">Pesquisar Produtos</RouterLink></li>
            <hr />

            <template v-if="authService.userState.isLoggedIn">
              <li><RouterLink to="/my-ads" @click="handleClose">{{ isAdmin ? 'Lista de anúncios' : 'Meus Anúncios' }}</RouterLink></li>
              <li v-if="!isAdmin"><RouterLink to="/favorites" @click="handleClose">Favoritos</RouterLink></li>
              <li><RouterLink to="/messages" @click="handleClose">Mensagens</RouterLink></li>
              <li v-if="isAdmin"><RouterLink to="/admin/users" @click="handleClose">Gerenciar Usuários</RouterLink></li>
              <li><RouterLink to="/profile" @click="handleClose">Dados Cadastrais</RouterLink></li>
              <hr />
              <li><a href="#" @click.prevent="handleLogout">Sair</a></li>
            </template>

            <template v-else>
              <li><RouterLink to="/login" @click="handleClose">Fazer Login</RouterLink></li>
            </template>
          </ul>
        </nav>
      </aside>
    </div>
  </transition>
</template>

<style scoped>
.side-menu-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.menu-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background-color: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.menu-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #888;
}

.menu-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-nav li a {
  display: block;
  padding: 1rem 1.5rem;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s;
}

.menu-nav li:last-child a {
  color: #ca0000ff;
}

.menu-nav li a:hover {
  background-color: #f5f5f5;
}

.menu-nav hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 0.5rem 0;
}

/* Animações com Transition */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-active .menu-panel,
.slide-fade-leave-active .menu-panel {
  transition: transform 0.3s ease-in-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-from .menu-panel,
.slide-fade-leave-to .menu-panel {
  transform: translateX(100%);
}
</style>