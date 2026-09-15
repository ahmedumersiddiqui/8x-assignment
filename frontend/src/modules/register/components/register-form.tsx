import { AuthSwitchPrompt } from '@/components/ui/auth-switch-prompt'
import { Button } from '@/components/ui/button'
import { ErrorMessage } from '@/components/ui/error-message'
import { TextField } from '@/components/ui/text-field'

import { useRegisterForm } from '../hooks/use-register-form'

export function RegisterForm({ redirectTo }: { redirectTo?: string }) {
  const { register, errors, onSubmit, isPending, errorMessage } = useRegisterForm(redirectTo)

  return (
    <>
      <div className="rounded-[8px] border border-line p-5">
        <h1 className="mb-4 text-3xl">Create account</h1>

        {errorMessage && (
          <div className="mb-4">
            <ErrorMessage message={errorMessage} />
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          <TextField
            label="Your name"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <TextField
            label="Re-enter password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" fullWidth isPending={isPending}>
            Create your account
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted">Passwords must be at least 8 characters.</p>
      </div>

      <AuthSwitchPrompt target="login" />
    </>
  )
}
