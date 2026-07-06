import { useState } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useFinancialStudents } from '@/features/financiero/useFinancialStudents'
import { apiFetch, ApiError } from '@/shared/api/httpClient'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Field } from '@/shared/ui/Field'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Reveal } from '@/shared/ui/Reveal'
import { controlClass, textareaClass } from '@/shared/ui/styles'
import { useToast } from '@/shared/ui/useToast'

const PAYMENT_TYPE_OPTIONS = ['Cuota', 'Reinscripción', 'Mora', 'Otro'] as const

const schema = z
  .object({
    studentId: z.string().length(26, 'Selecciona un estudiante de la lista.'),
    paymentType: z.string().min(1, 'Selecciona el tipo de pago.'),
    customType: z.string().optional(),
    amount: z.coerce.number().positive('El monto debe ser mayor a cero.'),
    paymentDate: z.string().min(1, 'Selecciona la fecha de pago.'),
    description: z.string().min(1, 'Describe el concepto del pago.'),
  })
  .refine((d) => d.paymentType !== 'Otro' || (d.customType?.trim().length ?? 0) > 0, {
    message: 'Especifica el tipo.',
    path: ['customType'],
  })

type FormValues = z.infer<typeof schema>

type RegisterPaymentResponse = {
  paymentId: string
  status: string
}

export function RegisterPaymentPage() {
  const [search, setSearch] = useState('')
  const { data: students, isLoading, isError } = useFinancialStudents({
    page: 1,
    pageSize: 100,
    search,
  })
  const { notify } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      studentId: '',
      paymentType: '',
      customType: '',
      amount: 0,
      paymentDate: '',
      description: '',
    },
  })

  const paymentTypeValue = watch('paymentType')

  const submit = useMutation({
    mutationFn: (values: FormValues) => {
      const paymentType = values.paymentType === 'Otro' ? values.customType!.trim() : values.paymentType
      return apiFetch<RegisterPaymentResponse>('/payments/records', {
        method: 'POST',
        body: {
          studentId: values.studentId,
          paymentType,
          amount: values.amount,
          paymentDate: values.paymentDate,
          description: values.description,
        },
      })
    },
    onSuccess: (res) => {
      notify('success', `Pago registrado correctamente (estado ${res.status}).`)
      reset()
    },
    onError: (e) =>
      notify('error', e instanceof ApiError ? e.message : 'No se pudo registrar el pago.'),
  })

  if (isLoading) {
    return (
      <>
        <PageHeader title="Registrar pago financiero" />
        <Spinner label="Cargando estudiantes financieros…" />
      </>
    )
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Registrar pago financiero" />
        <EmptyState
          icon="ti-alert-triangle"
          title="No se pudieron cargar los estudiantes"
          message="Revisa que el Gateway financiero esté disponible."
        />
      </>
    )
  }

  return (
    <Reveal>
      <PageHeader
        title="Registrar pago financiero"
        subtitle="Registra un pago para un estudiante desde el módulo financiero."
      />
      {!students || students.items.length === 0 ? (
        <EmptyState
          icon="ti-wallet"
          title="No hay estudiantes financieros"
          message="Necesitas estudiantes registrados en el módulo financiero para continuar."
        />
      ) : (
        <Card className="max-w-2xl p-7">
          <form onSubmit={handleSubmit((values) => submit.mutate(values))} className="flex flex-col gap-5">
            <Field label="Buscar estudiante" error={errors.studentId?.message}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Busca por nombre"
                className={controlClass}
              />
            </Field>

            <Field label="Estudiante" error={errors.studentId?.message}>
              <select {...register('studentId')} className={controlClass}>
                <option value="">Selecciona un estudiante</option>
                {students.items.map((student) => (
                  <option key={student.studentId} value={student.studentId}>
                    {student.fullName}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Tipo de pago" error={errors.paymentType?.message}>
                <select {...register('paymentType')} className={controlClass}>
                  <option value="">Selecciona el tipo de pago</option>
                  {PAYMENT_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Monto" error={errors.amount?.message}>
                <input
                  {...register('amount', { valueAsNumber: true })}
                  className={controlClass}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </Field>
            </div>

            {paymentTypeValue === 'Otro' && (
              <Field label="Especifica el tipo" error={errors.customType?.message}>
                <input
                  {...register('customType')}
                  className={controlClass}
                  placeholder="Ej. Pago de material"
                />
              </Field>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Fecha de pago" error={errors.paymentDate?.message}>
                <input {...register('paymentDate')} className={controlClass} type="date" />
              </Field>

              <Field label="Descripción" error={errors.description?.message}>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Detalle del pago o concepto"
                  className={textareaClass}
                />
              </Field>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={submit.isPending}>
                <i className="ti ti-currency-dollar text-lg" aria-hidden="true" />
                {submit.isPending ? 'Registrando…' : 'Registrar pago'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </Reveal>
  )
}
