import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { apiFetch } from '@/shared/api/httpClient'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Reveal } from '@/shared/ui/Reveal'
import { AcademicStatusPill, FinancialStatusPill } from '@/shared/ui/pills'
import { initials } from '@/shared/lib/format'
import type { StudentDetailDto, StudentStatusDto, StudentEventDto } from '@/types/api'

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

  if (detailQ.isLoading) {
    return (
      <>
        <PageHeader title="Ficha del Estudiante" />
        <Spinner label="Cargando ficha…" />
      </>
    )
  }

  if (detailQ.isError || !detailQ.data) {
    return (
      <>
        <PageHeader title="Ficha del Estudiante" />
        <EmptyState
          icon="ti-alert-triangle"
          title="No se pudo cargar la ficha"
          message="El estudiante no fue encontrado o hubo un error de conexión."
          action={<Button onClick={() => navigate(-1)}>Volver</Button>}
        />
      </>
    )
  }

  const s = detailQ.data
  const status = statusQ.data
  const events = eventsQ.data ?? []

  return (
    <Reveal>
      <PageHeader
        title="Ficha del Estudiante"
        actions={
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <i className="ti ti-arrow-left text-lg" aria-hidden="true" />
            Volver al listado
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Datos principales */}
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <div className="mb-5 flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-vino-soft text-lg font-medium text-vino">
                {initials(s.fullName)}
              </span>
              <div>
                <h2 className="font-display text-2xl text-ink">{s.fullName}</h2>
                <p className="text-base text-muted">{s.grade}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="ID Estudiante" value={s.studentId} />
              <InfoRow label="Documento" value={s.documentId} />
              <InfoRow label="Grado" value={s.grade} />
              <InfoRow label="Escuela" value={s.schoolId} />
              <InfoRow label="Tutor" value={s.guardian.name} />
              <InfoRow label="Email del tutor" value={s.guardian.email} />
            </div>
          </Card>

          {/* Historial de eventos */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl text-ink">Historial de eventos</h3>
              <Badge className="bg-panel text-muted">{events.length}</Badge>
            </div>

            {eventsQ.isLoading ? (
              <Spinner label="Cargando eventos…" />
            ) : events.length === 0 ? (
              <p className="text-base text-muted">Sin eventos registrados.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {events.map((ev, i) => (
                  <li
                    key={`${ev.eventType}-${ev.occurredAt}-${i}`}
                    className="flex items-center justify-between rounded-xl bg-panel px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <i
                        className={`ti text-lg ${
                          ev.eventType === 'StudentEnrolled'
                            ? 'ti-user-plus text-present'
                            : 'ti-refresh text-late'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-base text-ink">{formatEventType(ev.eventType)}</span>
                    </div>
                    <span className="text-sm text-muted">
                      {format(parseISO(ev.occurredAt), "d MMM yyyy, HH:mm", { locale: es })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Panel lateral: estado */}
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <h3 className="mb-4 font-display text-xl text-ink">Estado</h3>

            {statusQ.isLoading ? (
              <Spinner label="Cargando estado…" />
            ) : status ? (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="mb-1.5 text-sm font-medium text-muted">Académico</p>
                  <AcademicStatusPill status={status.academicStatus} />
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-medium text-muted">Financiero</p>
                  <FinancialStatusPill status={status.financialStatus} />
                </div>
              </div>
            ) : (
              <p className="text-base text-muted">No se pudo cargar el estado.</p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 font-display text-xl text-ink">Tutor / Acudiente</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <i className="ti ti-user text-lg text-muted" aria-hidden="true" />
                <span className="text-base text-ink">{s.guardian.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="ti ti-mail text-lg text-muted" aria-hidden="true" />
                <span className="text-base text-ink">{s.guardian.email}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Reveal>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-0.5 text-base text-ink">{value}</p>
    </div>
  )
}

function formatEventType(type: string): string {
  const map: Record<string, string> = {
    StudentEnrolled: 'Estudiante matriculado',
    StudentStatusUpdated: 'Estado actualizado',
  }
  return map[type] ?? type
}
