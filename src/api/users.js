import { request } from './http.js'

export function fetchUsers(params) {
  return request('/api/v1/users', { params })
}

export function createUser(payload) {
  return request('/api/v1/users', {
    method: 'POST',
    body: payload,
  })
}

export function updateUser(id, payload) {
  return request(`/api/v1/users/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export function deleteUser(id) {
  return request(`/api/v1/users/${id}`, {
    method: 'DELETE',
  })
}

export function updateUserRoles(id, roles) {
  const rolesValue = Array.isArray(roles) ? roles.join(',') : roles
  return request(`/api/v1/users/${id}`, {
    method: 'PUT',
    params: { roles: rolesValue },
  })
}

