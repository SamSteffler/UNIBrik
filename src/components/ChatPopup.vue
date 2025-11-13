<template>
  <Teleport to="body">
    <div v-if="isOpen" class="chat-overlay" @click="close">
      <div class="chat-popup" @click.stop>
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header-info">
            <img v-if="counterpart?.picture" :src="counterpart.picture" class="avatar" />
            <div v-else class="avatar-placeholder">{{ counterpart?.name?.[0] || '?' }}</div>
            <div class="header-text">
              <h3>{{ counterpart?.name || 'Carregando...' }}</h3>
              <p class="product-title">{{ product?.title || '' }}</p>
            </div>
          </div>
          <button @click="close" class="close-btn">✕</button>
        </div>

        <!-- Messages -->
        <div class="chat-messages" ref="messagesContainer">
          <div v-if="loading" class="loading">Carregando mensagens...</div>
          <div v-else-if="messages.length === 0" class="empty">
            <p>Nenhuma mensagem ainda.</p>
            <p class="hint">Inicie a conversa sobre "{{ product?.title }}"</p>
          </div>
          <div v-else>
            <div
              v-for="msg in messages"
              :key="msg.id"
              :class="['message', msg.sender_id === currentUserId ? 'sent' : 'received']"
            >
              <div class="message-content">
                <p>{{ msg.message }}</p>
                <span class="message-time">{{ formatTime(msg.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input">
          <textarea
            v-model="newMessage"
            placeholder="Digite sua mensagem..."
            @keydown.enter.exact.prevent="sendMessage"
            rows="1"
          ></textarea>
          <button @click="sendMessage" :disabled="!newMessage.trim()">
            Enviar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue';
import { userState } from '../services/authService';
import { url } from '../services/api';

const props = defineProps({
  isOpen: Boolean,
  productId: [Number, String],
  counterpartId: [Number, String],
  product: Object,
  counterpart: Object
});

const emit = defineEmits(['close', 'update:isOpen']);

const messages = ref([]);
const newMessage = ref('');
const loading = ref(false);
const messagesContainer = ref(null);
const currentUserId = userState.user?.id;

let pollInterval = null;

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && props.productId && props.counterpartId) {
    await loadMessages();
    scrollToBottom(); // 👈 garante que rola mesmo se o loadMessages não disparar
    startPolling();
  } else {
    stopPolling();
  }
});


async function loadMessages() {
  if (!currentUserId) return;
  try {
    const res = await fetch(url(`/api/messages/${props.productId}/${props.counterpartId}?userId=${currentUserId}`));
    const data = await res.json();
    const newMessages = data.messages || [];

    // Atualiza mensagens sem recriar array
    messages.value = newMessages;

    await nextTick();
    scrollToBottom(); // 👈 sempre desce após carregar mensagens
  } catch (e) {
    console.error('Erro ao carregar mensagens:', e);
  }
}



async function sendMessage() {
  if (!newMessage.value.trim() || !currentUserId) return;
  const payload = {
    productId: props.productId,
    senderId: currentUserId,
    receiverId: props.counterpartId,
    message: newMessage.value.trim()
  };
  try {
    const res = await fetch(url('/api/messages'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.message) {
      messages.value.push(data.message);
      newMessage.value = '';
      await nextTick();
      scrollToBottom();
    }
  } catch (e) {
    console.error('Erro ao enviar mensagem:', e);
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
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

function startPolling() {
  if (pollInterval) return;
  pollInterval = setInterval(() => {
    if (props.isOpen) {
      loadMessages();
    }
  }, 3000);
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

function close() {
  emit('close');
  emit('update:isOpen', false);
}

onUnmounted(() => stopPolling());
</script>

<style scoped>
.chat-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.chat-popup {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  height: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #004451;
  color: white;
  border-radius: 16px 16px 0 0;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #0984e3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.header-text {
  flex: 1;
  min-width: 0;
}

.header-text h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.product-title {
  margin: 2px 0 0;
  font-size: 0.85rem;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px 8px;
  opacity: 0.9;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.close-btn:hover {
  opacity: 1;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading, .empty {
  text-align: center;
  color: #636e72;
  padding: 40px 20px;
}

.empty .hint {
  font-size: 0.9rem;
  opacity: 0.7;
  margin-top: 8px;
}

.message {
  display: flex;
  margin-bottom: 5px;
}

.message.sent {
  align-self: flex-end;
  justify-content: flex-end; /* garante que o conteúdo encoste na direita */
}

/* centraliza o conteúdo dentro da bolha corretamente */
.message.sent .message-content {
  background: #0097b2;
  color: white;
  border-radius: 16px;
  border-bottom-right-radius: 16px;
  border-top-right-radius: 16px;
  transition: border-radius 0.15s;
}

/* quando há outra mensagem enviada logo abaixo (esta é a primeira do grupo) */
.message.sent + .message.sent .message-content {
  border-top-right-radius: 4px; /* canto superior direito reto */
}

/* quando vem logo abaixo outra enviada (esta NÃO é a última do grupo) */
.message.sent + .message.sent .message-content {
  border-top-right-radius: 4px;
}

/* quando é seguida por outra enviada (ou seja, NÃO é a última) */
.message.sent:not(:last-child):has(+ .message.sent) .message-content {
  border-bottom-right-radius: 4px;
}

/* quando está entre duas enviadas (mensagem do meio) */
.message.sent + .message.sent:has(+ .message.sent) .message-content {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

/* ===== MENSAGENS RECEBIDAS (opcional) ===== */
.message.received .message-content {
  border-radius: 16px;
}

.message.received + .message.received .message-content {
  border-top-left-radius: 4px;
}

.message.received:not(:last-child):has(+ .message.received) .message-content {
  border-bottom-left-radius: 4px;
}

/* mensagens recebidas continuam alinhadas à esquerda */
.message.received {
  align-self: flex-start;
  justify-content: flex-start;
}

.message-content {
  background: white;
  padding: 10px 14px;
  border-radius: 12px;
  max-width: 70%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-content p {
  margin: 0;
  word-wrap: break-word;
  font-size: 0.95rem;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  display: block;
  margin-top: 4px;
}

.chat-input {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background: white;
  border-radius: 0 0 16px 16px;
}

.chat-input textarea {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 20px;
  resize: none;
  font-family: inherit;
  font-size: 0.95rem;
  max-height: 100px;
}

.chat-input textarea:focus {
  outline: none;
  border-color: #004451;
}

.chat-input button {
  padding: 15px 20px;
  background: #004451;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  align-self: flex-end;
}

.chat-input button:hover:not(:disabled) {
  background: #003340;
}

.chat-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
