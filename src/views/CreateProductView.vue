<template>
  <div class="create-product">
    <h2 class="h2">Registrar produto</h2>

    <form @submit.prevent="handleSubmit">
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
        <select id="category" v-model="form.category">
          <option value="Eletrônicos">Eletrônicos</option>
          <option value="Móveis">Móveis</option>
          <option value="Livros">Livros</option>
          <option value="Roupas">Roupas</option>
          <option value="Serviços">Serviços</option>
          <option value="Materiais">Materiais</option>
          <option value="Outros">Outros</option>
        </select>
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
            <option value="A Combinar">A combinar</option>
          </select>
        </div>
      </div>

      <button type="submit" class="submit-button">Registrar</button>
    </form>
    
    <section class="images-section">
      <h3>Anexar imagens (opcional)</h3>
      <div class="upload-row">
        <input type="file" ref="fileInput" multiple accept="image/*" />
      </div>
      <div class="thumbnails">
        <div v-for="img in images" :key="img" class="thumb">
          <img :src="img" alt="" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { userState } from '../services/authService';
import { url } from '../services/api';

const router = useRouter();

const form = ref({
  title: '',
  condition: '',
  category: '',
  description: '',
  price: 0,
  location: 'UFSM'
});

const images = ref([]);
const fileInput = ref(null);
let createdProductId = null; // store ID after creation to allow uploading images

const handleSubmit = async () => {
  try {
    const payload = { ...form.value, seller_id: userState.user ? userState.user.id : null };
  const res = await fetch(url('/api/products'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar produto');
    createdProductId = data.product.id;
    alert('Produto registrado com sucesso! Você pode enviar imagens agora (ou editar o anúncio depois).');
    // optionally redirect to edit page where images and more can be managed
    router.push('/product/' + createdProductId);
  } catch (err) {
    console.error(err);
    alert(err.message || 'Erro ao criar produto');
  }
};

async function uploadAfterCreate() {
  if (!createdProductId) return alert('Crie o produto primeiro.');
  const files = fileInput.value?.files;
  if (!files || files.length === 0) return alert('Selecione pelo menos uma imagem.');
  const fd = new FormData();
  for (const f of files) fd.append('images', f);
  try {
    const res = await fetch(url(`/api/products/${createdProductId}/images`), { method: 'POST', body: fd });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || 'Upload failed');
    }
    const data = await res.json();
    images.value.push(...(data.images || []));
    fileInput.value.value = null;
    alert('Imagens enviadas com sucesso');
  } catch (e) { console.error(e); alert(e.message || 'Erro no upload'); }
}
</script>

<style scoped>
.create-product { 
  max-width: 800px;
  margin: 3rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.h2 {
  margin-bottom: 1.5rem;
  margin-left: 1rem;
  font-size: 1.5rem;
  color: #004451;
}

.form-group { 
  margin-bottom: 1rem;
  padding-left: 2rem;
  color: #004451;
}

label { 
  display:block; 
  margin-bottom:0.25rem 
}

input, textarea, select { 
  width: 95%;              /* ocupa toda a largura do container */
  padding: 0.6rem; 
  border: 1px solid #ddd; 
  border-radius: 6px; 
  box-sizing: border-box;   /* garante que o padding não ultrapasse o 100% */
  margin-bottom: 0.8rem;    /* dá um espaçamento entre os campos */
  font-size: 1rem;          /* mantém tamanho de texto consistente */
}

.form-grid { 
  display:flex; 
  gap:1rem 
}

.form-grid .form-group { 
  flex:1 
}

.submit-button { 
  margin-top:1rem; 
  padding:0.75rem 1rem; 
  background:#0984e3; 
  color:#fff; 
  border:none; 
  border-radius: 30px;
  padding-left: 3rem;
  padding-right: 3rem;
  font-family: 'Plus Jakarta Sans', Times, serif !important;
  font-weight: bold;
  background-color: #0097b2;
}

.submit-button:hover {
  background-color: rgba(0, 113, 133, 1);
}

</style>
