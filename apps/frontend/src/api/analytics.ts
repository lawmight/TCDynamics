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
    throw new Error(errorText || 'Impossible de charger les analyses')
  }
  const data = await res.json()
  // Basic validation
  if (Array.isArray(data)) {
    throw new Error(
      'Format de données invalide : un objet était attendu, mais un tableau a été reçu'
    )
  }
  if (typeof data !== 'object' || data === null) {
    throw new Error('Format de données invalide : objet attendu')
  }
  // Verify required numeric fields
  if (
    typeof data.chatMessages !== 'number' ||
    !Number.isFinite(data.chatMessages)
  ) {
    throw new Error(
      'Données invalides : `chatMessages` doit être un nombre fini'
    )
  }
  if (typeof data.uploads !== 'number' || !Number.isFinite(data.uploads)) {
    throw new Error('Données invalides : `uploads` doit être un nombre fini')
  }
  if (
    typeof data.activeUsers !== 'number' ||
    !Number.isFinite(data.activeUsers)
  ) {
    throw new Error(
      'Données invalides : `activeUsers` doit être un nombre fini'
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
    throw new Error(
      `Impossible d'enregistrer l'événement d'analyse : ${res.statusText}`
    )
  }
}
