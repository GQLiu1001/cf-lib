<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../../api/auth.js'
import { setAuth } from '../../auth/storage.js'
import { notifyError } from '../../utils/notify.js'

const router = useRouter()
const loading = ref(false)
const form = reactive({
  username: '',
  password: '',
  nickname: '',
  phone: '',
  email: '',
})

const handleSubmit = async () => {
  if (!form.username || !form.password || !form.nickname) {
    notifyError('请填写用户名、密码和昵称')
    return
  }
  loading.value = true
  try {
    const data = await register(form)
    setAuth(data)
    router.replace('/books')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="auth-page">
    <div class="card auth-card">
      <h2 class="page-title">注册</h2>
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
            autocomplete="new-password"
            placeholder="请输入密码"
          />
        </label>
        <label class="form-row">
          <span>昵称</span>
          <input v-model="form.nickname" placeholder="请输入昵称" />
        </label>
        <label class="form-row">
          <span>手机号</span>
          <input v-model="form.phone" placeholder="请输入手机号" />
        </label>
        <label class="form-row">
          <span>邮箱</span>
          <input v-model="form.email" type="email" placeholder="请输入邮箱" />
        </label>
        <button class="btn btn-primary" type="submit" :disabled="loading">
          {{ loading ? '注册中...' : '注册并登录' }}
        </button>
      </form>
      <div class="auth-links">
        <RouterLink class="btn btn-link" to="/login">返回登录</RouterLink>
      </div>
    </div>
  </section>
</template>
