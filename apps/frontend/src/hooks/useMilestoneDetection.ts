/**
 * useMilestoneDetection Hook
 * Auto-detect milestones and manage celebration state
 * Following onboarding-cro skill: celebrate meaningful achievements, show progress
 */

import { useCallback, useEffect, useState } from 'react'

import { analytics } from '@/utils/analytics'
import {
  areCelebrationsDisabled,
  createMilestoneAnalyticsEvent,
  detectMilestones,
  getCelebratedMilestones,
  markMilestoneCelebrated,
  MilestoneConfig,
  MILESTONES,
  UserMilestoneState,
} from '@/utils/celebrations'

interface UseMilestoneDetectionOptions {
  /** User state for milestone detection */
  userState: UserMilestoneState
  /** Disable detection (e.g., during loading) */
  disabled?: boolean
}

interface UseMilestoneDetectionReturn {
  /** Currently active milestone to celebrate (null if none) */
  activeMilestone: MilestoneConfig | null
  /** Dismiss the current celebration */
  dismissMilestone: (dontShowAgain?: boolean) => void
  /** Handle CTA click */
  handleCtaClick: () => void
  /** Whether celebrations are globally disabled */
  celebrationsDisabled: boolean
}

/**
 * Hook to detect and manage milestone celebrations
 *
 * @example
 * ```tsx
 * const { activeMilestone, dismissMilestone, handleCtaClick } = useMilestoneDetection({
 *   userState: {
 *     onboardingCompleted: true,
 *     firstWorkflowCreatedAt: '2024-01-15',
 *   },
 * })
 *
 * if (activeMilestone) {
 *   return <CelebrationModal milestone={activeMilestone} onDismiss={dismissMilestone} onCtaClick={handleCtaClick} />
 * }
 * ```
 */
export function useMilestoneDetection({
  userState,
  disabled = false,
}: UseMilestoneDetectionOptions): UseMilestoneDetectionReturn {
  const [activeMilestone, setActiveMilestone] =
    useState<MilestoneConfig | null>(null)
  const [celebrationsDisabled, setCelebrationsDisabled] = useState(false)

  // Check for celebrations disabled on mount
  useEffect(() => {
    setCelebrationsDisabled(areCelebrationsDisabled())
  }, [])

  // Detect milestones when user state changes
  useEffect(() => {
    if (disabled || celebrationsDisabled) {
      return
    }

    const celebrated = getCelebratedMilestones()
    const detected = detectMilestones(userState, celebrated)

    // Show only one milestone at a time (first in priority order)
    if (detected.length > 0) {
      const milestoneId = detected[0]
      const config = MILESTONES[milestoneId]
      setActiveMilestone(config)

      // Track milestone shown event
      const event = createMilestoneAnalyticsEvent(milestoneId, 'shown')
      analytics.trackEvent(event)
    }
  }, [userState, disabled, celebrationsDisabled])

  const dismissMilestone = useCallback(
    (dontShowAgain = false) => {
      if (!activeMilestone) return

      // Mark as celebrated so it won't show again
      markMilestoneCelebrated(activeMilestone.id)

      // Track dismiss event
      const event = createMilestoneAnalyticsEvent(
        activeMilestone.id,
        'dismissed'
      )
      analytics.trackEvent(event)

      // Clear active milestone
      setActiveMilestone(null)

      // Handle "don't show again" for all celebrations
      if (dontShowAgain) {
        import('@/utils/celebrations').then(({ setCelebrationsDisabled }) => {
          setCelebrationsDisabled(true)
        })
        setCelebrationsDisabled(true)
      }
    },
    [activeMilestone]
  )

  const handleCtaClick = useCallback(() => {
    if (!activeMilestone) return

    // Track CTA click event
    const event = createMilestoneAnalyticsEvent(
      activeMilestone.id,
      'cta_clicked'
    )
    analytics.trackEvent(event)

    // Mark as celebrated
    markMilestoneCelebrated(activeMilestone.id)
    setActiveMilestone(null)
  }, [activeMilestone])

  return {
    activeMilestone,
    dismissMilestone,
    handleCtaClick,
    celebrationsDisabled,
  }
}

export default useMilestoneDetection
