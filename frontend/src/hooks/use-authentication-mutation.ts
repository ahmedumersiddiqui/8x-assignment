import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { APIEndpoints } from '@/constants/api-endpoints'
import { MutationKeys } from '@/constants/mutation-keys'
import { QueryKeys } from '@/constants/query-keys'
import { HOME_PATH, LOGIN_PATH } from '@/constants/routes'
import type { Credentials, RegisterPayload } from '@/schemas/user'
import { UserSchema } from '@/schemas/user'
import { useAccountStore } from '@/stores/account-store'
import { API } from '@/utils/api'

type AuthEndpoint = typeof APIEndpoints.Login | typeof APIEndpoints.Register

export const useAuthenticationMutation = (
  endpoint: AuthEndpoint,
  mutationKey: string,
  redirectTo?: string,
) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [mutationKey],
    mutationFn: (payload: Credentials | RegisterPayload) => API.post(UserSchema, endpoint, payload),
    onSuccess: async (user) => {
      queryClient.setQueryData([QueryKeys.AccountDetails], user)
      useAccountStore.getState().setAccountDetails(user)
      await queryClient.invalidateQueries({ queryKey: [QueryKeys.Cart] })
      await navigate({ to: redirectTo ?? HOME_PATH })
    },
  })
}

export const useLogoutMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [MutationKeys.Logout],
    mutationFn: () => API.send(APIEndpoints.Logout, 'POST'),
    onSettled: async () => {
      useAccountStore.getState().reset()
      await queryClient.resetQueries()
      await navigate({ to: LOGIN_PATH })
    },
  })
}
