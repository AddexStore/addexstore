import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

const TOKEN_KEY = 'sifr_token'
const USER_KEY = 'sifr_user'

function mapUser(user) {
  if (!user) return null
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    avatar: user.avatar || '',
    role: user.role === 'ADMIN' ? 'admin' : (user.role === 'CUSTOMER' ? 'customer' : (user.role || 'customer')),
    joinDate: user.createdAt || user.joinDate || new Date().toISOString(),
  }
}

function loadToken() {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

function loadUser() {
  try {
    const saved = localStorage.getItem(USER_KEY)
    return saved ? JSON.parse(saved) : null
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)
  const [token, setToken] = useState(loadToken)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token && !user) {
      authService.getMe()
        .then((res) => { setUser(mapUser(res.data)) })
        .catch(() => { localStorage.removeItem(TOKEN_KEY); setToken(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const saveAuth = useCallback((tokenVal, userData) => {
    localStorage.setItem(TOKEN_KEY, tokenVal)
    localStorage.setItem(USER_KEY, JSON.stringify(mapUser(userData)))
    setToken(tokenVal)
    setUser(mapUser(userData))
  }, [])

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const isAuthenticated = !!token && !!user
  const isAdmin = user?.role === 'admin'

  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password)
    saveAuth(res.token, res.user)
    return mapUser(res.user)
  }, [saveAuth])

  const signup = useCallback(async (name, email, password) => {
    const res = await authService.signup(name, email, password)
    saveAuth(res.token, res.user)
    return mapUser(res.user)
  }, [saveAuth])

  const logout = useCallback(async () => {
    clearAuth()
  }, [clearAuth])

  const updateProfile = useCallback(async (data) => {
    const res = await authService.updateProfile(data)
    const mapped = mapUser(res.data)
    localStorage.setItem(USER_KEY, JSON.stringify(mapped))
    setUser(mapped)
    return mapped
  }, [])

  const value = { user, isAuthenticated, isAdmin, loading, login, logout, signup, updateProfile }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
