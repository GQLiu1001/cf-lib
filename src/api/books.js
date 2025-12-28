import { request } from './http.js'

export function fetchBooks(params) {
  return request('/api/v1/books', { params })
}

export function createBook(payload) {
  return request('/api/v1/books', {
    method: 'POST',
    body: payload,
  })
}

export function updateBook(id, payload) {
  return request(`/api/v1/books/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export function deleteBook(id) {
  return request(`/api/v1/books/${id}`, {
    method: 'DELETE',
  })
}

