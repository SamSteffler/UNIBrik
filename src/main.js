//import './assets/main.css'
//
//import { createApp } from 'vue'
//import App from './App.vue'
//import router from './router'
//
//const app = createApp(App)
//
//app.use(router)
//
//app.mount('#app')
//


import { createApp } from 'vue'
import vue3GoogleLogin from 'vue3-google-login'

import App from './App.vue'
import router from './router'
import './assets/main.css' // Importa o CSS global

const app = createApp(App)

app.use(router)

// Inicializa o plugin do Google Login com o Client ID do arquivo .env
app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
})

app.mount('#app')