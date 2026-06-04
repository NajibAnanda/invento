import axios from 'axios'

export const AUTH_STORAGE_KEY = 'invento-auth'
export const AUTH_UNAUTHORIZED_EVENT = 'invento:unauthorized'

const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)

  if (storedAuth) {
    try {
      const { token } = JSON.parse(storedAuth)

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const responseData = error.response?.data

    if (status === 401) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT))
    }

    return Promise.reject({
      message: status === 401
        ? 'Sesi Anda telah berakhir. Silakan masuk kembali.'
        : responseData?.message || 'Terjadi kesalahan saat menghubungi server.',
      errors: responseData?.data?.errors || responseData?.errors || {},
      status,
    })
  },
)

export default api
