import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/shared/api/httpClient'
import type { ObligationDetailDto, ObligationListItemDto } from '@/types/api'

// GET /api/payments/obligations — todas; el filtro por estado se aplica en cliente
// para poder mostrar contadores y cambiar de pestaña sin refetch.
export function useObligations() {
  return useQuery({
    queryKey: ['obligations'],
    queryFn: () => apiFetch<ObligationListItemDto[]>('/payments/obligations'),
  })
}

// GET /api/payments/obligations/{id} — detalle con datos del pago si fue confirmada.
export function useObligationDetail(obligationId: string | null) {
  return useQuery({
    queryKey: ['obligation', obligationId],
    queryFn: () => apiFetch<ObligationDetailDto>(`/payments/obligations/${obligationId}`),
    enabled: !!obligationId,
  })
}
