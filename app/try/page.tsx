import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import SignOutButton from '@/app/SignOutButton'
import TryForm from './TryForm'

export default async function TryPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login?callbackUrl=/try')

  return (
    <div className="min-h-screen bg-ale-bg">
      <header className="border-b border-ale-border bg-ale-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/ale-icon.png"
            alt="ALE"
            width={36}
            height={36}
            className="rounded"
            style={{ filter: 'drop-shadow(0 0 8px rgba(232, 160, 32, 0.5))' }}
          />
          <div>
            <h1 className="text-2xl font-bold tracking-widest text-ale-amber">ALE</h1>
            <p className="text-xs text-ale-muted italic">Authenticity Logic Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/scans" className="text-xs text-ale-muted hover:text-ale-amber transition-colors">
            Scans →
          </Link>
          <span className="hidden sm:inline text-xs text-ale-muted">{session.user?.email}</span>
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-ale-amber">Try ALE</h2>
          <p className="text-xs text-ale-muted mt-1">
            Paste any image or video URL to check if it&apos;s AI-generated or a deepfake.
          </p>
        </div>
        <TryForm />
      </main>
    </div>
  )
}
