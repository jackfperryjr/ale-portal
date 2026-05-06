import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import LoginHero from './LoginHero'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string }
}) {
  const session = await getServerSession(authOptions)
  const raw = searchParams.callbackUrl
  const callbackUrl = typeof raw === 'string' && raw.startsWith('/') ? raw : '/scans'
  if (session) redirect(callbackUrl)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <LoginHero error={searchParams.error} callbackUrl={callbackUrl} />
    </main>
  )
}
