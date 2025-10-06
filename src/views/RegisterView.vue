<template>
  <div class="register-container">
    <h2>Crie sua conta</h2>
    <p v-if="isGoogleRegister">
      Continue seu cadastro com o Google.
    </p>
    <p v-else>Preencha os dados para se cadastrar.</p>

    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="name">Nome Completo</label>
        <input type="text" id="name" v-model="form.name" required />
      </div>

      <div class="form-group">
        <label for="email">E-mail</label>
        <input type="email" id="email" v-model="form.email" required :disabled="isGoogleRegister" />
      </div>
      
      <div class="form-group">
        <label for="password">Senha</label>
        <input type="password" id="password" v-model="form.password" :required="!isGoogleRegister" />
        <small v-if="isGoogleRegister">Você não precisará de senha para login com Google.</small>
      </div>

      <button type="submit" class="submit-button">Finalizar Cadastro</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import authService from '../services/authService'; // 1. Importe o authService

const route = useRoute();
const router = useRouter();

const form = ref({
  name: '',
  email: '',
  password: '',
  // Dados do Google, se houver
  google_sub: null,
  picture: null
});

const isGoogleRegister = ref(false);

// Ao carregar o componente, verifica se vieram dados do Google pela rota
onMounted(() => {
  if (route.query.email) {
    isGoogleRegister.value = true;
    form.value.email = route.query.email;
    form.value.name = route.query.name || '';
    form.value.google_sub = route.query.sub || null;
    form.value.picture = route.query.picture || null;
  }
});

// MODIFICADO: Função de cadastro
const handleRegister = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Falha ao realizar o cadastro.');
    }

    // Se o cadastro for bem-sucedido:
    alert('Cadastro realizado com sucesso! Você será redirecionado.');
    
    // Se o backend retornar o usuário (após a melhoria do Passo 1)
    if (data.user) {
        authService.login(data.user); // 2. Salva o estado do usuário
        router.push('/profile');     // 3. Redireciona para o perfil
    } else {
        // Se o backend não retornar o usuário, redireciona para a tela de login
        router.push('/login');
    }

  } catch (error) {
    console.error("Erro no cadastro:", error);
    alert(error.message);
  }
};
</script>

<style scoped>
.register-container {
  max-width: 500px;
  margin: 3rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.form-group {
  margin-bottom: 1.5rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}
input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
input:disabled {
  background-color: #f2f2f2;
}
.submit-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #0097B2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
</style>