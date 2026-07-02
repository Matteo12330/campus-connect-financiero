import type { AttendanceStatus, IncidentSeverity } from '@/types/api'

const statusMap: Record<AttendanceStatus, { label: string; cls: string }> = {
  Present: { label: 'Presente', cls: 'bg-present-bg text-present-ink' },
  Absent: { label: 'Ausente', cls: 'bg-absent-bg text-absent-ink' },
  Late: { label: 'Tarde', cls: 'bg-late-bg text-late-ink' },
}

export function StatusPill({ status }: { status: AttendanceStatus }) {
  const m = statusMap[status]
  return <span className={`rounded-lg px-3 py-1 text-sm font-medium ${m.cls}`}>{m.label}</span>
}

const severityMap: Record<IncidentSeverity, { label: string; cls: string }> = {
  Low: { label: 'Baja', cls: 'bg-present-bg text-present-ink' },
  Medium: { label: 'Media', cls: 'bg-late-bg text-late-ink' },
  High: { label: 'Alta', cls: 'bg-absent-bg text-absent-ink' },
}

export function SeverityPill({ severity }: { severity: IncidentSeverity }) {
  const m = severityMap[severity]
  return <span className={`rounded-lg px-3 py-1 text-sm font-medium ${m.cls}`}>{m.label}</span>
}

const academicStatusMap: Record<string, { label: string; cls: string }> = {
  Active: { label: 'Activo', cls: 'bg-present-bg text-present-ink' },
  Suspended: { label: 'Suspendido', cls: 'bg-late-bg text-late-ink' },
  Graduated: { label: 'Graduado', cls: 'bg-sky-100 text-sky-800' },
}

export function AcademicStatusPill({ status }: { status: string }) {
  const m = academicStatusMap[status] ?? { label: status, cls: 'bg-panel text-muted' }
  return <span className={`rounded-lg px-3 py-1 text-sm font-medium ${m.cls}`}>{m.label}</span>
}

const financialStatusMap: Record<string, { label: string; cls: string }> = {
  Paid: { label: 'Pagado', cls: 'bg-present-bg text-present-ink' },
  Pending: { label: 'Pendiente', cls: 'bg-late-bg text-late-ink' },
  Overdue: { label: 'Vencido', cls: 'bg-absent-bg text-absent-ink' },
}

export function FinancialStatusPill({ status }: { status: string }) {
  const m = financialStatusMap[status] ?? { label: status, cls: 'bg-panel text-muted' }
  return <span className={`rounded-lg px-3 py-1 text-sm font-medium ${m.cls}`}>{m.label}</span>
}
