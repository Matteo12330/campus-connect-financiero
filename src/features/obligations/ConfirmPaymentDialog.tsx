import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { apiFetch, ApiError } from '@/shared/api/httpClient'
import { Button } from '@/shared/ui/Button'
import { Field } from '@/shared/ui/Field'
import { controlClass } from '@/shared/ui/styles'
import { useToast } from '@/shared/ui/useToast'
import { formatMoney } from '@/shared/lib/format'
import { METHOD_OPTIONS } from '@/features/obligations/paymentMethods'
import type { ConfirmPaymentResponse, ObligationListItemDto } from '@/types/api'

const schema = z.object({
  method: z.string().min(1, 'Selecciona el método de pago.'),
  reference: z.string().min(1, 'Ingresa el número de comprobante o referencia.'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  obligation: ObligationListItemDto
  studentName: string
  onClose: () => void
}

// Confirma el pago de una obligación pendiente. El backend publica el evento
// PaymentConfirmed (outbox → RabbitMQ) y Academic actualiza el estado financiero.
export function ConfirmPaymentDialog({ obligation, studentName, onClose }: Props) {
  const queryClient = useQueryClient()
  const { notify } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { method: '', reference: '' },
  })

  const confirm = useMutation({
    mutationFn: (values: FormValues) =>
      apiFetch<ConfirmPaymentResponse>(`/payments/obligations/${obligation.obligationId}/confirm`, {
        method: 'POST',
        body: values,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obligations'] })
      queryClient.invalidateQueries({ queryKey: ['obligation', obligation.obligationId] })
      queryClient.invalidateQueries({ queryKey: ['payments-students'] })
      notify('success', 'Pago confirmado. El estado financiero se notificará a los demás módulos.')
      onClose()
    },
    onError: (e) => {
      const msg =
        e instanceof ApiError && e.status === 409
          ? 'Esta obligación ya fue confirmada anteriormente.'
          : e instanceof ApiError
            ? e.message
            : 'No se pudo confirmar el pago.'
      notify('error', msg)
    },
  })

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="relative w-full max-w-md rounded-2xl border border-line bg-white p-7 shadow-pop"
      >
        <h2 className="font-display text-2xl text-ink">Confirmar pago</h2>
        <div className="mt-3 mb-5 h-[3px] w-12 rounded-full bg-oro" />

        <div className="mb-5 rounded-xl bg-panel px-4 py-3">
          <p className="text-base font-medium text-ink">{obligation.concept}</p>
          <p className="mt-0.5 text-sm text-muted">
            {studentName} · {formatMoney(obligation.amount)}
          </p>
        </div>

        <form
          onSubmit={handleSubmit((values) => confirm.mutate(values))}
          className="flex flex-col gap-5"
        >
          <Field label="Método de pago" error={errors.method?.message}>
            <select {...register('method')} className={controlClass}>
              <option value="">Selecciona el método</option>
              {METHOD_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Referencia / comprobante" error={errors.reference?.message}>
            <input
              {...register('reference')}
              className={controlClass}
              placeholder="Ej. TRX-000123"
            />
          </Field>

          <div className="flex justify-end gap-3">
            <Button type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={confirm.isPending}>
              <i className="ti ti-check text-lg" aria-hidden="true" />
              {confirm.isPending ? 'Confirmando…' : 'Confirmar pago'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
