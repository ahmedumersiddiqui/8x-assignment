import { useEffect, useState } from 'react'

import { BackToTopIcon, IconSize } from '@/components/icons'
import { Tooltip } from '@/components/ui/tooltip'

/** Roughly one fold. Below this the header is still on screen and the button is noise. */
const SHOW_AFTER_PX = 600

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  // Starts hidden on both the server and the first client render, so nothing to mismatch.
  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > SHOW_AFTER_PX)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      <Tooltip label="Back to top" placement="left">
        <button
          type="button"
          aria-label="Back to top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'auto'
                : 'smooth',
            })
          }
          className="flex h-11 w-11 items-center justify-center rounded-[100vw] bg-nav-sub text-white shadow-[0_2px_8px_rgba(15,17,17,0.35)] transition-colors hover:bg-nav-belt"
        >
          <BackToTopIcon size={IconSize.md} aria-hidden="true" />
        </button>
      </Tooltip>
    </div>
  )
}
