import { request } from './http.js'

export function fetchCopies(params) {
  return request('/api/v1/copies', { params })
}

export function createCopy(payload) {
  return request('/api/v1/copies', {
    method: 'POST',
    body: payload,
  })
}

export function updateCopy(id, payload) {
  return request(`/api/v1/copies/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export function deleteCopy(id) {
  return request(`/api/v1/copies/${id}`, {
    method: 'DELETE',
  })
}

