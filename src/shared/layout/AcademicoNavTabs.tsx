import { NavLink } from 'react-router-dom'
import { useAuth } from '@/shared/auth/useAuth'

export function AcademicoNavTabs() {
  const { user } = useAuth()

  const tabs = [
    ...(user?.role === 'Secretaria'
      ? [{ to: '/academico', label: 'Registrar', icon: 'ti-file-plus', end: true }]
      : []),
    { to: '/academico/estudiantes', label: 'Estudiantes', icon: 'ti-users', end: false },
  ]

  return (
    <nav className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl gap-8 px-6">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex items-center gap-2 border-b-[3px] py-4 text-base transition-colors ${
                isActive
                  ? 'border-oro font-medium text-vino'
                  : 'border-transparent text-muted hover:text-ink'
              }`
            }
          >
            <i className={`ti ${tab.icon} text-lg`} aria-hidden="true" />
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
