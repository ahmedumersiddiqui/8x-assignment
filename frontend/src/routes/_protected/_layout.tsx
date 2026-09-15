import { createFileRoute, Outlet } from '@tanstack/react-router'

import { MainLayout } from '@/layouts/main-layout'

export const Route = createFileRoute('/_protected/_layout')({
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}
