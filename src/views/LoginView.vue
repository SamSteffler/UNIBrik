<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { GoogleLogin } from 'vue3-google-login';
import authService from '../services/authService';
import { url } from '../services/api';

const router = useRouter();
const email = ref('');
const password = ref('');

// MODIFICADO: Funcao de login com e-mail e senha
const handleEmailLogin = async () => {
  try {
  const res = await fetch(url('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    });

    const data = await res.json();

    if (!res.ok) {
      // Verifica se usuario esta bloqueado
      if (res.status === 403 && data.blocked) {
        authService.login(data.user || { email: email.value, approved: 0 });
        router.push('/blocked');
        return;
      }
      // Se a resposta não for 2xx = erro
      throw new Error(data.error || 'Falha no login.');
    }

    // Se o login for bem-sucedido:
    authService.login(data.user); // Salva o estado do usuario
    router.push('/profile');      // Redireciona para o perfil

  } catch (error) {
    console.error("Erro no login:", error);
    alert(error.message); // Exibe o erro para o usuario
  }
};
// MODIFICADO: Callback para o sucesso do login com Google
const onLoginSuccess = async (response) => {
  const userData = JSON.parse(atob(response.credential.split('.')[1]));
  
  // NOVA LOGICA
  // Enviar os dados para o backend para verificacao
  const res = await fetch(url('/api/auth/google'), {
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

  if (res.status === 200) { // faz o login se ja existente
    authService.login(data.user);
    router.push('/profile');
  } else if (res.status === 403 && data.blocked) { // bloqueado
    authService.login(data.user || { email: userData.email, approved: 0, name: userData.name });
    router.push('/blocked');
  } else if (res.status === 404) { // redireciona para o cadastro se nao existente
    // dados do Google como query params para a pagina de registro
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
    console.error('Falha na autenticação:', data.error);
  }
};

const onLoginFailure = () => {
  console.error('Login com Google falhou');
};

const goToRegister = () => {
  router.push('/register');
};

// coisa do pao
import logo from '../assets/blue-logo-1.png' 
</script>

<template>
  <div class="login-container">
    <div class="logo">
      <img :src="logo" alt="Logo" />
    </div>
    <form @submit.prevent="handleEmailLogin">
      <input
        v-model="email" required
        id="email"
        type="text"
        placeholder="E-mail"
        class="input-field"
      />
      <input
        v-model="password" required
        id="password"
        type="password"
        placeholder="Senha"
        class="input-field"
      />
      <button type="submit" class="main-btn">Entrar</button>
    </form>


    <hr class="divider"/>

    <p>Ou escolha uma das opções</p>
    <button class="main-btn" @click.prevent="goToRegister">
      Cadastre-se!
    </button>

    <div class="google-login-button">
      <GoogleLogin :callback="onLoginSuccess" :onFailure="onLoginFailure"></GoogleLogin>
    </div>
    
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  height: 550px;
  width: 350px;
  margin: 5rem auto;
  padding: 1.5rem;
  background-color: #f2f2f2;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 15px;
  text-align: center;
  color: #0097b2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Logo */
.logo {
  display: flex;
  margin-top: 20px;
  margin-bottom: 20px;
  flex-direction: column;
  align-items: center;
}

.logo img {
  width: 150px;
  margin-bottom: 0.5rem;
}

.logo h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

/* Inputs */
.input-field {
  width: 85%;
  padding: 0.65rem 1rem;
  border-radius: 50px;
  border: none;
  margin-bottom: 0.6rem;
  font-size: 1rem;
  background-color: #f2f2f2;
  border: 2px solid #0097b2;
  color: #0097b2;
}

.input-field::placeholder {
  color: #0097b289;
}

.input-field:focus {
  border-color: #0097b2;
  background-color: #f2f2f2;
  outline: none; /* remove a borda de foco padrão */
  box-shadow: none; /* remove qualquer sombra interna extra */
}

.input-field:focus::placeholder {
  color: #0097b2;
}

/* Chrome, Edge, Safari */
.input-field:-webkit-autofill {
  -webkit-box-shadow: 0 0 0px 1000px #f2f2f2 inset; /* muda o fundo */
  -webkit-text-fill-color: #0097b2; /* muda a cor da fonte */
  transition: background-color 5000s ease-in-out; /* evita efeito piscante */
}

/* Firefox */
.input-field:-moz-autofill {
  box-shadow: 0 0 0px 1000px #f2f2f2 inset;
  -moz-text-fill-color: #0097b2;
}

/* Botão principal */
.main-btn {
  margin-top: 25px;
  margin-bottom: 20px;
  border: 2px solid #0097b2;
  background-color: #0097b2;
  color: #f2f2f2;
  width: 60%;
  border-radius: 50px;
  padding: 0.8rem 2rem;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: 0.3s;
}

.main-btn:hover {
  border: 2px solid #0097b2;
  background-color: #f0f0f0ff;
  color: #0097b2;
}

/* Divisor */
.divider {
  width: 75%;
  margin-top: 20px;
  margin-bottom: 20px;
  border: none;
  border-top: 2px solid #0097b26e;
}

/* Login Social */
.social-login {
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.social-btn {
  background-color: white;
  border: 1px solid #0097b2;
  border-radius: 50%;
  width: 48px;        
  height: 48px;      
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
}

.social-btn img {
  width: 35px;
  height: 35px;
}

.social-btn:hover {
  transform: scale(1.1);
  border: 1.5px solid #0097b2;
}


.google:hover {
  background-color: #ffffff;
}

.facebook img {
  filter: none;
}
</style>