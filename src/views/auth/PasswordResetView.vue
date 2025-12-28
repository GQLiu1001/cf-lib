<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { resetPassword } from '../../api/auth.js'
import { notifyError, notifySuccess } from '../../utils/notify.js'

const router = useRouter()
const loading = ref(false)
const form = reactive({
  username: '',
  newPassword: '',
})

const handleSubmit = async () => {
  if (!form.username || !form.newPassword) {
    notifyError('请输入用户名和新密码')
    return
  }
  loading.value = true
  try {
    await resetPassword(form)
    notifySuccess('密码已重置，请重新登录')
    router.push('/login')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="auth-page">
    <div class="card auth-card">
      <h2 class="page-title">忘记密码</h2>
      <form class="form-grid" @submit.prevent="handleSubmit">
        <label class="form-row">
          <span>用户名</span>
          <input v-model="form.username" autocomplete="username" placeholder="请输入用户名" />
        </label>
        <label class="form-row">
          <span>新密码</span>
          <input
            v-model="form.newPassword"
            type="password"
            autocomplete="new-password"
            placeholder="请输入新密码"
          />
        </label>
        <button class="btn btn-primary" type="submit" :disabled="loading">
          {{ loading ? '提交中...' : '重置密码' }}
        </button>
      </form>
      <div class="auth-links">
        <RouterLink class="btn btn-link" to="/login">返回登录</RouterLink>
      </div>
    </div>
  </section>
</template>
