'use client'
import { useState, useEffect } from 'react'

interface Result {
  reality_score: number
  label: string
  cached: boolean
  daily_credits?: number | null
  credits?: number | null
  details?: {
    ai_generated?: number | null
    deepfake?: number | null
    not_ai_generated?: number | null
  }
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#00C875' : score >= 40 ? '#F0A020' : '#E03050'
  const label = score >= 70 ? '✓ Pure ALE' : score >= 40 ? '⚠ Mixed Pour' : '✗ Skunked'
  const circ = 2 * Math.PI * 40
  const offset = circ * (1 - score / 100)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1E2830" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{Math.round(score)}%</span>
        </div>
      </div>
      <span className="text-sm font-semibold italic" style={{ color }}>{label}</span>
    </div>
  )
}

export default function TryForm() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dailyCredits, setDailyCredits] = useState<number | null>(null)
  const [paidCredits, setPaidCredits] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) { setDailyCredits(d.daily_credits); setPaidCredits(d.credits) }
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail ?? data.error ?? 'Something went wrong.')
      } else {
        setResult(data)
        if (data.daily_credits != null) setDailyCredits(data.daily_credits)
        if (data.credits != null) setPaidCredits(data.credits)
      }
    } catch {
      setError('Could not reach the API.')
    } finally {
      setLoading(false)
    }
  }

  const details = result?.details

  return (
    <>
    <style>{`
      @keyframes ale-liquid-rise {
        0%   { height: 0%;  opacity: 0.7; }
        80%  { height: 78%; opacity: 1;   }
        100% { height: 78%; opacity: 1;   }
      }
      @keyframes ale-foam-rise {
        0%   { bottom: 0%;  opacity: 0;   }
        60%  { bottom: 74%; opacity: 0;   }
        80%  { bottom: 76%; opacity: 0.9; }
        100% { bottom: 76%; opacity: 0.9; }
      }
      .ale-liquid { animation: ale-liquid-rise 1.8s ease-out infinite; }
      .ale-foam   { animation: ale-foam-rise   1.8s ease-out infinite; }
    `}</style>

    <div className="space-y-6">
      {(dailyCredits !== null || paidCredits !== null) && (
        <div className="flex gap-4 text-xs text-ale-muted">
          {dailyCredits !== null && (
            <span>Daily: <span className="text-ale-text font-semibold tabular-nums">{dailyCredits}</span></span>
          )}
          {paidCredits !== null && paidCredits > 0 && (
            <span>Paid: <span className="text-ale-text font-semibold tabular-nums">{paidCredits}</span></span>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          required
          className="flex-1 bg-ale-card border border-ale-border rounded px-4 py-2.5 text-sm text-ale-text placeholder:text-ale-muted focus:outline-none focus:border-ale-amber"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-ale-amber text-ale-bg font-bold text-sm rounded hover:bg-ale-gold transition-colors disabled:opacity-50"
        >
          {loading ? 'Pouring…' : 'Pour'}
        </button>
      </form>

      {loading && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="relative w-14 h-20">
            <div className="absolute inset-0 rounded-b-xl border-2 border-ale-border" style={{ borderTop: 'none' }} />
            <div
              className="ale-liquid absolute bottom-0 left-0.5 right-0.5 rounded-b-xl"
              style={{ background: 'rgba(232, 160, 32, 0.75)' }}
            />
            <div
              className="ale-foam absolute left-0.5 right-0.5 h-2.5 rounded"
              style={{ background: 'rgba(232, 220, 200, 0.65)' }}
            />
          </div>
          <span className="text-sm text-ale-muted italic">Pouring…</span>
        </div>
      )}

      {error && (
        <div className="bg-ale-card border border-ale-border rounded-lg p-4 text-sm text-ale-skunked italic">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-ale-card border border-ale-border rounded-lg p-6 flex flex-col sm:flex-row items-center gap-8">
          <ScoreRing score={result.reality_score} />
          <div className="flex-1 space-y-3 w-full">
            {details && (
              <div className="grid grid-cols-2 gap-3">
                {([
                  { label: 'AI Generated', value: details.ai_generated },
                  { label: 'Deepfake',     value: details.deepfake },
                  { label: 'Not AI',       value: details.not_ai_generated },
                ] as const).filter(({ value }) => value != null).map(({ label, value }) => (
                  <div key={label} className="bg-ale-bg rounded p-3">
                    <div className="text-ale-muted text-xs mb-1">{label}</div>
                    <div className="font-bold tabular-nums text-ale-text">
                      {Math.round((value as number) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
            {result.cached && (
              <p className="text-xs text-ale-muted italic">Cached result</p>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  )
}
