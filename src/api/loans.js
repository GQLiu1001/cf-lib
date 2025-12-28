import { request } from './http.js'

export function fetchLoans(params) {
  return request('/api/v1/loans', { params })
}

export function borrowBook(params) {
  return request('/loans/borrow', {
    method: 'POST',
    params,
  })
}

export function returnBook(params) {
  return request('/api/v1/loans/return', {
    method: 'POST',
    params,
  })
}

