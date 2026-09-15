import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { APIEndpoints } from '@/constants/api-endpoints'
import { MutationKeys } from '@/constants/mutation-keys'
import { useAuthenticationMutation } from '@/hooks/use-authentication-mutation'
import type { Credentials } from '@/schemas/user'
import { CredentialsSchema } from '@/schemas/user'
import { getAPIErrorMessage } from '@/utils/api'

export const useLoginForm = (redirectTo?: string) => {
  const mutation = useAuthenticationMutation(APIEndpoints.Login, MutationKeys.Login, redirectTo)
  const form = useForm<Credentials>({
    resolver: zodResolver(CredentialsSchema),
    defaultValues: { email: '', password: '' },
  })

  return {
    register: form.register,
    errors: form.formState.errors,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
    isPending: mutation.isPending,
    errorMessage: mutation.error
      ? getAPIErrorMessage(mutation.error, 'Could not sign you in.')
      : null,
  }
}
