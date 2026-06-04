import { create } from 'zustand'
import { AUTH_STORAGE_KEY, AUTH_UNAUTHORIZED_EVENT } from '../lib/axios'
import authService from '../services/authService'

const initialState = {
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
}

const persistAuth = ({ user, token, role }) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token, role }))
}

const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

const useAuthStore = create((set) => ({
  ...initialState,

  login: async (credentials) => {
    const response = await authService.login(credentials)
    const authState = {
      user: response.user,
      token: response.token,
      role: response.role,
      isAuthenticated: true,
    }

    persistAuth(authState)
    set(authState)

    return response
  },

  logout: async () => {
    try {
      await authService.logout()
    } finally {
      clearStoredAuth()
      set(initialState)
    }
  },

  loadUserFromStorage: () => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)

    if (!storedAuth) {
      set(initialState)
      return
    }

    try {
      const { user, token, role } = JSON.parse(storedAuth)

      if (!user || !token || !role) {
        throw new Error('Stored authentication data is incomplete.')
      }

      set({ user, token, role, isAuthenticated: true })
    } catch {
      clearStoredAuth()
      set(initialState)
    }
  },

  clearAuth: () => {
    clearStoredAuth()
    set(initialState)
  },
}))

window.addEventListener(AUTH_UNAUTHORIZED_EVENT, () => {
  useAuthStore.getState().clearAuth()
})

export default useAuthStore
