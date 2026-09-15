import { AuthSwitchPrompt } from '@/components/ui/auth-switch-prompt'
import { Button } from '@/components/ui/button'
import { ErrorMessage } from '@/components/ui/error-message'
import { TextField } from '@/components/ui/text-field'

import { useLoginForm } from '../hooks/use-login-form'

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const { register, errors, onSubmit, isPending, errorMessage } = useLoginForm(redirectTo)

  return (
    <>
      <div className="rounded-[8px] border border-line p-5">
        <h1 className="mb-4 text-3xl">Sign in</h1>

        {errorMessage && (
          <div className="mb-4">
            <ErrorMessage message={errorMessage} />
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
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
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" fullWidth isPending={isPending}>
            Sign in
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted">
          By continuing, you agree to the Conditions of Use and Privacy Notice.
        </p>
      </div>

      <AuthSwitchPrompt target="register" />
    </>
  )
}
