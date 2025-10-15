import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchView from '../views/SearchView.vue'
import ProfileView from '../views/ProfileView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import CreateProductView from '../views/CreateProductView.vue'
import MyAdsView from '../views/MyAdsView.vue'
import ProductView from '../views/ProductView.vue'
import EditProductView from '../views/EditProductView.vue'
import MyFavoritesView from '../views/MyFavoritesView.vue'
import EditProfileView from '../views/EditProfileView.vue'
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
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { hideHeader: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { hideHeader: true }
    },
    {
      path: '/products/create',
      name: 'create-product',
      component: CreateProductView,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: {
        requiresAuth: true
      }
    }
    ,
    {
      path: '/profile/edit',
      name: 'profile-edit',
      component: EditProfileView,
      meta: { requiresAuth: true }
    }
    ,
    {
      path: '/my-ads',
      name: 'my-ads',
      component: MyAdsView,
      meta: { requiresAuth: true }
    }
    ,
    {
      path: '/product/:id',
      name: 'product',
      component: ProductView
    }
    ,
    {
      path: '/product/:id/edit',
      name: 'product-edit',
      component: EditProductView,
      meta: { requiresAuth: true }
    }
    ,
    {
      path: '/favorites',
      name: 'favorites',
      component: MyFavoritesView,
      meta: { requiresAuth: true }
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


