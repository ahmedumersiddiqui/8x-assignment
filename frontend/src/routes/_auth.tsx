import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { HOME_PATH } from '@/constants/routes'
import { AuthLayout } from '@/layouts/auth-layout'

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context: { accountDetails } }) => {
    if (accountDetails) throw redirect({ to: HOME_PATH })
  },
  component: AuthComponent,
})

function AuthComponent() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  )
}
