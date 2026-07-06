import { useState } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { apiFetch, ApiError } from '@/shared/api/httpClient'
import { useFinancialStudents } from './useFinancialStudents'
import { useToast } from '@/shared/ui/useToast'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'

const schema = z.object({
  studentId: z.string().length(26, 'Selecciona un estudiante de la lista.'),
  concept: z.string().min(1, 'Ingresa el concepto de la obligación.'),
  amount: z.coerce.number().positive('El monto debe ser mayor a cero.'),
  dueDate: z.string().min(1, 'Selecciona la fecha de vencimiento.'),
})

type FormValues = z.infer<typeof schema>
type RegisterObligationResponse = {
  obligationId: string
  status: string
}

export function RegisterStudentPage() {
  const [search, setSearch] = useState('')
  const { data: students, isLoading, isError } = useFinancialStudents({
    page: 1,
    pageSize: 100,
    search,
  })
  const { notify } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      studentId: '',
      concept: '',
      amount: 0,
      dueDate: '',
    },
  })

  const registerObligation = useMutation({
    mutationFn: (values: FormValues) =>
      apiFetch<RegisterObligationResponse>('/payments/obligations', {
        method: 'POST',
        body: values,
      }),
    onSuccess: () => {
      notify('success', 'Obligación de pago registrada correctamente.')
      setServerError(null)
      reset()
    },
    onError: (e) => {
      const msg = e instanceof ApiError ? e.message : 'Error al registrar la obligación de pago.'
      setServerError(msg)
      notify('error', msg)
    },
  })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-green-900">Registrar obligación de pago</h1>
        <p className="text-sm text-gray-500">Asigna una obligación de cobro a un estudiante financiero existente.</p>
      </div>

      <div className="ac-card p-7">
        {isLoading ? (
          <Spinner label="Cargando estudiantes…" />
        ) : isError ? (
          <EmptyState
            icon="ti-alert-triangle"
            title="No se pudieron cargar los estudiantes"
            message="Revisa que el servicio financiero esté disponible."
          />
        ) : (
          <form onSubmit={handleSubmit((v) => registerObligation.mutate(v))} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">Buscar estudiante</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Busca por nombre"
                className="ac-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Estudiante</label>
              <select {...register('studentId')} className="ac-input w-full">
                <option value="">Selecciona un estudiante</option>
                {students?.items.map((student) => (
                  <option key={student.studentId} value={student.studentId}>
                    {student.fullName}
                  </option>
                ))}
              </select>
              {errors.studentId && <p className="text-xs text-red-600 mt-1">{errors.studentId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Concepto</label>
              <input {...register('concept')} className="ac-input w-full" placeholder="Ej: Mensualidad Marzo" />
              {errors.concept && <p className="text-xs text-red-600 mt-1">{errors.concept.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Monto</label>
                <input
                  {...register('amount', { valueAsNumber: true })}
                  className="ac-input w-full"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
                {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha de vencimiento</label>
                <input {...register('dueDate')} className="ac-input w-full" type="date" />
                {errors.dueDate && <p className="text-xs text-red-600 mt-1">{errors.dueDate.message}</p>}
              </div>
            </div>

            {serverError && (
              <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded">
                {serverError}
              </div>
            )}

            <button type="submit" disabled={registerObligation.isPending} className="ac-btn-primary w-full bg-green-700">
              {registerObligation.isPending ? 'Procesando...' : 'Registrar obligación'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}