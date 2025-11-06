<template>
  <div class="blocked-container">
    <div class="blocked-card">
      <div class="icon-container">
        <div class="block-icon">🚫</div>
      </div>
      
      <h1>Conta Bloqueada</h1>
      
      <div class="message-box">
        <p class="main-message">
          Sua conta foi temporariamente bloqueada pela administração da plataforma UNIBrik.
        </p>
        
        <div class="info-section">
          <h3>O que isso significa?</h3>
          <ul>
            <li>Você não pode acessar a plataforma no momento</li>
            <li>Todos os seus anúncios foram ocultados automaticamente</li>
            <li>Você não pode criar novos anúncios ou interagir com outros usuários</li>
          </ul>
        </div>
        
        <div class="info-section">
          <h3>Como resolver?</h3>
          <p>
            Entre em contato com a administração para entender o motivo do bloqueio 
            e solicitar a reativação da sua conta.
          </p>
        </div>
        
        <div class="contact-section">
          <h3>📧 Informações de Contato</h3>
          <p class="contact-info">
            Email: <a href="mailto:suporte@unibrik.com">suporte@unibrik.com</a>
          </p>
          <p class="contact-info">
            WhatsApp: <a href="https://wa.me/5511999999999" target="_blank">(11) 99999-9999</a>
          </p>
        </div>
      </div>
      
      <button @click="handleLogout" class="logout-button">
        Fazer Logout
      </button>
      
      <p class="footer-text">
        Após o desbloqueio, todos os seus anúncios serão restaurados automaticamente.
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import authService from '../services/authService';

const router = useRouter();

const handleLogout = () => {
  authService.logout();
  router.push('/login');
};
</script>

<style scoped>
.blocked-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.blocked-card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.icon-container {
  margin-bottom: 1.5rem;
}

.block-icon {
  font-size: 5rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

h1 {
  color: #d63031;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  font-weight: 800;
}

.message-box {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: left;
}

.main-message {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  font-weight: 500;
}

.info-section {
  margin-bottom: 1.5rem;
}

.info-section h3 {
  color: #004451;
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
  font-weight: 700;
}

.info-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-section li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  color: #555;
}

.info-section li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #d63031;
  font-weight: bold;
  font-size: 1.2rem;
}

.info-section p {
  color: #555;
  line-height: 1.6;
}

.contact-section {
  background: #fff;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.contact-section h3 {
  color: #004451;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.contact-info {
  margin: 0.5rem 0;
  font-size: 1rem;
  color: #2c3e50;
}

.contact-info a {
  color: #0097b2;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.contact-info a:hover {
  color: #004451;
  text-decoration: underline;
}

.logout-button {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #d63031, #c0392b);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(214, 48, 49, 0.3);
}

.logout-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(214, 48, 49, 0.4);
  background: linear-gradient(135deg, #c0392b, #a93226);
}

.footer-text {
  margin-top: 1.5rem;
  color: #636e72;
  font-size: 0.9rem;
  font-style: italic;
}

@media (max-width: 768px) {
  .blocked-card {
    padding: 2rem 1.5rem;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .block-icon {
    font-size: 4rem;
  }
}
</style>
