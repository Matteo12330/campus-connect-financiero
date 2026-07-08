import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useStudents } from '@/features/students/useStudents'
import { apiFetch, ApiError } from '@/shared/api/httpClient'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Field } from '@/shared/ui/Field'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Reveal } from '@/shared/ui/Reveal'
import { DatePicker } from '@/shared/ui/DatePicker'
import { controlClass } from '@/shared/ui/styles'
import { useToast } from '@/shared/ui/useToast'
import type { RegisterObligationRequest, RegisterObligationResponse } from '@/types/api'

const schema = z.object({
  studentId: z.string().length(26, 'Selecciona un estudiante de la lista.'),
  concept: z.string().min(1, 'Ingresa el concepto del cobro.'),
  amount: z
    .string()
    .min(1, 'Ingresa el monto.')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, 'El monto debe ser mayor a cero.'),
})

type FormValues = z.infer<typeof schema>

export function RegisterObligationPage() {
  const { data: studentsPage, isLoading, isError } = useStudents({ page: 1, pageSize: 100 })
  const students = studentsPage?.items ?? []
  const { notify } = useToast()
  const queryClient = useQueryClient()
  // La fecha de vencimiento vive fuera del form: el DatePicker garantiza un Date válido.
  const [dueDate, setDueDate] = useState<Date>(() => new Date())

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { studentId: '', concept: '', amount: '' },
  })

  const submit = useMutation({
    mutationFn: (values: FormValues) => {
      const body: RegisterObligationRequest = {
        studentId: values.studentId,
        concept: values.concept.trim(),
        amount: Number(values.amount),
        // El backend persiste dueDate como timestamptz y Npgsql solo acepta UTC:
        // enviar la fecha calendario como medianoche UTC explícita.
        dueDate: `${format(dueDate, 'yyyy-MM-dd')}T00:00:00Z`,
      }
      return apiFetch<RegisterObligationResponse>('/payments/obligations', {
        method: 'POST',
        body,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obligations'] })
      notify('success', 'Obligación registrada correctamente (estado Pendiente).')
      reset()
    },
    onError: (e) =>
      notify('error', e instanceof ApiError ? e.message : 'No se pudo registrar la obligación.'),
  })

  if (isLoading) {
    return (
      <>
        <PageHeader title="Registrar obligación de pago" />
        <Spinner label="Cargando estudiantes…" />
      </>
    )
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Registrar obligación de pago" />
        <EmptyState
          icon="ti-alert-triangle"
          title="No se pudieron cargar los estudiantes"
          message="Revisa que el Gateway y el servicio de Payments estén arriba."
        />
      </>
    )
  }

  return (
    <Reveal>
      <PageHeader
        title="Registrar obligación de pago"
        subtitle="Asigna un cobro (matrícula, mensualidad, etc.) a un estudiante. Luego podrás confirmar su pago."
      />
      {students.length === 0 ? (
        <EmptyState
          icon="ti-users"
          title="No hay estudiantes"
          message="La réplica local se llena cuando Secretaría matricula estudiantes (evento StudentEnrolled)."
        />
      ) : (
        <Card className="max-w-2xl p-7">
          <form
            onSubmit={handleSubmit((values) => submit.mutate(values))}
            className="flex flex-col gap-5"
          >
            <Field label="Estudiante" error={errors.studentId?.message}>
              <select {...register('studentId')} className={controlClass}>
                <option value="">Selecciona un estudiante</option>
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.fullName} — {s.grade}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Concepto" error={errors.concept?.message}>
              <input
                {...register('concept')}
                className={controlClass}
                placeholder="Ej. Mensualidad marzo 2026"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Monto (USD)" error={errors.amount?.message}>
                <input
                  {...register('amount')}
                  className={controlClass}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </Field>

              <Field label="Fecha de vencimiento">
                <DatePicker value={dueDate} onChange={setDueDate} />
              </Field>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={submit.isPending}>
                <i className="ti ti-cash text-lg" aria-hidden="true" />
                {submit.isPending ? 'Registrando…' : 'Registrar obligación'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </Reveal>
  )
}
