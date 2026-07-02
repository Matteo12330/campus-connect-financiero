import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/shared/auth/useAuth'
import { EmptyState } from '@/shared/ui/EmptyState'
import type { UserRole } from '@/types/api'

interface RoleGuardProps {
  allow: UserRole[]
  children: ReactNode
  /** Ruta de login a la que redirigir si no está autenticado. Por defecto /login */
  loginPath?: string
}

export function RoleGuard({ allow, children, loginPath = '/login' }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />
  }

  if (user && !allow.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-panel px-4">
        <EmptyState
          icon="ti-lock"
          title="No tienes acceso a este portal"
          message={`Tu sesión tiene el rol ${user.role}, que no tiene acceso a este portal.`}
        />
      </div>
    )
  }

  return <>{children}</>
}
