import { RegisterForm } from './components/register-form'

export function Register({ redirectTo }: { redirectTo?: string }) {
  return <RegisterForm redirectTo={redirectTo} />
}
