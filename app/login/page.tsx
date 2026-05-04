import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import LoginHero from './LoginHero'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const session = await getServerSession(authOptions)
  if (session) redirect('/')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <LoginHero error={searchParams.error} />
    </main>
  )
}
