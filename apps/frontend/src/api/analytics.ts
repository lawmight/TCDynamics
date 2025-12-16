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
  if (Array.isArray(data)) {
    throw new Error('Invalid analytics data format: expected object, got array')
  }
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid analytics data format: expected object')
  }
  // Verify required numeric fields
  if (
    typeof data.chatMessages !== 'number' ||
    !Number.isFinite(data.chatMessages)
  ) {
    throw new Error(
      'Invalid analytics data: chatMessages must be a finite number'
    )
  }
  if (typeof data.uploads !== 'number' || !Number.isFinite(data.uploads)) {
    throw new Error('Invalid analytics data: uploads must be a finite number')
  }
  if (
    typeof data.activeUsers !== 'number' ||
    !Number.isFinite(data.activeUsers)
  ) {
    throw new Error(
      'Invalid analytics data: activeUsers must be a finite number'
    )
  }
  // Validate optional avgLatencyMs field
  if (
    data.avgLatencyMs !== undefined &&
    (typeof data.avgLatencyMs !== 'number' ||
      !Number.isFinite(data.avgLatencyMs))
  ) {
    delete data.avgLatencyMs
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
