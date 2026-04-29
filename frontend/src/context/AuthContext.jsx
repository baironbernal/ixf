import { createContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/auth.service'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    authService.me().then(setUser).catch(() => setUser(null))
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

  return (
    <AuthContext
      value={{
        state: { user, loading: user === undefined },
        actions: { login, register, logout },
      }}
    >
      {children}
    </AuthContext>
  )
}
