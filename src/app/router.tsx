import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '@/shared/auth/useAuth'
import { AppShell } from '@/shared/layout/AppShell'
import { RoleGuard } from '@/shared/auth/RoleGuard'
import { LoginPage } from '@/features/auth/LoginPage'

// Importaciones actualizadas apuntando a tu nueva carpeta "financiero"
import { RegisterStudentPage } from '@/features/financiero/RegisterStudentPage'
import { RegisterPaymentPage } from '@/features/financiero/RegisterPaymentPage'
import { StudentsListPage } from '@/features/financiero/StudentsListPage'
import { StudentDetailPage } from '@/features/financiero/StudentDetailPage'

function RootGate() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    // Este portal solo está disponible para el rol 'Finanzas', porque los endpoints de Payments
    // están protegidos por la política 'Finanzas' en el backend.
    <RoleGuard allow={['Finanzas']}>
      <AppShell />
    </RoleGuard>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootGate />,
    children: [
      // Por ahora mantenemos los nombres de los componentes de Jimmy.
      // En el siguiente paso renombraremos "RegisterStudentPage" a tu vista de Pagos.
      { index: true, element: <RegisterStudentPage /> },
      { path: 'pagos', element: <RegisterPaymentPage /> },
      { path: 'estudiantes', element: <StudentsListPage /> },
      { path: 'estudiantes/:studentId', element: <StudentDetailPage /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])