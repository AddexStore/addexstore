import axios from 'axios'

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || import.meta.env.VITE_API_URL || 'http://localhost:8080'
const ASSET_ORIGIN = import.meta.env.VITE_ASSET_ORIGIN || API_ORIGIN
const API_BASE_URL = `${API_ORIGIN}/api`

export function getAssetUrl(path) {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('/assets/')) return path
  if (path.startsWith('/uploads/')) return `${ASSET_ORIGIN}${path}`
  return `${ASSET_ORIGIN}/uploads/${path}`
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

function getToken() {
  return localStorage.getItem('addex_token')
}

let refreshPromise = null

async function attemptRefresh() {
  const refreshToken = localStorage.getItem('addex_refresh_token')
  if (!refreshToken) return null

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
      .then((res) => {
        const { token, refreshToken: newRefresh } = res.data
        localStorage.setItem('addex_token', token)
        localStorage.setItem('addex_refresh_token', newRefresh)
        return token
      })
      .catch(() => {
        localStorage.removeItem('addex_token')
        localStorage.removeItem('addex_refresh_token')
        localStorage.removeItem('addex_user')
        window.dispatchEvent(new Event('auth-cleared'))
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
      originalRequest._retry = true
      const newToken = await attemptRefresh()
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      }
    }

    const message = error.response?.data?.message || `Request failed: ${error.response?.status || 'network error'}`
    return Promise.reject(new Error(message))
  }
)

export const api = {
  get: (endpoint) => apiClient.get(endpoint).then((res) => res.data),
  post: (endpoint, data) => apiClient.post(endpoint, data).then((res) => res.data),
  put: (endpoint, data) => apiClient.put(endpoint, data).then((res) => res.data),
  patch: (endpoint, data) => apiClient.patch(endpoint, data).then((res) => res.data),
  delete: (endpoint) => apiClient.delete(endpoint).then((res) => res.data),
  upload: (endpoint, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient
      .post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data)
  },
}

export default apiClient
