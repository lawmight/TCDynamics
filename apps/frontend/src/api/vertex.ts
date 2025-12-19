export type VertexChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type VertexChatResponse = {
  message: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
}

export const sendVertexChat = async ({
  messages,
  sessionId,
  temperature,
}: {
  messages: VertexChatMessage[]
  sessionId: string
  temperature?: number
}): Promise<VertexChatResponse> => {
  const res = await fetch('/api/vertex?action=chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, sessionId, temperature }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || 'Vertex chat failed')
  }

  return res.json()
}

export const embedText = async (text: string): Promise<number[]> => {
  const res = await fetch('/api/vertex?action=embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || 'Embedding failed')
  }

  const json = await res.json()
  return json.embedding || []
}
