<template>
  <div class="edit-product">
    <div v-if="loading" style="text-align:center;padding:3rem">
      <p>Carregando...</p>
    </div>

    <div v-else>
      <h2 class="h2">Editar produto</h2>

      <div v-if="error" class="error">{{ error }}</div>

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

        <div class="form-group images-section">
          <h3>Gerenciar imagens</h3>
          
          <!-- Existing images -->
          <div class="thumbnails" v-if="existingImages.length > 0">
            <div v-for="img in existingImages" :key="img" class="thumb">
              <img :src="img" alt="Imagem do produto" />
              <button type="button" @click="deleteExistingImage(img)" class="remove-btn">✕</button>
            </div>
          </div>

          <!-- New images to upload -->
          <div class="thumbnails" v-if="selectedFiles.length > 0">
            <div v-for="(file, index) in selectedFiles" :key="'new-' + index" class="thumb">
              <img :src="file.preview" :alt="file.name" />
              <button type="button" @click="removeImage(index)" class="remove-btn">✕</button>
            </div>
          </div>

          <!-- File input -->
          <input 
            type="file" 
            ref="fileInput" 
            multiple 
            accept="image/*" 
            @change="handleFileSelect"
            class="file-input"
          />
          <p class="hint">
            Clique para adicionar mais imagens
          </p>
        </div>

        <div class="actions">
          <button type="submit" class="submit-button">Salvar Alterações</button>
          <button type="button" class="cancel-button" @click="goBack">Cancelar</button>
          <button type="button" class="delete-button" @click="handleDelete">Remover produto</button>
        </div>
      </form>
    </div>
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

const existingImages = ref([]);
const selectedFiles = ref([]);
const fileInput = ref(null);

function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  
  files.forEach(file => {
    // Create preview URL
    const preview = URL.createObjectURL(file);
    selectedFiles.value.push({
      file,
      preview,
      name: file.name
    });
  });
  
  // Reset input so same file can be selected again if needed
  event.target.value = '';
}

function removeImage(index) {
  // Revoke preview URL to free memory
  URL.revokeObjectURL(selectedFiles.value[index].preview);
  selectedFiles.value.splice(index, 1);
}

async function deleteExistingImage(path) {
  if (!confirm('Remover esta imagem?')) return;
  try {
    const res = await fetch(url(`/api/products/${id}/images`), { 
      method: 'DELETE', 
      headers: {'Content-Type':'application/json'}, 
      body: JSON.stringify({ filename: path.split('/').pop() }) 
    });
    if (!res.ok) throw new Error('Erro ao remover imagem');
    existingImages.value = existingImages.value.filter(i => i !== path);
    alert('Imagem removida com sucesso');
  } catch (e) { 
    console.error(e); 
    alert(e.message || 'Erro ao excluir imagem'); 
  }
}

async function load() {
  loading.value = true;
  try {
    const headers = {};
    // Send seller_id header to allow viewing own pending products
    if (userState.user && userState.user.id) {
      headers['x-seller-id'] = String(userState.user.id);
    }
    
    const res = await fetch(url(`/api/products/${id}`), { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao carregar produto');
    Object.assign(form.value, data.product);
    // Ensure numeric price
    form.value.price = Number(form.value.price || 0);
    
    // Load existing images
    existingImages.value = data.product.images || [];
    
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
    // 1. Update product data (this will set status back to 'pending')
    const res = await fetch(url(`/api/products/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar produto');
    
    // 2. Upload new images if any were selected
    if (selectedFiles.value.length > 0) {
      const fd = new FormData();
      selectedFiles.value.forEach(({ file }) => {
        fd.append('images', file);
      });
      
      try {
        const uploadRes = await fetch(url(`/api/products/${id}/images`), {
          method: 'POST',
          body: fd
        });
        
        if (!uploadRes.ok) {
          console.error('Image upload failed, but product was updated');
          alert('Produto atualizado com sucesso, mas houve um erro ao enviar as novas imagens.');
        } else {
          alert('Produto atualizado com sucesso! Ele voltará para aprovação pendente.');
        }
      } catch (uploadErr) {
        console.error('Upload error:', uploadErr);
        alert('Produto atualizado com sucesso, mas houve um erro ao enviar as novas imagens.');
      }
    } else {
      alert('Produto atualizado com sucesso! Ele voltará para aprovação pendente.');
    }
    
    // 3. Redirect to the product page
    router.push('/product/' + id);
    
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
.edit-product { 
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

.error {
  color: #d63031;
  background: #ffe0e0;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
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
  width: 95%;
  padding: 0.6rem; 
  border: 1px solid #ddd; 
  border-radius: 6px; 
  box-sizing: border-box;
  margin-bottom: 0.8rem;
  font-size: 1rem;
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.form-grid { 
  display:flex; 
  gap:1rem 
}

.form-grid .form-group { 
  flex:1 
}

.images-section {
  margin-top: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin-left: 2rem;
  margin-right: 2rem;
}

.images-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #004451;
}

.file-input {
  width: 100%;
  padding: 0.8rem;
  border: 2px dashed #0097b2;
  border-radius: 8px;
  cursor: pointer;
  background: white;
  transition: all 0.3s;
  margin-top: 1rem;
}

.file-input:hover {
  border-color: #004451;
  background: #f0f8ff;
}

.thumbnails {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.thumb {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(214, 48, 49, 0.9);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #d63031;
  transform: scale(1.1);
}

.hint {
  margin-top: 0.5rem;
  color: #636e72;
  font-size: 0.9rem;
  font-style: italic;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-left: 2rem;
  padding-right: 2rem;
  flex-wrap: wrap;
}

.submit-button { 
  padding: 0.75rem 1rem; 
  background: #0097b2;
  color: #fff; 
  border: none; 
  border-radius: 30px;
  padding-left: 2rem;
  padding-right: 2rem;
  font-family: 'Plus Jakarta Sans', Times, serif !important;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-button:hover {
  background-color: rgba(0, 113, 133, 1);
}

.cancel-button { 
  padding: 0.75rem 1rem; 
  background: #b2bec3; 
  color: #fff; 
  border: none; 
  border-radius: 30px;
  padding-left: 2rem;
  padding-right: 2rem;
  font-family: 'Plus Jakarta Sans', Times, serif !important;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-button:hover {
  background: #95a5a6;
}

.delete-button {
  padding: 0.75rem 1rem;
  background: #d63031;
  color: #fff;
  border: none;
  border-radius: 30px;
  padding-left: 2rem;
  padding-right: 2rem;
  font-family: 'Plus Jakarta Sans', Times, serif !important;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  margin-left: auto;
}

.delete-button:hover {
  background: #c0392b;
}
</style>
