import { useState, useRef, useEffect, useId } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Send, Bot, User, Loader2 } from 'lucide-react'
import { chatAPI } from '@/api/azureServices'
import { logger } from '@/utils/logger'
import { useToggle } from '@/hooks/useToggle'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
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
        content:
          data.message || data.response || 'Réponse reçue du service IA.',
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
          className="rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
          aria-expanded={isOpen}
          aria-controls={chatbotId}
          aria-label={isOpen ? 'Fermer le chatbot IA' : 'Ouvrir le chatbot IA'}
        >
          {isOpen ? (
            <MessageCircle className="w-6 h-6" />
          ) : (
            <Bot className="w-6 h-6" />
          )}
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
        <div
          id={chatbotId}
          className="fixed bottom-24 right-6 z-40 w-96 h-[500px] shadow-2xl"
          role="dialog"
          aria-labelledby="chatbot-title"
          aria-describedby="chatbot-description"
        >
          <Card className="h-full flex flex-col bg-card/95 backdrop-blur-sm border-primary/20">
            <CardHeader className="pb-4 bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle id="chatbot-title" className="text-lg font-mono">
                      WorkFlowAI Assistant
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs font-mono">
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

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Bot className="w-12 h-12 mb-4 text-primary/50" />
                    <p className="font-mono text-sm mb-2">
                      Bonjour! Je suis votre assistant IA
                    </p>
                    <p className="text-xs font-mono">
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
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 font-mono text-sm ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-card border border-border'
                          }`}
                        >
                          {message.content}
                        </div>
                        {message.role === 'user' && (
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isConnecting && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-card border border-border rounded-lg px-4 py-2">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs text-muted-foreground font-mono">
                              Connexion...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-card border border-border rounded-lg px-4 py-2">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs text-muted-foreground font-mono">
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
              <div className="p-4 border-t border-border">
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
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-2 text-center">
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
