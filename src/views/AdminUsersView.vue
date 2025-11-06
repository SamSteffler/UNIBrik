<template>
  <div class="admin-users">
    <h2 class="h2">Gerenciamento de Usuários</h2>

    <div class="filter-controls">
      <button @click="filterType = 'all'" :class="['filter-button', {active: filterType === 'all'}]">Todos</button>
      <button @click="filterType = 'active'" :class="['filter-button', {active: filterType === 'active'}]">Ativos</button>
      <button @click="filterType = 'blocked'" :class="['filter-button', {active: filterType === 'blocked'}]">Bloqueados</button>
      <button @click="filterType = 'admin'" :class="['filter-button', {active: filterType === 'admin'}]">Administradores</button>
    </div>

    <div v-if="loading" class="loading">Carregando...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="users-grid">
      <div v-for="user in displayedUsers" :key="user.id" class="user-card">
        <div class="user-header">
          <div class="user-avatar">
            <img v-if="user.picture" :src="user.picture" :alt="user.name" />
            <div v-else class="avatar-placeholder">{{ user.name.charAt(0).toUpperCase() }}</div>
          </div>
          <div class="user-info">
            <h3>{{ user.name }}</h3>
            <p class="user-email">{{ user.email }}</p>
            <span class="role-badge" :class="'role-' + (user.role || 'user')">{{ getRoleLabel(user.role) }}</span>
          </div>
        </div>
        
        <div class="user-details">
          <div class="detail-row">
            <span class="label">ID:</span>
            <span>{{ user.id }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Status:</span>
            <span class="status-badge" :class="user.approved ? 'status-active' : 'status-blocked'">
              {{ user.approved ? 'Ativo' : 'Bloqueado' }}
            </span>
          </div>
          <div class="detail-row" v-if="user.google_sub">
            <span class="label">Login:</span>
            <span>Google</span>
          </div>
        </div>

        <div class="user-actions">
          <button v-if="user.approved" @click="blockUser(user.id)" class="action-button block-button">
            🚫 Bloquear
          </button>
          <button v-else @click="unblockUser(user.id)" class="action-button unblock-button">
            ✅ Desbloquear
          </button>
          <button @click="deleteUser(user.id)" class="action-button delete-button">
            🗑️ Excluir
          </button>
        </div>
      </div>
    </div>

    <div v-if="displayedUsers.length === 0 && !loading" class="no-results">
      Nenhum usuário encontrado.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { userState } from '../services/authService'
import { url } from '../services/api'

const users = ref([])
const loading = ref(false)
const error = ref(null)
const filterType = ref('all') // 'all', 'active', 'blocked', 'admin'

const displayedUsers = computed(() => {
  if (filterType.value === 'all') return users.value;
  if (filterType.value === 'active') return users.value.filter(u => u.approved);
  if (filterType.value === 'blocked') return users.value.filter(u => !u.approved);
  if (filterType.value === 'admin') return users.value.filter(u => u.role === 'admin' || u.role === 'supervisor');
  return users.value;
});

function getRoleLabel(role) {
  const labels = {
    'admin': 'Administrador',
    'supervisor': 'Supervisor',
    'user': 'Usuário'
  };
  return labels[role] || 'Usuário';
}

async function loadUsers() {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch(url('/api/admin/users'), {
      headers: { 'x-admin-id': String(userState.user.id) }
    });
    const data = await res.json();
    users.value = data.results || [];
  } catch (e) {
    console.error(e);
    error.value = 'Erro ao carregar usuários.';
  }
  loading.value = false;
}

async function blockUser(id) {
  const userToBlock = users.value.find(u => u.id === id);
  if (!confirm(`Tem certeza que deseja bloquear ${userToBlock?.name}?\n\n⚠️ ATENÇÃO: Todos os anúncios deste usuário serão automaticamente ocultados e o usuário não poderá acessar a plataforma até ser desbloqueado.`)) return;
  try {
    const res = await fetch(url(`/api/admin/unapprove-user/${id}`), {
      method: 'POST',
      headers: { 'x-admin-id': String(userState.user.id) }
    });
    const data = await res.json();
    
    users.value = users.value.map(u => u.id === id ? { ...u, approved: 0 } : u);
    
    if (data.productsBlocked > 0) {
      alert(`✅ Usuário bloqueado com sucesso!\n\n${data.productsBlocked} anúncio(s) foram automaticamente ocultados.`);
    } else {
      alert('✅ Usuário bloqueado com sucesso!');
    }
  } catch (e) {
    console.error(e);
    alert('Erro ao bloquear usuário');
  }
}

async function unblockUser(id) {
  try {
    await fetch(url(`/api/admin/approve-user/${id}`), {
      method: 'POST',
      headers: { 'x-admin-id': String(userState.user.id) }
    });
    users.value = users.value.map(u => u.id === id ? { ...u, approved: 1 } : u);
  } catch (e) {
    console.error(e);
    alert('Erro ao desbloquear usuário');
  }
}

async function deleteUser(id) {
  if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return;
  try {
    await fetch(url(`/api/admin/user/${id}`), {
      method: 'DELETE',
      headers: { 'x-admin-id': String(userState.user.id) }
    });
    users.value = users.value.filter(u => u.id !== id);
  } catch (e) {
    console.error(e);
    alert('Erro ao excluir usuário');
  }
}

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.admin-users {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
}

.h2 {
  color: #004451;
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.filter-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-button {
  padding: 8px 16px;
  border: 2px solid #0097b2;
  background: white;
  color: #0097b2;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-button:hover {
  background: #e8f8fa;
}

.filter-button.active {
  background: #0097b2;
  color: white;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #636e72;
}

.error {
  color: #d63031;
  background: #ffe5e5;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.user-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.user-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.user-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e8e8e8;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0097b2, #004451);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info h3 {
  margin: 0 0 0.25rem 0;
  color: #004451;
  font-size: 1.1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-email {
  margin: 0 0 0.5rem 0;
  color: #636e72;
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-admin {
  background: #e74c3c;
  color: white;
}

.role-supervisor {
  background: #f39c12;
  color: white;
}

.role-user {
  background: #ecf0f1;
  color: #2c3e50;
}

.user-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.9rem;
}

.detail-row .label {
  color: #636e72;
  font-weight: 600;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-blocked {
  background: #f8d7da;
  color: #721c24;
}

.user-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.block-button {
  background: #f39c12;
  color: white;
}

.block-button:hover {
  background: #e67e22;
  transform: translateY(-1px);
}

.unblock-button {
  background: #27ae60;
  color: white;
}

.unblock-button:hover {
  background: #229954;
  transform: translateY(-1px);
}

.delete-button {
  background: #d63031;
  color: white;
}

.delete-button:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: #636e72;
  font-size: 1.1rem;
}
</style>
