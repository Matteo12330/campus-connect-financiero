import { useAuth } from '@/shared/auth/useAuth'
import { useHealth } from '@/shared/api/useHealth'
import { initials } from '@/shared/lib/format'

export function TopBar() {
  const { user, logout } = useAuth()
  const online = useHealth()

  return (
    <header className="border-b-2 border-oro/70 bg-[linear-gradient(100deg,#7a1b2e_0%,#5e1422_55%,#4e0f1c_100%)] text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/12">
            <i className="ti ti-wallet text-2xl text-oro-soft" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg">CampusConnect 360</p>
            <p className="text-sm text-white/80">Portal Financiero / Pagos</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/90">
            <span
              className={`h-2.5 w-2.5 rounded-full ${online ? 'bg-[#67d6a2]' : 'bg-white/40'}`}
              aria-hidden="true"
            />
            {online ? 'En línea' : 'Sin conexión'}
          </span>

          <div className="flex items-center gap-2.5 text-base">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-medium">
              {user ? initials(user.fullName) : '?'}
            </span>
            <span className="hidden sm:inline">{user?.fullName}</span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-base text-white/85 transition hover:bg-white/12"
          >
            <i className="ti ti-logout text-lg" aria-hidden="true" />
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
