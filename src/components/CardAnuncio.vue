<template>
  <div :class="['card', variantClass]" @click="onClick" role="button" tabindex="0">
    <div class="img-container">
      <img v-if="imageSrc" :src="imageSrc" :alt="titleVal" />
      <span v-else class="placeholder">📦</span>
    </div>

    <div class="body">
      <h3 class="title">{{ titleVal }}</h3>

      <p class="meta">
        <span class="cond">{{ conditionVal || categoryVal || '' }}</span>
        <span class="sep" v-if="locationVal"> | {{ locationVal }}</span>
      </p>

      <p class="desc">{{ shortDesc }}</p>

      <p class="price">{{ priceLabel }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  // Accept either an `item` object or individual props for backwards compatibility
  item: Object,
  id: [Number, String],
  title: String,
  titulo: String,
  price: [Number, String],
  preco: [Number, String],
  description: String,
  descricao: String,
  location: String,
  local: String,
  images: Array,
  img: String,
  condition: String,
  category: String,
  // layout variant: 'compact' (default) or 'list'
  variant: { type: String, default: 'compact' },
  // whether the card should auto-navigate to product page on click. If false, emits 'card-click'.
  navigate: { type: Boolean, default: true }
})

const emit = defineEmits(['card-click'])

const router = useRouter()

const idVal = computed(() => props.item?.id ?? props.id)
const titleVal = computed(() => props.item?.title ?? props.titulo ?? props.title ?? '')
const priceVal = computed(() => props.item?.price ?? props.preco ?? props.price)
const descriptionVal = computed(() => props.item?.description ?? props.descricao ?? props.description ?? '')
const locationVal = computed(() => props.item?.location ?? props.local ?? props.location ?? '')
const imagesVal = computed(() => props.item?.images ?? props.images ?? (props.img ? [props.img] : []))
const conditionVal = computed(() => props.item?.condition ?? props.condition)
const categoryVal = computed(() => props.item?.category ?? props.category)

const imageSrc = computed(() => (imagesVal.value && imagesVal.value.length ? imagesVal.value[0] : null))

const shortDesc = computed(() => {
  const d = descriptionVal.value || ''
  return d.length > 100 ? d.slice(0, 100) + '...' : d
})

const priceLabel = computed(() => {
  const p = priceVal.value
  if (p === undefined || p === null || p === '') return ''
  if (Number(p) === 0) return 'Grátis'
  return typeof p === 'number' ? `R$ ${p}` : p
})

const variantClass = computed(() => (props.variant === 'list' ? 'variant-list' : 'variant-compact'))

function onClick() {
  if (props.navigate && idVal.value) {
    router.push({ name: 'product', params: { id: idVal.value } })
    return
  }
  // emit event for parent to handle (e.g., edit)
  emit('card-click', idVal.value)
}

</script>
<style scoped>
.card { background: #fff; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.04); display:flex; gap:12px; padding:12px; cursor:pointer }
.img-container { width:100px; height:80px; border-radius:10px; overflow:hidden; background:#f1f2f6; display:flex; align-items:center; justify-content:center; flex-shrink:0 }
.img-container img { width:100%; height:100%; object-fit:cover }
.placeholder { font-size:1.6rem }
.body { flex:1; display:flex; flex-direction:column; gap:6px }
.title { margin:0; font-size:1rem; color:#004451 }
.meta { margin:0; color:#636e72; font-size:0.85rem }
.desc { margin:0; color:#2d3436; font-size:0.9rem }
.price { margin:0; color:#0984e3; font-weight:700 }

/* Compact variant (used on Home view) */
.variant-compact { flex-direction: column; width: 180px; padding:10px; border-radius:20px }
.variant-compact .img-container { width:100%; height:120px; border-radius:16px }
.variant-compact .body { gap:4px }
.variant-compact .title { font-size:0.95rem }

/* List variant (used on Search/MyAds) */
.variant-list { flex-direction:row; width:100%; padding:12px }

</style>