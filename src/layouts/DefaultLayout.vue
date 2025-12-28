<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { logout } from '../api/auth.js'
import { clearAuth } from '../auth/storage.js'
import { useAuth } from '../auth/useAuth.js'

const router = useRouter()
const { user, isLoggedIn, hasRoles } = useAuth()

const navItems = [
  { label: '分类', to: '/categories', public: true },
  { label: '书目', to: '/books', public: true },
  { label: '副本', to: '/copies', public: true },
  { label: '借阅', to: '/loans', public: true },
  { label: '用户', to: '/users', roles: ['ADMIN'] },
  { label: '角色', to: '/roles', roles: ['ADMIN'] },
]

const visibleNavItems = computed(() => {
  return navItems.filter((item) => {
    if (item.public) {
      return true
    }
    if (item.roles?.length) {
      return hasRoles(item.roles)
    }
    return false
  })
})

const handleLogout = async () => {
  try {
    await logout()
  } catch (error) {
    // Ignore logout failures and still clear local session.
  }
  clearAuth()
  router.push('/login')
}
</script>

<template>
  <div class="layout">
    <header class="topbar">
      <div class="brand">Library System</div>
      <nav class="nav">
        <RouterLink v-for="item in visibleNavItems" :key="item.to" :to="item.to">
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="auth-actions">
        <template v-if="isLoggedIn">
          <span>{{ user?.nickname || user?.username }}</span>
          <button class="btn btn-link" type="button" @click="handleLogout">退出</button>
        </template>
        <template v-else>
          <RouterLink class="btn btn-link" to="/login">登录</RouterLink>
          <RouterLink class="btn btn-link" to="/register">注册</RouterLink>
        </template>
      </div>
    </header>
    <main class="page">
      <RouterView />
    </main>
  </div>
</template>
