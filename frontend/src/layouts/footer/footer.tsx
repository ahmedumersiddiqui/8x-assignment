import { Link } from '@tanstack/react-router'

import { FooterColumns, WORDMARK } from '@/constants/navigation'

export function Footer() {
  return (
    <footer className="mt-10 bg-nav-sub text-white">
      <div className="mx-auto grid max-w-[1500px] grid-cols-2 gap-8 px-6 py-10 sm:grid-cols-4">
        {FooterColumns.map((column) => (
          <div key={column.title}>
            <h2 className="mb-2">{column.title}</h2>
            <ul className="space-y-1 text-sm text-line">
              {column.links.map((link) => (
                <li key={link}>{link}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-nav-belt py-6 text-center text-xs text-line">
        <Link to="/" className="text-white hover:no-underline">
          {WORDMARK}
        </Link>
        <p className="mt-2">A portfolio build. Not affiliated with any retailer.</p>
      </div>
    </footer>
  )
}
