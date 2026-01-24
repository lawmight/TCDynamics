import { Suspense, lazy } from 'react'

import Loader2 from '~icons/lucide/loader-2'

// Lazy load the AIChatbot component
const AIChatbot = lazy(() => import('./AIChatbot'))

// Loading fallback component
const ChatbotLoadingFallback = () => (
  <div className="fixed bottom-6 right-6 z-50" data-testid="loader-container">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/50 shadow-lg">
      <Loader2
        data-testid="loader-icon"
        className="h-6 w-6 animate-spin text-primary-foreground"
      />
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
