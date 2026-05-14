import { getAnalyses, getApiErrors } from '@/lib/api'
import ApiHealthCard from '../components/ApiHealthCard'
import AppHeader from '../components/AppHeader'

const PLATFORM_MAP: Record<string, string> = {
  'www.youtube.com': 'YouTube', 'youtube.com': 'YouTube',
  'youtu.be': 'YouTube',        'm.youtube.com': 'YouTube',
  'x.com': 'X',                 'www.x.com': 'X',
  'twitter.com': 'X',           'www.twitter.com': 'X',
  'pbs.twimg.com': 'X',         'video.twimg.com': 'X',
  'www.tiktok.com': 'TikTok',   'tiktok.com': 'TikTok',
  'www.instagram.com': 'Instagram',
  'www.facebook.com': 'Facebook', 'facebook.com': 'Facebook', 'fb.com': 'Facebook',
  'www.reddit.com': 'Reddit',   'reddit.com': 'Reddit',
  'www.linkedin.com': 'LinkedIn', 'media.licdn.com': 'LinkedIn',
}

function getPlatform(url: string): string {
  try { return PLATFORM_MAP[new URL(url).hostname] ?? 'Other' }
  catch { return 'Other' }
}

function pct(n: number, total: number) {
  return total === 0 ? 0 : Math.round((n / total) * 100)
}

function StatCard({ label, value, sub, color = 'text-ale-amber' }: {
  label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className="bg-ale-card border border-ale-border rounded-lg p-4 text-center">
      <div className={`text-3xl font-bold tabular-nums ${color}`}>{value}</div>
      <div className="text-xs text-ale-muted mt-1">{label}</div>
      {sub && <div className="text-xs text-ale-muted mt-0.5 italic">{sub}</div>}
    </div>
  )
}

