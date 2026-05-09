'use client'
import { useEffect, useState } from 'react'

function fmt(s: number) {
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
}

export default function ApiHealthCard({
  last429At,
  retryAfterSeconds,
  count24h,
  countHour,
  statusBreakdown,
}: {
  last429At: string | null
  retryAfterSeconds: number | null
  count24h: number
  countHour: number
  statusBreakdown: { code: number; count: number }[]
}) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    // Only tick if there's an active countdown to show
    if (!last429At) return
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [last429At])

  const hitMs      = last429At ? new Date(last429At).getTime() : null
  const elapsed    = hitMs != null ? Math.floor((now - hitMs) / 1000) : null
  const remaining  = retryAfterSeconds != null && elapsed != null
    ? retryAfterSeconds - elapsed
    : null

  return (
    <div className="bg-ale-card border border-ale-border rounded-lg p-5 space-y-4">

      <div className="flex gap-8">
        <div>
          <div className={`text-2xl font-bold tabular-nums ${count24h > 0 ? 'text-rose-400' : 'text-ale-real'}`}>
            {count24h}
          </div>
          <div className="text-xs text-ale-muted mt-1">rate limits (24h)</div>
        </div>
        <div>
          <div className={`text-2xl font-bold tabular-nums ${countHour > 0 ? 'text-ale-mixed' : 'text-ale-real'}`}>
            {countHour}
          </div>
          <div className="text-xs text-ale-muted mt-1">last hour</div>
        </div>
      </div>

      {last429At ? (
        <div className="space-y-1.5">
          <div className="text-xs text-ale-muted">
            Last hit:{' '}
            <span className="text-ale-text font-mono">
              {new Date(last429At).toLocaleTimeString()}
            </span>
            {elapsed != null && (
              <span className="ml-1.5 italic">({fmt(elapsed)} ago)</span>
            )}
          </div>

          {remaining != null && remaining > 0 ? (
            <div className="text-xs font-bold text-rose-400">
              ⏱ Quota clears in {fmt(remaining)}
            </div>
          ) : remaining != null ? (
            <div className="text-xs font-bold text-ale-real">✓ Quota window elapsed — should be clear</div>
          ) : retryAfterSeconds != null ? (
            <div className="text-xs text-ale-muted italic">Retry-After: {retryAfterSeconds}s (no live count — page age unknown)</div>
          ) : (
            <div className="text-xs text-ale-muted italic">No Retry-After header — reset window unknown</div>
          )}
        </div>
      ) : (
        <div className="text-xs text-ale-real font-bold">✓ No rate limits in last 24h</div>
      )}

      {statusBreakdown.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {statusBreakdown.map(({ code, count }) => {
            const color = code === 429 ? 'text-rose-400 border-rose-900'
              : code >= 500 ? 'text-ale-skunked border-ale-skunked/30'
              : 'text-ale-muted border-ale-border'
            return (
              <span key={code}
                className={`text-xs px-2 py-0.5 rounded border font-mono ${color}`}>
                {code} × {count}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
