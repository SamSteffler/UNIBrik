<script setup>
import authService from '../services/authService';
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

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

const editProfile = () => {
  router.push('/profile/edit');
};

const manageUsers = () => {
  router.push('/admin/users');
};

const isAdmin = computed(() => {
  const user = authService.userState.user;
  return user && (user.role === 'admin' || user.role === 'supervisor');
});

// Verifica se o usuario tem endereco cadastrado
const hasAddress = computed(() => {
  const user = authService.userState.user;
  return user.address_street || user.address_city || user.address_cep;
});

// Formata a data de nascimento
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

// Formata o CEP
const formatCEP = (cep) => {
  if (!cep) return '';
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return cep;
};
</script>

<template>
  <div v-if="authService.userState.isLoggedIn" class="profile-container">
    <aside class="profile-menu">
      <h3>Minha Conta</h3>
      <ul>
        <li @click="myAds">{{ isAdmin ? 'Lista de anúncios' : 'Meus anúncios' }}</li>
        <li v-if="!isAdmin" @click="favorites">Favoritos</li>
        <li v-if="isAdmin" @click="manageUsers">Gerenciar Usuários</li>
        <li @click="editProfile">Dados cadastrais</li>
        <li class="logout-button" @click="handleLogout">Sair</li>
      </ul>
    </aside>

    <div class="profile-content">
      <div class="profile-header">
        <div class="profile-avatar">
          <img 
            v-if="authService.userState.user.picture" 
            :src="authService.userState.user.picture" 
            :alt="authService.userState.user.name"
          />
          <div v-else class="avatar-placeholder">
            {{ authService.userState.user.name.charAt(0).toUpperCase() }}
          </div>
        </div>
        <div class="profile-info">
          <h1>{{ authService.userState.user.name }}</h1>
          <p class="user-email">{{ authService.userState.user.email }}</p>
        </div>
      </div>

      <div class="profile-details">
        <h2>Informações Pessoais</h2>
        <div class="info-grid">
          <div class="info-item" v-if="authService.userState.user.phone">
            <span class="info-label">📱 Telefone:</span>
            <span class="info-value">{{ authService.userState.user.phone }}</span>
          </div>
          <div class="info-item" v-if="authService.userState.user.birth_date">
            <span class="info-label">🎂 Data de Nascimento:</span>
            <span class="info-value">{{ formatDate(authService.userState.user.birth_date) }}</span>
          </div>
        </div>

        <h2 v-if="hasAddress">Endereço</h2>
        <div class="info-grid" v-if="hasAddress">
          <div class="info-item full-width" v-if="authService.userState.user.address_street">
            <span class="info-label">📍 Endereço:</span>
            <span class="info-value">
              {{ authService.userState.user.address_street }}
              <span v-if="authService.userState.user.address_number">, {{ authService.userState.user.address_number }}</span>
              <span v-if="authService.userState.user.address_complement"> - {{ authService.userState.user.address_complement }}</span>
            </span>
          </div>
          <div class="info-item" v-if="authService.userState.user.address_district">
            <span class="info-label">🏘️ Bairro:</span>
            <span class="info-value">{{ authService.userState.user.address_district }}</span>
          </div>
          <div class="info-item" v-if="authService.userState.user.address_cep">
            <span class="info-label">📮 CEP:</span>
            <span class="info-value">{{ formatCEP(authService.userState.user.address_cep) }}</span>
          </div>
          <div class="info-item" v-if="authService.userState.user.address_city">
            <span class="info-label">🏙️ Cidade:</span>
            <span class="info-value">
              {{ authService.userState.user.address_city }}
              <span v-if="authService.userState.user.address_uf"> - {{ authService.userState.user.address_uf }}</span>
            </span>
          </div>
        </div>

        <div class="edit-prompt" v-if="!hasAddress || !authService.userState.user.phone">
          <p>💡 Complete seu perfil para ter uma experiência melhor!</p>
          <button @click="editProfile" class="btn-edit">Editar Perfil</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  display: flex;
  gap: 2rem;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.profile-menu {
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  min-width: 220px;
}

.profile-menu h3 {
  margin-bottom: 1rem;
  color: #004451;
}

.profile-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.profile-menu li {
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.profile-menu li:hover {
  background-color: #f0f0f0;
  color: #0097B2;
}

.profile-menu li.logout-button {
  margin-top: 1rem;
  color: #d32f2f;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.profile-menu li.logout-button:hover {
  background-color: #ffebee;
}

.profile-content {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 2rem;
}

.profile-avatar {
  flex-shrink: 0;
}

.profile-avatar img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #0097B2;
  box-shadow: 0 4px 12px rgba(0, 151, 178, 0.2);
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0097B2 0%, #004451 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  color: white;
  border: 4px solid #0097B2;
  box-shadow: 0 4px 12px rgba(0, 151, 178, 0.2);
}

.profile-info h1 {
  color: #004451;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.user-email {
  color: #004451b5;
  font-size: 1.1rem;
  margin: 0;
}

.profile-details h2 {
  color: #004451;
  font-size: 1.3rem;
  margin: 2rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #0097B2;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-weight: 600;
  color: #004451;
  font-size: 0.95rem;
}

.info-value {
  color: #004451b5;
  font-size: 1.05rem;
}

.edit-prompt {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #e3f2fd 0%, #fff3e0 100%);
  border-radius: 8px;
  text-align: center;
  border: 2px dashed #0097B2;
}

.edit-prompt p {
  margin: 0 0 1rem 0;
  color: #004451;
  font-size: 1.1rem;
  font-weight: 500;
}

.btn-edit {
  padding: 0.75rem 2rem;
  background-color: #0097B2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-edit:hover {
  background-color: #007a8f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 151, 178, 0.3);
}

@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>