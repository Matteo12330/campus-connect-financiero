import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/shared/api/httpClient'
import { Spinner } from '@/shared/ui/Spinner'
import { initials } from '@/shared/lib/format'
import { PaymentHistoryList } from './PaymentHistoryList'
import { FinancialStatusPill } from '@/shared/ui/pills'
import type { StudentDetailDto, StudentStatusDto } from '@/types/api'

export function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()

  const detailQ = useQuery({
    queryKey: ['financial-student', studentId],
    queryFn: () => apiFetch<StudentDetailDto>(`/payments/students/${studentId}`),
    enabled: !!studentId,
  })
  const statusQ = useQuery({
    queryKey: ['financial-student-status', studentId],
    queryFn: () => apiFetch<StudentStatusDto>(`/payments/students/${studentId}/status`),
    enabled: !!studentId,
  })

  if (detailQ.isLoading) return <div className="ac-card flex items-center justify-center py-24"><Spinner label="Cargando perfil financiero…" /></div>
  if (detailQ.isError || !detailQ.data) return <div className="ac-card py-24 text-center">Error al cargar datos.</div>

  const s = detailQ.data
  const status = statusQ.data

  return (
    <div>
      <div className="ac-animate-up mb-7 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="ac-btn-ghost"><i className="ti ti-arrow-left" /></button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#064e3b' }}>Perfil Financiero</h1>
          <p className="text-sm text-gray-500">Gestión de pagos y estado de cuenta</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="flex flex-col gap-6">
          <div className="ac-card p-6 flex items-center gap-4">
            <div className="ac-avatar h-16 w-16" style={{ background: '#dcfce7', color: '#065f46' }}>{initials(s.fullName)}</div>
            <div>
              <h2 className="text-xl font-bold">{s.fullName}</h2>
              <p className="text-sm text-gray-500">ID: {s.studentId.slice(0,8)}</p>
            </div>
          </div>

          <div className="ac-card p-6 border-l-4 border-green-600">
            <h3 className="text-sm font-bold uppercase mb-4 text-green-800">Registrar nuevo pago</h3>
            <div className="flex gap-2">
              <input type="number" placeholder="Monto ($)" className="ac-input flex-1" />
              <button className="ac-btn-primary bg-green-700">Confirmar</button>
            </div>
          </div>

          {/* Integración del Historial */}
          {studentId && <PaymentHistoryList studentId={studentId} />}
        </div>

        <div className="flex flex-col gap-6">
          <div className="ac-card p-6">
            <h3 className="mb-4 text-xs font-bold uppercase text-green-800">Estado Financiero</h3>
            {status ? <FinancialStatusPill status={status.financialStatus} /> : <Spinner />}
          </div>
        </div>
      </div>
    </div>
  )
}