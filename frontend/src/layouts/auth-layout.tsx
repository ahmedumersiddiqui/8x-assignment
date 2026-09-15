import { Link } from '@tanstack/react-router'

import { WORDMARK } from '@/constants/navigation'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="py-5 text-center">
        <Link to="/" className="text-3xl text-ink hover:no-underline">
          {WORDMARK}
          <span className="text-badge">.</span>
        </Link>
      </div>

      <main className="flex-1 px-4">
        <div className="mx-auto w-full max-w-[350px]">{children}</div>
      </main>

      <footer className="mt-10 border-t border-line py-6 text-center text-xs text-muted">
        <p className="mb-1 space-x-4">
          <span>Conditions of Use</span>
          <span>Privacy Notice</span>
          <span>Help</span>
        </p>
        <p>A portfolio build. Not affiliated with any retailer.</p>
      </footer>
    </div>
  )
}
