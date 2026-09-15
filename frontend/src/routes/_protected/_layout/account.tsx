import { createFileRoute } from '@tanstack/react-router'

import { Account } from '@/modules/account'

export const Route = createFileRoute('/_protected/_layout/account')({
  component: Account,
})
