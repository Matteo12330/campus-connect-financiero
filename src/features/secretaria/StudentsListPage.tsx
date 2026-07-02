import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAcademicStudents } from './useAcademicStudents'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Reveal } from '@/shared/ui/Reveal'
import { AcademicStatusPill, FinancialStatusPill } from '@/shared/ui/pills'
import { controlClass } from '@/shared/ui/styles'
import { initials } from '@/shared/lib/format'

const PAGE_SIZE = 10

export function StudentsListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [grade, setGrade] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading, isError, refetch } = useAcademicStudents({
    page,
    pageSize: PAGE_SIZE,
    grade: grade || undefined,
    search: search || undefined,
  })

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Estudiantes" />
        <Spinner label="Cargando estudiantes…" />
      </>
    )
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Estudiantes" />
        <EmptyState
          icon="ti-alert-triangle"
          title="No se pudieron cargar los estudiantes"
          message="Revisa que el Gateway esté arriba."
          action={<Button onClick={() => refetch()}>Reintentar</Button>}
        />
      </>
    )
  }

  const students = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <Reveal>
      <PageHeader
        title="Estudiantes"
        subtitle={`${total} estudiante${total !== 1 ? 's' : ''} registrado${total !== 1 ? 's' : ''}`}
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          placeholder="Buscar por nombre o documento…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`${controlClass} min-w-[200px] flex-1`}
        />
        <input
          placeholder="Filtrar por grado…"
          value={grade}
          onChange={(e) => {
            setGrade(e.target.value)
            setPage(1)
          }}
          className={`${controlClass} w-auto max-w-[200px]`}
        />
        <Button onClick={handleSearch}>
          <i className="ti ti-search text-lg" aria-hidden="true" />
          Buscar
        </Button>
      </div>

      {students.length === 0 ? (
        <EmptyState
          icon="ti-users"
          title="No hay estudiantes para mostrar"
          message="No se encontraron estudiantes con los filtros aplicados."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-line bg-panel px-5 py-3 text-sm font-medium text-muted">
            <span>Estudiante</span>
            <span>Grado</span>
            <span>Académico</span>
            <span>Financiero</span>
          </div>
          {students.map((s) => (
            <button
              key={s.studentId}
              onClick={() => navigate(`/academico/estudiantes/${s.studentId}`)}
              className="grid w-full grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-line px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-panel/60"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-vino-soft text-sm font-medium text-vino">
                  {initials(s.fullName)}
                </span>
                <span className="text-base text-ink">{s.fullName}</span>
              </div>
              <span className="text-sm text-muted">{s.grade}</span>
              <AcademicStatusPill status={s.academicStatus} />
              <FinancialStatusPill status={s.financialStatus} />
            </button>
          ))}
        </Card>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <i className="ti ti-chevron-left" aria-hidden="true" />
            Anterior
          </Button>
          <span className="text-sm text-muted">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
            <i className="ti ti-chevron-right" aria-hidden="true" />
          </Button>
        </div>
      )}
    </Reveal>
  )
}
