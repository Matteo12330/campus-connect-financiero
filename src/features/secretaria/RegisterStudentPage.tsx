import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { apiFetch, ApiError } from '@/shared/api/httpClient'
import { useToast } from '@/shared/ui/useToast'
import type { EnrollStudentResponse } from '@/types/api'

const schema = z.object({
  fullName:      z.string().min(1, 'Ingresa el nombre completo.'),
  documentId:    z.string().min(6, 'Mínimo 6 caracteres.').max(15, 'Máximo 15 caracteres.'),
  grade:         z.string().min(1, 'Ingresa el grado.'),
  schoolId:      z.string().optional(),
  guardianName:  z.string().min(1, 'Ingresa el nombre del tutor.'),
  guardianEmail: z.string().email('Ingresa un email válido.'),
})

type FormValues = z.infer<typeof schema>

function FormField({
  id, label, register, error, placeholder, type = 'text', optional = false,
}: {
  id: keyof FormValues
  label: string
  register: ReturnType<ReturnType<typeof useForm<FormValues>>['register']>
  error?: string
  placeholder: string
  type?: string
  optional?: boolean
}) {
  return (
    <div>
      <label htmlFor={`reg-${id}`} className="mb-1.5 block text-sm font-medium" style={{ color: '#374151' }}>
        {label}
        {optional && <span className="ml-1 text-xs font-normal" style={{ color: '#9ca3af' }}>(opcional)</span>}
      </label>
      <input
        id={`reg-${id}`}
        className="ac-input"
        type={type}
        placeholder={placeholder}
        {...register}
      />
      {error && <p className="mt-1 text-xs" style={{ color: '#dc2626' }}>{error}</p>}
    </div>
  )
}

export function RegisterStudentPage() {
  const { notify } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState<EnrollStudentResponse | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', documentId: '', grade: '', schoolId: '', guardianName: '', guardianEmail: '' },
  })

  const enroll = useMutation({
    mutationFn: (values: FormValues) =>
      apiFetch<EnrollStudentResponse>('/academic/students', {
        method: 'POST',
        body: {
          fullName: values.fullName, documentId: values.documentId,
          grade: values.grade, schoolId: values.schoolId || undefined,
          guardianName: values.guardianName, guardianEmail: values.guardianEmail,
        },
      }),
    onSuccess: (res) => {
      notify('success', `Matriculado: ${res.studentId}`)
      setServerError(null)
      setSuccess(res)
      reset()
    },
    onError: (e) => {
      const msg = e instanceof ApiError ? e.message : 'No se pudo registrar el estudiante.'
      setServerError(msg)
      notify('error', msg)
    },
  })

  return (
    <div>
      {/* Header */}
      <div className="ac-animate-up mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'linear-gradient(135deg,#16a34a,#0d9488)', boxShadow: '0 4px 14px rgba(22,163,74,0.3)' }}>
          <i className="ti ti-file-plus text-xl text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#052e16' }}>
            Registrar y Matricular Estudiante
          </h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Al guardar se genera la matrícula con estado inicial Activo.
          </p>
        </div>
      </div>

      {/* Banner de éxito */}
      {success && (
        <div className="ac-card ac-animate-up mb-6 flex items-start gap-4 p-5"
          style={{ borderLeft: '4px solid #16a34a', background: 'rgba(240,253,244,0.9)' }}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'rgba(22,163,74,0.12)' }}>
            <i className="ti ti-check text-xl" style={{ color: '#16a34a' }} aria-hidden="true" />
          </span>
          <div className="flex-1">
            <p className="font-semibold" style={{ color: '#052e16' }}>Estudiante matriculado exitosamente</p>
            <p className="mt-0.5 text-sm" style={{ color: '#6b7280' }}>
              ID:{' '}
              <code className="rounded px-1.5 py-0.5 font-mono text-xs"
                style={{ background: '#dcfce7', color: '#15803d' }}>{success.studentId}</code>
              {' '}· Matrícula:{' '}
              <code className="rounded px-1.5 py-0.5 font-mono text-xs"
                style={{ background: '#dcfce7', color: '#15803d' }}>{success.enrollmentId}</code>
            </p>
          </div>
          <button onClick={() => setSuccess(null)} className="text-sm" style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Formulario */}
      <div className="ac-card ac-animate-up-1 p-7">
        <form onSubmit={handleSubmit((v) => enroll.mutate(v))} className="flex flex-col gap-6">

          {/* Sección estudiante */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              style={{ color: '#16a34a' }}>
              <i className="ti ti-user-circle" aria-hidden="true" /> Datos del estudiante
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="fullName"   label="Nombre completo"        register={register('fullName')}   error={errors.fullName?.message}   placeholder="Juan Pérez García" />
              <FormField id="documentId" label="Documento de identidad" register={register('documentId')} error={errors.documentId?.message} placeholder="ABC123456" />
              <FormField id="grade"      label="Grado"                  register={register('grade')}      error={errors.grade?.message}      placeholder="Ej: 5to Primaria" />
              <FormField id="schoolId"   label="Escuela"                register={register('schoolId')}   error={errors.schoolId?.message}   placeholder="SCH-001" optional />
            </div>
          </section>

          <div style={{ borderTop: '1px dashed rgba(187,247,208,0.9)' }} />

          {/* Sección tutor */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              style={{ color: '#0d9488' }}>
              <i className="ti ti-heart-handshake" aria-hidden="true" /> Tutor / Acudiente
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="guardianName"  label="Nombre del tutor" register={register('guardianName')}  error={errors.guardianName?.message}  placeholder="María García" />
              <FormField id="guardianEmail" label="Email del tutor"  register={register('guardianEmail')} error={errors.guardianEmail?.message} placeholder="maria@ejemplo.com" type="email" />
            </div>
          </section>

          {serverError && (
            <div className="flex items-center gap-2.5 rounded-xl px-4 py-3"
              style={{ background: '#fee2e2', color: '#b91c1c' }}>
              <i className="ti ti-alert-circle" aria-hidden="true" />
              <span className="text-sm">{serverError}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={enroll.isPending} className="ac-btn-primary">
              {enroll.isPending
                ? <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" /> Registrando…</>
                : <><i className="ti ti-file-plus" aria-hidden="true" /> Registrar y Matricular</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
