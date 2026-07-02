import { Outlet } from 'react-router-dom'
import { AcademicoTopBar } from '@/shared/layout/AcademicoTopBar'
import { AcademicoNavTabs } from '@/shared/layout/AcademicoNavTabs'

export function AcademicoShell() {
  return (
    <div className="ac-portal ac-page-bg">
      <AcademicoTopBar />
      <AcademicoNavTabs />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
