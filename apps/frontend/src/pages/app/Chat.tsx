import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { recordEvent } from '@/api/analytics'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { LoadingState } from '@/components/ui/loading-state'
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

type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

type ChatResponse = {
  message?: string
  response?: string
  conversationId?: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
}

const SESSION_EXPIRED_MESSAGE =
  'Votre session a expire. Reconnectez-vous puis reessayez.'

const getApiUnavailableMessage = () =>
  import.meta.env.DEV
    ? "Impossible de se connecter au serveur API. Verifiez que vous avez demarre l'environnement complet avec `npm run dev` (et pas seulement `npm run dev:frontend`)."
    : 'Erreur reseau : impossible de joindre le serveur API. Reessayez plus tard.'

const getApiNotFoundMessage = () =>
  import.meta.env.DEV
    ? "Point d'entree API introuvable. Verifiez que le serveur Vercel de developpement est actif (`npm run dev` lance a la fois le frontend et l'API)."
    : "Point d'entree API introuvable. Verifiez votre configuration."

const getLargeHeaderMessage = () =>
  import.meta.env.DEV
    ? "En-tetes de requete trop volumineux. Verifiez que vous utilisez `npm run dev` (qui applique le correctif de taille d'en-tete), puis reconnectez-vous si necessaire."
    : "Les donnees d'authentification sont trop volumineuses. Deconnectez-vous puis reconnectez-vous pour rafraichir votre session."

const getAiServiceNotConfiguredMessage = () =>
  import.meta.env.DEV
    ? "Service IA non configure. Ajoutez OPENROUTER_API_KEY dans votre .env.local, puis redemarrez `npm run dev`."
    : "Service IA momentanement indisponible. Reessayez plus tard."

const getInvalidChatSuccessBodyMessage = () =>
  import.meta.env.DEV
    ? 'Reponse vide ou non JSON depuis /api/ai. Verifiez que `npm run dev` tourne (API Vercel sur le port 3201, proxy Vite) et que ALLOW_VERCEL_CHAT est actif.'
    : 'Reponse serveur invalide. Reessayez plus tard.'

const MAX_RAW_ERROR_LENGTH = 500
const RAW_ERROR_SENSITIVE_PATTERNS = [
  /^\s*at\s.+/i,
  /\b(?:[A-Za-z]:\\|\/(?:Users|home|var|tmp|srv|app|workspace|private|opt)\/)/,
  /\b[A-Za-z0-9_.-]+\.(?:ts|tsx|js|jsx|mjs|cjs|py|rb|go|java|php|cs):\d+(?::\d+)?\b/,
  /\bfile:\/\//i,
]

const sanitizeRawChatError = (rawBody: string): string => {
  const sanitizedLines = rawBody
    .trim()
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)

  let sensitiveContentDetected = false

  const safeText = sanitizedLines
    .filter(line => {
      const isSensitive = RAW_ERROR_SENSITIVE_PATTERNS.some(pattern =>
        pattern.test(line)
      )
      if (isSensitive) {
        sensitiveContentDetected = true
      }
      return !isSensitive
    })
    .join(' ')
    .slice(0, MAX_RAW_ERROR_LENGTH)
    .trim()

  if (sensitiveContentDetected) {
    return 'Une erreur serveur est survenue. Reessayez plus tard.'
  }

  return safeText || 'La requete de chat a echoue'
}

/** Parse error message from an already-read response body (single read per request). */
const getChatErrorMessageFromBody = (
  status: number,
  contentType: string,
  rawBody: string
): string => {
  if (status === 404) {
    return getApiNotFoundMessage()
  }

  if (status === 431) {
    return getLargeHeaderMessage()
  }

  const trimmed = rawBody.trim()
  if (trimmed) {
    if (contentType.includes('application/json')) {
      try {
        const parsedError = JSON.parse(trimmed) as {
          error?: unknown
          message?: unknown
        }

        if (
          typeof parsedError.message === 'string' &&
          parsedError.message.trim().length > 0
        ) {
          if (
            parsedError.message.toLowerCase().includes('jwt is expired') ||
            parsedError.message.toLowerCase().includes('token is expired')
          ) {
            return SESSION_EXPIRED_MESSAGE
          }
          return parsedError.message
        }

        if (
          typeof parsedError.error === 'string' &&
          parsedError.error.trim().length > 0
        ) {
          if (
            parsedError.error.toLowerCase().includes('service ia non configur')
          ) {
            return getAiServiceNotConfiguredMessage()
          }
          if (
            parsedError.error.toLowerCase().includes('jwt is expired') ||
            parsedError.error.toLowerCase().includes('token is expired')
          ) {
            return SESSION_EXPIRED_MESSAGE
          }
          return parsedError.error
        }
      } catch {
        // Fall through to the raw response text below when JSON parsing fails.
      }
    }

    return sanitizeRawChatError(trimmed)
  }

  if (status === 401) {
    return 'Authentification requise. Connectez-vous pour continuer.'
  }

  return 'La requete de chat a echoue'
}

const parseChatSuccessJson = (bodyText: string): ChatResponse => {
  const trimmed = bodyText.trim()
  if (!trimmed) {
    throw new Error(getInvalidChatSuccessBodyMessage())
  }
  try {
    return JSON.parse(trimmed) as ChatResponse
  } catch {
    throw new Error(getInvalidChatSuccessBodyMessage())
  }
}

const isSessionExpiredError = (status: number, errorMessage: string) =>
  status === 401 &&
  (errorMessage === SESSION_EXPIRED_MESSAGE ||
    errorMessage.toLowerCase().includes('jwt is expired') ||
    errorMessage.toLowerCase().includes('token is expired'))

