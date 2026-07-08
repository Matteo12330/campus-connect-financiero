import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { format, isBefore, parseISO, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { useObligations, useObligationDetail } from '@/features/obligations/useObligations'
import { useStudents } from '@/features/students/useStudents'
import { ConfirmPaymentDialog } from '@/features/obligations/ConfirmPaymentDialog'
import { methodLabel } from '@/features/obligations/paymentMethods'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Reveal } from '@/shared/ui/Reveal'
import { ObligationStatusPill } from '@/shared/ui/pills'
import { initials, formatMoney } from '@/shared/lib/format'
import type { ObligationListItemDto, ObligationStatus } from '@/types/api'

type Filter = 'Todas' | ObligationStatus

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export function ObligationsPage() {
  const { data: obligations, isLoading, isError, refetch } = useObligations()
  // Réplica de estudiantes para mostrar nombres (la lista de obligaciones solo trae el ULID).
  const { data: studentsPage } = useStudents({ page: 1, pageSize: 100 })
  const [filter, setFilter] = useState<Filter>('Todas')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<ObligationListItemDto | null>(null)

  const nameById = useMemo(() => {
    const m = new Map<string, string>()
    studentsPage?.items.forEach((s) => m.set(s.studentId, s.fullName))
    return m
  }, [studentsPage])

  const counts = useMemo(() => {
    const all = obligations ?? []
    return {
      Todas: all.length,
      Pending: all.filter((o) => o.status === 'Pending').length,
      Confirmed: all.filter((o) => o.status === 'Confirmed').length,
    }
  }, [obligations])

  const visible = useMemo(
    () => (obligations ?? []).filter((o) => filter === 'Todas' || o.status === filter),
    [obligations, filter],
  )

  if (isLoading) {
    return (
      <>
        <PageHeader title="Obligaciones de pago" />
        <Spinner label="Cargando obligaciones…" />
      </>
    )
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Obligaciones de pago" />
        <EmptyState
          icon="ti-alert-triangle"
          title="No se pudieron cargar las obligaciones"
          message="Revisa que el Gateway y el servicio de Payments estén arriba."
          action={<Button onClick={() => refetch()}>Reintentar</Button>}
        />
      </>
    )
  }

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'Todas', label: 'Todas', count: counts.Todas },
    { key: 'Pending', label: 'Pendientes', count: counts.Pending },
    { key: 'Confirmed', label: 'Confirmadas', count: counts.Confirmed },
  ]

  return (
    <Reveal>
      <PageHeader
        title="Obligaciones de pago"
        subtitle="Consulta los cobros registrados y confirma los pagos recibidos."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-xl border px-4 py-2 text-base transition-colors ${
              filter === f.key
                ? 'border-vino bg-vino-soft/60 font-medium text-vino'
                : 'border-line bg-white text-muted hover:text-ink'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon="ti-receipt"
          title="No hay obligaciones para mostrar"
          message={
            counts.Todas === 0
              ? 'Registra la primera obligación de pago desde la pestaña "Registrar obligación".'
              : 'No hay obligaciones con este estado.'
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line bg-panel/60 px-5 py-3 text-sm font-medium text-muted sm:grid-cols-[2fr_1.4fr_1fr_1fr_auto]">
            <span>Concepto</span>
            <span className="hidden sm:block">Estudiante</span>
            <span className="hidden sm:block">Vence</span>
            <span className="hidden sm:block">Monto</span>
            <span className="text-right">Estado</span>
          </div>
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.035 } } }}
          >
            {visible.map((o) => (
              <motion.div key={o.obligationId} variants={rowVariants}>
                <ObligationRow
                  obligation={o}
                  studentName={nameById.get(o.studentId) ?? `${o.studentId.slice(0, 8)}…`}
                  expanded={expandedId === o.obligationId}
                  onToggle={() =>
                    setExpandedId((id) => (id === o.obligationId ? null : o.obligationId))
                  }
                  onConfirm={() => setConfirming(o)}
                />
              </motion.div>
            ))}
          </motion.div>
        </Card>
      )}

      <AnimatePresence>
        {confirming && (
          <ConfirmPaymentDialog
            obligation={confirming}
            studentName={nameById.get(confirming.studentId) ?? `${confirming.studentId.slice(0, 8)}…`}
            onClose={() => setConfirming(null)}
          />
        )}
      </AnimatePresence>
    </Reveal>
  )
}

function ObligationRow({
  obligation,
  studentName,
  expanded,
  onToggle,
  onConfirm,
}: {
  obligation: ObligationListItemDto
  studentName: string
  expanded: boolean
  onToggle: () => void
  onConfirm: () => void
}) {
  // dueDate llega como medianoche UTC ("...T00:00:00Z"); usar solo la parte de fecha
  // evita que el día se corra al convertir a la zona horaria local.
  const due = parseISO(obligation.dueDate.slice(0, 10))
  const overdue = obligation.status === 'Pending' && isBefore(due, startOfDay(new Date()))

  return (
    <div className="border-b border-line last:border-b-0">
      <button
        onClick={onToggle}
        className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-panel/60 sm:grid-cols-[2fr_1.4fr_1fr_1fr_auto]"
      >
        <span className="flex items-center gap-2 text-base text-ink">
          <i
            className={`ti ti-chevron-${expanded ? 'down' : 'right'} text-muted`}
            aria-hidden="true"
          />
          {obligation.concept}
        </span>
        <span className="hidden items-center gap-2 text-base text-ink sm:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-vino-soft text-xs font-medium text-vino">
            {initials(studentName)}
          </span>
          {studentName}
        </span>
        <span className={`hidden text-base sm:block ${overdue ? 'font-medium text-absent-ink' : 'text-muted'}`}>
          {format(due, 'd MMM yyyy', { locale: es })}
          {overdue && ' · vencida'}
        </span>
        <span className="hidden text-base font-medium text-ink sm:block">
          {formatMoney(obligation.amount)}
        </span>
        <span className="justify-self-end">
          <ObligationStatusPill status={obligation.status} />
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ObligationDetail obligation={obligation} onConfirm={onConfirm} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ObligationDetail({
  obligation,
  onConfirm,
}: {
  obligation: ObligationListItemDto
  onConfirm: () => void
}) {
  const { data, isLoading } = useObligationDetail(obligation.obligationId)

  return (
    <div className="bg-panel/40 px-5 py-4 pl-12">
      {isLoading ? (
        <Spinner label="Cargando detalle…" />
      ) : data?.payment ? (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-base">
          <span className="text-muted">
            Método: <span className="font-medium text-ink">{methodLabel(data.payment.method)}</span>
          </span>
          <span className="text-muted">
            Referencia: <span className="font-medium text-ink">{data.payment.reference}</span>
          </span>
          <span className="text-muted">
            Confirmado:{' '}
            <span className="font-medium text-ink">
              {format(parseISO(data.payment.confirmedAt), "d MMM yyyy 'a las' HH:mm", { locale: es })}
            </span>
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-base text-muted">
            Pago pendiente. Al confirmarlo se notificará a los demás módulos.
          </p>
          <Button variant="primary" onClick={onConfirm}>
            <i className="ti ti-check text-lg" aria-hidden="true" />
            Confirmar pago
          </Button>
        </div>
      )}
    </div>
  )
}
