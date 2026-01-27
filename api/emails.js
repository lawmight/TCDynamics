/**
 * Consolidated Email API
 * Handles cron jobs, sending, segments, and triggers in one function
 */

import { getResendClient } from './_lib/email.js'
import { User } from './_lib/models/User.js'
import { connectToDatabase } from './_lib/mongodb.js'

// Import templates
import tipsTemplate from './emails/templates/advanced-tips.js'
import feedbackTemplate from './emails/templates/feedback-request.js'
import firstValueTemplate from './emails/templates/first-value.js'
import reminderTemplate from './emails/templates/onboarding-reminder.js'
import welcomeTemplate from './emails/templates/welcome.js'

// Template registry
const TEMPLATES = {
  welcome: welcomeTemplate,
  'onboarding-reminder': reminderTemplate,
  'first-value': firstValueTemplate,
  'advanced-tips': tipsTemplate,
  'feedback-request': feedbackTemplate,
}

/**
 * Segment definitions
 */
const SEGMENTS = {
  // Persona-based segments
  personas: [
    'marketing',
    'sales',
    'finance',
    'hr',
    'operations',
    'legal',
    'other',
  ],

  // Industry segments
  industries: [
    'tech',
    'retail',
    'services',
    'manufacturing',
    'healthcare',
    'finance',
    'other',
  ],

  // Onboarding status
  onboardingStatus: ['not_started', 'in_progress', 'completed'],

  // Activation status
  activationStatus: ['not_activated', 'activated', 'power_user'],
}

function getQueryValue(value) {
  if (Array.isArray(value)) return value[0]
  return value
}

/**
 * Determine user's persona based on profile data
 */
function getPersona(user) {
  const title = (user.jobTitle || '').toLowerCase()
  const company = (user.company || '').toLowerCase()

  if (
    title.includes('market') ||
    title.includes('brand') ||
    title.includes('growth')
  ) {
    return 'marketing'
  }
  if (
    title.includes('sale') ||
    title.includes('account') ||
    title.includes('business dev')
  ) {
    return 'sales'
  }
  if (
    title.includes('finan') ||
    title.includes('account') ||
    title.includes('cfo')
  ) {
    return 'finance'
  }
  if (
    title.includes('hr') ||
    title.includes('human') ||
    title.includes('people')
  ) {
    return 'hr'
  }
  if (
    title.includes('operation') ||
    title.includes('ops') ||
    title.includes('coo')
  ) {
    return 'operations'
  }
  if (
    title.includes('legal') ||
    title.includes('counsel') ||
    title.includes('compliance')
  ) {
    return 'legal'
  }
  return 'other'
}

/**
 * Determine user's onboarding status
 */
function getOnboardingStatus(user) {
  if (user.onboarding?.completed) return 'completed'
  if (user.onboarding?.currentStep > 0) return 'in_progress'
  return 'not_started'
}

/**
 * Determine user's activation status
 */
function getActivationStatus(user) {
  const workflowCount = user.workflowCount || 0
  if (workflowCount >= 5) return 'power_user'
  if (workflowCount >= 1 || user.firstWorkflowCreatedAt) return 'activated'
  return 'not_activated'
}

/**
 * Get all segments for a user
 */
function getUserSegments(user) {
  return {
    persona: getPersona(user),
    industry: user.industry || 'other',
    onboardingStatus: getOnboardingStatus(user),
    activationStatus: getActivationStatus(user),
    plan: user.plan || 'starter',
    daysSinceSignup: Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    ),
  }
}

/**
 * Query users by segment criteria
 */
async function getUsersBySegment(criteria) {
  await connectToDatabase()

  const query = { deletedAt: { $exists: false } }

  if (criteria.onboardingStatus) {
    switch (criteria.onboardingStatus) {
      case 'completed':
        query['onboarding.completed'] = true
        break
      case 'in_progress':
        query['onboarding.completed'] = { $ne: true }
        query['onboarding.currentStep'] = { $gt: 0 }
        break
      case 'not_started':
        query['onboarding.currentStep'] = { $in: [0, null, undefined] }
        query['onboarding.completed'] = { $ne: true }
        break
    }
  }

  if (criteria.activationStatus) {
    switch (criteria.activationStatus) {
      case 'power_user':
        query.workflowCount = { $gte: 5 }
        break
      case 'activated':
        query.$or = [
          { workflowCount: { $gte: 1 } },
          { firstWorkflowCreatedAt: { $exists: true } },
        ]
        break
      case 'not_activated':
        query.firstWorkflowCreatedAt = { $exists: false }
        query.workflowCount = { $in: [0, null, undefined] }
        break
    }
  }

  if (criteria.plan) {
    query.plan = criteria.plan
  }

  if (criteria.signupDateRange) {
    query.createdAt = {
      $gte: new Date(criteria.signupDateRange.start),
      $lte: new Date(criteria.signupDateRange.end),
    }
  }

  return User.find(query).limit(criteria.limit || 100)
}

