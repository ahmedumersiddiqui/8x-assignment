import { createFileRoute } from '@tanstack/react-router'

import { Register } from '@/modules/register'

export const Route = createFileRoute('/_auth/register')({
  component: Register,
})
