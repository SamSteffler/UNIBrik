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

    <section class="images-section">
      <h3>Imagens do anúncio</h3>
      <div class="upload-row">
        <input type="file" ref="fileInput" multiple accept="image/*" />
        <button @click="uploadImages" class="upload-button">Enviar imagens</button>
      </div>

      <div class="thumbnails">
        <div v-for="img in images" :key="img" class="thumb">
          <img :src="img" alt="" />
          <button class="thumb-delete" @click="deleteImage(img)">Excluir</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { url } from '../services/api';
import { userState } from '../services/authService';
import { ref as vueRef } from 'vue';

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

const images = ref([]);
const fileInput = vueRef(null);

async function loadImages() {
  try {
    const res = await fetch(url(`/api/products/${id}/images`));
    if (!res.ok) throw new Error('Erro ao carregar imagens');
    const data = await res.json();
    images.value = data.images || [];
  } catch (e) { console.error('loadImages', e); }
}

async function uploadImages() {
  const files = fileInput.value?.files;
  if (!files || files.length === 0) return alert('Selecione pelo menos uma imagem.');
  const fd = new FormData();
  for (const f of files) fd.append('images', f);
  try {
    const res = await fetch(url(`/api/products/${id}/images`), { method: 'POST', body: fd });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || 'Upload failed');
    }
    const data = await res.json();
    images.value.push(...(data.images || []));
    // clear input
    fileInput.value.value = null;
    alert('Imagens enviadas');
  } catch (e) { console.error(e); alert(e.message || 'Erro no upload'); }
}

async function deleteImage(path) {
  if (!confirm('Remover esta imagem?')) return;
  try {
    const res = await fetch(url(`/api/products/${id}/images`), { method: 'DELETE', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ filename: path.split('/').pop() }) });
    if (!res.ok) throw new Error('Erro ao remover imagem');
    images.value = images.value.filter(i => i !== path);
  } catch (e) { console.error(e); alert(e.message || 'Erro ao excluir imagem'); }
}

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
onMounted(loadImages);
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
.images-section { margin-top:1.5rem }
.upload-row { display:flex; gap:0.5rem; align-items:center }
.thumbnails { display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.75rem }
.thumb { width:120px; position:relative }
.thumb img { width:100%; height:80px; object-fit:cover; border-radius:6px }
.thumb-delete { position:absolute; right:6px; top:6px; background:rgba(0,0,0,0.6); color:white; border:none; padding:0.25rem 0.5rem; border-radius:4px }
.upload-button { padding:0.5rem 0.75rem; background:#0984e3; color:#fff; border:none; border-radius:6px }
</style>