const sendChat = async ({
  message,
  sessionId,
  temperature,
  userEmail,
  getToken,
}: {
  message: string
  sessionId: string
  temperature?: number
  userEmail?: string
  getToken: (forceRefresh?: boolean) => Promise<string | null>
}): Promise<ChatResponse> => {
  const token = await getToken()
  if (!token) {
    throw new Error('Authentification requise. Connectez-vous pour continuer.')
  }

  const makeRequest = (accessToken: string) =>
    fetch('/api/ai?action=chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ message, sessionId, temperature, userEmail }),
    })

  let res: Response
  try {
    res = await makeRequest(token)
  } catch {
    throw new Error(getApiUnavailableMessage())
  }

  const contentType = res.headers.get('content-type') || ''
  const bodyText = await res.text().catch(() => '')

  if (!res.ok) {
    const errorMessage = getChatErrorMessageFromBody(
      res.status,
      contentType,
      bodyText
    )
    if (isSessionExpiredError(res.status, errorMessage)) {
      const refreshedToken = await getToken(true)
      if (!refreshedToken) {
        throw new Error(SESSION_EXPIRED_MESSAGE)
      }

      try {
        const retryResponse = await makeRequest(refreshedToken)
        const retryType = retryResponse.headers.get('content-type') || ''
        const retryText = await retryResponse.text().catch(() => '')

        if (!retryResponse.ok) {
          const retryError = getChatErrorMessageFromBody(
            retryResponse.status,
            retryType,
            retryText
          )
          throw new Error(
            isSessionExpiredError(retryResponse.status, retryError)
              ? SESSION_EXPIRED_MESSAGE
              : retryError
          )
        }

        return parseChatSuccessJson(retryText)
      } catch (retryError) {
        if (retryError instanceof Error) {
          throw retryError
        }
        throw new Error(SESSION_EXPIRED_MESSAGE)
      }
    }

    throw new Error(errorMessage)
  }

  return parseChatSuccessJson(bodyText)
}

const SUGGESTED_PROMPTS = [
  {
    label: 'Resumer mes documents',
    prompt:
      'Resume les points importants de ma base de connaissances importee.',
  },
  {
    label: 'Creer un workflow',
    prompt:
      "Aide-moi a creer un workflow automatise pour traiter les emails entrants de mes clients.",
  },
  {
    label: 'Analyser les tendances',
    prompt:
      'Quelles tendances identifies-tu dans mes donnees recentes et mon activite ?',
  },
  {
    label: 'RGPD compliance',
    prompt:
      'Quelles etapes dois-je suivre pour garder mes workflows conformes au RGPD ?',
  },
]

const Chat = () => {
  const { user, getToken } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
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
  const userEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(
    async (overrideInput?: string) => {
      const text = (overrideInput ?? input).trim()
      if (!text || isSending) return
      const userMessage: ChatMessage = { role: 'user', content: text }
      const payload = [...messages, userMessage]
      setMessages(payload)
      setInput('')
      setIsSending(true)
      setError(null)

      try {
        const response = await sendChat({
          message: text,
          sessionId,
          temperature: 0.3,
          userEmail,
          getToken,
        })
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.response || response.message || 'Aucune reponse recue.',
        }
        setMessages([...payload, assistantMessage])
        await recordEvent(
          'chat_message',
          { sessionId, user: userEmail },
          { getToken }
        )
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Impossible d'envoyer le message"
        setError(message)
      } finally {
        setIsSending(false)
        textareaRef.current?.focus()
      }
    },
    [getToken, input, isSending, messages, sessionId, userEmail]
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
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-semibold">Assistant IA</h1>
          <p className="text-muted-foreground text-sm">
            Conversation assistee par IA &middot; Session {sessionId.slice(0, 8)}
          </p>
        </div>
        {hasMessages && (
          <Button variant="outline" size="sm" onClick={handleNewConversation}>
            <Plus className="mr-1.5 size-3.5" />
            Nouvelle conversation
          </Button>
        )}
      </div>

      {/* Messages area */}
      <Card className="border-border flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {!hasMessages ? (
            <div className="flex h-full items-center py-8">
              <EmptyState
                className="w-full"
                icon={<Bot className="size-7" />}
                title="Comment puis-je vous aider aujourd'hui ?"
                description="Posez une question sur vos workflows, vos documents ou votre activite."
                action={
                  <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
                    {SUGGESTED_PROMPTS.map(suggestion => (
                      <button
                        key={suggestion.label}
                        type="button"
                        className="border-border bg-card hover:border-primary/30 hover:bg-accent rounded-lg border p-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        onClick={() => void handleSend(suggestion.prompt)}
                      >
                        <span className="font-medium">{suggestion.label}</span>
                      </button>
                    ))}
                  </div>
                }
              />
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
                              <span className="sr-only">Copier le message</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {copiedIndex === index ? 'Copie !' : 'Copier'}
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
                    <LoadingState
                      variant="dots"
                      label="L'assistant est en train d'ecrire"
                    />
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
            <ErrorState
              variant="inline"
              message={error}
              className="mb-3"
            />
          )}
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ecrivez votre message... (Maj+Entree pour un retour a la ligne)"
              className="max-h-[200px] min-h-[44px] resize-none"
              rows={1}
              disabled={isSending}
              aria-label="Champ de message"
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
              <span className="sr-only">Envoyer le message</span>
            </Button>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            Propulse par OpenRouter. Les donnees ne sont conservees que si vous
            les importez dans votre base de connaissances.
          </p>
        </div>
      </Card>
    </div>
  )
}

export default Chat
