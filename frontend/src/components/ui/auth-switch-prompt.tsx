import { Link } from '@tanstack/react-router'

import { Text } from './text'


export function AuthSwitchPrompt({ target }: { target: 'login' | 'register' }) {
  return (
    <div className="mt-5">
      <div className="relative mb-4 border-t border-line text-center">
        <Text as="span" size="xs" tone="muted" className="relative -top-2 bg-white px-2">
          {target === 'register' ? 'New to us?' : 'Already have an account?'}
        </Text>
      </div>
      <Link
        to={target === 'register' ? '/register' : '/login'}
        className="block rounded-[3px] border border-line bg-field py-1 text-center text-ink hover:bg-line hover:no-underline"
      >
        {target === 'register' ? 'Create your account' : 'Sign in'}
      </Link>
    </div>
  )
}
