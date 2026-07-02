import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/shared/layout/AppShell'
import { AcademicoShell } from '@/shared/layout/AcademicoShell'
import { RoleGuard } from '@/shared/auth/RoleGuard'
import { LoginPage } from '@/features/auth/LoginPage'
import { LoginAcademicoPage } from '@/features/auth/LoginAcademicoPage'
import { AttendancePage } from '@/features/attendance/AttendancePage'
import { IncidentsPage } from '@/features/incidents/IncidentsPage'
import { StudentsPage } from '@/features/students/StudentsPage'
import { RegisterStudentPage } from '@/features/secretaria/RegisterStudentPage'
import { StudentsListPage } from '@/features/secretaria/StudentsListPage'
import { StudentDetailPage } from '@/features/secretaria/StudentDetailPage'

export const router = createBrowserRouter([
  // ── Portal Docente ──
  { path: '/login', element: <LoginPage /> },
  {
    element: (
      <RoleGuard allow={['Docente']}>
        <AppShell />
      </RoleGuard>
    ),
    children: [
      { index: true, element: <AttendancePage /> },
      { path: 'incidentes', element: <IncidentsPage /> },
      { path: 'estudiantes', element: <StudentsPage /> },
    ],
  },

  // ── Portal Académico / Secretaría ──
  { path: '/academico/login', element: <LoginAcademicoPage /> },
  {
    path: '/academico',
    element: (
      <RoleGuard allow={['Secretaria', 'Direccion']}>
        <AcademicoShell />
      </RoleGuard>
    ),
    children: [
      { index: true, element: <RegisterStudentPage /> },
      { path: 'estudiantes', element: <StudentsListPage /> },
      { path: 'estudiantes/:studentId', element: <StudentDetailPage /> },
    ],
  },
])
