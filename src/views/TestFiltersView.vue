<template>
  <div class="test-page">
    <h1>Teste do Componente SearchFilters</h1>
    
    <div class="test-container">
      <div class="test-section">
        <h2>Componente SearchFilters:</h2>
        <SearchFilters 
          v-model="filters" 
          @filtersChanged="onFiltersChanged"
        />
      </div>
      
      <div class="test-section">
        <h2>Estado Atual dos Filtros:</h2>
        <pre>{{ JSON.stringify(filters, null, 2) }}</pre>
      </div>
      
      <div class="test-section">
        <h2>Log de Mudanças:</h2>
        <div class="log">
          <div v-for="(change, index) in changeLog" :key="index" class="log-entry">
            <strong>{{ change.timestamp }}:</strong> {{ change.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SearchFilters from '../components/SearchFilters.vue'

const filters = ref({
  minPrice: 0,
  maxPrice: 5000,
  selectedCategories: [],
  selectedLocations: [],
  selectedConditions: [],
  sortBy: 'created_at_desc'
})

const changeLog = ref([])

function onFiltersChanged(newFilters) {
  const timestamp = new Date().toLocaleTimeString()
  const changes = []
  
  // Detectar mudanças específicas
  if (newFilters.minPrice !== filters.value.minPrice) {
    changes.push(`Preço mínimo: ${filters.value.minPrice} → ${newFilters.minPrice}`)
  }
  if (newFilters.maxPrice !== filters.value.maxPrice) {
    changes.push(`Preço máximo: ${filters.value.maxPrice} → ${newFilters.maxPrice}`)
  }
  if (JSON.stringify(newFilters.selectedCategories) !== JSON.stringify(filters.value.selectedCategories)) {
    changes.push(`Categorias: ${JSON.stringify(filters.value.selectedCategories)} → ${JSON.stringify(newFilters.selectedCategories)}`)
  }
  if (JSON.stringify(newFilters.selectedLocations) !== JSON.stringify(filters.value.selectedLocations)) {
    changes.push(`Localizações: ${JSON.stringify(filters.value.selectedLocations)} → ${JSON.stringify(newFilters.selectedLocations)}`)
  }
  if (JSON.stringify(newFilters.selectedConditions) !== JSON.stringify(filters.value.selectedConditions)) {
    changes.push(`Condições: ${JSON.stringify(filters.value.selectedConditions)} → ${JSON.stringify(newFilters.selectedConditions)}`)
  }
  if (newFilters.sortBy !== filters.value.sortBy) {
    changes.push(`Ordenação: ${filters.value.sortBy} → ${newFilters.sortBy}`)
  }
  
  if (changes.length > 0) {
    changeLog.value.unshift({
      timestamp,
      description: changes.join(' | ')
    })
    
    // Manter apenas as últimas 10 mudanças
    if (changeLog.value.length > 10) {
      changeLog.value = changeLog.value.slice(0, 10)
    }
  }
  
  filters.value = { ...newFilters }
  console.log('Filtros alterados:', newFilters)
}

// Log inicial
changeLog.value.push({
  timestamp: new Date().toLocaleTimeString(),
  description: 'Componente inicializado com filtros padrão'
})
</script>

<style scoped>
.test-page {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1rem;
}

.test-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

.test-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-section h2 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}

pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.9rem;
}

.log {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1rem;
}

.log-entry {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.9rem;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-entry strong {
  color: #0984e3;
}

@media (max-width: 768px) {
  .test-container {
    grid-template-columns: 1fr;
  }
}
</style>