<template>
  <div class="sidebar-filters">
    <h3 class="filters-title">Filtros</h3>

    <!-- Faixa de Preço -->
    <div class="filter-section">
      <div class="price-range">
        <div class="price-sliders">
          <input
            type="range"
            :min="0"
            :max="5000"
            :step="50"
            v-model="filters.minPrice"
            @input="onFilterChange"
            class="slider slider-min"
          />
          <input
            type="range"
            :min="0"
            :max="5000"
            :step="50"
            v-model="filters.maxPrice"
            @input="onFilterChange"
            class="slider slider-max"
          />
        </div>
        <div class="price-display">
          De: R$ {{ filters.minPrice || 0 }},00 até R$ {{ filters.maxPrice || 5000 }},00
        </div>
        <div class="price-inputs">
          <input
            type="number"
            v-model.number="filters.minPrice"
            @input="onFilterChange"
            placeholder="Min"
            class="price-input"
            min="0"
          />
          <span>-</span>
          <input
            type="number"
            v-model.number="filters.maxPrice"
            @input="onFilterChange"
            placeholder="Max"
            class="price-input"
            min="0"
          />
        </div>
      </div>
    </div>

    <!-- Categorias -->
    <div class="filter-section">
      <h4 class="section-title">Categorias</h4>
      <div class="checkbox-list">
        <label 
          v-for="category in categories" 
          :key="category"
          class="checkbox-item"
        >
          <input
            type="checkbox"
            :value="category"
            v-model="filters.selectedCategories"
            @change="onFilterChange"
          />
          <span class="checkmark"></span>
          {{ category }}
        </label>
      </div>
    </div>

    <!-- Local de Retirada -->
    <div class="filter-section">
      <h4 class="section-title">Local de Retirada</h4>
      <div class="checkbox-list">
        <label 
          v-for="location in locations" 
          :key="location"
          class="checkbox-item"
        >
          <input
            type="checkbox"
            :value="location"
            v-model="filters.selectedLocations"
            @change="onFilterChange"
          />
          <span class="checkmark"></span>
          {{ location }}
        </label>
      </div>
    </div>

    <!-- Condição -->
    <div class="filter-section">
      <h4 class="section-title">Condição</h4>
      <div class="checkbox-list">
        <label 
          v-for="condition in conditions" 
          :key="condition"
          class="checkbox-item"
        >
          <input
            type="checkbox"
            :value="condition"
            v-model="filters.selectedConditions"
            @change="onFilterChange"
          />
          <span class="checkmark"></span>
          {{ condition }}
        </label>
      </div>
    </div>

    <!-- Ordenação -->
    <div class="filter-section">
      <h4 class="section-title">Ordenar por</h4>
      <select v-model="filters.sortBy" @change="onFilterChange" class="sort-select">
        <option value="created_at_desc">Mais recentes</option>
        <option value="created_at_asc">Mais antigos</option>
        <option value="price_asc">Menor preço</option>
        <option value="price_desc">Maior preço</option>
        <option value="title_asc">Nome A-Z</option>
        <option value="title_desc">Nome Z-A</option>
      </select>
    </div>

    <!-- Botão Limpar Filtros -->
    <button 
      v-if="hasActiveFilters" 
      @click="clearFilters" 
      class="clear-filters-btn"
    >
      Limpar todos os filtros
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'filtersChanged'])

// Opções disponíveis
const categories = [
  'Eletrônicos',
  'Livros', 
  'Materiais de aula',
  'Móveis',
  'Serviços',
  'Roupas'
]

const locations = [
  'Retirada na UFSM',
  'Retirada em casa'
]

const conditions = [
  'Novo',
  'Usado - como novo',
  'Usado - bom estado',
  'Usado - aceitável'
]

// Estado dos filtros
const filters = ref({
  minPrice: props.modelValue.minPrice !== undefined ? props.modelValue.minPrice : 0,
  maxPrice: props.modelValue.maxPrice !== undefined ? props.modelValue.maxPrice : 5000,
  selectedCategories: props.modelValue.selectedCategories || [],
  selectedLocations: props.modelValue.selectedLocations || [],
  selectedConditions: props.modelValue.selectedConditions || [],
  sortBy: props.modelValue.sortBy || 'created_at_desc'
})

// Computed properties
const hasActiveFilters = computed(() => {
  return filters.value.minPrice > 0 ||
         filters.value.maxPrice < 5000 ||
         filters.value.selectedCategories.length > 0 ||
         filters.value.selectedLocations.length > 0 ||
         filters.value.selectedConditions.length > 0 ||
         filters.value.sortBy !== 'created_at_desc'
})

// Methods
function onFilterChange() {
  // Validação: se minPrice > maxPrice, ajustar
  if (filters.value.minPrice && filters.value.maxPrice && 
      filters.value.minPrice > filters.value.maxPrice) {
    filters.value.maxPrice = filters.value.minPrice
  }

  emit('update:modelValue', { ...filters.value })
  emit('filtersChanged', { ...filters.value })
}

function clearFilters() {
  filters.value = {
    minPrice: 0,
    maxPrice: 5000,
    selectedCategories: [],
    selectedLocations: [],
    selectedConditions: [],
    sortBy: 'created_at_desc'
  }
  onFilterChange()
}

// Watch para mudanças externas no modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    filters.value = { ...filters.value, ...newValue }
  }
}, { deep: true })
</script>

<style scoped>
.sidebar-filters {
  background: #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  width: 250px;
  height: fit-content;
}

.filters-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.filter-section {
  margin-bottom: 25px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

/* Price Range Slider */
.price-range {
  margin-bottom: 20px;
}

.price-sliders {
  margin-bottom: 10px;
  position: relative;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  position: absolute;
  top: 0;
  left: 0;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2c9aa0;
  cursor: pointer;
  position: relative;
  z-index: 2;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2c9aa0;
  cursor: pointer;
  border: none;
  position: relative;
  z-index: 2;
}

.slider-min {
  z-index: 1;
}

.slider-max {
  z-index: 2;
}

.price-display {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 10px;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
}

.price-inputs span {
  color: #666;
  font-size: 0.9rem;
}

/* Checkbox Lists */
.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #333;
  padding: 4px 0;
}

.checkbox-item input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 2px solid #999;
  border-radius: 3px;
  position: relative;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.checkbox-item input[type="checkbox"]:checked + .checkmark {
  background: #2c9aa0;
  border-color: #2c9aa0;
}

.checkbox-item input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: -3px;
  left: 2px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-item:hover .checkmark {
  border-color: #2c9aa0;
}

/* Sort Select */
.sort-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  font-size: 0.9rem;
  color: #333;
}

.sort-select:focus {
  outline: none;
  border-color: #2c9aa0;
}

/* Clear Filters Button */
.clear-filters-btn {
  width: 100%;
  padding: 12px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 10px;
}

.clear-filters-btn:hover {
  background: #f5f5f5;
  border-color: #2c9aa0;
  color: #2c9aa0;
}

/* Responsividade */
@media (max-width: 768px) {
  .sidebar-filters {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style>