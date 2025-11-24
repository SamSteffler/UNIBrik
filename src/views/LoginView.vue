<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { GoogleLogin } from 'vue3-google-login';
import authService from '../services/authService';
import { url } from '../services/api';
import logo from '../assets/blue-logo-1.png';

const router = useRouter();
const email = ref('');
const password = ref('');

// Função auxiliar de validação
const isUfsmEmail = (emailToCheck) => {
  if (!emailToCheck) return false;
  const parts = emailToCheck.split('@');
  if (parts.length !== 2) return false;
  return parts[1].toLowerCase().includes('ufsm');
};

// Login com e-mail e senha
const handleEmailLogin = async () => {
  // Validação Frontend
  if (!isUfsmEmail(email.value)) {
    alert('Acesso restrito: Por favor, utilize seu e-mail institucional da UFSM.');
    return;
  }

  try {
    const res = await fetch(url('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 403 && data.blocked) {
        authService.login(data.user || { email: email.value, approved: 0 });
        router.push('/blocked');
        return;
      }
      throw new Error(data.error || 'Falha no login.');
    }

    authService.login(data.user);
    router.push('/profile');

  } catch (error) {
    console.error("Erro no login:", error);
    alert(error.message);
  }
};

// Callback para o sucesso do login com Google
const onLoginSuccess = async (response) => {
  try {
    const userData = JSON.parse(atob(response.credential.split('.')[1]));
    
    // Validação crítica UFSM
    if (!isUfsmEmail(userData.email)) {
        alert('Acesso restrito: Utilize sua conta Google vinculada à UFSM (@ufsm.br, @acad.ufsm.br).');
        return; 
    }

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

    if (res.status === 200) { 
      authService.login(data.user);
      router.push('/profile');
    } else if (res.status === 403) {
       if (data.blocked) {
          authService.login(data.user || { email: userData.email, approved: 0, name: userData.name });
          router.push('/blocked');
       } else {
          alert(data.error || 'Acesso negado.');
       }
    } else if (res.status === 404) { 
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
      alert(data.error || 'Erro ao conectar com Google');
    }
  } catch (err) {
    console.error("Erro no login Google:", err);
    alert("Erro ao processar login.");
  }
};

const onLoginFailure = () => {
  console.error('Login com Google falhou');
  alert("Não foi possível conectar com o Google.");
};

const goToRegister = () => {
  router.push('/register');
};
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
    <!-- Corrigido: removida a classe 'secondary-btn' para voltar a ser preenchido -->
    <button class="main-btn" @click.prevent="goToRegister">
      Cadastre-se!
    </button>

    <!-- Botão Google Customizado com Logo Oficial -->
    <div class="google-container">
      <GoogleLogin :callback="onLoginSuccess" :error="onLoginFailure">
        <button class="google-custom-btn">
          <!-- SVG Oficial do Google -->
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="google-icon">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
          </svg>
          Entrar com Google
        </button>
      </GoogleLogin>
    </div>
    
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  /* Altura removida para ajustar ao conteúdo */
  width: 350px;
  margin: 1rem auto;
  padding: 2rem 1.5rem;
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

.logo {
  display: flex;
  margin-top: 10px;
  margin-bottom: 20px;
  flex-direction: column;
  align-items: center;
}

.logo img {
  width: 150px;
  margin-bottom: 0.5rem;
}

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
  outline: none;
  box-shadow: none;
}

/* Estilos gerais dos botões (Entrar e Cadastre-se) */
.main-btn {
  margin-top: 20px;
  margin-bottom: 10px;
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
  background-color: #007a8f;
  border-color: #007a8f;
}

.divider {
  width: 75%;
  margin: 20px 0;
  border: none;
  border-top: 2px solid #0097b26e;
}

/* Botão Google Customizado */
.google-container {
  margin-top: 15px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.google-custom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background-color: white;
  color: #555;
  border: 1px solid #ddd;
  border-radius: 50px; /* Redondo */
  padding: 0.8rem 2rem;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-width: 220px;
}

.google-custom-btn:hover {
  background-color: #f8f9fa;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  transform: translateY(-1px);
}

.google-icon {
  width: 20px;
  height: 20px;
}
</style>