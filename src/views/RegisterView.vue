<template>
  <div class="register-container">
    <h2>Crie sua conta</h2>
    <form @submit.prevent="handleRegister">
      
      <fieldset>
        <legend>Dados Pessoais</legend>
        <div class="form-group">
          <label for="name">Nome Completo</label>
          <input type="text" id="name" v-model="form.name" required />
        </div>
        <div class="form-group">
          <label for="email">E-mail</label>
          <input type="email" id="email" v-model="form.email" required :disabled="isGoogleRegister" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="birth_date">Data de Nascimento</label>
            <input type="date" id="birth_date" v-model="form.birth_date" />
          </div>
          <div class="form-group">
            <label for="phone">Celular (com DDD)</label>
            <input type="tel" id="phone" v-model="form.phone" placeholder="(XX) XXXXX-XXXX" />
          </div>
        </div>
        <div class="form-group">
          <label for="password">Senha</label>
          <input type="password" id="password" v-model="form.password" :required="!isGoogleRegister" />
          <small v-if="isGoogleRegister">Você não precisará de senha para login com Google.</small>
        </div>
      </fieldset>
      
      <fieldset>
        <legend>Endereço</legend>
        <div class="form-group">
          <label for="cep">CEP</label>
          <input type="text" id="cep" v-model="form.address_cep" @blur="fetchAddressByCep" placeholder="Apenas números" />
        </div>
        <div class="form-group">
          <label for="street">Rua / Logradouro</label>
          <input type="text" id="street" v-model="form.address_street" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="number">Número</label>
            <input type="text" id="number" v-model="form.address_number" />
          </div>
          <div class="form-group">
            <label for="district">Bairro</label>
            <input type="text" id="district" v-model="form.address_district" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="city">Cidade</label>
            <input type="text" id="city" v-model="form.address_city" />
          </div>
          <div class="form-group uf-group">
            <label for="uf">UF</label>
            <input type="text" id="uf" v-model="form.address_uf" maxlength="2" />
          </div>
        </div>
      </fieldset>

      <button type="submit" class="submit-button">Finalizar Cadastro</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import authService from '../services/authService';

const route = useRoute();
const router = useRouter();

// 1. Adicione os novos campos ao 'form' ref
const form = ref({
  name: '',
  email: '',
  password: '',
  google_sub: null,
  picture: null,
  birth_date: '',
  phone: '',
  address_cep: '',
  address_street: '',
  address_number: '',
  address_district: '',
  address_city: '',
  address_uf: ''
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


// 2. (BÔNUS) Função para buscar endereço pelo CEP
const fetchAddressByCep = async () => {
  const cep = form.value.address_cep.replace(/\D/g, ''); // Remove caracteres não numéricos
  if (cep.length === 8) {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        form.value.address_street = data.logradouro;
        form.value.address_district = data.bairro;
        form.value.address_city = data.localidade;
        form.value.address_uf = data.uf;
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  }
};

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
  max-width: 800px;
  margin: 3rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
fieldset {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}
legend {
  padding: 0 0.5rem;
  font-weight: bold;
  color: #004451;
}
.form-row {
  display: flex;
  gap: 1rem;
}
.form-row .form-group {
  flex: 1;
}
.uf-group {
  flex: 0 0 60px; /* Faz o campo UF ficar menor */
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
  width: 90%;
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