async function runOnboardingStalled({ dryRun }) {
  await connectToDatabase()

  // Find users who:
  // 1. Were created 3 days ago (±12 hours window)
  // 2. Haven't completed onboarding
  // 3. Haven't received this email yet
  // 4. Haven't opted out of onboarding emails
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const windowStart = new Date(threeDaysAgo.getTime() - 12 * 60 * 60 * 1000)
  const windowEnd = new Date(threeDaysAgo.getTime() + 12 * 60 * 60 * 1000)

  const eligibleUsers = await User.find({
    createdAt: { $gte: windowStart, $lte: windowEnd },
    'onboarding.completed': { $ne: true },
    'emailHistory.reminderSentAt': { $exists: false },
    'emailPreferences.onboarding': { $ne: false },
    deletedAt: { $exists: false },
  }).limit(100)

  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      eligibleCount: eligibleUsers.length,
      users: eligibleUsers.map(u => ({
        email: u.email,
        createdAt: u.createdAt,
        firstName: u.firstName,
      })),
    }
  }

  const results = []
  const resend = getResendClient()

  for (const user of eligibleUsers) {
    try {
      const data = { firstName: user.firstName || 'there' }
      const html = reminderTemplate.generateHTML(data)
      const text = reminderTemplate.generateText(data)

      const result = await resend.emails.send({
        from: 'TCDynamics <hello@tcdynamics.fr>',
        to: [user.email],
        subject: reminderTemplate.subject.replace(
          '{{firstName}}',
          data.firstName
        ),
        html,
        text,
        headers: {
          'X-Email-Template': 'onboarding-reminder',
          'X-Email-Trigger': 'stalled',
        },
      })

      // Update user document
      await User.findByIdAndUpdate(user._id, {
        $set: { 'emailHistory.reminderSentAt': new Date() },
        $push: {
          emailLog: {
            template: 'onboarding-reminder',
            sentAt: new Date(),
            emailId: result.data?.id || result.id,
          },
        },
      })

      results.push({ email: user.email, success: true })
    } catch (error) {
      console.error(
        `[Email] Failed to send reminder to ${user.email}:`,
        error
      )
      results.push({
        email: user.email,
        success: false,
        error: error.message,
      })
    }
  }

  console.log(
    `[Email] Sent ${results.filter(r => r.success).length}/${eligibleUsers.length} reminder emails`
  )

  return {
    success: true,
    sent: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  }
}

async function runWeeklyTips({ dryRun }) {
  await connectToDatabase()

  // Find users who:
  // 1. Were created 7 days ago (±12 hours window)
  // 2. Have completed onboarding OR have activated a workflow
  // 3. Haven't received tips email yet
  // 4. Haven't opted out of tips emails
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const windowStart = new Date(sevenDaysAgo.getTime() - 12 * 60 * 60 * 1000)
  const windowEnd = new Date(sevenDaysAgo.getTime() + 12 * 60 * 60 * 1000)

  const eligibleUsers = await User.find({
    createdAt: { $gte: windowStart, $lte: windowEnd },
    $or: [
      { 'onboarding.completed': true },
      { firstWorkflowCreatedAt: { $exists: true } },
    ],
    'emailHistory.tipsSentAt': { $exists: false },
    'emailPreferences.tips': { $ne: false },
    deletedAt: { $exists: false },
  }).limit(100)

  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      eligibleCount: eligibleUsers.length,
      users: eligibleUsers.map(u => ({
        email: u.email,
        createdAt: u.createdAt,
        firstName: u.firstName,
      })),
    }
  }

  const results = []
  const resend = getResendClient()

  for (const user of eligibleUsers) {
    try {
      const data = { firstName: user.firstName || 'there' }
      const html = tipsTemplate.generateHTML(data)
      const text = tipsTemplate.generateText(data)

      const result = await resend.emails.send({
        from: 'TCDynamics <tips@tcdynamics.fr>',
        to: [user.email],
        subject: tipsTemplate.subject.replace('{{firstName}}', data.firstName),
        html,
        text,
        headers: {
          'X-Email-Template': 'advanced-tips',
          'X-Email-Trigger': 'weekly-tips',
        },
      })

      await User.findByIdAndUpdate(user._id, {
        $set: { 'emailHistory.tipsSentAt': new Date() },
        $push: {
          emailLog: {
            template: 'advanced-tips',
            sentAt: new Date(),
            emailId: result.data?.id || result.id,
          },
        },
      })

      results.push({ email: user.email, success: true })
    } catch (error) {
      console.error(`[Email] Failed to send tips to ${user.email}:`, error)
      results.push({
        email: user.email,
        success: false,
        error: error.message,
      })
    }
  }

  console.log(
    `[Email] Sent ${results.filter(r => r.success).length}/${eligibleUsers.length} tips emails`
  )

  return {
    success: true,
    sent: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  }
}

