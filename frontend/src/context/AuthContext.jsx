import { createContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/auth.service'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    authService.me().then(setUser).catch(() => setUser(null))
  }, [])

  // Auto-logout when any request returns 401 (session expired)
  useEffect(() => {
    const handle = () => setUser(null)
    window.addEventListener('auth:expired', handle)
    return () => window.removeEventListener('auth:expired', handle)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    setUser(data)
    return data
  }, [])

  const register = useCallback(async (fields) => {
    const data = await authService.register(fields)
    setUser(data)
    return data
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const isLoading      = user === undefined
  const isAuthenticated = user !== null && user !== undefined
  const isAdmin        = user?.roles?.includes('admin') ?? false
  const isClient       = user?.roles?.includes('client') ?? false

  return (
    <AuthContext
      value={{ user, isLoading, isAuthenticated, isAdmin, isClient, login, register, logout }}
    >
      {children}
    </AuthContext>
  )
}
