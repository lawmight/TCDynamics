export type OverviewMetrics = {
  success: boolean
  projectId: string
  windowDays: number
  results: Record<
    string,
    {
      p50: string | number
      p75: string | number
      p95: string | number
      samples: string | number
    }
  >
}

export type PageMetric = {
  path: string
  samples: number
  p75LCP?: number
  p75INP?: number
  p75CLS?: number
}

export type PagesResponse = {
  success: boolean
  projectId: string
  windowDays: number
  pages: PageMetric[]
}

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

export const fetchMetricsOverview = async (
  projectId: string,
  days = 7
): Promise<OverviewMetrics> => {
  const url = `${API_BASE}/api/metrics/overview?projectId=${encodeURIComponent(projectId)}&days=${days}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch overview: ${res.status}`)
  return res.json()
}

export const fetchMetricsPages = async (
  projectId: string,
  days = 7,
  limit = 50
): Promise<PagesResponse> => {
  const url = `${API_BASE}/api/metrics/pages?projectId=${encodeURIComponent(projectId)}&days=${days}&limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch pages: ${res.status}`)
  return res.json()
}
