import { request } from './http.js'

export function login(payload) {
  return request('/api/v1/auth/login', {
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export function register(payload) {
  return request('/api/v1/auth/register', {
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export function resetPassword(payload) {
  return request('/api/v1/auth/password/reset', {
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export function logout() {
  return request('/api/v1/auth/logout', {
    method: 'POST',
    auth: true,
  })
}

