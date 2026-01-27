/**
 * Celebrations Utility
 * Milestone configurations and celebration logic for Phase 5 Continuous Engagement
 * Following analytics-tracking skill patterns for event naming
 */

import type { Options as ConfettiOptions } from 'canvas-confetti'

// ============================================================================
// Types
// ============================================================================

export type MilestoneId =
  | 'onboarding_complete'
  | 'first_workflow_activated'
  | 'first_document_processed'
  | 'ten_workflows_created'
  | 'first_team_member'
  | 'first_integration_connected'

export interface MilestoneConfig {
  id: MilestoneId
  title: string
  message: string
  ctaText: string
  ctaLink: string
  confetti: ConfettiOptions
  analyticsEvent: string
}

export interface UserMilestoneState {
  onboardingCompleted?: boolean
  firstWorkflowCreatedAt?: string
  firstDocumentUploadedAt?: string
  workflowCount?: number
  teamMemberCount?: number
  integrationCount?: number
}

// ============================================================================
// Confetti Presets
// ============================================================================

const CONFETTI_COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4ade80']

const defaultConfetti: ConfettiOptions = {
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  colors: CONFETTI_COLORS,
}

const celebrationConfetti: ConfettiOptions = {
  ...defaultConfetti,
  particleCount: 150,
  spread: 100,
}

const subtleConfetti: ConfettiOptions = {
  ...defaultConfetti,
  particleCount: 50,
  spread: 50,
}

// ============================================================================
// Milestone Configurations
// ============================================================================

export const MILESTONES: Record<MilestoneId, MilestoneConfig> = {
  onboarding_complete: {
    id: 'onboarding_complete',
    title: 'Bienvenue chez TCDynamics ! 🎉',
    message:
      'Félicitations ! Vous avez terminé votre configuration initiale. Vous êtes prêt à automatiser vos processus métier.',
    ctaText: 'Explorer les fonctionnalités',
    ctaLink: '/app/workflows',
    confetti: celebrationConfetti,
    analyticsEvent: 'milestone_onboarding_complete',
  },
  first_workflow_activated: {
    id: 'first_workflow_activated',
    title: 'Premier workflow activé ! 🚀',
    message:
      "Excellent ! Votre premier workflow est maintenant actif. L'automatisation commence ici !",
    ctaText: 'Créer un autre workflow',
    ctaLink: '/app/workflows/new',
    confetti: celebrationConfetti,
    analyticsEvent: 'milestone_first_workflow_activated',
  },
  first_document_processed: {
    id: 'first_document_processed',
    title: 'Premier document traité ! 📄',
    message:
      'Super ! Votre premier document a été traité avec succès. Continuez à importer vos fichiers.',
    ctaText: 'Importer plus de documents',
    ctaLink: '/app/files',
    confetti: defaultConfetti,
    analyticsEvent: 'milestone_first_document_processed',
  },
  ten_workflows_created: {
    id: 'ten_workflows_created',
    title: 'Power User ! ⚡',
    message:
      "Impressionnant ! Vous avez créé 10 workflows. Vous maîtrisez l'automatisation.",
    ctaText: 'Découvrir les fonctionnalités avancées',
    ctaLink: '/app/settings/advanced',
    confetti: celebrationConfetti,
    analyticsEvent: 'milestone_ten_workflows_created',
  },
  first_team_member: {
    id: 'first_team_member',
    title: 'Travail en équipe ! 👥',
    message:
      'Génial ! Vous avez invité votre premier collaborateur. Ensemble, vous irez plus loin.',
    ctaText: 'Gérer votre équipe',
    ctaLink: '/app/settings/team',
    confetti: defaultConfetti,
    analyticsEvent: 'milestone_first_team_member',
  },
  first_integration_connected: {
    id: 'first_integration_connected',
    title: 'Connecté ! 🔗',
    message:
      'Parfait ! Votre première intégration est configurée. Synchronisez vos outils préférés.',
    ctaText: "Ajouter plus d'integrations",
    ctaLink: '/app/settings/integrations',
    confetti: subtleConfetti,
    analyticsEvent: 'milestone_first_integration_connected',
  },
}

