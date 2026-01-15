import { Bot, Loader2, Send, User, X } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { chatAPI } from '@/api/azureServices'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToggle } from '@/hooks/useToggle'
import { logger } from '@/utils/logger'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Helper function to get truly focusable elements
const getFocusableElements = (root: Element): HTMLElement[] => {
  const elements = root.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  return Array.from(elements).filter(element => {
    const el = element as HTMLElement

    // Skip disabled elements
    const isFormElement = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(
      el.tagName
    )
    if (isFormElement && (el as HTMLFormElement).disabled) return false

    // Skip hidden input types
    if (el.tagName === 'INPUT' && el.getAttribute('type') === 'hidden')
      return false

    // Skip aria-hidden elements
    if (el.getAttribute('aria-hidden') === 'true') return false

    // Skip elements with hidden attribute
    if (el.hasAttribute('hidden')) return false

    // Check if element is inside a disabled fieldset
    let parent = el.parentElement
    while (parent) {
      if (parent.tagName === 'FIELDSET' && parent.hasAttribute('disabled')) {
        return false
      }
      parent = parent.parentElement
    }

    // Check visibility using computed style
    const computedStyle = window.getComputedStyle(el)
    if (
      computedStyle.display === 'none' ||
      computedStyle.visibility === 'hidden'
    ) {
      return false
    }

    // Check if element is actually visible in the DOM
    // offsetParent is null for elements that are not visible
    if (el.offsetParent === null && computedStyle.position !== 'fixed') {
      return false
    }

    // Additional check for dimensions (elements with 0 width/height might not be focusable)
    if (el.offsetWidth === 0 && el.offsetHeight === 0) {
      return false
    }

    return true
  }) as HTMLElement[]
}

const AIChatbot = () => {
  const { isOpen, toggle, close } = useToggle()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const liveRegionId = useId()
  const chatbotId = useId()
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Announce new messages to screen readers
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1]
      const liveRegion = document.getElementById(liveRegionId)
      if (liveRegion) {
        liveRegion.textContent = `${latestMessage.role === 'assistant' ? 'Assistant IA' : 'Vous'}: ${latestMessage.content}`
      }
    }
  }, [messages, liveRegionId])

  // Handle ESC key and focus management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        close()
      }
    }

    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement

      // Add ESC key listener
      document.addEventListener('keydown', handleKeyDown)

      // Focus the first focusable element in the chatbot
      const chatbotElement = document.getElementById(chatbotId)
      if (chatbotElement) {
        const focusableElements = getFocusableElements(chatbotElement)
        const firstFocusable = focusableElements[0]
        if (firstFocusable) {
          firstFocusable.focus()
        }
      }
    } else {
      // Restore focus when closing
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
        previousFocusRef.current = null
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, close, chatbotId])

  // Focus trap function
  const handleFocusTrap = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) return

      const chatbotElement = document.getElementById(chatbotId)
      if (!chatbotElement) return

      const focusableElements = getFocusableElements(chatbotElement)

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement?.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement?.focus()
          }
        }
      }
    },
    [isOpen, chatbotId]
  )

  const sendMessage = async () => {
    if (!input.trim() || isLoading || isConnecting) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsConnecting(true)

    // Small delay to show connecting state for better UX
    await new Promise(resolve => setTimeout(resolve, 300))

    setIsLoading(true)
    setIsConnecting(false)

    try {
      const data = await chatAPI.sendSimpleMessage(
        userMessage.content,
        'web-session'
      )

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'Réponse reçue du service IA.',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      logger.error('Error sending message', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
        role: 'assistant',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Chatbot Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggle}
          size="lg"
          className="h-16 w-16 rounded-full bg-primary shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl"
          aria-expanded={isOpen}
          aria-controls={chatbotId}
          aria-label={isOpen ? 'Fermer le chatbot IA' : 'Ouvrir le chatbot IA'}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
        </Button>
      </div>

      {/* ARIA Live Region for screen reader announcements */}
      <div
        id={liveRegionId}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Chatbot Window */}
      {isOpen && (
        /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */
        <div
          id={chatbotId}
          className="fixed bottom-24 right-6 z-40 h-[500px] w-96 shadow-2xl"
          role="dialog"
          aria-labelledby="chatbot-title"
          aria-describedby="chatbot-description"
          tabIndex={-1}
          onKeyDown={handleFocusTrap}
        >
          <Card className="flex h-full flex-col border-primary/20 bg-card/95 backdrop-blur-sm">
            <CardHeader className="bg-primary/5 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle id="chatbot-title" className="font-mono text-lg">
                      WorkFlowAI Assistant
                    </CardTitle>
                    <Badge variant="secondary" className="font-mono text-xs">
                      IA Active
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={close}
                  className="h-8 w-8 p-0"
                  aria-label="Fermer le chatbot IA"
                >
                  ×
                </Button>
              </div>
            </CardHeader>

            <div id="chatbot-description" className="sr-only">
              Chatbot IA pour assistance avec WorkFlowAI. Posez vos questions et
              recevez des réponses intelligentes.
            </div>

            <CardContent className="flex flex-1 flex-col p-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                    <Bot className="mb-4 h-12 w-12 text-primary/50" />
                    <p className="mb-2 font-mono text-sm">
                      Bonjour! Je suis votre assistant IA
                    </p>
                    <p className="font-mono text-xs">
                      Comment puis-je vous aider avec WorkFlowAI ?
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 font-mono text-sm ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-border bg-card'
                          }`}
                        >
                          {message.content}
                        </div>
                        {message.role === 'user' && (
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isConnecting && (
                      <div className="flex justify-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="rounded-lg border border-border bg-card px-4 py-2">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="font-mono text-xs text-muted-foreground">
                              Connexion...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    {isLoading && (
                      <div className="flex justify-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="rounded-lg border border-border bg-card px-4 py-2">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="font-mono text-xs text-muted-foreground">
                              Réflexion...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Posez votre question..."
                    className="flex-1 font-mono text-sm"
                    disabled={isLoading}
                    aria-label="Message input"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading || isConnecting}
                    size="sm"
                    className="px-3"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-center font-mono text-xs text-muted-foreground">
                  Propulsé par Azure OpenAI GPT-3.5-turbo
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

export default AIChatbot
