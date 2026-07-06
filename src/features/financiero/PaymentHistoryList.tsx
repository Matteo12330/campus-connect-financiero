import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/shared/api/httpClient'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { FinancialStatusPill } from '@/shared/ui/pills'
import type { PaymentConfirmationResponse, PaymentRecordDto } from '@/types/api'

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value)
}

export function PaymentHistoryList({ studentId }: { studentId: string }) {
  const queryClient = useQueryClient()

  const paymentsQuery = useQuery({
    queryKey: ['student-payments', studentId],
    queryFn: async () => apiFetch<PaymentRecordDto[]>(`/payments/records?studentId=${studentId}`),
    enabled: !!studentId,
  })

  const confirmPayment = useMutation({
    mutationFn: (paymentId: string) =>
      apiFetch<PaymentConfirmationResponse>(`/payments/records/${paymentId}/confirm`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-payments', studentId] })
      queryClient.invalidateQueries({ queryKey: ['financial-student-status', studentId] })
    },
  })

  const payments = paymentsQuery.data ?? []

  const pendingPayments = useMemo(
    () => payments.filter((payment) => payment.status === 'Pending'),
    [payments],
  )

  if (paymentsQuery.isLoading) {
    return (
      <div className="ac-card p-6 mt-6">
        <Spinner label="Cargando historial de pagos…" />
      </div>
    )
  }

  if (paymentsQuery.isError) {
    return (
      <div className="ac-card p-6 mt-6">
        <EmptyState
          icon="ti-alert-triangle"
          title="No se pudo cargar el historial"
          message="Revisa que el servicio de pagos esté disponible."
        />
      </div>
    )
  }

  return (
    <div className="ac-card p-6 mt-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase text-gray-700">Historial de pagos</h3>
          <p className="text-sm text-gray-500">Registros pendientes y confirmados del estudiante.</p>
        </div>
        <div className="text-sm text-gray-600">
          {payments.length} pago{payments.length !== 1 ? 's' : ''} registrados · {pendingPayments.length} pendiente{pendingPayments.length !== 1 ? 's' : ''}
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="text-sm text-gray-500 italic p-4 text-center border-2 border-dashed rounded-lg">
          No hay registros de pagos para este estudiante.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-3">Concepto</th>
                <th className="py-3 px-3">Monto</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.paymentId} className="border-b border-slate-100">
                  <td className="py-3 px-3 text-slate-700">{new Date(payment.paymentDate).toLocaleDateString('es-CL')}</td>
                  <td className="py-3 px-3 text-slate-700">{payment.paymentType} — {payment.description}</td>
                  <td className="py-3 px-3 text-slate-700">{formatMoney(payment.amount)}</td>
                  <td className="py-3 px-3">
                    <FinancialStatusPill status={payment.status} />
                  </td>
                  <td className="py-3 px-3">
                    {payment.status === 'Pending' ? (
                      <button
                        type="button"
                        onClick={() => confirmPayment.mutate(payment.paymentId)}
                        disabled={confirmPayment.isPending}
                        className="rounded-xl border border-green-600 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                      >
                        {confirmPayment.isPending ? 'Confirmando…' : 'Confirmar pago'}
                      </button>
                    ) : payment.status === 'Confirmed' ? (
                      <span className="text-xs text-slate-600">Confirmado</span>
                    ) : (
                      <span className="text-xs text-slate-600">Sin acción</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
