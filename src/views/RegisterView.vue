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
            <label for="birth_date">Data de Nascimento *</label>
            <input type="date" id="birth_date" v-model="form.birth_date" :max="maxDate" required />
            <small class="error-message" v-if="ageError">{{ ageError }}</small>
          </div>

          <div class="form-group">
            <label for="phone">Celular (com DDD)</label>
            <input 
              type="tel" 
              id="phone" 
              v-model="form.phone" 
              @input="formatPhone"
              placeholder="(XX) XXXXX-XXXX"
              maxlength="15"
            />
            <small class="helper-text">Apenas números, máximo 11 dígitos</small>
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
            <label for="complement">Complemento</label>
            <input type="text" id="complement" v-model="form.address_complement" placeholder="Apto, bloco, etc." />
          </div>
        </div>

        <div class="form-group">
          <label for="district">Bairro</label>
          <input type="text" id="district" v-model="form.address_district" />
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

      <div class="button-group">
        <button type="submit" class="submit-button">Finalizar Cadastro</button>
      </div>
    </form>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import authService from '../services/authService';
import { url } from '../services/api';

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
  address_complement: '',
  address_district: '',
  address_city: '',
  address_uf: ''
});

const isGoogleRegister = ref(false);
const ageError = ref('');

// Data máxima para o campo de data (18 anos atrás)
const maxDate = (() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().split('T')[0];
})();

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


// Formata o telefone (apenas dígitos, máximo 11)
const formatPhone = (e) => {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length > 11) {
    value = value.slice(0, 11);
  }
  
  // Formata visualmente: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (value.length <= 10) {
    value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  } else {
    value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
  }
  
  form.value.phone = value;
};

// Valida idade (mínimo 18 anos)
const validateAge = () => {
  ageError.value = '';
  if (!form.value.birth_date) {
    ageError.value = 'Data de nascimento é obrigatória';
    return false;
  }
  
  const birthDate = new Date(form.value.birth_date);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < 18) {
    ageError.value = 'Você deve ter pelo menos 18 anos para se cadastrar';
    return false;
  }
  
  return true;
};

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
  // Validação de idade
  if (!validateAge()) {
    alert('Por favor, corrija os erros no formulário.');
    return;
  }

  // Remove formatação do telefone antes de enviar
  const phoneDigits = form.value.phone.replace(/\D/g, '');
  if (phoneDigits && phoneDigits.length > 11) {
    alert('O número de telefone deve ter no máximo 11 dígitos.');
    return;
  }

  try {
    // Cria uma cópia do form com o telefone sem formatação
    const formData = {
      ...form.value,
      phone: phoneDigits
    };

    const res = await fetch(url('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
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
  margin: 0 auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 2rem;
  color: #004451;
  text-align: center;
}

fieldset {
  border: 1px solid #ddd;
  border-radius: 15px;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
}

legend {
  padding: 0 0.5rem;
  font-weight: bold;
  color: #0097b2;
}

.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-row .form-group {
  flex: 1;
}

.uf-group {
  flex: 0 0 80px;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #004451;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 15px;
  font-size: 1rem;
  box-sizing: border-box;
  display: block;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #0097B2;
  box-shadow: 0 0 0 3px rgba(0, 151, 178, 0.1);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.helper-text {
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.875rem;
}

.error-message {
  display: block;
  margin-top: 0.25rem;
  color: #d32f2f;
  font-size: 0.875rem;
  font-weight: 500;
}

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #0097b2;
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  font-family: 'Plus Jakarta Sans', Times, serif !important;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background-color: rgba(0, 113, 133, 1);
}
</style>