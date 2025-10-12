<template>
  <div class="create-product">
    <h2>Registrar produto</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title">Título</label>
        <input id="title" v-model="form.title" required />
      </div>

      <div class="form-group">
        <label for="condition">Condição</label>
        <input id="condition" v-model="form.condition" />
      </div>

      <div class="form-group">
        <label for="category">Categoria</label>
        <input id="category" v-model="form.category" />
      </div>

      <div class="form-group">
        <label for="description">Descrição</label>
        <textarea id="description" v-model="form.description"></textarea>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label for="price">Preço (R$)</label>
          <input id="price" type="number" v-model.number="form.price" min="0" step="0.01" />
        </div>

        <div class="form-group">
          <label for="location">Local</label>
          <select id="location" v-model="form.location">
            <option value="UFSM">UFSM</option>
            <option value="Em casa">Em casa</option>
          </select>
        </div>
      </div>

      <button type="submit" class="submit-button">Registrar</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { userState } from '../services/authService';

const router = useRouter();

const form = ref({
  title: '',
  condition: '',
  category: '',
  description: '',
  price: 0,
  location: 'UFSM'
});

const handleSubmit = async () => {
  try {
    const payload = { ...form.value, seller_id: userState.user ? userState.user.id : null };
    const res = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar produto');
    alert('Produto registrado com sucesso!');
    router.push('/search?q=' + encodeURIComponent(form.value.title));
  } catch (err) {
    console.error(err);
    alert(err.message || 'Erro ao criar produto');
  }
};
</script>

<style scoped>
.create-product { max-width: 700px; margin: 2rem auto; padding:1rem }
.form-group { margin-bottom: 1rem }
label { display:block; margin-bottom:0.25rem }
input, textarea, select { width:100%; padding:0.6rem; border:1px solid #ccc; border-radius:6px }
.form-grid { display:flex; gap:1rem }
.form-grid .form-group { flex:1 }
.submit-button { margin-top:1rem; padding:0.75rem 1rem; background:#0984e3; color:#fff; border:none; border-radius:6px }
</style>
