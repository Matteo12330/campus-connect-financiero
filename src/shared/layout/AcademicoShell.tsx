import { Outlet } from 'react-router-dom'
import { AcademicoTopBar } from '@/shared/layout/AcademicoTopBar'
import { AcademicoNavTabs } from '@/shared/layout/AcademicoNavTabs'

export function AcademicoShell() {
  return (
    <div className="min-h-screen bg-panel">
      <AcademicoTopBar />
      <AcademicoNavTabs />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
