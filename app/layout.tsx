import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ALE — The Brewery',
  description: 'Brewmaster dashboard for the Authenticity Logic Engine',
}

const API_URL = process.env.ALE_API_URL ?? 'http://localhost:8000'

async function getSystemStatus(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/status`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data.active ? data.message : null
  } catch {
    return null
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const statusMessage = await getSystemStatus()
  return (
    <html lang="en">
      <body className="min-h-screen font-serif">
        {statusMessage && (
          <div className="w-full bg-amber-950 border-b border-amber-800 text-amber-400 text-xs text-center px-4 py-2">
            {statusMessage}
          </div>
        )}
        {children}
      </body>
    </html>
  )
}
