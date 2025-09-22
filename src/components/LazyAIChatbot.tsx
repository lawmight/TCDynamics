import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'

// Lazy load the AIChatbot component
const AIChatbot = lazy(() => import('./AIChatbot'))

// Loading fallback component
const ChatbotLoadingFallback = () => (
  <div className="fixed bottom-6 right-6 z-50">
    <div className="rounded-full w-16 h-16 shadow-lg bg-primary/50 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary-foreground" />
    </div>
  </div>
)

/**
 * Lazy-loaded AIChatbot component with loading fallback
 * Improves initial page load performance by deferring chatbot initialization
 */
const LazyAIChatbot = () => {
  return (
    <Suspense fallback={<ChatbotLoadingFallback />}>
      <AIChatbot />
    </Suspense>
  )
}

export default LazyAIChatbot