// ============================================================================
// Detection Logic
// ============================================================================

/**
 * Detect which milestones the user has reached but not yet celebrated
 * @param userState - Current user milestone state
 * @param celebratedMilestones - Set of milestone IDs already celebrated
 * @returns Array of milestone IDs to celebrate (in priority order)
 */
export function detectMilestones(
  userState: UserMilestoneState,
  celebratedMilestones: Set<MilestoneId>
): MilestoneId[] {
  const detected: MilestoneId[] = []

  // Priority order: most impactful first
  if (
    userState.onboardingCompleted &&
    !celebratedMilestones.has('onboarding_complete')
  ) {
    detected.push('onboarding_complete')
  }

  if (
    userState.firstWorkflowCreatedAt &&
    !celebratedMilestones.has('first_workflow_activated')
  ) {
    detected.push('first_workflow_activated')
  }

  if (
    userState.firstDocumentUploadedAt &&
    !celebratedMilestones.has('first_document_processed')
  ) {
    detected.push('first_document_processed')
  }

  if (
    (userState.workflowCount ?? 0) >= 10 &&
    !celebratedMilestones.has('ten_workflows_created')
  ) {
    detected.push('ten_workflows_created')
  }

  if (
    (userState.teamMemberCount ?? 0) >= 1 &&
    !celebratedMilestones.has('first_team_member')
  ) {
    detected.push('first_team_member')
  }

  if (
    (userState.integrationCount ?? 0) >= 1 &&
    !celebratedMilestones.has('first_integration_connected')
  ) {
    detected.push('first_integration_connected')
  }

  return detected
}

// ============================================================================
// LocalStorage Helpers
// ============================================================================

const CELEBRATED_MILESTONES_KEY = 'tc_celebrated_milestones'
const CELEBRATIONS_DISABLED_KEY = 'tc_celebrations_disabled'

/**
 * Get the set of milestones the user has already celebrated
 */
export function getCelebratedMilestones(): Set<MilestoneId> {
  try {
    const stored = localStorage.getItem(CELEBRATED_MILESTONES_KEY)
    if (stored) {
      return new Set(JSON.parse(stored) as MilestoneId[])
    }
  } catch {
    // Ignore parsing errors
  }
  return new Set()
}

/**
 * Mark a milestone as celebrated
 */
export function markMilestoneCelebrated(milestoneId: MilestoneId): void {
  const celebrated = getCelebratedMilestones()
  celebrated.add(milestoneId)
  try {
    localStorage.setItem(
      CELEBRATED_MILESTONES_KEY,
      JSON.stringify([...celebrated])
    )
  } catch {
    // Ignore storage errors
  }
}

/**
 * Check if celebrations are disabled by user preference
 */
export function areCelebrationsDisabled(): boolean {
  try {
    return localStorage.getItem(CELEBRATIONS_DISABLED_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Set user preference for celebrations
 */
export function setCelebrationsDisabled(disabled: boolean): void {
  try {
    localStorage.setItem(CELEBRATIONS_DISABLED_KEY, String(disabled))
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// Analytics Helpers (following analytics-tracking skill patterns)
// ============================================================================

interface MilestoneAnalyticsEvent {
  category: 'Milestone'
  action: string
  label?: string
  value?: number
}

/**
 * Create analytics event for milestone
 * Following Object-Action naming convention from analytics-tracking skill
 */
export function createMilestoneAnalyticsEvent(
  milestoneId: MilestoneId,
  action: 'shown' | 'dismissed' | 'cta_clicked'
): MilestoneAnalyticsEvent {
  const config = MILESTONES[milestoneId]
  return {
    category: 'Milestone',
    action: `${config.analyticsEvent}_${action}`,
    label: milestoneId,
  }
}
