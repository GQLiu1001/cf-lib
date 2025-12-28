import { request } from './http.js'

export function fetchRoles() {
  return request('/api/v1/roles')
}

