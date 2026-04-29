import { use } from 'react'
import { AuthContext } from '../context/AuthContext'

/**
 * Returns the full auth context:
 * { user, isLoading, isAuthenticated, isAdmin, isClient, login, register, logout }
 */
export function useAuth() {
  return use(AuthContext)
}
