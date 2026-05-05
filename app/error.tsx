'use client'
import { useEffect } from 'react'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    const id = setTimeout(() => window.location.reload(), 3000)
    return () => clearTimeout(id)
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
      <p className="text-5xl font-bold tracking-widest" style={{ color: '#E8A020' }}>ALE</p>
      <p className="italic text-sm" style={{ color: '#60707A' }}>The brewery is warming up…</p>
      <p className="text-xs opacity-40" style={{ color: '#60707A' }}>Retrying in a moment</p>
    </main>
  )
}
