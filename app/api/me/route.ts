import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

const API_URL = process.env.ALE_API_URL ?? 'http://localhost:8000'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await fetch(
    `${API_URL}/me?session_id=${encodeURIComponent(session.user.email)}`,
    { cache: 'no-store' },
  )
  const data = await res.json()
  return NextResponse.json(data, { status: res.ok ? 200 : res.status })
}
