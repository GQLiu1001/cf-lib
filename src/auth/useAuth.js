import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getToken, getUser } from './storage.js'

export function useAuth() {
  const user = ref(getUser())
  const token = ref(getToken())

  const refresh = () => {
    user.value = getUser()
    token.value = getToken()
  }

  const handleChange = () => refresh()

  onMounted(() => {
    window.addEventListener('auth-changed', handleChange)
  })

  onUnmounted(() => {
    window.removeEventListener('auth-changed', handleChange)
  })

  const isLoggedIn = computed(() => Boolean(token.value))
  const hasRoles = (roles) => roles.some((role) => user.value?.roles?.includes(role))

  return {
    user,
    token,
    isLoggedIn,
    hasRoles,
    refresh,
  }
}

