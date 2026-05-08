'use client'
import { useEffect, useState } from 'react'

export default function StatusBanner() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/status')
      .then(r => r.json())
      .then(d => { if (d.active && d.message) setMessage(d.message) })
      .catch(() => {})
  }, [])

  if (!message) return null
  return (
    <div className="w-full bg-amber-950 border-b border-amber-800 text-amber-400 text-xs text-center px-4 py-2">
      {message}
    </div>
  )
}
