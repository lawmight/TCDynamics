import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { recordEvent } from '@/api/analytics'
import { sendVertexChat, type VertexChatMessage } from '@/api/vertex'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import Bot from '~icons/lucide/bot'
import Check from '~icons/lucide/check'
import Copy from '~icons/lucide/copy'
import Loader2 from '~icons/lucide/loader-2'
import Plus from '~icons/lucide/plus'
import Send from '~icons/lucide/send'
import User from '~icons/lucide/user'

const SUGGESTED_PROMPTS = [
  {
    label: 'Summarize my [REDACTED]',
    prompt: 'Summarize the key points from my uploaded knowledge base [REDACTED].',
  },
  {
    label: 'Create a workflow',
    prompt:
      'Help me create an automated workflow for processing incoming client emails.',
  },
  {
    label: 'Analyze trends',
    prompt:
      'What trends can you identify from my recent data and workflow activity?',
  },
  {
    label: 'RGPD compliance',
    prompt:
      'What steps should I take to ensure my workflows are RGPD compliant?',
  },
]

const Chat = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<VertexChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
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

  const handleSend = useCallback(
    async (overrideInput?: string) => {
      const text = (overrideInput ?? input).trim()
      if (!text || isSending) return
      const userMessage: VertexChatMessage = { role: 'user', content: text }
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
        textareaRef.current?.focus()
      }
    },
    [input, isSending, messages, sessionId, user?.email]
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  const handleCopy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleNewConversation = () => {
    setMessages([])
    setError(null)
    setInput('')
    textareaRef.current?.focus()
  }

  const hasMessages = messages.length > 0

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-xl font-semibold">Chat</h1>
          <p className="text-muted-foreground text-sm">
            Vertex AI &middot; Session {sessionId.slice(0, 8)}
          </p>
        </div>
        {hasMessages && (
          <Button variant="outline" size="sm" onClick={handleNewConversation}>
            <Plus className="mr-1.5 size-3.5" />
            New chat
          </Button>
        )}
      </div>

      {/* Messages area */}
      <Card className="border-border flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {!hasMessages ? (
            /* Empty state with suggestions */
            <div className="flex h-full flex-col items-center justify-center gap-6 py-12">
              <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-2xl">
                <Bot className="size-7" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold">
                  How can I help you today?
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Ask anything about your workflows or knowledge base.
                </p>
              </div>
              <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTED_PROMPTS.map(suggestion => (
                  <button
                    key={suggestion.label}
                    type="button"
                    className="border-border bg-card hover:border-primary/30 hover:bg-accent rounded-lg border p-3 text-left text-sm transition-colors"
                    onClick={() => void handleSend(suggestion.prompt)}
                  >
                    <span className="font-medium">{suggestion.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message list */
            <div className="space-y-1">
              {messages.map((msg, index) => (
                <div
                  key={`${msg.role}-${index}`}
                  className={cn(
                    'group flex gap-3 rounded-lg px-3 py-3',
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  )}
                >
                  <div
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-lg',
                      msg.role === 'assistant'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <Bot className="size-4" />
                    ) : (
                      <User className="size-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'relative max-w-[85%] space-y-1',
                      msg.role === 'user' ? 'text-right' : ''
                    )}
                  >
                    <div
                      className={cn(
                        'inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                        msg.role === 'assistant'
                          ? 'bg-muted text-foreground'
                          : 'bg-primary text-primary-foreground'
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground size-7"
                              onClick={() =>
                                void handleCopy(msg.content, index)
                              }
                            >
                              {copiedIndex === index ? (
                                <Check className="size-3" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                              <span className="sr-only">Copy message</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {copiedIndex === index ? 'Copied!' : 'Copy'}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isSending && (
                <div className="flex gap-3 px-3 py-3">
                  <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                    <Bot className="size-4" />
                  </div>
                  <div className="bg-muted flex items-center gap-1.5 rounded-2xl px-4 py-3">
                    <span className="bg-muted-foreground/50 size-2 animate-bounce rounded-full [animation-delay:0ms]" />
                    <span className="bg-muted-foreground/50 size-2 animate-bounce rounded-full [animation-delay:150ms]" />
                    <span className="bg-muted-foreground/50 size-2 animate-bounce rounded-full [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-border bg-card border-t p-4">
          {error && (
            <p className="text-destructive mb-2 text-sm">{error}</p>
          )}
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Shift+Enter for newline)"
              className="max-h-[200px] min-h-[44px] resize-none"
              rows={1}
              disabled={isSending}
              aria-label="Chat message input"
            />
            <Button
              size="icon"
              className="size-10 shrink-0"
              onClick={() => void handleSend()}
              disabled={isSending || !input.trim()}
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            Powered by Vertex AI (Gemini). Data is not stored unless uploaded to
            KB.
          </p>
        </div>
      </Card>
    </div>
  )
}

export default Chat
