//import { createRouter, createWebHistory } from 'vue-router'
//import HomeView from '../views/HomeView.vue'
//
//const router = createRouter({
//  history: createWebHistory(import.meta.env.BASE_URL),
//  routes: [
//    {
//      path: '/',
//      name: 'home',
//      component: HomeView,
//    },
//    {
//      path: '/about',
//      name: 'about',
//      // route level code-splitting
//      // this generates a separate chunk (About.[hash].js) for this route
//      // which is lazy-loaded when the route is visited.
//      component: () => import('../views/AboutView.vue'),
//    },
//  ],
//})
//
//export default router
//
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchView from '../views/SearchView.vue'
import ProfileView from '../views/ProfileView.vue'
import LoginView from '../views/LoginView.vue' // 1. Importe a nova view
import { userState } from '../services/authService';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView
    },
    // 2. Adicione a nova rota de login
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: {
        requiresAuth: true
      }
    }
  ]
})

// 3. Modifique a guarda de rota
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !userState.isLoggedIn) {
    // Se a rota exige login e o usuário não está logado,
    // redireciona para a página de login.
    next({ name: 'login' });
  } else {
    // Caso contrário, permite o acesso.
    next();
  }
});

export default router