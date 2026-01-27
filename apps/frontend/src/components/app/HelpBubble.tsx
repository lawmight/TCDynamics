/**
 * HelpBubble Component
 * Floating contextual help bubble for proactive support
 * Following onboarding-cro skill: offer help before users ask
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { analytics } from '@/utils/analytics'
import BookOpen from '~icons/lucide/book-open'
import HelpCircle from '~icons/lucide/help-circle'
import MessageCircle from '~icons/lucide/message-circle'
import ThumbsDown from '~icons/lucide/thumbs-down'
import ThumbsUp from '~icons/lucide/thumbs-up'
import Video from '~icons/lucide/video'
import X from '~icons/lucide/x'

export interface HelpResource {
  type: 'video' | 'guide' | 'chat' | 'support'
  label: string
  url?: string
  onClick?: () => void
}

export interface StruggleContext {
  stepId: string
  stepName: string
  message: string
  resources: HelpResource[]
}

interface HelpBubbleProps {
  /** Context about where user is struggling */
  struggle: StruggleContext
  /** Called when user dismisses the bubble */
  onDismiss: () => void
  /** Called when user clicks a help resource */
  onResourceClick: (resource: HelpResource) => void
  /** Called when user provides feedback */
  onFeedback: (helpful: boolean) => void
  /** Position of the bubble */
  position?: 'bottom-right' | 'bottom-left'
}

const resourceIcons = {
  video: Video,
  guide: BookOpen,
  chat: MessageCircle,
  support: HelpCircle,
}

/**
 * Floating help bubble for proactive support
 * Appears when user struggles with a specific step
 */
export function HelpBubble({
  struggle,
  onDismiss,
  onResourceClick,
  onFeedback,
  position = 'bottom-right',
}: HelpBubbleProps) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState(false)

  const positionClasses =
    position === 'bottom-right' ? 'bottom-6 right-6' : 'bottom-6 left-6'

  const handleResourceClick = (resource: HelpResource) => {
    // Track resource click
    analytics.trackEvent({
      category: 'ProactiveSupport',
      action: 'resource_clicked',
      label: `${struggle.stepId}_${resource.type}`,
    })

    onResourceClick(resource)
    setShowFeedback(true)
  }

  const handleFeedback = (helpful: boolean) => {
    // Track feedback
    analytics.trackEvent({
      category: 'ProactiveSupport',
      action: helpful ? 'feedback_helpful' : 'feedback_not_helpful',
      label: struggle.stepId,
    })

    onFeedback(helpful)
    setFeedbackGiven(true)

    // Auto-dismiss after feedback
    setTimeout(() => {
      onDismiss()
    }, 1500)
  }

  const handleDismiss = () => {
    // Track dismissal
    analytics.trackEvent({
      category: 'ProactiveSupport',
      action: 'bubble_dismissed',
      label: struggle.stepId,
    })

    onDismiss()
  }

  return (
    <div
      className={`fixed ${positionClasses} animate-in fade-in slide-in-from-bottom-4 z-50 max-w-sm duration-300`}
      role="complementary"
      aria-label="Aide contextuelle"
    >
      <Card className="border-primary/20 bg-card/95 shadow-lg backdrop-blur-sm">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-sm opacity-70 transition-opacity hover:opacity-100"
          aria-label="Fermer"
        >
          <X className="size-4" />
        </button>

        <CardHeader className="pb-3 pt-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-full">
              <HelpCircle className="text-primary size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Besoin d&apos;aide ?
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                {struggle.message}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          {!showFeedback ? (
            <div className="flex flex-wrap gap-2">
              {struggle.resources.map((resource, index) => {
                const Icon = resourceIcons[resource.type]
                return resource.url ? (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    asChild
                    onClick={() => handleResourceClick(resource)}
                  >
                    <Link to={resource.url}>
                      <Icon className="mr-1.5 size-4" />
                      {resource.label}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleResourceClick(resource)
                      resource.onClick?.()
                    }}
                  >
                    <Icon className="mr-1.5 size-4" />
                    {resource.label}
                  </Button>
                )
              })}
            </div>
          ) : !feedbackGiven ? (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                Cette aide vous a-t-elle été utile ?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFeedback(true)}
                  className="flex-1"
                >
                  <ThumbsUp className="mr-1.5 size-4" />
                  Oui
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFeedback(false)}
                  className="flex-1"
                >
                  <ThumbsDown className="mr-1.5 size-4" />
                  Non
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Merci pour votre retour ! 🙏
            </p>
          )}
        </CardContent>

        <CardFooter className="border-t py-3">
          <p className="text-muted-foreground text-xs">
            Étape : {struggle.stepName}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default HelpBubble
