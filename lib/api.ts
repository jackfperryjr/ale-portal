const API_URL = process.env.ALE_API_URL ?? 'http://localhost:8000'
const API_KEY = process.env.ALE_API_KEY ?? ''

const headers = () => ({
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
})

export interface Analysis {
  id: string
  url: string
  videoId: string | null
  realityScore: number | null
  label: string | null
  rawResult: { details?: Record<string, number> } | null
  contentType: string | null
  trigger: string | null
  userDisagreed: boolean
  createdAt: string
  review: {
    status: string
    notes: string | null
    updatedAt: string
  } | null
}

export interface QueueItem {
  id: string
  url: string
  videoId: string | null
  analysisId: string | null
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
  analysis: {
    realityScore: number | null
    rawResult: { details?: Record<string, number> } | null
  } | null
}

export interface Stats {
  queuePending: number
  queueVerified: number
  totalAnalyses: number
}

function toQueueItem(r: any): QueueItem {
  return {
    id: r.id,
    url: r.url,
    videoId: r.video_id,
    analysisId: r.analysis_id,
    status: r.status,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    analysis: r.analysis
      ? { realityScore: r.analysis.reality_score, rawResult: r.analysis.raw_result }
      : null,
  }
}

function toAnalysis(r: any): Analysis {
  return {
    id: r.id,
    url: r.url,
    videoId: r.video_id,
    realityScore: r.reality_score,
    label: r.label,
    rawResult: r.raw_result,
    contentType: r.content_type ?? null,
    trigger: r.trigger ?? null,
    userDisagreed: r.user_disagreed ?? false,
    createdAt: r.created_at,
    review: r.review
      ? { status: r.review.status, notes: r.review.notes, updatedAt: r.review.updated_at }
      : null,
  }
}

export async function getQueue(status: string): Promise<QueueItem[]> {
  const res = await fetch(`${API_URL}/queue?status=${status}`, { cache: 'no-store', headers: headers() })
  if (!res.ok) throw new Error(`GET /queue?status=${status} → ${res.status}`)
  return (await res.json()).map(toQueueItem)
}

export async function getQueueItem(id: string): Promise<QueueItem | null> {
  const res = await fetch(`${API_URL}/queue/${id}`, { cache: 'no-store', headers: headers() })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GET /queue/${id} → ${res.status}`)
  return toQueueItem(await res.json())
}

export async function getAnalyses(limit = 100): Promise<Analysis[]> {
  const res = await fetch(`${API_URL}/analyses?limit=${limit}`, { cache: 'no-store', headers: headers() })
  if (!res.ok) throw new Error(`GET /analyses → ${res.status}`)
  return (await res.json()).map(toAnalysis)
}

export async function getStats(): Promise<Stats> {
  const res = await fetch(`${API_URL}/stats`, { cache: 'no-store', headers: headers() })
  if (!res.ok) throw new Error(`GET /stats → ${res.status}`)
  const r = await res.json()
  return {
    queuePending: r.queue_pending,
    queueVerified: r.queue_verified,
    totalAnalyses: r.total_analyses,
  }
}

export async function patchQueueItem(id: string, status: string, notes?: string): Promise<void> {
  const res = await fetch(`${API_URL}/queue/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status, notes: notes ?? null }),
  })
  if (!res.ok) throw new Error(`PATCH /queue/${id} → ${res.status}`)
}
