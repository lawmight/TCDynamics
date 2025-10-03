// src/components/contact/DemoForm.tsx
// Optimized demo form component with performance improvements

import { memo, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useDemoForm } from '@/hooks/useFormSubmission'
import { Calendar, Send, CheckCircle, AlertCircle } from 'lucide-react'

interface DemoFormProps {
  className?: string
}

const DemoForm = memo(({ className }: DemoFormProps) => {
  const {
    submitForm,
    isSubmitting,
    response,
    clearResponse,
    isSuccess,
    errors,
    message,
    cleanup,
  } = useDemoForm()

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
        name: `${formData.get('firstName')} ${formData.get('lastName')}`,
        email: formData.get('email') as string,
        phone: (formData.get('phone') as string) || undefined,
        company: formData.get('company') as string,
        employeeCount: (formData.get('employeeCount') as string) || undefined,
        industry: (formData.get('industry') as string) || undefined,
        message: (formData.get('message') as string) || undefined,
      }

      await submitForm(data)
    },
    [submitForm]
  )

  return (
    <Card className={`h-full ${className || ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-600" />
          Demander une démonstration
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Planifiez une démonstration personnalisée de nos solutions WorkFlowAI
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Prénom *
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                disabled={isSubmitting}
                className="w-full"
                placeholder="Votre prénom"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nom *
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                disabled={isSubmitting}
                className="w-full"
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Entreprise *
              </label>
              <Input
                id="company"
                name="company"
                type="text"
                required
                disabled={isSubmitting}
                className="w-full"
                placeholder="Nom de votre entreprise"
              />
            </div>
            <div>
              <label
                htmlFor="employeeCount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre d'employés
              </label>
              <select
                id="employeeCount"
                name="employeeCount"
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionnez...</option>
                <option value="1-10">1-10 employés</option>
                <option value="11-50">11-50 employés</option>
                <option value="51-200">51-200 employés</option>
                <option value="201-500">201-500 employés</option>
                <option value="500+">500+ employés</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="industry"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Secteur d'activité
            </label>
            <select
              id="industry"
              name="industry"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionnez...</option>
              <option value="technologie">Technologie</option>
              <option value="finance">Finance</option>
              <option value="sante">Santé</option>
              <option value="education">Éducation</option>
              <option value="retail">Commerce de détail</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="services">Services</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Message (optionnel)
            </label>
            <Textarea
              id="message"
              name="message"
              disabled={isSubmitting}
              className="w-full min-h-[100px]"
              placeholder="Décrivez vos besoins spécifiques ou vos questions..."
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
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Demander une démonstration
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
})

DemoForm.displayName = 'DemoForm'

export { DemoForm }
