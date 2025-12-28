import { createRouter, createWebHistory } from 'vue-router'
import { hasAnyRole, isAuthenticated } from '../auth/storage.js'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/auth/RegisterView.vue'),
    meta: { public: true },
  },
  {
    path: '/password-reset',
    name: 'password-reset',
    component: () => import('../views/auth/PasswordResetView.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('../layouts/DefaultLayout.vue'),
    children: [
      { path: '', redirect: '/login' },
      {
        path: 'categories',
        name: 'categories',
        component: () => import('../views/categories/CategoryListView.vue'),
        meta: { public: true },
      },
      {
        path: 'books',
        name: 'books',
        component: () => import('../views/books/BookListView.vue'),
        meta: { public: true },
      },
      {
        path: 'copies',
        name: 'copies',
        component: () => import('../views/copies/CopyListView.vue'),
        meta: { public: true },
      },
      {
        path: 'loans',
        name: 'loans',
        component: () => import('../views/loans/LoanListView.vue'),
        meta: { public: true },
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('../views/users/UserListView.vue'),
        meta: { roles: ['ADMIN'] },
      },
      {
        path: 'roles',
        name: 'roles',
        component: () => import('../views/roles/RoleListView.vue'),
        meta: { roles: ['ADMIN'] },
      },
    ],
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('../views/ForbiddenView.vue'),
    meta: { public: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: { public: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.meta?.public) {
    if (
      isAuthenticated() &&
      (to.name === 'login' || to.name === 'register' || to.name === 'password-reset')
    ) {
      return { path: '/books' }
    }
    return true
  }

  const roles = to.meta?.roles
  if (roles?.length) {
    if (!isAuthenticated()) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }
    if (!hasAnyRole(roles)) {
      return { path: '/forbidden' }
    }
  }

  return true
})

export default router