async function handleCron(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify cron secret to prevent unauthorized access
  // Vercel automatically adds Authorization header for cron jobs
  const authHeader = req.headers.authorization
  const cronSecret = req.headers['x-cron-secret'] || req.query.secret

  // Accept either Vercel's CRON_SECRET or custom header
  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    cronSecret !== process.env.CRON_SECRET
  ) {
    // Allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const job = getQueryValue(req.query.job)

  try {
    let description
    let result

    switch (job) {
      case 'reminders':
        description =
          'Day 3 reminder emails for users with incomplete onboarding'
        result = await runOnboardingStalled({ dryRun: false })
        break
      case 'tips':
        description = 'Day 7 tips emails for activated users'
        result = await runWeeklyTips({ dryRun: false })
        break
      case 'feedback':
        // Feedback emails would need a trigger - for now return info
        return res.status(200).json({
          success: true,
          job: 'feedback',
          description: 'Day 14 NPS feedback request',
          note: 'Feedback trigger not yet implemented - pending User model schema update',
        })
      default:
        return res.status(400).json({
          error: 'Invalid job type',
          availableJobs: ['reminders', 'tips', 'feedback'],
        })
    }

    console.log(`[Cron] Job '${job}' completed:`, result)

    return res.status(200).json({
      success: true,
      job,
      description,
      result,
    })
  } catch (error) {
    console.error(`[Cron] Job '${job}' failed:`, error)
    return res.status(500).json({
      success: false,
      job,
      error: error.message,
    })
  }
}

