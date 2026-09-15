import { createFileRoute, Outlet } from '@tanstack/react-router'

import { MainLayout } from '@/layouts/main-layout'

export const Route = createFileRoute('/_shop')({
  component: ShopComponent,
})

function ShopComponent() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}
