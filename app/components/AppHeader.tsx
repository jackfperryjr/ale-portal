'use client'
import { useState } from 'react'
import Link from 'next/link'
import SignOutButton from '../SignOutButton'

interface AppHeaderProps {
  email?: string | null
}

export default function AppHeader({ email }: AppHeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="border-b border-ale-border bg-ale-card px-6 py-4 relative">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <img
            src="/ale-icon.png"
            alt="ALE"
            width={36}
            height={36}
            style={{ filter: 'drop-shadow(0 0 8px rgba(232, 160, 32, 0.5))' }}
          />
          <div>
            <h1 className="text-2xl font-bold tracking-widest text-ale-amber">ALE</h1>
            <p className="hidden sm:block text-xs text-ale-muted italic">Authenticity Logic Engine</p>
          </div>
        </Link>

        <nav className="hidden sm:flex items-center gap-4">
          <Link href="/try" className="text-xs text-ale-muted hover:text-ale-amber transition-colors">
            Try ALE
          </Link>
          <Link href="/scans" className="text-xs text-ale-muted hover:text-ale-amber transition-colors">
            Scans
          </Link>
          <Link href="/metrics" className="text-xs text-ale-muted hover:text-ale-amber transition-colors">
            Metrics
          </Link>
          <a
            href="https://buy.stripe.com/aFafZj7YI6n06d3fxG0Fi00"
            target="_blank"
            rel="noopener"
            className="text-xs italic text-ale-muted hover:text-ale-amber transition-colors"
          >
            Buy us a round 🍺
          </a>
          {email && <span className="text-xs text-ale-muted">{email}</span>}
          {email && <SignOutButton />}
        </nav>

        <button
          className="sm:hidden flex flex-col gap-1.5 p-1 text-ale-muted hover:text-ale-amber transition-colors"
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span className={`block w-5 h-0.5 bg-current transition-transform origin-center ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-current transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-current transition-transform origin-center ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {open && (
        <nav className="sm:hidden absolute top-full left-0 right-0 bg-ale-card border-b border-ale-border px-6 py-4 flex flex-col gap-4 z-50">
          <Link href="/try" className="text-sm text-ale-muted hover:text-ale-amber transition-colors"
            onClick={() => setOpen(false)}>
            Try ALE
          </Link>
          <Link href="/scans" className="text-sm text-ale-muted hover:text-ale-amber transition-colors"
            onClick={() => setOpen(false)}>
            Scans
          </Link>
          <Link href="/metrics" className="text-sm text-ale-muted hover:text-ale-amber transition-colors"
            onClick={() => setOpen(false)}>
            Metrics
          </Link>
          <a
            href="https://buy.stripe.com/aFafZj7YI6n06d3fxG0Fi00"
            target="_blank"
            rel="noopener"
            className="text-sm italic text-ale-muted hover:text-ale-amber transition-colors"
          >
            Buy us a round 🍺
          </a>
          {email && <span className="text-xs text-ale-muted border-t border-ale-border pt-3">{email}</span>}
          {email && <SignOutButton />}
        </nav>
      )}
    </header>
  )
}
