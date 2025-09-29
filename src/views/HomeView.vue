<template>
  <div class="home-container">
    
    <!-- Seção: Acessados recentemente -->
    <section class="section">
      <h2 class="section-title">Acessados recentemente</h2>
      <div class="cards-grid">
        <div class="card" v-for="item in recentItems" :key="item.id">
          <div class="card-image" :style="{ backgroundColor: item.color }"></div>
          <div class="card-content">
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-subtitle">{{ item.subtitle }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Seção: Podem te interessar -->
    <section class="section">
      <h2 class="section-title">Podem te interessar</h2>
      <div class="cards-grid">
        <div class="card" v-for="item in suggestedItems" :key="item.id">
          <div class="card-image" :style="{ backgroundColor: item.color }"></div>
          <div class="card-content">
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-subtitle">{{ item.subtitle }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Dados para "Acessados recentemente" (4 itens)
const recentItems = ref([
  {
    id: 1,
    title: 'Livro de Cálculo I',
    subtitle: 'Matemática - 7ª edição',
    color: '#FF6B6B'
  },
  {
    id: 2,
    title: 'Cadeira de Escritório',
    subtitle: 'Móveis - Ergonômica',
    color: '#4ECDC4'
  },
  {
    id: 3,
    title: 'Notebook Dell',
    subtitle: 'Eletrônicos - i5 8GB RAM',
    color: '#45B7D1'
  },
  {
    id: 4,
    title: 'Violão Acústico',
    subtitle: 'Instrumentos - Usado',
    color: '#F9CA24'
  }
])

// Dados para "Podem te interessar" (10 itens)
const suggestedItems = ref([
  {
    id: 5,
    title: 'Física Moderna',
    subtitle: 'Livros - 4ª edição',
    color: '#6C5CE7'
  },
  {
    id: 6,
    title: 'Mesa de Estudos',
    subtitle: 'Móveis - Madeira',
    color: '#A29BFE'
  },
  {
    id: 7,
    title: 'Calculadora HP',
    subtitle: 'Eletrônicos - Científica',
    color: '#FD79A8'
  },
  {
    id: 8,
    title: 'Bicicleta Aro 26',
    subtitle: 'Esporte - Mountain Bike',
    color: '#00B894'
  },
  {
    id: 9,
    title: 'Kit Laboratório',
    subtitle: 'Química - Completo',
    color: '#E17055'
  },
  {
    id: 10,
    title: 'Mochila Universitária',
    subtitle: 'Acessórios - Impermeável',
    color: '#0984E3'
  },
  {
    id: 11,
    title: 'Apostila Engenharia',
    subtitle: 'Material - Resumos',
    color: '#00CEC9'
  },
  {
    id: 12,
    title: 'Monitor 24"',
    subtitle: 'Eletrônicos - Full HD',
    color: '#FDCB6E'
  },
  {
    id: 13,
    title: 'Microscópio',
    subtitle: 'Laboratório - Óptico',
    color: '#E84393'
  },
  {
    id: 14,
    title: 'Uniforme Curso',
    subtitle: 'Roupas - Tamanho M',
    color: '#74B9FF'
  }
])
</script>

<style scoped>
.home-container {
  width: 75%;
  margin: 0 auto;
  padding: 0 1rem;
}

.main-title {
  text-align: center;
  color: #2d3436;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  font-weight: 300;
}

.section {
  margin-bottom: 4rem;
}

.section-title {
  font-size: 1.8rem;
  color: #2d3436;
  margin-bottom: 1.5rem;
  padding-left: 0.5rem;
  border-left: 4px solid #0984e3;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 900px; /* Limita para 3 cards por linha */
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-image {
  height: 180px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.card-image::after {
  content: '📷';
  font-size: 2rem;
  opacity: 0.7;
  color: white;
}

.card-content {
  padding: 1.25rem;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3436;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.card-subtitle {
  color: #636e72;
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.4;
}

/* Responsividade */
@media (max-width: 768px) {
  .main-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .card-content {
    padding: 1rem;
  }
  
  .home-container {
    padding: 0 0.5rem;
  }
}

@media (max-width: 480px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
  
  .main-title {
    font-size: 1.6rem;
  }
}
</style>