async function handleSend(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { template, to, data = {} } = req.body

    // Validate required fields
    if (!template) {
      return res.status(400).json({ error: 'template is required' })
    }

    if (!to) {
      return res.status(400).json({ error: 'to (email address) is required' })
    }

    // Validate template exists
    const templateConfig = TEMPLATES[template]
    if (!templateConfig) {
      return res.status(400).json({
        error: `Invalid template: ${template}`,
        availableTemplates: Object.keys(TEMPLATES),
      })
    }

    // Generate email content
    const html = templateConfig.generateHTML(data)
    const text = templateConfig.generateText(data)

    // Process subject with template variables
    let subject = templateConfig.subject
    if (data.firstName) {
      subject = subject.replace('{{firstName}}', data.firstName)
    }

    // Get Resend client
    const resend = getResendClient()

    // Send email
    const result = await resend.emails.send({
      from: 'TCDynamics <notifications@tcdynamics.fr>',
      to: [to],
      subject,
      html,
      text,
      headers: {
        'X-Email-Template': template,
        'X-Email-Sequence': 'engagement',
      },
    })

    console.log(`[Email] Sent ${template} email to ${to}:`, result)

    return res.status(200).json({
      success: true,
      emailId: result.data?.id || result.id,
      template,
    })
  } catch (error) {
    console.error('[Email] Send engagement email error:', error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

async function handleSegments(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      segments: SEGMENTS,
    })
  }

  if (req.method === 'POST') {
    try {
      const criteria = req.body
      const users = await getUsersBySegment(criteria)

      return res.status(200).json({
        count: users.length,
        users: users.map(u => ({
          id: u._id,
          email: u.email,
          firstName: u.firstName,
          segments: getUserSegments(u),
        })),
      })
    } catch (error) {
      console.error('[Segments] Query error:', error)
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

async function handleTriggerSignup(req, res, body) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId, email, firstName = 'there' } = body || {}

    if (!email) {
      return res.status(400).json({ error: 'email is required' })
    }

    await connectToDatabase()

    // Check if user has opted in to onboarding emails
    const user = await User.findOne({ clerkId: userId })
    if (user?.emailPreferences?.onboarding === false) {
      console.log(`[Email] Skipping welcome email - user opted out: ${email}`)
      return res
        .status(200)
        .json({ success: true, skipped: true, reason: 'user_opted_out' })
    }

    // Generate email content
    const html = welcomeTemplate.generateHTML({ firstName })
    const text = welcomeTemplate.generateText({ firstName })

    // Send email via Resend
    const resend = getResendClient()
    const result = await resend.emails.send({
      from: 'TCDynamics <welcome@tcdynamics.fr>',
      to: [email],
      subject: welcomeTemplate.subject.replace('{{firstName}}', firstName),
      html,
      text,
      headers: {
        'X-Email-Template': 'welcome',
        'X-Email-Trigger': 'signup',
      },
    })

    // Record email sent in user document
    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $set: { 'emailHistory.welcomeSentAt': new Date() },
        $push: {
          emailLog: {
            template: 'welcome',
            sentAt: new Date(),
            emailId: result.data?.id || result.id,
          },
        },
      }
    )

    console.log(`[Email] Sent welcome email to ${email}:`, result)

    return res.status(200).json({
      success: true,
      emailId: result.data?.id || result.id,
    })
  } catch (error) {
    console.error('[Email] Signup trigger error:', error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

async function handleTriggerFirstValue(req, res, body) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId, workflowName } = body || {}

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    await connectToDatabase()

    // Find user by clerkId or _id
    const user = await User.findOne({
      $or: [{ clerkId: userId }, { _id: userId }],
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if already sent
    if (user.emailHistory?.firstValueSentAt) {
      return res.status(200).json({
        success: true,
        skipped: true,
        reason: 'already_sent',
      })
    }

    // Check email preferences
    if (user.emailPreferences?.onboarding === false) {
      return res.status(200).json({
        success: true,
        skipped: true,
        reason: 'user_opted_out',
      })
    }

    // Generate and send email
    const data = {
      firstName: user.firstName || 'there',
      workflowName: workflowName || 'votre nouveau workflow',
    }
    const html = firstValueTemplate.generateHTML(data)
    const text = firstValueTemplate.generateText(data)

    const resend = getResendClient()
    const result = await resend.emails.send({
      from: 'TCDynamics <hello@tcdynamics.fr>',
      to: [user.email],
      subject: firstValueTemplate.subject.replace(
        '{{firstName}}',
        data.firstName
      ),
      html,
      text,
      headers: {
        'X-Email-Template': 'first-value',
        'X-Email-Trigger': 'workflow_activated',
      },
    })

    // Update user document
    await User.findByIdAndUpdate(user._id, {
      $set: { 'emailHistory.firstValueSentAt': new Date() },
      $push: {
        emailLog: {
          template: 'first-value',
          sentAt: new Date(),
          emailId: result.data?.id || result.id,
          metadata: { workflowName },
        },
      },
    })

    console.log(`[Email] Sent first-value email to ${user.email}:`, result)

    return res.status(200).json({
      success: true,
      emailId: result.data?.id || result.id,
    })
  } catch (error) {
    console.error('[Email] First value trigger error:', error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

async function handleTriggerOnboardingStalled(req, res, body) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { dryRun = false } = body || {}
    const result = await runOnboardingStalled({ dryRun })
    return res.status(200).json(result)
  } catch (error) {
    console.error('[Email] Onboarding stalled trigger error:', error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

async function handleTriggerWeeklyTips(req, res, body) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { dryRun = false } = body || {}
    const result = await runWeeklyTips({ dryRun })
    return res.status(200).json(result)
  } catch (error) {
    console.error('[Email] Weekly tips trigger error:', error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

async function handleTrigger(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body || {}
  const type = getQueryValue(req.query.type) || body.type

  if (!type) {
    return res.status(400).json({
      error: 'Trigger type is required',
      validTypes: ['signup', 'onboarding-stalled', 'first-value', 'weekly-tips'],
    })
  }

  if (type === 'signup') {
    return handleTriggerSignup(req, res, body)
  }
  if (type === 'onboarding-stalled') {
    return handleTriggerOnboardingStalled(req, res, body)
  }
  if (type === 'first-value') {
    return handleTriggerFirstValue(req, res, body)
  }
  if (type === 'weekly-tips') {
    return handleTriggerWeeklyTips(req, res, body)
  }

  return res.status(400).json({
    error: 'Invalid trigger type',
    validTypes: ['signup', 'onboarding-stalled', 'first-value', 'weekly-tips'],
  })
}

export default async function handler(req, res) {
  const action = getQueryValue(req.query.action)

  if (!action) {
    return res.status(400).json({
      error: 'Action missing',
      validActions: ['cron', 'send', 'segments', 'trigger'],
    })
  }

  if (action === 'cron') {
    return handleCron(req, res)
  }
  if (action === 'send') {
    return handleSend(req, res)
  }
  if (action === 'segments') {
    return handleSegments(req, res)
  }
  if (action === 'trigger') {
    return handleTrigger(req, res)
  }

  return res.status(400).json({
    error: 'Invalid action',
    validActions: ['cron', 'send', 'segments', 'trigger'],
  })
}