export default async function MetricsPage() {
  const [scans, apiErrors] = await Promise.all([getAnalyses(2000), getApiErrors(24)])

  const scored    = scans.filter(s => s.realityScore !== null)
  const genuine   = scored.filter(s => s.realityScore! >= 70)
  const mixed     = scored.filter(s => s.realityScore! >= 40 && s.realityScore! < 70)
  const synthetic = scored.filter(s => s.realityScore! < 40)
  const avgScore  = scored.length
    ? scored.reduce((sum, s) => sum + s.realityScore!, 0) / scored.length
    : 0
  const humanReviewed = scans.filter(s => s.review !== null).length

  // ── Platform breakdown ──────────────────────────────────────────────────────
  const platMap: Record<string, { total: number; genuine: number; mixed: number; synthetic: number; scoreSum: number }> = {}
  for (const s of scored) {
    const p = getPlatform(s.url)
    if (!platMap[p]) platMap[p] = { total: 0, genuine: 0, mixed: 0, synthetic: 0, scoreSum: 0 }
    platMap[p].total++
    platMap[p].scoreSum += s.realityScore!
    if (s.realityScore! >= 70)      platMap[p].genuine++
    else if (s.realityScore! >= 40) platMap[p].mixed++
    else                            platMap[p].synthetic++
  }
  const platforms = Object.entries(platMap).sort(([a], [b]) => {
    if (a === 'Other') return 1
    if (b === 'Other') return -1
    return a.localeCompare(b)
  })

  // ── Score histogram (10pt buckets) ──────────────────────────────────────────
  const buckets = Array.from({ length: 10 }, (_, i) => {
    const lo = i * 10, hi = i === 9 ? 101 : lo + 10
    return { label: `${lo}–${lo + 9}`, count: scored.filter(s => s.realityScore! >= lo && s.realityScore! < hi).length }
  })
  const maxBucket = Math.max(...buckets.map(b => b.count), 1)

  // ── 14-day trend ────────────────────────────────────────────────────────────
  const today = new Date()
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (13 - i))
    return d.toISOString().slice(0, 10)
  })
  const daily = days.map(day => ({
    day,
    short: new Date(day + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: scans.filter(s => s.createdAt.slice(0, 10) === day).length,
  }))
  const maxDaily = Math.max(...daily.map(d => d.count), 1)

  // ── Content type breakdown ──────────────────────────────────────────────────
  const videoScans = scans.filter(s => s.contentType === 'video').length
  const imageScans = scans.filter(s => s.contentType === 'image').length
  const disagreeCount = scans.filter(s => s.userDisagreed).length

  // ── Trigger breakdown ───────────────────────────────────────────────────────
  const triggerLabels: Record<string, string> = {
    cap_click: 'Video Cap',
    image_hover: 'Image Hover',
    manual_url: 'Manual URL',
  }
  const triggerCounts = ['cap_click', 'image_hover', 'manual_url'].map(t => ({
    key: t,
    label: triggerLabels[t],
    count: scans.filter(s => s.trigger === t).length,
  })).filter(t => t.count > 0)

  // ── Hive signal averages ────────────────────────────────────────────────────
  const withAI       = scans.filter(s => s.rawResult?.details?.ai_generated != null)
  const withDeepfake = scans.filter(s => s.rawResult?.details?.deepfake != null)
  const withNotAI    = scans.filter(s => s.rawResult?.details?.not_ai_generated != null)
  const avg = (arr: typeof scans, key: string) =>
    arr.length ? arr.reduce((sum, s) => sum + (s.rawResult!.details![key] ?? 0), 0) / arr.length : null
  const avgAI       = avg(withAI, 'ai_generated')
  const avgDeepfake = avg(withDeepfake, 'deepfake')
  const avgNotAI    = avg(withNotAI, 'not_ai_generated')

  // ── API error stats ─────────────────────────────────────────────────────────
  const errors429   = apiErrors.filter(e => e.statusCode === 429)
  const last429     = errors429[0] ?? null
  const hourAgo     = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const count429h   = errors429.filter(e => e.createdAt >= hourAgo).length
  const statusBreakdown = Object.entries(
    apiErrors.reduce((acc, e) => { acc[e.statusCode] = (acc[e.statusCode] ?? 0) + 1; return acc }, {} as Record<number, number>)
  ).map(([code, count]) => ({ code: Number(code), count })).sort((a, b) => b.count - a.count)

  return (
    <div className="min-h-screen bg-ale-bg">
      <AppHeader />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-10">

        <div>
          <h2 className="text-lg font-bold text-ale-amber">Metrics</h2>
          <p className="text-xs text-ale-muted mt-1">
            Aggregated stats across the last {scans.length} scans processed by Hive AI.
          </p>
        </div>

        {/* ── Overview ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <StatCard label="Total Scans"   value={scans.length} />
          <StatCard label="Avg Score"     value={`${Math.round(avgScore)}%`} color="text-ale-amber" />
          <StatCard label="Genuine"       value={`${pct(genuine.length, scored.length)}%`}
            sub={`${genuine.length} scans`}   color="text-ale-real" />
          <StatCard label="Mixed"         value={`${pct(mixed.length, scored.length)}%`}
            sub={`${mixed.length} scans`}     color="text-ale-mixed" />
          <StatCard label="Synthetic"     value={`${pct(synthetic.length, scored.length)}%`}
            sub={`${synthetic.length} scans`} color="text-ale-skunked" />
          <StatCard label="Human Reviewed" value={humanReviewed}
            sub={`${pct(humanReviewed, scans.length)}% of scans`} color="text-emerald-300" />
        </div>

        {/* ── Content type & disagree ── */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Video Scans" value={videoScans}
            sub={`${pct(videoScans, scans.length)}% of total`} color="text-ale-amber" />
          <StatCard label="Image Scans" value={imageScans}
            sub={`${pct(imageScans, scans.length)}% of total`} color="text-ale-amber" />
          <StatCard label="Disagreements" value={disagreeCount}
            sub={`${pct(disagreeCount, scans.length)}% of scans`} color="text-rose-400" />
        </div>

        {/* ── Platform breakdown ── */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-ale-amber uppercase tracking-wider">By Platform</h3>
          <div className="bg-ale-card border border-ale-border rounded-lg overflow-hidden">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="border-b border-ale-border text-ale-muted text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 w-28">Platform</th>
                  <th className="text-left px-4 py-3 w-16">Scans</th>
                  <th className="text-left px-4 py-3 w-20">Avg Score</th>
                  <th className="text-left px-4 py-3">Genuine / Mixed / Synthetic</th>
                </tr>
              </thead>
              <tbody>
                {platforms.map(([name, data]) => {
                  const gPct = pct(data.genuine, data.total)
                  const mPct = pct(data.mixed, data.total)
                  const sPct = pct(data.synthetic, data.total)
                  const avg  = Math.round(data.scoreSum / data.total)
                  const color = avg >= 70 ? 'text-ale-real' : avg >= 40 ? 'text-ale-mixed' : 'text-ale-skunked'
                  return (
                    <tr key={name} className="border-b border-ale-border last:border-0">
                      <td className="px-4 py-3 font-medium text-ale-text">{name}</td>
                      <td className="px-4 py-3 text-ale-muted tabular-nums">{data.total}</td>
                      <td className={`px-4 py-3 font-bold tabular-nums ${color}`}>{avg}%</td>
                      <td className="px-4 py-3">
                        <div className="flex h-2 rounded-full overflow-hidden gap-px">
                          {gPct > 0 && <div style={{ width: `${gPct}%`, background: '#00C875' }} />}
                          {mPct > 0 && <div style={{ width: `${mPct}%`, background: '#F0A020' }} />}
                          {sPct > 0 && <div style={{ width: `${sPct}%`, background: '#E03050' }} />}
                        </div>
                        <div className="flex gap-3 mt-1.5 text-xs text-ale-muted">
                          <span className="text-ale-real">{gPct}% real</span>
                          {mPct > 0 && <span className="text-ale-mixed">{mPct}% mixed</span>}
                          <span className="text-ale-skunked">{sPct}% synth</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {platforms.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-ale-muted italic text-sm">
                      No data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* ── Score histogram ── */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-ale-amber uppercase tracking-wider">Score Distribution</h3>
            <div className="bg-ale-card border border-ale-border rounded-lg p-5 space-y-2">
              {buckets.map((b, i) => {
                const barPct = Math.round((b.count / maxBucket) * 100)
                const color  = i >= 7 ? '#00C875' : i >= 4 ? '#F0A020' : '#E03050'
                return (
                  <div key={b.label} className="flex items-center gap-3">
                    <span className="text-xs text-ale-muted tabular-nums w-12 text-right">{b.label}</span>
                    <div className="flex-1 h-2 bg-ale-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${barPct}%`, background: color }} />
                    </div>
                    <span className="text-xs text-ale-muted tabular-nums w-6">{b.count}</span>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ── Hive signals ── */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-ale-amber uppercase tracking-wider">Avg Hive Signals</h3>
            <div className="bg-ale-card border border-ale-border rounded-lg p-5 space-y-5">
              {([
                { label: 'Not AI Generated', value: avgNotAI, danger: false },
                { label: 'AI Generated',     value: avgAI,    danger: true  },
                { label: 'Deepfake',         value: avgDeepfake, danger: true },
              ] as const).map(({ label, value, danger }) => {
                if (value === null) return null
                const p     = Math.round(value * 100)
                const color = danger
                  ? p < 15 ? '#00C875' : p < 40 ? '#F0A020' : '#E03050'
                  : p > 85 ? '#00C875' : p > 60 ? '#F0A020' : '#E03050'
                return (
                  <div key={label} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-ale-muted">{label}</span>
                      <span className="font-bold tabular-nums" style={{ color }}>{p}%</span>
                    </div>
                    <div className="h-1.5 bg-ale-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${p}%`, background: color }} />
                    </div>
                  </div>
                )
              })}
              <p className="text-xs text-ale-muted italic pt-1">
                Averaged across {withAI.length} scored items.
              </p>
            </div>
          </section>

          {/* ── Trigger breakdown ── */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-ale-amber uppercase tracking-wider">By Trigger</h3>
            <div className="bg-ale-card border border-ale-border rounded-lg p-5 space-y-5">
              {triggerCounts.length === 0 ? (
                <p className="text-xs text-ale-muted italic">No trigger data yet.</p>
              ) : triggerCounts.map(({ key, label, count }) => {
                const p = pct(count, scans.length)
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-ale-muted">{label}</span>
                      <span className="font-bold tabular-nums text-ale-amber">{count} ({p}%)</span>
                    </div>
                    <div className="h-1.5 bg-ale-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${p}%`, background: '#E8A020' }} />
                    </div>
                  </div>
                )
              })}
              <p className="text-xs text-ale-muted italic pt-1">
                How users initiated each scan.
              </p>
            </div>
          </section>

        </div>

        {/* ── API health ── */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-ale-amber uppercase tracking-wider">API Health (24h)</h3>
          <ApiHealthCard
            last429At={last429?.createdAt ?? null}
            retryAfterSeconds={last429?.retryAfter ?? null}
            count24h={errors429.length}
            countHour={count429h}
            statusBreakdown={statusBreakdown}
          />
        </section>

        {/* ── 14-day trend ── */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-ale-amber uppercase tracking-wider">Daily Scan Volume (14 days)</h3>
          <div className="bg-ale-card border border-ale-border rounded-lg p-5">
            <div className="flex items-end gap-1.5 h-28">
              {daily.map(({ day, short, count }) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: `${Math.round((count / maxDaily) * 100)}%`,
                      minHeight: count > 0 ? '4px' : '0',
                      background: '#E8A020',
                      opacity: 0.75,
                    }}
                  />
                  <span className="text-ale-muted hidden sm:block"
                    style={{ fontSize: '9px', whiteSpace: 'nowrap' }}>
                    {short}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
