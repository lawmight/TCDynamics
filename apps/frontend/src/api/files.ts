export type KnowledgeFile = {
  id: string
  name: string
  path: string
  size: number
  mimeType: string
  createdAt?: string
  summary?: string
}

type UploadPayload = {
  fileName: string
  mimeType: string
  base64: string
  size: number
}

export const uploadKnowledgeFile = async (
  payload: UploadPayload
): Promise<{ success: boolean; path?: string; summary?: string }> => {
  const res = await fetch('/api/files-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || 'Upload failed')
  }

  return res.json()
}

export const listKnowledgeFiles = async (): Promise<KnowledgeFile[]> => {
  const res = await fetch('/api/files-list')
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || 'Listing failed')
  }
  const json = await res.json()
  return json.files || []
}
