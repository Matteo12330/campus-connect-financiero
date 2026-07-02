import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { apiFetch } from '@/shared/api/httpClient'
import { Spinner } from '@/shared/ui/Spinner'
import { initials } from '@/shared/lib/format'
import type { StudentDetailDto, StudentStatusDto, StudentEventDto } from '@/types/api'

/* ─── Pills ───────────────────────────────────────────────────────── */
const acMap: Record<string, { cls: string; label: string }> = {
  Active:    { cls: 'ac-status-active',    label: 'Activo'     },
  Suspended: { cls: 'ac-status-suspended', label: 'Suspendido' },
  Graduated: { cls: 'ac-status-graduated', label: 'Graduado'   },
}
const finMap: Record<string, { cls: string; label: string }> = {
  Paid:    { cls: 'ac-status-paid',    label: 'Pagado'    },
  Pending: { cls: 'ac-status-pending', label: 'Pendiente' },
  Overdue: { cls: 'ac-status-overdue', label: 'Vencido'   },
}
const AcPill  = ({ s }: { s: string }) => { const m = acMap[s]  ?? { cls: '', label: s }; return <span className={`ac-badge ${m.cls}`}>{m.label}</span> }
const FinPill = ({ s }: { s: string }) => { const m = finMap[s] ?? { cls: '', label: s }; return <span className={`ac-badge ${m.cls}`}>{m.label}</span> }

/* ─── Fila de dato ────────────────────────────────────────────────── */
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
        style={{ background: '#f0fdf4', color: '#16a34a' }}>
        <i className={`ti ${icon}`} aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>{label}</p>
        <p className="mt-0.5 text-sm font-medium" style={{ color: '#111827' }}>{value}</p>
      </div>
    </div>
  )
}

/* ─── Helpers de eventos ──────────────────────────────────────────── */
const evLabels: Record<string, string> = {
  StudentEnrolled:      'Estudiante matriculado',
  StudentStatusUpdated: 'Estado actualizado',
}
const evIcon  = (t: string) => t === 'StudentEnrolled' ? 'ti-user-plus' : 'ti-refresh'
const evColor = (t: string) => ({ color: t === 'StudentEnrolled' ? '#16a34a' : '#0d9488' })
const evBg    = (t: string) => ({ background: t === 'StudentEnrolled' ? '#f0fdf4' : '#f0fdfa' })

