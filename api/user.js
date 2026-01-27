/**
 * Consolidated User API
 * Handles email preferences and onboarding struggle detection
 */

import { getAuth } from '@clerk/nextjs/server'
import { User } from './_lib/models/User.js'
import { connectToDatabase } from './_lib/mongodb.js'

// Struggle detection patterns
const STRUGGLE_PATTERNS = {
  // Same step viewed multiple times without completion
  repeatedStepViews: {
    threshold: 3,
    timeWindowMinutes: 30,
  },
  // High dwell time on a step
  highDwellTime: {
    thresholdSeconds: 300, // 5 minutes
  },
  // Form validation errors
  repeatedErrors: {
    threshold: 3,
    timeWindowMinutes: 10,
  },
  // Repeated modal closures without completion
  abandonments: {
    threshold: 2,
    timeWindowMinutes: 15,
  },
}

// Help resources mapped to onboarding step IDs
const HELP_RESOURCES = {
  'step-account-setup': {
    stepName: 'Configuration du compte',
    message: 'La configuration du compte vous pose problème ?',
    resources: [
      {
        type: 'video',
        label: 'Tutoriel vidéo',
        url: '/help/videos/account-setup',
      },
      { type: 'guide', label: 'Guide rapide', url: '/docs/getting-started' },
      { type: 'chat', label: 'Chat support' },
    ],
  },
  'step-first-workflow': {
    stepName: 'Créer votre premier workflow',
    message: "Besoin d'aide pour créer un workflow ?",
    resources: [
      {
        type: 'video',
        label: 'Tutoriel création',
        url: '/help/videos/create-workflow',
      },
      {
        type: 'guide',
        label: 'Templates prêts',
        url: '/app/workflows/templates',
      },
      { type: 'support', label: 'Aide personnalisée' },
    ],
  },
  'step-upload-document': {
    stepName: 'Importer un document',
    message: "L'import de document ne fonctionne pas ?",
    resources: [
      {
        type: 'guide',
        label: 'Formats supportés',
        url: '/docs/supported-formats',
      },
      { type: 'chat', label: 'Assistance technique' },
    ],
  },
  'step-invite-team': {
    stepName: 'Inviter votre équipe',
    message: 'Des questions sur les invitations ?',
    resources: [
      { type: 'guide', label: 'Gérer les accès', url: '/docs/team-management' },
      { type: 'chat', label: 'Chat support' },
    ],
  },
  'step-connect-integration': {
    stepName: 'Connecter une intégration',
    message: "L'intégration pose problème ?",
    resources: [
      {
        type: 'video',
        label: 'Configuration étape par étape',
        url: '/help/videos/integrations',
      },
      {
        type: 'guide',
        label: "Guide d'intégration",
        url: '/docs/integrations',
      },
      { type: 'support', label: 'Aide technique' },
    ],
  },
  // Default fallback
  default: {
    stepName: 'Étape en cours',
    message: "Vous semblez avoir besoin d'aide. Comment puis-je vous aider ?",
    resources: [
      { type: 'guide', label: "Centre d'aide", url: '/docs' },
      { type: 'chat', label: 'Contacter le support' },
    ],
  },
}

function getQueryValue(value) {
  if (Array.isArray(value)) return value[0]
  return value
}

/**
 * Analyze events for struggle patterns
 * @param {Array} events - Recent analytics events for the user
 * @returns {Object|null} Struggle context if detected, null otherwise
 */
