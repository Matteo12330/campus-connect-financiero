import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/shared/layout/AppShell'
import { RoleGuard } from '@/shared/auth/RoleGuard'
import { LoginPage } from '@/features/auth/LoginPage'
import { ObligationsPage } from '@/features/obligations/ObligationsPage'
import { RegisterObligationPage } from '@/features/obligations/RegisterObligationPage'
import { StudentsPage } from '@/features/students/StudentsPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    // Los endpoints de Payments están protegidos por la política "Finanzas" en el backend.
    element: (
      <RoleGuard allow={['Finanzas']}>
        <AppShell />
      </RoleGuard>
    ),
    children: [
      { index: true, element: <ObligationsPage /> },
      { path: 'registrar', element: <RegisterObligationPage /> },
      { path: 'estudiantes', element: <StudentsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
