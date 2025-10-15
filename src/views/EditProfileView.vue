<template>
  <div class="edit-profile-container">
    <h2>Editar Dados Cadastrais</h2>
    <form @submit.prevent="handleUpdate">
      
      <fieldset>
        <legend>Dados Pessoais</legend>
        <div class="form-group">
          <label for="name">Nome Completo</label>
          <input type="text" id="name" v-model="form.name" required />
        </div>
        <div class="form-group">
          <label for="email">E-mail</label>
          <input type="email" id="email" v-model="form.email" disabled />
          <small class="info-text">O e-mail não pode ser alterado pois está vinculado à sua conta Google.</small>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="birth_date">Data de Nascimento</label>
            <input type="date" id="birth_date" v-model="form.birth_date" :max="maxDate" />
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
        <div class="form-group" v-if="!form.google_sub">
          <label for="password">Nova Senha (deixe em branco para manter a atual)</label>
          <input type="password" id="password" v-model="form.password" placeholder="Digite apenas se quiser alterar" />
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
        <button type="button" class="cancel-button" @click="handleCancel">Cancelar</button>
        <button type="submit" class="submit-button">Salvar Alterações</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';
import { url } from '../services/api';

const router = useRouter();

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

const ageError = ref('');

// Data máxima para o campo de data (18 anos atrás)
const maxDate = (() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().split('T')[0];
})();

// Carrega os dados do usuário logado ao montar o componente
onMounted(async () => {
  if (!authService.userState.isLoggedIn) {
    router.push('/login');
    return;
  }

  try {
    // Busca os dados atualizados do usuário no servidor
    const userId = authService.userState.user.id;
    const res = await fetch(url(`/api/auth/user/${userId}`));
    
    if (!res.ok) {
      throw new Error('Erro ao carregar dados do usuário');
    }

    const userData = await res.json();
    
    // Preenche o formulário com os dados do usuário
    form.value = {
      name: userData.name || '',
      email: userData.email || '',
      password: '', // Sempre vazio para edição
      google_sub: userData.google_sub || null,
      picture: userData.picture || null,
      birth_date: userData.birth_date || '',
      phone: userData.phone || '',
      address_cep: userData.address_cep || '',
      address_street: userData.address_street || '',
      address_number: userData.address_number || '',
      address_complement: userData.address_complement || '',
      address_district: userData.address_district || '',
      address_city: userData.address_city || '',
      address_uf: userData.address_uf || ''
    };

    // Formata o telefone se já existir
    if (form.value.phone) {
      formatPhoneDisplay();
    }
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error);
    alert('Erro ao carregar seus dados. Tente novamente.');
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

// Formata o telefone ao carregar (para exibição)
const formatPhoneDisplay = () => {
  let value = form.value.phone.replace(/\D/g, '');
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
    return true; // Não é obrigatório na edição
  }
  
  const birthDate = new Date(form.value.birth_date);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < 18) {
    ageError.value = 'Você deve ter pelo menos 18 anos';
    return false;
  }
  
  return true;
};

// Função para buscar endereço pelo CEP
const fetchAddressByCep = async () => {
  const cep = form.value.address_cep.replace(/\D/g, '');
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

// Função para atualizar os dados do usuário
const handleUpdate = async () => {
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
    const userId = authService.userState.user.id;
    
    // Prepara os dados para envio (sem a senha se estiver vazia)
    const dataToSend = { 
      ...form.value,
      phone: phoneDigits // Envia apenas os dígitos
    };
    
    if (!dataToSend.password) {
      delete dataToSend.password; // Remove a senha se não foi preenchida
    }

    const res = await fetch(url(`/api/auth/user/${userId}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Falha ao atualizar os dados.');
    }

    // Atualiza o estado do usuário no frontend
    authService.login(data.user);
    
    alert('Dados atualizados com sucesso!');
    router.push('/profile');

  } catch (error) {
    console.error("Erro ao atualizar dados:", error);
    alert(error.message);
  }
};

// Função para cancelar e voltar ao perfil
const handleCancel = () => {
  router.push('/profile');
};
</script>

<style scoped>
.edit-profile-container {
  max-width: 800px;
  margin: 3rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

h2 {
  margin-bottom: 2rem;
  color: #004451;
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
  color: #0097b2;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.uf-group {
  flex: 0 0 60px;
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

input {
  width: 90%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:disabled {
  background-color: #f2f2f2;
  cursor: not-allowed;
  color: #666;
}

input:focus {
  outline: none;
  border-color: #0097B2;
  box-shadow: 0 0 0 3px rgba(0, 151, 178, 0.1);
}

.info-text {
  display: block;
  margin-top: 0.5rem;
  color: #00445166;
  padding-left: 0.25rem;
  font-size: 0.80rem;
  font-style: italic;
}

.helper-text {
  display: block;
  margin-top: 0.25rem;
  color: #00445166;
  padding-left: 0.25rem;
  font-size: 0.80rem;
  font-style: italic;
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
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-button,
.submit-button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-button {
  border-radius: 30px;
  font-family: 'Plus Jakarta Sans', Times, serif !important;
  font-weight: bold;
  background-color: #e7e7e7ff;
  color: #4a4a4aff;
}

.cancel-button:hover {
  background-color: #c5c5c5ff;
}

.submit-button {
  border-radius: 30px;
  font-family: 'Plus Jakarta Sans', Times, serif !important;
  font-weight: bold;
  background-color: #0097b2;
  color: white;
}

.submit-button:hover {
  background-color: rgba(0, 113, 133, 1);
}
</style>
