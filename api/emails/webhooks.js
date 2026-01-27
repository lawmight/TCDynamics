/**
 * Resend Webhooks Handler
 * Tracks email opens, clicks, bounces, and spam complaints
 * Configure webhook URL in Resend dashboard: /api/emails/webhooks
 */

import crypto from 'crypto'
import { User } from '../_lib/models/User.js'
import { connectToDatabase } from '../_lib/mongodb.js'

/**
 * Verify Resend webhook signature
 */
function verifyWebhookSignature(payload, signature, secret) {
  if (!secret) return true // Skip verification if no secret configured

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

/**
 * POST /api/emails/webhooks
 * Resend webhook events:
 * - email.sent
 * - email.delivered
 * - email.opened
 * - email.clicked
 * - email.bounced
 * - email.complained
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const signature = req.headers['resend-signature']
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

    // Verify signature if secret is configured
    if (webhookSecret && signature) {
      const payload = JSON.stringify(req.body)
      if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
        console.error('[Webhook] Invalid signature')
        return res.status(401).json({ error: 'Invalid signature' })
      }
    }

    const { type, data } = req.body

    if (!type || !data) {
      return res.status(400).json({ error: 'Invalid webhook payload' })
    }

    await connectToDatabase()

    const { email_id, to, created_at } = data
    const recipientEmail = Array.isArray(to) ? to[0] : to

    // Find user by email
    const user = await User.findOne({ email: recipientEmail?.toLowerCase() })

    if (!user) {
      console.log(`[Webhook] User not found for email: ${recipientEmail}`)
      return res.status(200).json({ received: true, userFound: false })
    }

    // Update email log with event
    const eventData = {
      type,
      emailId: email_id,
      timestamp: new Date(created_at),
    }

    // Add event-specific data
    if (type === 'email.clicked' && data.link) {
      eventData.link = data.link
    }
    if (type === 'email.bounced') {
      eventData.bounceType = data.bounce_type
    }
    if (type === 'email.complained') {
      eventData.complaintType = data.complaint_type
    }

    // Update user document
    const update = {
      $push: {
        emailEvents: eventData,
      },
    }

    // Handle specific event types
    switch (type) {
      case 'email.bounced':
        // Mark email as bounced
        update.$set = {
          'emailHealth.lastBounce': new Date(),
          'emailHealth.bounceCount': (user.emailHealth?.bounceCount || 0) + 1,
        }
        // Auto-unsubscribe after 3 bounces
        if ((user.emailHealth?.bounceCount || 0) >= 2) {
          update.$set['emailPreferences.all'] = false
          console.log(
            `[Webhook] Auto-unsubscribed ${recipientEmail} after 3 bounces`
          )
        }
        break

      case 'email.complained':
        // Immediately unsubscribe on spam complaint
        update.$set = {
          'emailPreferences.all': false,
          'emailHealth.spamComplaint': true,
          'emailHealth.lastComplaint': new Date(),
        }
        console.log(
          `[Webhook] User ${recipientEmail} reported spam - unsubscribed`
        )
        break

      case 'email.opened':
        // Track engagement
        update.$set = {
          'emailHealth.lastOpened': new Date(),
        }
        update.$inc = { 'emailHealth.openCount': 1 }
        break

      case 'email.clicked':
        // Track engagement
        update.$set = {
          'emailHealth.lastClicked': new Date(),
        }
        update.$inc = { 'emailHealth.clickCount': 1 }
        break
    }

    await User.findByIdAndUpdate(user._id, update)

    console.log(`[Webhook] Processed ${type} for ${recipientEmail}`)

    return res.status(200).json({
      received: true,
      type,
      email: recipientEmail,
    })
  } catch (error) {
    console.error('[Webhook] Processing error:', error)
    return res.status(500).json({
      error: error.message,
    })
  }
}
