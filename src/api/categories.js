import { request } from './http.js'

export function fetchCategories() {
  return request('/api/v1/categories')
}

export function createCategory(payload) {
  return request('/api/v1/categories', {
    method: 'POST',
    body: payload,
  })
}

export function updateCategory(id, payload) {
  return request(`/api/v1/categories/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export function deleteCategory(id) {
  return request(`/api/v1/categories/${id}`, {
    method: 'DELETE',
  })
}

