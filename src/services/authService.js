import { reactive } from 'vue';
import { googleLogout } from 'vue3-google-login';
import router from '../router';

// Estado reativo do usuário.
export const userState = reactive({
  isLoggedIn: !!localStorage.getItem('user'),
  user: JSON.parse(localStorage.getItem('user')) || null,
});

/**
 * Função chamada após o sucesso do login com Google.
 * @param {object} userData - Dados retornados pela API do Google.
 */
function login(userData) {
  localStorage.setItem('user', JSON.stringify(userData));
  userState.isLoggedIn = true;
  userState.user = userData;
  router.push('/profile'); // Redireciona para o perfil após o login (correto!)
}

/**
 * Função para fazer logout.
 */
function logout() {
  googleLogout();
  localStorage.removeItem('user');
  userState.isLoggedIn = false;
  userState.user = null;
  router.push('/'); // Redireciona para a home após o logout (correto!)
}

export default {
  userState,
  login,
  logout,
};