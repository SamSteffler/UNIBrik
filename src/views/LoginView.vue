<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { GoogleLogin } from 'vue3-google-login';
import authService from '../services/authService';

const router = useRouter();
const email = ref('');
const password = ref('');

// MODIFICADO: Função de login com e-mail e senha
const handleEmailLogin = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    });

    const data = await res.json();

    if (!res.ok) {
      // Se a resposta não for 2xx, lança um erro com a mensagem do backend
      throw new Error(data.error || 'Falha no login.');
    }

    // Se o login for bem-sucedido:
    authService.login(data.user); // 1. Salva o estado do usuário
    router.push('/profile');     // 2. Redireciona para o perfil

  } catch (error) {
    console.error("Erro no login:", error);
    alert(error.message); // Exibe o erro para o usuário
  }
};
// MODIFICADO: Callback para o sucesso do login com Google
const onLoginSuccess = async (response) => {
  const userData = JSON.parse(atob(response.credential.split('.')[1]));
  
  // AQUI ESTÁ A NOVA LÓGICA
  // 1. Enviar os dados para o backend para verificação
  const res = await fetch('http://localhost:3000/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        sub: userData.sub,
        picture: userData.picture
      })
  });

  const data = await res.json();

  if (res.status === 200) { // 2. Se o usuário já existe, faz o login
    authService.login(data.user);
    router.push('/profile');
  } else if (res.status === 404) { // 3. Se não existe, redireciona para o cadastro
    // Passamos os dados do Google como query params para a página de registro
    router.push({ 
        name: 'register', 
        query: { 
            name: userData.name,
            email: userData.email,
            sub: userData.sub,
            picture: userData.picture
        } 
    });
  } else {
    // Tratar outros erros
    console.error('Falha na autenticação:', data.error);
  }
};

const onLoginFailure = () => {
  console.error('Login com Google falhou');
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<template>
  <div class="login-container">
    <h2>Acesse sua conta</h2>
    <form @submit.prevent="handleEmailLogin">
      <div class="form-group">
        <label for="email">E-mail</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">Senha</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit" class="submit-button">Entrar</button>
    </form>

    <div class="divider">ou</div>

    <div class="google-login-button">
      <GoogleLogin :callback="onLoginSuccess" :error="onLoginFailure" />
    </div>

    <div class="register-link">
      <p>Não tem uma conta? <a href="#" @click.prevent="goToRegister">Cadastre-se</a></p>
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
.form-group {
  text-align: left;
  margin-bottom: 1rem;
}
.submit-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #0097B2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.divider {
  margin: 1.5rem 0;
  color: #888;
}
.register-link {
  margin-top: 1.5rem;
}
.register-link a {
  color: #0097B2;
  font-weight: bold;
  text-decoration: none;
}
</style>