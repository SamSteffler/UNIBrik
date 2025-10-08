<script setup>
import { ref } from "vue"
import logo from '../assets/blue-logo-1.png'
import facebookLogo from '../assets/facebook-logo.png'
import googleLogo from '../assets/google-logo.png'

// IMPORTANTE: Importe o componente GoogleLogin, e não apenas a função googleSdkLoaded
import { GoogleLogin } from 'vue3-google-login'
import authService from '../services/authService'

// Campos locais
const emailOuCpf = ref("")
const senha = ref("")

// Callback Google: Chamado quando o login com Google é bem-sucedido
const onLoginSuccess = (response) => {
  // A 'response' contém o credential JWT (o token de identidade)
  console.log('✅ Usuário logado com Google (via componente):', response)

  // Decodifica o payload do JWT para obter os dados do usuário
  const userData = JSON.parse(atob(response.credential.split(".")[1]))
  
  // Exemplo de como você pode usar os dados:
  console.log("Nome:", userData.name)
  console.log("Email:", userData.email)
  
  // Chame o serviço de autenticação com o token ou os dados decodificados, conforme o seu backend espera
  // authService.googleLogin({ token: response.credential, ...userData })
}

const onLoginFailure = () => {
  console.error("❌ Login com Google falhou")
}

// Ação principal do botão
const entrarOuCadastrar = async () => {
  try {
    // Note: Sua função original enviava 'email' e 'senha',
    // assumindo que 'emailOuCpf' é o campo de email aqui.
    await authService.login({
      email: emailOuCpf.value,
      senha: senha.value,
    })
  } catch (error) {
    console.error("❌ Erro no login manual:", error)
  }
}

// REMOVIDO: A função 'googleLogin' antiga e complexa que usava 'gapi.auth2' foi removida.
// O componente <GoogleLogin> fará isso por nós.
</script>

<template>
  <div class="login-container">
    <div class="logo">
      <img :src="logo" alt="Logo" />
    </div>

    <input
      v-model="emailOuCpf"
      type="text"
      placeholder="E-mail ou CPF"
      class="input-field"
    />
    <input
      v-model="senha"
      type="password"
      placeholder="Senha"
      class="input-field"
    />

    <button class="main-btn" @click="entrarOuCadastrar">
      Entrar ou Cadastrar
    </button>

    <hr class="divider" />
    <p>Ou escolha uma das opções</p>

    <div class="social-login">
      <GoogleLogin 
        :callback="onLoginSuccess" 
        :prompt="false" 
        mode="button"
        :onFailure="onLoginFailure"
      >
        <button class="social-btn google">
          <img :src="googleLogo" alt="Google" />
        </button>
      </GoogleLogin>

      <button class="social-btn facebook">
        <img :src="facebookLogo" alt="Facebook" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  height: 515px;
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