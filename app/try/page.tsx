import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AppHeader from '@/app/components/AppHeader'
import TryForm from './TryForm'

export default async function TryPage({
  searchParams,
}: {
  searchParams: { url?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login?callbackUrl=/try')

  return (
    <div className="min-h-screen bg-ale-bg">
      <AppHeader email={session.user?.email} />

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-ale-amber">Try ALE</h2>
          <p className="text-xs text-ale-muted mt-1">
            Paste any image or video URL to check if it&apos;s AI-generated or a deepfake.
          </p>
        </div>
        <TryForm initialUrl={searchParams.url} />
      </main>
    </div>
  )
}
