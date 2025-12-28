import { clearAuth, getToken } from '../auth/storage.js'
import { mockRequest } from './mock.js'
import { notifyError } from '../utils/notify.js'

const API_BASE = 'http://localhost:8080'
const USE_MOCK = true
const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

function buildQuery(params) {
  if (!params) {
    return ''
  }
  const entries = Object.entries(params).filter(([, value]) => {
    if (value === undefined || value === null) {
      return false
    }
    if (typeof value === 'string' && value.trim() === '') {
      return false
    }
    return true
  })
  if (!entries.length) {
    return ''
  }
  const search = new URLSearchParams()
  for (const [key, value] of entries) {
    search.append(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

function handleAuthError(status, message) {
  if (status === 401) {
    clearAuth()
    window.location.href = '/login'
    return
  }
  if (status === 403) {
    notifyError(message || '无权限')
  }
}

export async function request(path, options = {}) {
  if (USE_MOCK) {
    try {
      return await mockRequest(path, options)
    } catch (error) {
      handleAuthError(error.status, error.message)
      notifyError(error.message || '请求失败')
      throw error
    }
  }

  const {
    method = 'GET',
    params,
    body,
    auth = true,
  } = options

  const token = auth ? getToken() : ''
  const headers = { ...DEFAULT_HEADERS }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const query = buildQuery(params)
  const url = `${API_BASE}${path}${query}`

  const fetchOptions = {
    method,
    headers,
  }

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(url, fetchOptions)
  } catch (error) {
    notifyError('网络异常，请稍后再试')
    throw error
  }

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json() : null

  if (!response.ok) {
    handleAuthError(response.status, payload?.message)
    const message = payload?.message || `请求失败 (${response.status})`
    notifyError(message)
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  if (!payload) {
    return null
  }

  if (payload.code !== 200) {
    handleAuthError(payload.code, payload.message)
    const message = payload.message || '请求失败'
    notifyError(message)
    const error = new Error(message)
    error.code = payload.code
    throw error
  }

  return payload.data
}
