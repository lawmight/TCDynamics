export type AnalyticsSummary = {
  chatMessages: number
  uploads: number
  activeUsers: number
  avgLatencyMs?: number
}

export const fetchAnalytics = async (): Promise<AnalyticsSummary> => {
  const res = await fetch('/api/analytics')
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || 'Failed to load analytics')
  }
  const data = await res.json()
  // Basic validation
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid analytics data format')
  }
  return data as AnalyticsSummary
}

export const recordEvent = async (
  event: 'chat_message' | 'file_upload' | 'login',
  metadata?: Record<string, unknown>
) => {
  const res = await fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, metadata }),
  })
  if (!res.ok) {
    throw new Error(`Failed to record analytics event: ${res.statusText}`)
  }
}
