<template>
  <div class="sidebar-filters">
    <h3 class="filters-title">Filtros</h3>

    <!-- Faixa de Preço -->
    <div class="filter-section price-section">
      <div class="price-range">
        <div class="slider-container">
          <input
            type="range"
            :min="0"
            :max="5000"
            :step="50"
            v-model.number="filters.minPrice"
            @input="onFilterChange"
            class="slider slider-min"
          />
          <input
            type="range"
            :min="0"
            :max="5000"
            :step="50"
            v-model.number="filters.maxPrice"
            @input="onFilterChange"
            class="slider slider-max"
          />
          <div class="slider-track"></div>
          <div 
            class="slider-range" 
            :style="{ 
              left: (filters.minPrice / 5000 * 100) + '%', 
              width: ((filters.maxPrice - filters.minPrice) / 5000 * 100) + '%' 
            }"
          ></div>
        </div>
        <div class="price-display">
          De: R$ {{ formatPrice(filters.minPrice) }} até R$ {{ formatPrice(filters.maxPrice) }}
        </div>
        <div class="price-inputs">
          <input
            type="number"
            v-model.number="filters.minPrice"
            @input="onFilterChange"
            placeholder="0"
            class="price-input"
            min="0"
            max="5000"
          />
          <span class="separator">-</span>
          <input
            type="number"
            v-model.number="filters.maxPrice"
            @input="onFilterChange"
            placeholder="5000"
            class="price-input"
            min="0"
            max="5000"
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
          <span class="custom-checkbox"></span>
          <span class="label-text">{{ category }}</span>
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
          <span class="custom-checkbox"></span>
          <span class="label-text">{{ location }}</span>
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
          <span class="custom-checkbox"></span>
          <span class="label-text">{{ condition }}</span>
        </label>
      </div>
    </div>

    <!-- Ordenação -->
    <div class="filter-section" v-if="false">
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
      Limpar filtros
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
function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0)
}

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
  background: #E8E8E8;
  border-radius: 20px;
  padding: 24px 20px;
  width: 280px;
  height: fit-content;
}

.filters-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2C2C2C;
  margin: 0 0 24px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.filter-section {
  margin-bottom: 32px;
}

.price-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2C2C2C;
  margin: 0 0 16px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* ===== PRICE RANGE SLIDER ===== */
.price-range {
  margin-bottom: 16px;
}

.slider-container {
  position: relative;
  height: 40px;
  margin-bottom: 12px;
}

.slider-track {
  position: absolute;
  width: 100%;
  height: 6px;
  background: #B8B8B8;
  border-radius: 3px;
  top: 17px;
  z-index: 1;
}

.slider-range {
  position: absolute;
  height: 6px;
  background: #2E9AA0;
  border-radius: 3px;
  top: 17px;
  z-index: 2;
}

.slider {
  position: absolute;
  width: 100%;
  height: 40px;
  background: transparent;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  pointer-events: none;
  top: 0;
  left: 0;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2E9AA0;
  cursor: pointer;
  pointer-events: all;
  position: relative;
  z-index: 4;
  border: 3px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.1s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider::-webkit-slider-thumb:active {
  transform: scale(1.15);
}

.slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2E9AA0;
  cursor: pointer;
  pointer-events: all;
  position: relative;
  z-index: 4;
  border: 3px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.1s ease;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.1);
}

.slider::-moz-range-thumb:active {
  transform: scale(1.15);
}

.slider-min {
  z-index: 3;
}

.slider-max {
  z-index: 4;
}

.price-display {
  font-size: 0.95rem;
  color: #4A4A4A;
  margin-bottom: 12px;
  font-weight: 500;
  text-align: center;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

.price-input {
  flex: 1;
  max-width: 100px;
  padding: 10px 12px;
  border: 1px solid #C0C0C0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #fff;
  text-align: center;
  font-weight: 500;
  color: #2C2C2C;
}

.price-input:focus {
  outline: none;
  border-color: #2E9AA0;
  box-shadow: 0 0 0 3px rgba(46, 154, 160, 0.1);
}

.separator {
  color: #666;
  font-size: 1rem;
  font-weight: 600;
}

/* ===== CHECKBOX LISTS ===== */
.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 1rem;
  color: #2C2C2C;
  padding: 4px 0;
  user-select: none;
  font-weight: 500;
}

.checkbox-item input[type="checkbox"] {
  display: none;
}

.custom-checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid #7A7A7A;
  border-radius: 4px;
  position: relative;
  flex-shrink: 0;
  transition: all 0.2s ease;
  background: #fff;
}

.checkbox-item input[type="checkbox"]:checked + .custom-checkbox {
  background: #2E9AA0;
  border-color: #2E9AA0;
}

.checkbox-item input[type="checkbox"]:checked + .custom-checkbox::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 11px;
  border: solid white;
  border-width: 0 2.5px 2.5px 0;
  transform: rotate(45deg);
}

.checkbox-item:hover .custom-checkbox {
  border-color: #2E9AA0;
}

.label-text {
  flex: 1;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* ===== SELECT ===== */
.sort-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #C0C0C0;
  border-radius: 8px;
  background: #fff;
  font-size: 0.95rem;
  color: #2C2C2C;
  font-weight: 500;
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  border-color: #2E9AA0;
  box-shadow: 0 0 0 3px rgba(46, 154, 160, 0.1);
}

/* ===== CLEAR BUTTON ===== */
.clear-filters-btn {
  width: 100%;
  padding: 12px 16px;
  background: #fff;
  border: 2px solid #2E9AA0;
  border-radius: 8px;
  color: #2E9AA0;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.clear-filters-btn:hover {
  background: #2E9AA0;
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(46, 154, 160, 0.3);
}

.clear-filters-btn:active {
  transform: translateY(0);
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 768px) {
  .sidebar-filters {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style>