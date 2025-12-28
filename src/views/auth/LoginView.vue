<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../../api/auth.js'
import { setAuth } from '../../auth/storage.js'
import { notifyError } from '../../utils/notify.js'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const form = reactive({
  username: '',
  password: '',
})

const handleSubmit = async () => {
  if (!form.username || !form.password) {
    notifyError('请输入用户名和密码')
    return
  }
  loading.value = true
  try {
    const data = await login(form)
    setAuth(data)
    const redirect = route.query.redirect ? String(route.query.redirect) : '/books'
    router.replace(redirect)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="auth-page">
    <div class="card auth-card">
      <h2 class="page-title">登录</h2>
      <form class="form-grid" @submit.prevent="handleSubmit">
        <label class="form-row">
          <span>用户名</span>
          <input v-model="form.username" autocomplete="username" placeholder="请输入用户名" />
        </label>
        <label class="form-row">
          <span>密码</span>
          <input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="请输入密码"
          />
        </label>
        <button class="btn btn-primary" type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      <div class="auth-links">
        <RouterLink class="btn btn-link" to="/register">注册账号</RouterLink>
        <RouterLink class="btn btn-link" to="/password-reset">忘记密码</RouterLink>
      </div>
    </div>
  </section>
</template>
