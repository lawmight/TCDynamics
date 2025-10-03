// src/components/Contact-optimized.tsx
// Optimized Contact component with improved performance and maintainability

import { memo, lazy, Suspense } from 'react'
import { ContactInfo } from './contact/ContactInfo'
import { ContactForm } from './contact/ContactForm'

// Lazy load the demo form for better initial bundle size
const LazyDemoForm = lazy(() =>
  import('./contact/DemoForm').then(module => ({ default: module.DemoForm }))
)

interface ContactProps {
  className?: string
}

const Contact = memo(({ className }: ContactProps) => {
  return (
    <div className={`min-h-screen bg-gray-50 py-12 ${className || ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Contact Information Section */}
        <ContactInfo className="mb-12" />

        {/* Forms Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <ContactForm />

          {/* Demo Form */}
          <Suspense
            fallback={
              <div className="h-96 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center">
                <div className="animate-pulse text-gray-500">
                  Chargement du formulaire...
                </div>
              </div>
            }
          >
            <LazyDemoForm />
          </Suspense>
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Informations supplémentaires
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">24h</div>
              <div className="text-sm text-gray-600">Délai de réponse</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-sm text-gray-600">Satisfaction client</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                7j/7
              </div>
              <div className="text-sm text-gray-600">Support disponible</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

Contact.displayName = 'Contact'

export { Contact }
