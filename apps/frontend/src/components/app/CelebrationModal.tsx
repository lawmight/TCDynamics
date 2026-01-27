/**
 * CelebrationModal Component
 * Modal with confetti animation for milestone celebrations
 * Following frontend-design skill: distinctive, memorable UI with intentional motion
 */

import confetti from 'canvas-confetti'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { MilestoneConfig } from '@/utils/celebrations'
import Sparkles from '~icons/lucide/sparkles'
import X from '~icons/lucide/x'

interface CelebrationModalProps {
  /** Milestone configuration to display */
  milestone: MilestoneConfig
  /** Called when user dismisses the modal */
  onDismiss: (dontShowAgain?: boolean) => void
  /** Called when user clicks the CTA */
  onCtaClick: () => void
  /** Whether to show "Don't show again" option */
  showDontShowAgain?: boolean
}

/**
 * Celebration modal with confetti animation
 * Triggers confetti on mount and displays milestone message with CTA
 */
export function CelebrationModal({
  milestone,
  onDismiss,
  onCtaClick,
  showDontShowAgain = true,
}: CelebrationModalProps) {
  const confettiTriggered = useRef(false)

  // Trigger confetti animation on mount
  useEffect(() => {
    if (confettiTriggered.current) return
    confettiTriggered.current = true

    // Fire confetti with milestone-specific config
    confetti(milestone.confetti)

    // Optional: second burst for more impact
    const timeout = setTimeout(() => {
      confetti({
        ...milestone.confetti,
        origin: { x: 0.7, y: 0.6 },
        particleCount: Math.floor(
          (milestone.confetti.particleCount ?? 100) * 0.7
        ),
      })
    }, 250)

    return () => clearTimeout(timeout)
  }, [milestone.confetti])

  const handleDismiss = () => {
    onDismiss(false)
  }

  const handleDontShowAgain = () => {
    onDismiss(true)
  }

  const handleCtaClick = () => {
    onCtaClick()
  }

  return (
    <Dialog open={true} onOpenChange={() => handleDismiss()}>
      <DialogContent
        className="sm:max-w-md"
        aria-describedby="celebration-description"
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="ring-offset-background focus:ring-ring absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
          aria-label="Fermer"
        >
          <X className="size-4" />
        </button>

        <DialogHeader className="text-center sm:text-center">
          {/* Icon with gradient background */}
          <div className="from-primary/20 to-primary/5 mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br">
            <Sparkles className="text-primary size-8" />
          </div>

          <DialogTitle className="text-2xl font-bold tracking-tight">
            {milestone.title}
          </DialogTitle>

          <DialogDescription
            id="celebration-description"
            className="text-muted-foreground text-base"
          >
            {milestone.message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-3 sm:flex-col">
          {/* Primary CTA */}
          <Button asChild size="lg" className="w-full">
            <Link to={milestone.ctaLink} onClick={handleCtaClick}>
              {milestone.ctaText}
            </Link>
          </Button>

          {/* Secondary actions */}
          <div className="flex w-full items-center justify-between text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              Plus tard
            </Button>

            {showDontShowAgain && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDontShowAgain}
                className="text-muted-foreground hover:text-foreground"
              >
                Ne plus afficher
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CelebrationModal
