import { useState } from 'react'
import { motion } from 'motion/react'
import { useStudents } from '@/features/students/useStudents'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Reveal } from '@/shared/ui/Reveal'
import { AcademicStatusPill, FinancialStatusPill } from '@/shared/ui/pills'
import { controlClass } from '@/shared/ui/styles'
import { initials } from '@/shared/lib/format'

const PAGE_SIZE = 10

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export function StudentsPage() {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  // La paginación es del servidor: `total` viene del backend, no de la página actual.
  const { data, isLoading, isError, refetch } = useStudents({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  })

  const students = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const doSearch = () => {
    setSearch(searchInput.trim())
    setPage(1)
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
          message="Revisa que el Gateway y el servicio de Payments estén arriba."
          action={<Button onClick={() => refetch()}>Reintentar</Button>}
        />
      </>
    )
  }

  return (
    <Reveal>
      <PageHeader
        title="Estudiantes"
        subtitle="Réplica local sincronizada desde Secretaría, con su estado financiero."
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch()}
          placeholder="Buscar por nombre"
          className={`${controlClass} max-w-xs`}
        />
        <Button onClick={doSearch}>
          <i className="ti ti-search text-lg" aria-hidden="true" />
          Buscar
        </Button>
        {search && (
          <span className="text-base text-muted">
            {total} resultado{total !== 1 ? 's' : ''} para “{search}”
          </span>
        )}
      </div>

      {students.length === 0 ? (
        <EmptyState
          icon="ti-users"
          title="No hay estudiantes para mostrar"
          message={
            search
              ? 'Prueba con otro término de búsqueda.'
              : 'La lista se llena cuando Secretaría matricula estudiantes (evento StudentEnrolled).'
          }
        />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line bg-panel/60 px-5 py-3 text-sm font-medium text-muted sm:grid-cols-[2fr_1fr_1fr_1fr]">
              <span>Estudiante</span>
              <span className="hidden sm:block">Grado</span>
              <span className="hidden sm:block">Estado académico</span>
              <span className="text-right sm:text-left">Estado financiero</span>
            </div>
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.035 } } }}
            >
              {students.map((s) => (
                <motion.div
                  key={s.studentId}
                  variants={rowVariants}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line px-5 py-4 transition-colors last:border-b-0 hover:bg-panel/60 sm:grid-cols-[2fr_1fr_1fr_1fr]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-vino-soft text-base font-medium text-vino">
                      {initials(s.fullName)}
                    </span>
                    <span className="text-base text-ink">{s.fullName}</span>
                  </div>
                  <span className="hidden sm:block">
                    <Badge className="bg-panel text-muted">{s.grade}</Badge>
                  </span>
                  <span className="hidden sm:block">
                    <AcademicStatusPill status={s.academicStatus} />
                  </span>
                  <span className="text-right sm:text-left">
                    <FinancialStatusPill status={s.financialStatus} />
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </Card>

          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-4">
              <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                <i className="ti ti-chevron-left text-lg" aria-hidden="true" />
                Anterior
              </Button>
              <span className="text-base text-muted">
                Página {page} de {totalPages}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Siguiente
                <i className="ti ti-chevron-right text-lg" aria-hidden="true" />
              </Button>
            </div>
          )}
        </>
      )}
    </Reveal>
  )
}
