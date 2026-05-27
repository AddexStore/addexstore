import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { users } from '../data/users'

const AuthContext = createContext(null)

const STORAGE_KEY = 'sifr_user'

function loadUser() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null
    const parsed = JSON.parse(saved)
    if (typeof parsed.id === 'string' && parsed.id.startsWith('usr_')) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  const isAuthenticated = user !== null
  const isAdmin = user?.role === 'admin'

  const saveUser = useCallback((userData) => {
    setUser(userData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
  }, [])

  const clearUser = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const login = useCallback(async (email, password) => {
    await new Promise((r) => setTimeout(r, 600))

    const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    const userData = matched
      ? { ...matched, password: undefined }
      : {
          id: 'usr_' + Date.now().toString(36),
          email,
          name: email.split('@')[0],
          role: email.includes('admin') ? 'admin' : 'customer',
          createdAt: new Date().toISOString(),
        }

    saveUser(userData)
    return userData
  }, [saveUser])

  const signup = useCallback(async (name, email, password) => {
    await new Promise((r) => setTimeout(r, 600))

    const userData = {
      id: 'usr_' + Date.now().toString(36),
      email,
      name,
      role: 'customer',
      createdAt: new Date().toISOString(),
    }

    saveUser(userData)
    return userData
  }, [saveUser])

  const logout = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 300))
    clearUser()
  }, [clearUser])

  const updateProfile = useCallback(async (data) => {
    await new Promise((r) => setTimeout(r, 400))

    const updated = { ...user, ...data }
    saveUser(updated)
    return updated
  }, [user, saveUser])

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    logout,
    signup,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
