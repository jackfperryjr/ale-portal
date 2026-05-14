import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.ALE_API_URL ?? 'http://localhost:8000'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, analysis_id } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  const res = await fetch(`${API_URL}/queue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, analysis_id }),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.ok ? 200 : res.status })
}
