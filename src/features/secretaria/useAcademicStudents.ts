import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/shared/api/httpClient'
import type { StudentListItemDto, PagedList } from '@/types/api'

interface Params {
  page: number
  pageSize: number
  grade?: string
  search?: string
}

export function useAcademicStudents({ page, pageSize, grade, search }: Params) {
  return useQuery({
    queryKey: ['academic-students', page, pageSize, grade, search],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })
      if (grade) params.set('grade', grade)
      if (search) params.set('search', search)
      return apiFetch<PagedList<StudentListItemDto>>(`/academic/students?${params}`)
    },
  })
}
