'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import SignOutButton from '../SignOutButton'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface AppHeaderProps {
  email?: string | null
}

export default function AppHeader({ email }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIos, setIsIos] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [iosHintOpen, setIosHintOpen] = useState(false)
  const iosHintRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIos(ios)

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    if (!iosHintOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (iosHintRef.current && !iosHintRef.current.contains(e.target as Node)) {
        setIosHintOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [iosHintOpen])

  async function handleInstallClick() {
    if (installPrompt) {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') {
        setInstallPrompt(null)
        setIsInstalled(true)
      }
    } else if (isIos) {
      setIosHintOpen(v => !v)
    }
  }

  const showInstall = !isInstalled && (installPrompt !== null || isIos)

  const installBtn = showInstall ? (
    <div className="relative" ref={iosHintRef}>
      <button
        onClick={handleInstallClick}
        className="text-xs text-ale-muted hover:text-ale-amber transition-colors"
      >
        Install app
      </button>
      {iosHintOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-ale-card border border-ale-border rounded-lg p-3 z-50 shadow-lg text-xs text-ale-muted leading-relaxed">
          <p className="mb-1 font-semibold text-ale-text">Add to Home Screen</p>
          <p>Tap the <span className="text-ale-amber">Share</span> button in Safari, then choose <span className="text-ale-amber">Add to Home Screen</span>.</p>
        </div>
      )}
    </div>
  ) : null

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
          {installBtn}
          {email && <span className="text-xs text-ale-muted">{email}</span>}
          {email && <SignOutButton />}
        </nav>

        <button
          className="sm:hidden flex flex-col gap-1.5 p-1 text-ale-muted hover:text-ale-amber transition-colors"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <span className={`block w-5 h-0.5 bg-current transition-transform origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-current transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-current transition-transform origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {menuOpen && (
        <nav className="sm:hidden absolute top-full left-0 right-0 bg-ale-card border-b border-ale-border px-6 py-4 flex flex-col gap-4 z-50">
          <Link href="/try" className="text-sm text-ale-muted hover:text-ale-amber transition-colors"
            onClick={() => setMenuOpen(false)}>
            Try ALE
          </Link>
          <Link href="/scans" className="text-sm text-ale-muted hover:text-ale-amber transition-colors"
            onClick={() => setMenuOpen(false)}>
            Scans
          </Link>
          <Link href="/metrics" className="text-sm text-ale-muted hover:text-ale-amber transition-colors"
            onClick={() => setMenuOpen(false)}>
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
          {showInstall && (
            <button
              onClick={handleInstallClick}
              className="text-sm text-left text-ale-muted hover:text-ale-amber transition-colors"
            >
              Install app
            </button>
          )}
          {isIos && iosHintOpen && (
            <p className="text-xs text-ale-muted leading-relaxed border border-ale-border rounded p-3">
              Tap the <span className="text-ale-amber">Share</span> button in Safari, then choose{' '}
              <span className="text-ale-amber">Add to Home Screen</span>.
            </p>
          )}
          {email && <span className="text-xs text-ale-muted border-t border-ale-border pt-3">{email}</span>}
          {email && <SignOutButton />}
        </nav>
      )}
    </header>
  )
}
