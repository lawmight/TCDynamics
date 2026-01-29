import { track } from '@vercel/analytics'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import X from '~icons/lucide/x'

interface PostSubmissionFeedbackProps {
  onClose: () => void
  formType: 'demo' | 'contact'
  userEmail?: string
  userCompany?: string
}

export const PostSubmissionFeedback = ({
  onClose,
  formType,
  userEmail,
  userCompany,
}: PostSubmissionFeedbackProps) => {
  const [rating, setRating] = useState<number>(5)
  const [feedback, setFeedback] = useState('')
  const [followup, setFollowup] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Track feedback submission
      track('feedback_submitted', {
        formType,
        rating,
        hasComment: feedback.length > 0,
        allowFollowup: followup,
        timestamp: new Date().toISOString(),
      })

      // Save feedback to MongoDB
      const feedbackData = {
        form_type: formType,
        rating,
        feedback_text: feedback || null,
        user_email: userEmail || null,
        user_company: userCompany || null,
        allow_followup: followup,
        created_at: new Date().toISOString(),
      }

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      // Close dialog after successful submission
      onClose()
    } catch (error) {
      // Track error
      track('feedback_error', {
        formType,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })

      console.error('Error submitting feedback:', error)
      // Still close dialog even if save fails
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/80"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border border-border bg-background shadow-lg">
          {/* Header */}
          <div className="relative border-b border-border p-6">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Close dialog"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </button>
            <div>
              <h2 className="text-xl font-semibold">
                Votre avis nous intéresse
              </h2>
              <p className="pt-2 text-sm text-muted-foreground">
                Avez-vous trouvé ce que vous cherchiez ? Votre retour nous aide
                à améliorer
              </p>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Question 1: Satisfaction Rating */}
            <div className="space-y-3">
              <label htmlFor="rating" className="block text-sm font-medium">
                Étiez-vous satisfait de votre expérience ? *
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`rounded-lg border-2 py-3 text-sm font-semibold transition-all ${
                      rating === value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {rating === 1 && 'Pas satisfait'}
                {rating === 2 && 'Peu satisfait'}
                {rating === 3 && 'Neutre'}
                {rating === 4 && 'Satisfait'}
                {rating === 5 && 'Très satisfait'}
              </p>
            </div>

            {/* Question 2: What were they looking for */}
            <div className="space-y-3">
              <label htmlFor="feedback" className="block text-sm font-medium">
                Qu'aviez-vous comme besoin spécifique ? (optionnel)
              </label>
              <Textarea
                id="feedback"
                placeholder="Décrivez votre besoin ou ce que vous trouviez manquant..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                maxLength={500}
                className="min-h-[100px] resize-none bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                {feedback.length}/500 caractères
              </p>
            </div>

            {/* Question 3: Follow-up permission */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="followup"
                checked={followup}
                onChange={e => setFollowup(e.target.checked)}
                className="mt-1 size-4 rounded border-border"
              />
              <label htmlFor="followup" className="text-sm">
                Puis-je vous contacter pour discuter de vos besoins spécifiques
                ?
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Passer
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
                variant="hero"
              >
                {isSubmitting ? 'Envoi...' : 'Envoyer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
