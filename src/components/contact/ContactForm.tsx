// src/components/contact/ContactForm.tsx
// Optimized contact form component with performance improvements

import { memo, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useContactForm } from '@/hooks/useFormSubmission'
import { MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react'

interface ContactFormProps {
  className?: string
}

const ContactForm = memo(({ className }: ContactFormProps) => {
  const {
    submitForm,
    isSubmitting,
    response,
    clearResponse,
    isSuccess,
    errors,
    message,
    cleanup,
  } = useContactForm()

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        clearResponse()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, clearResponse])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const formData = new FormData(e.currentTarget)
      const data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: (formData.get('phone') as string) || undefined,
        company: (formData.get('company') as string) || undefined,
        message: formData.get('message') as string,
      }

      await submitForm(data)
    },
    [submitForm]
  )

  return (
    <Card className={`h-full ${className || ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Formulaire de contact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nom complet *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                disabled={isSubmitting}
                className="w-full"
                placeholder="Votre nom complet"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                disabled={isSubmitting}
                className="w-full"
                placeholder="votre@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Téléphone
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                disabled={isSubmitting}
                className="w-full"
                placeholder="01 23 45 67 89"
              />
            </div>
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Entreprise
              </label>
              <Input
                id="company"
                name="company"
                type="text"
                disabled={isSubmitting}
                className="w-full"
                placeholder="Nom de votre entreprise"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Message *
            </label>
            <Textarea
              id="message"
              name="message"
              required
              disabled={isSubmitting}
              className="w-full min-h-[120px]"
              placeholder="Décrivez votre projet ou votre demande..."
            />
          </div>

          {response && (
            <div
              className={`p-4 rounded-lg flex items-start gap-3 ${
                isSuccess
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {isSuccess ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    isSuccess ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {message}
                </p>
                {errors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700">
                        • {error}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Envoyer le message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
})

ContactForm.displayName = 'ContactForm'

export { ContactForm }
