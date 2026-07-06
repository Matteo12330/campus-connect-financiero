import { NavLink } from 'react-router-dom'

export function NavTabs() {
  const tabs = [
    { to: '/', label: 'Obligaciones', icon: 'ti-receipt', end: true },
    { to: '/pagos', label: 'Registrar pago', icon: 'ti-currency-dollar', end: false },
    { to: '/estudiantes', label: 'Estudiantes', icon: 'ti-users', end: false },
  ]

  return (
    <nav
      className="sticky top-0 z-20"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(187,247,208,0.9)',
        boxShadow: '0 1px 12px rgba(22,163,74,0.07)',
      }}
    >
      <div className="mx-auto flex max-w-6xl gap-2 px-6">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex items-center gap-2 border-b-[2.5px] px-3 py-3.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'border-[#16a34a] text-[#16a34a]'
                  : 'border-transparent text-[#6b7280] hover:text-[#16a34a] hover:border-[#86efac]'
              }`
            }
          >
            <i className={`ti ${tab.icon} text-base`} aria-hidden="true" />
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
