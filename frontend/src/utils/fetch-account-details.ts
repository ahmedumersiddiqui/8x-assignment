import type { QueryClient } from '@tanstack/react-query'

import { accountQuery } from '@/hooks/use-account-query'
import type { User } from '@/schemas/user'
import { useAccountStore } from '@/stores/account-store'

export async function fetchAccountDetails(queryClient: QueryClient): Promise<User | null> {
  const accountDetails = await queryClient.ensureQueryData(accountQuery())

  if (!import.meta.env.SSR) useAccountStore.getState().setAccountDetails(accountDetails)

  return accountDetails
}
