import type { ObligationStatus } from '@/types/api'

const obligationStatusMap: Record<ObligationStatus, { label: string; cls: string }> = {
  Pending: { label: 'Pendiente', cls: 'bg-late-bg text-late-ink' },
  Confirmed: { label: 'Confirmada', cls: 'bg-present-bg text-present-ink' },
}

export function ObligationStatusPill({ status }: { status: ObligationStatus }) {
  const m = obligationStatusMap[status] ?? { label: status, cls: 'bg-panel text-muted' }
  return <span className={`rounded-lg px-3 py-1 text-sm font-medium ${m.cls}`}>{m.label}</span>
}

// Estado financiero del estudiante en la réplica (lo actualiza Academic vía eventos).
const financialStatusMap: Record<string, { label: string; cls: string }> = {
  Paid: { label: 'Pagado', cls: 'bg-present-bg text-present-ink' },
  Pending: { label: 'Pendiente', cls: 'bg-late-bg text-late-ink' },
  Overdue: { label: 'Vencido', cls: 'bg-absent-bg text-absent-ink' },
}

export function FinancialStatusPill({ status }: { status: string | null }) {
  if (!status) return <span className="text-sm text-muted">—</span>
  const m = financialStatusMap[status] ?? { label: status, cls: 'bg-panel text-muted' }
  return <span className={`rounded-lg px-3 py-1 text-sm font-medium ${m.cls}`}>{m.label}</span>
}

const academicStatusMap: Record<string, { label: string; cls: string }> = {
  Active: { label: 'Activo', cls: 'bg-present-bg text-present-ink' },
  Suspended: { label: 'Suspendido', cls: 'bg-late-bg text-late-ink' },
  Graduated: { label: 'Graduado', cls: 'bg-vino-soft text-vino' },
}

export function AcademicStatusPill({ status }: { status: string | null }) {
  if (!status) return <span className="text-sm text-muted">—</span>
  const m = academicStatusMap[status] ?? { label: status, cls: 'bg-panel text-muted' }
  return <span className={`rounded-lg px-3 py-1 text-sm font-medium ${m.cls}`}>{m.label}</span>
}
