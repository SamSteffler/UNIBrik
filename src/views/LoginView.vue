<script setup>
import { GoogleLogin } from 'vue3-google-login';
import authService from '../services/authService';

// Callback para o sucesso do login
const onLoginSuccess = (response) => {
  // O token de credencial pode ser decodificado para obter os dados do usuário
  const userData = JSON.parse(atob(response.credential.split('.')[1]));
  authService.login(userData);
};

// Callback para falha no login (opcional, mas bom para depuração)
const onLoginFailure = () => {
  console.error('Login failed');
};
</script>

<template>
  <div class="login-container">
    <h2>Acesse sua conta</h2>
    <p>Use sua conta do Google ou crie um cadastro.</p>
    
    <div class="google-login-button">
      <GoogleLogin :callback="onLoginSuccess" :error="onLoginFailure" />
    </div>

    </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 5rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-align: center;
}

.google-login-button {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}
</style>