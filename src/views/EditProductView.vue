<template>
  <div class="edit-product">
    <h2>Editar Produto</h2>

    <div v-if="loading">Carregando...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <form v-if="!loading" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title">Título</label>
        <input id="title" v-model="form.title" required />
      </div>

      <div class="form-group">
        <label for="condition">Condição</label>
        <select id="condition" v-model="form.condition">
          <option value="Novo">Novo</option>
          <option value="Usado">Usado - como novo</option>
          <option value="Usado - bom">Usado - bom</option>
          <option value="Usado - aceitável">Usado - aceitável</option>
        </select>
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
          <label for="location">Local de retirada</label>
          <select id="location" v-model="form.location">
            <option value="UFSM">UFSM</option>
            <option value="Em casa">Em casa</option>
            <option value="A definir">A combinar</option>
          </select>
        </div>
      </div>

      <div class="actions">
        <button type="submit" class="submit-button">Salvar</button>
        <button type="button" class="cancel-button" @click="goBack">Cancelar</button>
        <button type="button" class="delete-button" @click="handleDelete">Remover produto</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { url } from '../services/api';
import { userState } from '../services/authService';

const route = useRoute();
const router = useRouter();
const id = route.params.id;

const loading = ref(true);
const error = ref(null);
const form = ref({
  title: '',
  condition: '',
  category: '',
  description: '',
  price: 0,
  location: 'UFSM'
});

async function load() {
  loading.value = true;
  try {
  const res = await fetch(url(`/api/products/${id}`));
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao carregar produto');
    Object.assign(form.value, data.product);
    // Ensure numeric price
    form.value.price = Number(form.value.price || 0);
    // Ownership check: if seller_id exists and doesn't match user, warn and redirect
    if (data.product && data.product.seller_id && userState.user && data.product.seller_id !== userState.user.id) {
      alert('Você não tem permissão para editar esse anúncio.');
      router.push('/my-ads');
    }
  } catch (err) {
    console.error(err);
    error.value = err.message || 'Erro ao carregar produto';
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  try {
  const res = await fetch(url(`/api/products/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar produto');
    alert('Produto atualizado com sucesso');
    router.push('/my-ads');
  } catch (err) {
    console.error(err);
    alert(err.message || 'Erro ao atualizar produto');
  }
}

async function handleDelete() {
  if (!confirm('Tem certeza que deseja remover este produto? Esta operação não pode ser desfeita.')) return;
  try {
    const res = await fetch(url(`/api/products/${id}`), { method: 'DELETE' });
    // Parse response safely: if server returns JSON, parse it; otherwise read text
    let data;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      data = await res.json();
    } else {
      data = { text: await res.text() };
    }
    if (!res.ok) {
      // Prefer error message from JSON, fallback to plain text
      throw new Error((data && data.error) || data.text || 'Erro ao deletar produto');
    }
    alert('Produto removido com sucesso');
    router.push('/my-ads');
  } catch (err) {
    console.error(err);
    alert(err.message || 'Erro ao remover produto');
  }
}

function goBack() {
  router.push('/my-ads');
}

onMounted(load);
</script>

<style scoped>
.edit-product { max-width: 700px; margin: 2rem auto; padding:1rem }
.form-group { margin-bottom: 1rem }
label { display:block; margin-bottom:0.25rem }
input, textarea, select { width:100%; padding:0.6rem; border:1px solid #ccc; border-radius:6px }
.form-grid { display:flex; gap:1rem }
.form-grid .form-group { flex:1 }
.actions { display:flex; gap:0.5rem; margin-top:1rem }
.submit-button { padding:0.75rem 1rem; background:#0984e3; color:#fff; border:none; border-radius:6px }
.cancel-button { padding:0.6rem 1rem; background:#b2bec3; color:#fff; border:none; border-radius:6px }
.error { color:#d63031 }
</style>
