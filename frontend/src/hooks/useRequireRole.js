import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'

/**
 * Redirects to `redirectTo` if the user does not have `role`.
 * Combines auth check + role check in one hook.
 */
export function useRequireRole(role, redirectTo = '/dashboard') {
  const { isAuthenticated, isLoading, user } = useAuth()
  const navigate = useNavigate()

  const hasRole = user?.roles?.includes(role) ?? false

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || !hasRole) {
      navigate(redirectTo, { replace: true })
    }
  }, [isLoading, isAuthenticated, hasRole, navigate, redirectTo])

  return { hasRole, isLoading }
}
