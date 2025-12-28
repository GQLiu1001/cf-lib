const TOKEN_KEY = 'cf_lib_access_token'
const USER_KEY = 'cf_lib_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw)
  } catch (error) {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export function setAuth(auth) {
  if (!auth) {
    return
  }
  const { accessToken, user } = auth
  if (accessToken) {
    localStorage.setItem(TOKEN_KEY, accessToken)
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
  window.dispatchEvent(new Event('auth-changed'))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new Event('auth-changed'))
}

export function isAuthenticated() {
  return Boolean(getToken())
}

export function hasRole(role) {
  const user = getUser()
  return Boolean(user?.roles?.includes(role))
}

export function hasAnyRole(roles) {
  const user = getUser()
  if (!user?.roles) {
    return false
  }
  return roles.some((role) => user.roles.includes(role))
}
