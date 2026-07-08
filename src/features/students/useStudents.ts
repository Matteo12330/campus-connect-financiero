import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/shared/api/httpClient'
import type { PagedList, StudentReplicaItemDto } from '@/types/api'

interface Params {
  page: number
  pageSize: number
  grade?: string
  search?: string
}

// GET /api/payments/students — réplica local paginada (se llena con StudentEnrolled).
export function useStudents({ page, pageSize, grade, search }: Params) {
  return useQuery({
    queryKey: ['payments-students', page, pageSize, grade ?? '', search ?? ''],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })
      if (grade) params.set('grade', grade)
      if (search) params.set('search', search)
      return apiFetch<PagedList<StudentReplicaItemDto>>(`/payments/students?${params}`)
    },
    // Mantiene la página anterior visible mientras carga la siguiente (paginación fluida).
    placeholderData: (prev) => prev,
  })
}
