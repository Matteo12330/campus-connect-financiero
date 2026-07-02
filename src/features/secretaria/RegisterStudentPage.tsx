import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { apiFetch, ApiError } from '@/shared/api/httpClient'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Field } from '@/shared/ui/Field'
import { Reveal } from '@/shared/ui/Reveal'
import { controlClass } from '@/shared/ui/styles'
import { useToast } from '@/shared/ui/useToast'
import type { EnrollStudentResponse } from '@/types/api'

const schema = z.object({
  fullName: z.string().min(1, 'Ingresa el nombre completo.'),
  documentId: z.string().min(6, 'Mínimo 6 caracteres.').max(15, 'Máximo 15 caracteres.'),
  grade: z.string().min(1, 'Ingresa el grado.'),
  schoolId: z.string().optional(),
  guardianName: z.string().min(1, 'Ingresa el nombre del tutor.'),
  guardianEmail: z.string().email('Ingresa un email válido.'),
})

type FormValues = z.infer<typeof schema>

export function RegisterStudentPage() {
  const { notify } = useToast()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      documentId: '',
      grade: '',
      schoolId: '',
      guardianName: '',
      guardianEmail: '',
    },
  })

  const enroll = useMutation({
    mutationFn: (values: FormValues) =>
      apiFetch<EnrollStudentResponse>('/academic/students', {
        method: 'POST',
        body: {
          fullName: values.fullName,
          documentId: values.documentId,
          grade: values.grade,
          schoolId: values.schoolId || undefined,
          guardianName: values.guardianName,
          guardianEmail: values.guardianEmail,
        },
      }),
    onSuccess: (res) => {
      notify('success', `Estudiante matriculado exitosamente. ID: ${res.studentId}`)
      setError(null)
      reset()
    },
    onError: (e) => {
      const msg = e instanceof ApiError ? e.message : 'No se pudo registrar el estudiante.'
      setError(msg)
      notify('error', msg)
    },
  })

  return (
    <Reveal>
      <PageHeader
        title="Registrar y Matricular Estudiante"
        subtitle="Al guardar se crea el registro del estudiante y se genera su matrícula con estado inicial Activo."
      />

      <Card className="max-w-2xl p-7">
        <form
          onSubmit={handleSubmit((values) => enroll.mutate(values))}
          className="flex flex-col gap-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre completo" error={errors.fullName?.message}>
              <input
                {...register('fullName')}
                className={controlClass}
                placeholder="Juan Pérez García"
              />
            </Field>

            <Field label="Documento de identidad" error={errors.documentId?.message}>
              <input
                {...register('documentId')}
                className={controlClass}
                placeholder="ABC123456"
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Grado" error={errors.grade?.message}>
              <input
                {...register('grade')}
                className={controlClass}
                placeholder="Ej: 5to Primaria"
              />
            </Field>

            <Field label="Escuela (opcional)" error={errors.schoolId?.message}>
              <input
                {...register('schoolId')}
                className={controlClass}
                placeholder="SCH-001"
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre del tutor" error={errors.guardianName?.message}>
              <input
                {...register('guardianName')}
                className={controlClass}
                placeholder="María García"
              />
            </Field>

            <Field label="Email del tutor" error={errors.guardianEmail?.message}>
              <input
                {...register('guardianEmail')}
                type="email"
                className={controlClass}
                placeholder="maria@ejemplo.com"
              />
            </Field>
          </div>

          {error && (
            <p className="rounded-xl bg-absent-bg px-4 py-3 text-base text-absent-ink">{error}</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={enroll.isPending}>
              <i className="ti ti-file-plus text-lg" aria-hidden="true" />
              {enroll.isPending ? 'Registrando…' : 'Registrar y Matricular'}
            </Button>
          </div>
        </form>
      </Card>
    </Reveal>
  )
}
