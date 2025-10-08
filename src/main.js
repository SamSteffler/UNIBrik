//import './assets/main.css'
//
//import { createApp } from 'vue'
//import App from './App.vue'
//import router from './router'
//import vue3GoogleLogin from 'vue3-google-login'
//
//const app = createApp(App)
//
//app.use(vue3GoogleLogin, {
//  clientId: 'SEU_CLIENT_ID_AQUI.apps.googleusercontent.com'
//})
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
  clientId: 'SEU_CLIENT_ID_AQUI.apps.googleusercontent.com'
})

app.mount('#app')