import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { LOGIN_PATH } from '@/constants/routes'

export const Route = createFileRoute('/_protected')({
  beforeLoad: ({ context: { accountDetails }, location }) => {
    if (!accountDetails) {
      throw redirect({ to: LOGIN_PATH, search: { redirect: location.href } })
    }
  },
  component: ProtectedComponent,
})

function ProtectedComponent() {
  return <Outlet />
}
