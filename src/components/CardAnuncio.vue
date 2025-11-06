<template>
  <div :class="['card', variantClass]" @click="onClick" role="button" tabindex="0">
    <div class="img-container">
      <img v-if="imageSrc" :src="imageSrc" :alt="titleVal" />
      <span v-else class="placeholder">📦</span>
      <span v-if="statusVal === 'pending'" class="pending-badge">Aprovação pendente</span>
    </div>

    <div class="body">
      <h3 class="title">{{ titleVal }}</h3>

      <p class="price">{{ priceLabel }}</p>

      <p class="desc">{{ shortDesc }}</p>

      <p class="meta">
        <span class="cond">{{ conditionVal || categoryVal || '' }}</span>
        <span class="sep" v-if="locationVal"> | {{ locationVal }}</span>
      </p>
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
  navigate: { type: Boolean, default: true },
  // description styling and truncation controls
  descMaxChars: { type: Number, default: 100 },
  descSize: { type: String, default: '0.9rem' }
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
const statusVal = computed(() => props.item?.status)

const imageSrc = computed(() => {
  if (!imagesVal.value || !imagesVal.value.length) return null
  
  let imageUrl = imagesVal.value[0]
  
  // Transform backend URLs to work with Vite dev server
  if (imageUrl && imageUrl.startsWith('http://localhost:3000/')) {
    // Replace backend URL with Vite dev server base path
    imageUrl = imageUrl.replace('http://localhost:3000/', '/UNIBrik/')
  }
  
  return imageUrl
})

const shortDesc = computed(() => {
  const d = descriptionVal.value || ''
  const max = props.descMaxChars ?? 100
  return d.length > max ? d.slice(0, max) + '...' : d
})

const priceLabel = computed(() => {
  const p = priceVal.value
  if (p === undefined || p === null || p === '') return ''
  if (Number(p) === 0) return 'Grátis'
  return typeof p === 'number' ? `R$ ${p}` : p
})

const variantClass = computed(() => (props.variant === 'list' ? 'variant-list' : 'variant-compact'))

const descStyle = computed(() => ({ fontSize: props.descSize }))

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
.card {
   background: #fff; 
   border-radius: 12px; 
   box-shadow: 0 4px 10px rgba(0,0,0,0.04); 
   display:flex; 
   gap:12px; 
   padding:12px; 
   cursor:pointer 
}

.img-container { 
  width:100px; 
  height:80px; 
  border-radius:10px; 
  overflow:hidden; 
  background:#f1f2f6; 
  display:flex; 
  align-items:center; 
  justify-content:center; 
  flex-shrink:0;
  position:relative;
}

.img-container img { 
  width:100%; 
  height:100%; 
  object-fit:cover 
}

.placeholder { 
  font-size:1.6rem 
}

.pending-badge {
  position: absolute;
  bottom: 6px;
  left: 6px;
  background: rgba(243, 156, 18, 0.95);
  color: #fff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: bold;
  z-index: 10;
}

.body { 
  flex:1; 
  display:flex; 
  flex-direction:column; 
  gap:6px 
}

/* Compact variant (Home) */
.variant-compact { 
  position: relative;
  flex-direction: column; 
  width: 144px; 
  padding:8px; 
  border-radius:16px 
}

.variant-compact .img-container { 
  width:100%; 
  height:96px; 
  border-radius:13px 
}

.variant-compact .body { 
  gap:3px 
}

.variant-compact .title { 
  font-size:0.8rem;
  margin:0; 
  margin-top: -7px;
  margin-bottom: -2px;
  line-height:1.1em;
  color: #004451;
  font-weight: bold; 
}

.variant-compact .meta { 
  position: absolute;
  font-size:0.70rem;
  margin:0; 
  color: #004451; 
  font-weight: bold;
  bottom: 10px;
}

.variant-compact .desc {
  margin:0;
  font-size: 9px;          /* já reduzido para 80% */
  display: -webkit-box;         /* necessário para line-clamp */
  -webkit-line-clamp: 2;        /* limita a 2 linhas */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;      /* adiciona "..." se cortar */
  max-height: 2.4em;            /* opcional: controla altura total */
  margin-bottom: 25px;
  margin-top: 5px;
  margin-left: 5px;
  color: #00445186;
}

.variant-compact .price { 
  margin:0; 
  margin-left: 1px;
  color: #0097b2; 
  font-weight:bold;
  font-size:0.72rem;
}


/* List variant (Search/MyAds) */
.variant-list { 
  position: relative;
  flex-direction:row; 
  width:100%; 
  padding:12px 
}

.variant-list .img-container { 
  width:35%; 
  height:100%; 
  border-radius:13px 
}

.variant-list .body { 
  gap:3px 
}

.variant-list .title { 
  font-size:18px;
  margin:0; 
  margin-bottom: -2px;
  line-height:1.1em;
  color: #004451;
  font-weight: bold; 
}

.variant-list .meta { 
  position: absolute;
  font-size: 13px;
  margin:0; 
  color: #004451; 
  font-weight: bold;
  bottom: 10px;
}

.variant-list .desc {
  margin:0;
  font-size: 11px;          /* já reduzido para 80% */
  display: -webkit-box;         /* necessário para line-clamp */
  -webkit-line-clamp: 2;        /* limita a 2 linhas */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;      /* adiciona "..." se cortar */
  max-height: 2.4em;            /* opcional: controla altura total */
  margin-bottom: 25px;
  margin-top: 5px;
  margin-left: 5px;
  color: #00445186;
}

.variant-list .price { 
  margin:0; 
  margin-left: 1px;
  color: #0097b2; 
  font-weight:bold;
  font-size:16px;
}


</style>