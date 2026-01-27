import { useEffect, useMemo, useRef, useState } from 'react'

import { recordEvent } from '@/api/analytics'
import { sendVertexChat, type VertexChatMessage } from '@/api/vertex'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import Loader2 from '~icons/lucide/loader-2'
import Send from '~icons/lucide/send'

const Chat = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<VertexChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your Vertex AI assistant. Ask me anything about your workflows, and I'll respond using the TCDynamics knowledge base.",
    },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const sessionId = useMemo(
    () =>
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(),
    []
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isSending) return
    const userMessage: VertexChatMessage = {
      role: 'user',
      content: input.trim(),
    }
    const payload = [...messages, userMessage]
    setMessages(payload)
    setInput('')
    setIsSending(true)
    setError(null)

    try {
      const response = await sendVertexChat({
        messages: payload,
        sessionId,
        temperature: 0.3,
      })
      const assistantMessage: VertexChatMessage = {
        role: 'assistant',
        content: response.message || 'No response received.',
      }
      setMessages([...payload, assistantMessage])
      await recordEvent('chat_message', { sessionId, user: user?.email })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to send message'
      setError(message)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm">
          Vertex AI · Gemini · Session {sessionId.slice(0, 8)}
        </p>
        <h1 className="text-2xl font-semibold">Workspace Chat</h1>
        <p className="text-muted-foreground text-sm">
          Ask questions about your documents or create new content. Responses
          are powered by Google Vertex AI.
        </p>
      </div>

      <Card className="border-border bg-card/70 h-[60vh] overflow-y-auto p-4 shadow-sm">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={`${msg.role}-${index}`}
              className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'assistant'
                    ? 'bg-muted text-foreground'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </Card>

      <Card className="border-border bg-card/80 p-4 shadow-sm">
        <div className="space-y-3">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything… (Shift+Enter for newline)"
            className="min-h-[96px]"
            disabled={isSending}
            aria-label="Chat message input"
          />
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <div className="flex items-center justify-between gap-3">
            <div className="text-muted-foreground text-xs">
              Uses Vertex AI (Gemini) with safe defaults. Data is not stored
              unless you upload to KB.
            </div>
            <Button
              onClick={() => void handleSend()}
              disabled={isSending || !input.trim()}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Sending
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" /> Send
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Chat
