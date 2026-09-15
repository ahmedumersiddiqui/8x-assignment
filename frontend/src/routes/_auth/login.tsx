import { createFileRoute } from '@tanstack/react-router'

import { Login } from '@/modules/login'
import { RedirectSearchSchema } from '@/schemas/navigation'

export const Route = createFileRoute('/_auth/login')({
  validateSearch: RedirectSearchSchema,
  component: LoginComponent,
})

function LoginComponent() {
  const { redirect } = Route.useSearch()
  return <Login redirectTo={redirect} />
}
