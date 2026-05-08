import { NextResponse } from 'next/server'

const API_URL = process.env.ALE_API_URL ?? 'http://localhost:8000'

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/status`, { cache: 'no-store' })
    if (!res.ok) return NextResponse.json({ active: false, message: '' })
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ active: false, message: '' })
  }
}
