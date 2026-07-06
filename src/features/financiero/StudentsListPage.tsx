import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFinancialStudents } from './useFinancialStudents'
import { Spinner } from '@/shared/ui/Spinner'
import { initials } from '@/shared/lib/format'

const PAGE_SIZE = 10

const FinPill = ({ value }: { value: string }) => {
  return <span className="ac-badge ac-status-pending">{value}</span>
}

export function StudentsListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading, isError } = useFinancialStudents({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  })

  const students = data?.items ?? []
  const total = students.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const visibleStudents = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const doSearch = () => { setSearch(searchInput); setPage(1) }

  return (
    <div>
      {/* Header */}
      <div className="ac-animate-up mb-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 4px 14px rgba(4,120,87,0.3)' }}>
            <i className="ti ti-wallet text-xl text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#064e3b' }}>Gestión de Pagos</h1>
            {!isLoading && !isError && (
              <p className="text-sm" style={{ color: '#6b7280' }}>
                {total} registro{total !== 1 ? 's' : ''} en total
              </p>
            )}
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#9ca3af' }} aria-hidden="true" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch()}
              placeholder="Buscar estudiante…"
              className="ac-input pl-9"
              style={{ minWidth: '250px' }}
            />
          </div>
          <button onClick={doSearch} className="ac-btn-primary">
            <i className="ti ti-search" aria-hidden="true" /> Buscar
          </button>
        </div>
      </div>

      {/* Estado de carga */}
      {isLoading ? (
        <div className="ac-card py-24 flex justify-center"><Spinner label="Cargando lista financiera…" /></div>
      ) : isError ? (
        <div className="ac-card py-24 text-center text-red-600">Error al cargar datos.</div>
      ) : (
        <div className="ac-card ac-animate-up-1 overflow-hidden">
          <div className="grid items-center gap-4 border-b px-5 py-3 text-xs font-bold uppercase tracking-wider"
            style={{
              gridTemplateColumns: '1fr 120px 120px',
              borderColor: 'rgba(187,247,208,0.8)',
              color: '#6b7280',
              background: 'rgba(236,253,243,0.5)',
            }}>
            <span>Estudiante</span>
            <span>Estado Pago</span>
            <span className="text-center">Acciones</span>
          </div>

          {visibleStudents.map((s) => (
            <div key={s.studentId} className="ac-table-row grid items-center gap-4 border-b px-5 py-3" style={{ gridTemplateColumns: '1fr 120px 120px' }}>
              <div className="flex items-center gap-3">
                <span className="ac-avatar h-9 w-9 text-xs">{initials(s.fullName)}</span>
                <div className="text-left">
                  <p className="text-sm font-medium" style={{ color: '#111827' }}>{s.fullName}</p>
                  <p className="font-mono text-xs" style={{ color: '#9ca3af' }}>ID: {s.studentId.slice(0, 8)}</p>
                </div>
              </div>
              <FinPill value="Disponible" />
              <button 
                onClick={() => navigate(`/estudiantes/${s.studentId}`)}
                className="ac-btn-secondary mx-auto text-xs py-1 px-3"
              >
                Gestionar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {!isLoading && totalPages > 1 && (
        <div className="ac-animate-up-2 mt-5 flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="ac-btn-secondary">Anterior</button>
          <span className="text-sm">Pág {page} de {totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="ac-btn-secondary">Siguiente</button>
        </div>
      )}
    </div>
  )
}