import { BackToTop } from './back-to-top'
import { Footer } from './footer'
import { Header } from './header'

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:block focus:bg-cta focus:p-2 focus:text-ink"
      >
        Skip to main content
      </a>
      <Header />
      <div id="main">{children}</div>
      <Footer />
      <BackToTop />
    </>
  )
}
