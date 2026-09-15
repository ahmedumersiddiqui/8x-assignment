import { LoginForm } from './components/login-form'

export function Login({ redirectTo }: { redirectTo?: string }) {
  return <LoginForm redirectTo={redirectTo} />
}