/* ─── Componente principal ────────────────────────────────────────── */
export function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()

  const detailQ = useQuery({
    queryKey: ['academic-student', studentId],
    queryFn: () => apiFetch<StudentDetailDto>(`/academic/students/${studentId}`),
    enabled: !!studentId,
  })
  const statusQ = useQuery({
    queryKey: ['academic-student-status', studentId],
    queryFn: () => apiFetch<StudentStatusDto>(`/academic/students/${studentId}/status`),
    enabled: !!studentId,
  })
  const eventsQ = useQuery({
    queryKey: ['academic-student-events', studentId],
    queryFn: async () => {
      const res = await apiFetch<{ items: StudentEventDto[] }>(`/academic/students/${studentId}/events`)
      return res.items
    },
    enabled: !!studentId,
  })

  /* ── Cargando ── */
  if (detailQ.isLoading) {
    return (
      <div className="ac-card flex items-center justify-center py-24">
        <Spinner label="Cargando ficha del estudiante…" />
      </div>
    )
  }

  /* ── Error ── */
  if (detailQ.isError || !detailQ.data) {
    return (
      <div className="ac-card flex flex-col items-center justify-center gap-4 py-24">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: '#fee2e2' }}>
          <i className="ti ti-alert-triangle text-2xl" style={{ color: '#dc2626' }} aria-hidden="true" />
        </div>
        <div className="text-center">
          <p className="font-semibold" style={{ color: '#052e16' }}>No se pudo cargar la ficha</p>
          <p className="text-sm" style={{ color: '#6b7280' }}>Estudiante no encontrado o error de conexión.</p>
        </div>
        <button onClick={() => navigate(-1)} className="ac-btn-secondary">
          <i className="ti ti-arrow-left" aria-hidden="true" /> Volver
        </button>
      </div>
    )
  }

  const s      = detailQ.data
  const status = statusQ.data
  const events = eventsQ.data ?? []

  return (
    <div>
      {/* ── Título + botón volver ── */}
      <div className="ac-animate-up mb-7 flex flex-wrap items-center gap-3">
        <button onClick={() => navigate(-1)} className="ac-btn-ghost" style={{ paddingInline: '0.6rem' }}>
          <i className="ti ti-arrow-left" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#052e16' }}>Ficha del Estudiante</h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>Detalles, estado y historial de eventos</p>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="ac-card ac-animate-up mb-6 p-6"
        style={{ background: 'linear-gradient(110deg,rgba(240,253,244,0.92) 0%,rgba(209,250,229,0.7) 100%)' }}>
        <div className="flex flex-wrap items-center gap-5">
          <div className="ac-avatar h-20 w-20 text-2xl"
            style={{ background: 'linear-gradient(135deg,#bbf7d0,#99f6e4)', color: '#065f46' }}>
            {initials(s.fullName)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold" style={{ color: '#052e16' }}>{s.fullName}</h2>
            <p className="mt-0.5 text-sm" style={{ color: '#6b7280' }}>{s.grade} · {s.schoolId}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {statusQ.isLoading
                ? [1, 2].map((k) => (
                    <span key={k} className="inline-block h-6 w-20 animate-pulse rounded-full"
                      style={{ background: '#d1fae5' }} />
                  ))
                : status
                  ? <><AcPill s={status.academicStatus} /><FinPill s={status.financialStatus} /></>
                  : null
              }
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid principal: columna izquierda + lateral ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

        {/* ── Columna izquierda ── */}
        <div className="flex flex-col gap-6">

          {/* Datos académicos */}
          <div className="ac-card ac-animate-up-1 p-6">
            <h3 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              style={{ color: '#16a34a' }}>
              <i className="ti ti-id-badge" aria-hidden="true" /> Datos Académicos
            </h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoRow icon="ti-fingerprint" label="ID Estudiante" value={s.studentId} />
              <InfoRow icon="ti-credit-card" label="Documento"     value={s.documentId} />
              <InfoRow icon="ti-book"        label="Grado"         value={s.grade} />
              <InfoRow icon="ti-building"    label="Escuela"       value={s.schoolId} />
            </div>
          </div>

          {/* Historial de eventos */}
          <div className="ac-card ac-animate-up-2 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                style={{ color: '#0d9488' }}>
                <i className="ti ti-activity" aria-hidden="true" /> Historial de eventos
              </h3>
              {!eventsQ.isLoading && (
                <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ background: '#f0fdfa', color: '#0d9488' }}>
                  {events.length}
                </span>
              )}
            </div>

            {eventsQ.isLoading && <Spinner label="Cargando eventos…" />}

            {!eventsQ.isLoading && events.length === 0 && (
              <p className="py-8 text-center text-sm" style={{ color: '#9ca3af' }}>
                Sin eventos registrados para este estudiante.
              </p>
            )}

            {!eventsQ.isLoading && events.length > 0 && (
              <ul className="flex flex-col gap-3">
                {events.map((ev, i) => (
                  <li key={`${ev.eventType}-${i}`}
                    className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ background: 'rgba(240,253,244,0.5)', border: '1px solid rgba(187,247,208,0.7)' }}>
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                        style={{ ...evBg(ev.eventType), ...evColor(ev.eventType) }}>
                        <i className={`ti ${evIcon(ev.eventType)}`} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#111827' }}>
                          {evLabels[ev.eventType] ?? ev.eventType}
                        </p>
                        <p className="font-mono text-xs" style={{ color: '#9ca3af' }}>
                          {ev.correlationId.slice(0, 8)}…
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-lg px-2.5 py-1 text-xs"
                      style={{ background: '#f3f4f6', color: '#6b7280' }}>
                      {format(parseISO(ev.occurredAt), 'd MMM yyyy, HH:mm', { locale: es })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Columna lateral ── */}
        <div className="flex flex-col gap-6">

          {/* Estado */}
          <div className="ac-card ac-animate-up-1 p-6">
            <h3 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              style={{ color: '#16a34a' }}>
              <i className="ti ti-chart-bar" aria-hidden="true" /> Estado
            </h3>
            {statusQ.isLoading ? (
              <div className="flex flex-col gap-4">
                {[1, 2].map((k) => (
                  <div key={k}>
                    <div className="mb-1.5 h-3 w-16 animate-pulse rounded" style={{ background: '#d1fae5' }} />
                    <div className="h-6 w-24 animate-pulse rounded-full" style={{ background: '#f0fdf4' }} />
                  </div>
                ))}
              </div>
            ) : status ? (
              <div className="flex flex-col gap-5">
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>
                    Académico
                  </p>
                  <AcPill s={status.academicStatus} />
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>
                    Financiero
                  </p>
                  <FinPill s={status.financialStatus} />
                </div>
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#9ca3af' }}>No se pudo cargar el estado.</p>
            )}
          </div>

          {/* Tutor */}
          <div className="ac-card ac-animate-up-2 p-6">
            <h3 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              style={{ color: '#0d9488' }}>
              <i className="ti ti-heart-handshake" aria-hidden="true" /> Tutor / Acudiente
            </h3>
            <div className="flex flex-col gap-4">
              <InfoRow icon="ti-user" label="Nombre" value={s.guardian.name} />
              <InfoRow icon="ti-mail" label="Email"  value={s.guardian.email} />
            </div>
          </div>

          {/* ID técnico */}
          <div className="ac-animate-up-3 rounded-xl p-4"
            style={{ background: 'rgba(240,253,244,0.6)', border: '1px dashed rgba(134,239,172,0.8)' }}>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: '#9ca3af' }}>
              ID de estudiante
            </p>
            <code className="block break-all font-mono text-xs" style={{ color: '#16a34a' }}>
              {s.studentId}
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
