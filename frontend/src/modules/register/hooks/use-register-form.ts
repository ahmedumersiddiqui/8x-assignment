import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { APIEndpoints } from '@/constants/api-endpoints'
import { MutationKeys } from '@/constants/mutation-keys'
import { useAuthenticationMutation } from '@/hooks/use-authentication-mutation'
import { getAPIErrorMessage } from '@/utils/api'

import type { RegisterFormValues } from '../schema'
import { RegisterFormSchema } from '../schema'

export const useRegisterForm = (redirectTo?: string) => {
  const mutation = useAuthenticationMutation(
    APIEndpoints.Register,
    MutationKeys.Register,
    redirectTo,
  )
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  return {
    register: form.register,
    errors: form.formState.errors,
    // confirmPassword never leaves the browser.
    onSubmit: form.handleSubmit(({ confirmPassword: _confirmPassword, ...payload }) =>
      mutation.mutate(payload),
    ),
    isPending: mutation.isPending,
    errorMessage: mutation.error
      ? getAPIErrorMessage(mutation.error, 'Could not create your account.')
      : null,
  }
}
