<template>
  <div class="messages-view">
    <h2>Mensagens</h2>

    <div v-if="loading" class="loading">Carregando conversas...</div>
    
    <div v-else-if="conversations.length === 0" class="empty">
      <p>📭 Nenhuma conversa ainda</p>
      <p class="hint">Suas conversas sobre anúncios aparecerão aqui</p>
    </div>

    <div v-else class="conversations-list">
      <div
        v-for="conv in conversations"
        :key="`${conv.product_id}-${conv.counterpart_id}`"
        class="conversation-item"
        @click="openChat(conv)"
      >
        <div class="conv-avatar">
          <img v-if="conv.counterpart_picture" :src="conv.counterpart_picture" alt="" />
          <div v-else class="avatar-placeholder">{{ conv.counterpart_name?.[0] || '?' }}</div>
        </div>

        <div class="conv-info">
          <div class="conv-header">
            <h3>{{ conv.counterpart_name }}</h3>
            <span v-if="!conv.unread_count" class="conv-time">{{ formatTime(conv.last_message_time) }}</span>
          </div>
          <p class="product-title">{{ conv.product_title }}</p>
          <p class="last-message">{{ conv.last_message }}</p>
        </div>

        <div v-if="conv.unread_count > 0" class="unread-badge">
          {{ conv.unread_count }}
        </div>
      </div>
    </div>

    <!-- Chat Popup -->
    <ChatPopup
      v-model:isOpen="chatOpen"
      :productId="selectedConv?.product_id"
      :counterpartId="selectedConv?.counterpart_id"
      :product="{ title: selectedConv?.product_title }"
      :counterpart="{ 
        name: selectedConv?.counterpart_name, 
        picture: selectedConv?.counterpart_picture 
      }"
      @close="handleChatClose"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { userState } from '../services/authService';
import { url } from '../services/api';
import ChatPopup from '../components/ChatPopup.vue';

const conversations = ref([]);
const loading = ref(false);
const chatOpen = ref(false);
const selectedConv = ref(null);

onMounted(() => {
  loadConversations();
});

async function loadConversations() {
  if (!userState.user) return;
  loading.value = true;
  try {
    const res = await fetch(url(`/api/conversations?userId=${userState.user.id}`));
    const data = await res.json();
    console.log('Conversations API response:', data);
    conversations.value = data.conversations || [];
    console.log('Loaded conversations:', conversations.value);
  } catch (e) {
    console.error('Error loading conversations:', e);
  } finally {
    loading.value = false;
  }
}

async function openChat(conv) {
  selectedConv.value = conv;
  chatOpen.value = true;

  // Zera imediatamente no frontend (para sumir visualmente)
  conv.unread_count = 0;

  // Tenta marcar como lidas no backend
  try {
    await fetch(url(`/api/conversations/markAsRead`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userState.user.id,
        productId: conv.product_id,
        counterpartId: conv.counterpart_id,
      }),
    });
  } catch (e) {
    console.warn('Falha ao marcar mensagens como lidas:', e);
  }
}

function handleChatClose() {
  chatOpen.value = false;
  // Reload conversations to update unread counts and last message
  setTimeout(() => {
    loadConversations();
  }, 300);
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 0) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return date.toLocaleDateString('pt-BR', { weekday: 'short' });
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
</script>

<style scoped>
.messages-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  font-size: 2rem;
  margin-bottom: 24px;
  color: #004451;
}

.loading, .empty {
  text-align: center;
  padding: 60px 20px;
  color: #636e72;
}

.empty p {
  font-size: 1.2rem;
  margin: 8px 0;
}

.empty .hint {
  font-size: 0.95rem;
  opacity: 0.7;
}

.conversations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.conversation-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f2f2f2;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.conversation-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.conv-avatar {
  flex-shrink: 0;
}

.conv-avatar img {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #004451, #0984e3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
}

.conv-info {
  flex: 1;
  min-width: 0;
}

.conv-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.conv-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3436;
}

.conv-time {
  font-size: 0.85rem;
  color: #636e72;
  white-space: nowrap;
}

.product-title {
  margin: 0 0 6px;
  font-size: 0.9rem;
  color: #004451;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.last-message {
  margin: 0;
  font-size: 0.95rem;
  color: #636e72;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #d63031;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

@media (max-width: 600px) {
  .messages-view {
    padding: 12px;
  }

  h2 {
    font-size: 1.5rem;
  }

  .conversation-item {
    padding: 12px;
  }

  .conv-avatar img,
  .avatar-placeholder {
    width: 48px;
    height: 48px;
  }
}
</style>
