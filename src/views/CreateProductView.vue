<template>
  <div class="create-product">
    <div v-if="isAdminOrSupervisor" style="text-align:center;padding:3rem">
      <h2 style="color:#d63031">Acesso negado</h2>
      <p>Contas de administrador/supervisor não podem criar anúncios.</p>
      <button @click="$router.push('/')" class="submit-button">Voltar para Home</button>
    </div>

    <div v-else>
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

        <div class="form-group images-section">
          <h3>Anexar imagens (opcional)</h3>
          <input 
            type="file" 
            ref="fileInput" 
            multiple 
            accept="image/*" 
            @change="handleFileSelect"
            class="file-input"
          />
          <div class="thumbnails" v-if="selectedFiles.length > 0">
            <div v-for="(file, index) in selectedFiles" :key="index" class="thumb">
              <img :src="file.preview" :alt="file.name" />
              <button type="button" @click="removeImage(index)" class="remove-btn">✕</button>
            </div>
          </div>
          <p class="hint" v-if="selectedFiles.length === 0">
            Clique para selecionar imagens
          </p>
        </div>

        <button type="submit" class="submit-button">Criar Anúncio</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
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

const fileInput = ref(null);
const selectedFiles = ref([]);

const isAdminOrSupervisor = computed(() => {
  return userState.user && (userState.user.role === 'admin' || userState.user.role === 'supervisor');
});

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

const handleSubmit = async () => {
  try {
    if (isAdminOrSupervisor.value) {
      return alert('Contas de administrador/supervisor não podem criar anúncios.');
    }
    
    // 1. Create the product first
    const payload = { ...form.value, seller_id: userState.user ? userState.user.id : null };
    const res = await fetch(url('/api/products'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar produto');
    
    const productId = data.product.id;
    
    // 2. Upload images if any were selected
    if (selectedFiles.value.length > 0) {
      const fd = new FormData();
      selectedFiles.value.forEach(({ file }) => {
        fd.append('images', file);
      });
      
      try {
        const uploadRes = await fetch(url(`/api/products/${productId}/images`), {
          method: 'POST',
          body: fd
        });
        
        if (!uploadRes.ok) {
          console.error('Image upload failed, but product was created');
          alert('Produto criado com sucesso, mas houve um erro ao enviar as imagens. Você pode adicioná-las editando o anúncio.');
        } else {
          alert('Produto criado com sucesso e imagens enviadas!');
        }
      } catch (uploadErr) {
        console.error('Upload error:', uploadErr);
        alert('Produto criado com sucesso, mas houve um erro ao enviar as imagens. Você pode adicioná-las editando o anúncio.');
      }
    } else {
      alert('Produto criado com sucesso!');
    }
    
    // 3. Redirect to the product page
    router.push('/product/' + productId);
    
  } catch (err) {
    console.error(err);
    alert(err.message || 'Erro ao criar produto');
  }
};
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

.images-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
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
}

.file-input:hover {
  border-color: #004451;
  background: #f0f8ff;
}

.thumbnails {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
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

</style>