function analyzeEvents(events) {
  if (!events || events.length === 0) {
    return null
  }

  const now = Date.now()
  const stepCounts = {}
  const errorCounts = {}
  let detectedStep = null
  let struggleType = null

  for (const event of events) {
    const eventTime = new Date(event.timestamp).getTime()
    const ageMinutes = (now - eventTime) / (1000 * 60)

    // Count step views within time window
    if (
      event.action === 'step_viewed' &&
      ageMinutes <= STRUGGLE_PATTERNS.repeatedStepViews.timeWindowMinutes
    ) {
      const stepId = event.stepId || event.label
      stepCounts[stepId] = (stepCounts[stepId] || 0) + 1

      if (stepCounts[stepId] >= STRUGGLE_PATTERNS.repeatedStepViews.threshold) {
        detectedStep = stepId
        struggleType = 'repeated_views'
        break
      }
    }

    // Count errors within time window
    if (
      event.action === 'error' &&
      ageMinutes <= STRUGGLE_PATTERNS.repeatedErrors.timeWindowMinutes
    ) {
      const context = event.context || 'unknown'
      errorCounts[context] = (errorCounts[context] || 0) + 1

      if (errorCounts[context] >= STRUGGLE_PATTERNS.repeatedErrors.threshold) {
        detectedStep = context
        struggleType = 'repeated_errors'
        break
      }
    }

    // Check for high dwell time
    if (
      event.action === 'time_on_step' &&
      event.value >= STRUGGLE_PATTERNS.highDwellTime.thresholdSeconds
    ) {
      detectedStep = event.stepId || event.label
      struggleType = 'high_dwell_time'
      break
    }
  }

  if (!detectedStep) {
    return null
  }

  // Get help resources for detected step
  const helpConfig = HELP_RESOURCES[detectedStep] || HELP_RESOURCES.default

  return {
    detected: true,
    stepId: detectedStep,
    struggleType,
    ...helpConfig,
  }
}

async function handleEmailPreferences(req, res) {
  try {
    // Get authenticated user
    const { userId } = getAuth(req)

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await connectToDatabase()

    const user = await User.findOne({ clerkId: userId })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (req.method === 'GET') {
      // Return current preferences
      const preferences = user.emailPreferences || {
        onboarding: true,
        tips: true,
        product_updates: true,
        notifications: true,
      }

      return res.status(200).json({
        preferences,
        email: user.email,
      })
    }

    if (req.method === 'PUT') {
      const { preferences } = req.body

      if (!preferences || typeof preferences !== 'object') {
        return res.status(400).json({ error: 'preferences object is required' })
      }

      // Validate preference keys
      const validKeys = [
        'onboarding',
        'tips',
        'product_updates',
        'notifications',
        'all',
      ]
      const sanitizedPreferences = {}

      for (const [key, value] of Object.entries(preferences)) {
        if (validKeys.includes(key) && typeof value === 'boolean') {
          sanitizedPreferences[key] = value
        }
      }

      // If 'all' is false, set all preferences to false
      if (sanitizedPreferences.all === false) {
        sanitizedPreferences.onboarding = false
        sanitizedPreferences.tips = false
        sanitizedPreferences.product_updates = false
        // Keep notifications true for transactional
      }

      // Update user preferences
      await User.findByIdAndUpdate(user._id, {
        $set: {
          emailPreferences: {
            ...user.emailPreferences,
            ...sanitizedPreferences,
            updatedAt: new Date(),
          },
        },
      })

      console.log(
        `[EmailPreferences] Updated for ${user.email}:`,
        sanitizedPreferences
      )

      return res.status(200).json({
        success: true,
        preferences: {
          ...user.emailPreferences,
          ...sanitizedPreferences,
        },
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('[EmailPreferences] Error:', error)
    return res.status(500).json({
      error: error.message,
    })
  }
}

async function handleDetectStruggle(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId, events: eventsParam } = req.query

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    let events = []

    // For testing: accept events directly
    if (eventsParam) {
      try {
        events = JSON.parse(eventsParam)
      } catch {
        return res.status(400).json({ error: 'Invalid events JSON' })
      }
    } else {
      // In production: fetch from analytics database
      // For now, return no struggle if no events provided
      // TODO: Connect to real analytics backend
      events = []
    }

    // Analyze events for struggle patterns
    const struggleContext = analyzeEvents(events)

    if (struggleContext) {
      return res.status(200).json({
        struggle: true,
        context: struggleContext,
      })
    }

    return res.status(200).json({
      struggle: false,
      context: null,
    })
  } catch (error) {
    console.error('Error in detect-struggle:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default async function handler(req, res) {
  const action = getQueryValue(req.query.action)

  if (action === 'email-preferences') {
    return handleEmailPreferences(req, res)
  }

  if (action === 'detect-struggle') {
    return handleDetectStruggle(req, res)
  }

  return res.status(400).json({
    error: 'Invalid action',
    validActions: ['email-preferences', 'detect-struggle'],
  })
}
