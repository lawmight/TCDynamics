/**
 * Resend Email Client Utility
 * Singleton pattern for optimal performance (Research-recommended)
 * Sends notification emails for contact forms and demo requests
 */

import { Resend } from 'resend'

// Module-scope singleton (reused across invocations for performance)
let resendClient = null
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Escape HTML special characters to prevent XSS attacks
 * @param {*} text - Text to escape
 * @returns {string} Escaped HTML-safe string
 */
function escapeHtml(text) {
  if (text == null) return ''
  const str = String(text)
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  }
  return str.replace(/[&<>"'\/]/g, char => escapeMap[char])
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return EMAIL_REGEX.test(email)
}

/**
 * Get or create Resend client
 * @returns {Resend}
 */
export function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      throw new Error(
        'Resend configuration missing. Check RESEND_API_KEY environment variable.'
      )
    }

    resendClient = new Resend(apiKey)
  }

  return resendClient
}

/**
 * Generate HTML email template for contact form notification
 * @param {Object} contactData - Contact form data
 * @returns {string} HTML email content
 */
function generateContactEmailHTML(contactData) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 20px; }
    .field-label { font-weight: 600; color: #667eea; margin-bottom: 5px; }
    .field-value { background: white; padding: 12px; border-radius: 4px; border-left: 3px solid #667eea; }
    .message-box { background: white; padding: 15px; border-radius: 4px; border: 1px solid #e1e4e8; margin-top: 10px; white-space: pre-wrap; }
    .footer { text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 Nouveau message de contact</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">Nom</div>
        <div class="field-value">${escapeHtml(contactData.name)}</div>
      </div>

      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value"><a href="mailto:${escapeHtml(contactData.email)}">${escapeHtml(contactData.email)}</a></div>
      </div>

      ${
        contactData.phone
          ? `
      <div class="field">
        <div class="field-label">Téléphone</div>
        <div class="field-value">${escapeHtml(contactData.phone)}</div>
      </div>
      `
          : ''
      }

      ${
        contactData.company
          ? `
      <div class="field">
        <div class="field-label">Entreprise</div>
        <div class="field-value">${escapeHtml(contactData.company)}</div>
      </div>
      `
          : ''
      }

      <div class="field">
        <div class="field-label">Message</div>
        <div class="message-box">${escapeHtml(contactData.message)}</div>
      </div>

      <div class="footer">
        Reçu le ${new Date().toLocaleString('fr-FR')} via le formulaire de contact TCDynamics
      </div>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Generate HTML email template for demo request notification
 * @param {Object} demoData - Demo request data
 * @returns {string} HTML email content
 */
function generateDemoEmailHTML(demoData) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .badge { display: inline-block; background: rgba(255,255,255,0.3); padding: 5px 10px; border-radius: 4px; font-size: 12px; margin-top: 10px; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 20px; }
    .field-label { font-weight: 600; color: #f5576c; margin-bottom: 5px; }
    .field-value { background: white; padding: 12px; border-radius: 4px; border-left: 3px solid #f5576c; }
    .message-box { background: white; padding: 15px; border-radius: 4px; border: 1px solid #e1e4e8; margin-top: 10px; white-space: pre-wrap; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 18px; font-weight: 600; margin-bottom: 15px; color: #f5576c; border-bottom: 2px solid #f5576c; padding-bottom: 10px; }
    .footer { text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Nouvelle demande de démonstration</h1>
      ${demoData.timeline ? `<span class="badge">Timeline: ${escapeHtml(demoData.timeline)}</span>` : ''}
    </div>
    <div class="content">
      <div class="section">
        <div class="section-title">Informations de contact</div>

        <div class="field">
          <div class="field-label">Nom</div>
          <div class="field-value">${escapeHtml(demoData.name)}</div>
        </div>

        <div class="field">
          <div class="field-label">Email</div>
          <div class="field-value"><a href="mailto:${escapeHtml(demoData.email)}">${escapeHtml(demoData.email)}</a></div>
        </div>

        ${
          demoData.phone
            ? `
        <div class="field">
          <div class="field-label">Téléphone</div>
          <div class="field-value">${escapeHtml(demoData.phone)}</div>
        </div>
        `
            : ''
        }

        ${
          demoData.jobTitle
            ? `
        <div class="field">
          <div class="field-label">Fonction</div>
          <div class="field-value">${escapeHtml(demoData.jobTitle)}</div>
        </div>
        `
            : ''
        }
      </div>

      <div class="section">
        <div class="section-title">Informations sur l'entreprise</div>

        <div class="field">
          <div class="field-label">Entreprise</div>
          <div class="field-value">${escapeHtml(demoData.company)}</div>
        </div>

        ${
          demoData.companySize
            ? `
        <div class="field">
          <div class="field-label">Taille de l'entreprise</div>
          <div class="field-value">${escapeHtml(demoData.companySize)}</div>
        </div>
        `
            : ''
        }

        ${
          demoData.industry
            ? `
        <div class="field">
          <div class="field-label">Secteur d'activité</div>
          <div class="field-value">${escapeHtml(demoData.industry)}</div>
        </div>
        `
            : ''
        }
      </div>

      <div class="section">
        <div class="section-title">Besoins et contexte</div>

        <div class="field">
          <div class="field-label">Besoins métier</div>
          <div class="message-box">${escapeHtml(demoData.businessNeeds)}</div>
        </div>

        ${
          demoData.useCase
            ? `
        <div class="field">
          <div class="field-label">Cas d'usage</div>
          <div class="field-value">${escapeHtml(demoData.useCase)}</div>
        </div>
        `
            : ''
        }

        ${
          demoData.timeline
            ? `
        <div class="field">
          <div class="field-label">Timeline</div>
          <div class="field-value">${escapeHtml(demoData.timeline)}</div>
        </div>
        `
            : ''
        }

        ${
          demoData.preferredDate
            ? `
        <div class="field">
          <div class="field-label">Date préférée</div>
          <div class="field-value">${new Date(demoData.preferredDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        `
            : ''
        }

        ${
          demoData.message
            ? `
        <div class="field">
          <div class="field-label">Message additionnel</div>
          <div class="message-box">${escapeHtml(demoData.message)}</div>
        </div>
        `
            : ''
        }
      </div>

      <div class="footer">
        Reçu le ${new Date().toLocaleString('fr-FR')} via le formulaire de demande de démonstration TCDynamics
      </div>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Send contact form notification email
 * @param {Object} contactData - Contact form data
 * @param {string} contactData.name - Contact name
 * @param {string} contactData.email - Contact email
 * @param {string} contactData.message - Contact message
 * @param {string} [contactData.phone] - Contact phone (optional)
 * @param {string} [contactData.company] - Contact company (optional)
 * @returns {Promise<{success: boolean, emailId?: string, error?: string}>}
 */
export async function sendContactNotification(contactData) {
  try {
    console.log('[Email] Starting sendContactNotification...')

    const resend = getResendClient()
    const toEmail = process.env.CONTACT_EMAIL?.trim()
    if (!toEmail) {
      console.error('[Email] No CONTACT_EMAIL environment variable found!')
      return { success: false, error: 'Missing contact email configuration' }
    }
    if (!isValidEmail(toEmail)) {
      console.error('[Email] CONTACT_EMAIL has invalid format:', toEmail)
      return { success: false, error: 'Invalid contact email configuration' }
    }
    console.log('[Email] Sending to:', toEmail)

    const result = await resend.emails.send({
      from: 'TCDynamics <contact@tcdynamics.fr>',
      to: [toEmail],
      replyTo: contactData.email,
      subject: `Nouveau message de ${escapeHtml(contactData.name)}${contactData.company ? ` (${escapeHtml(contactData.company)})` : ''}`,
      html: generateContactEmailHTML(contactData),
      text: `
Nouveau message de contact

Nom: ${contactData.name}
Email: ${contactData.email}
${contactData.phone ? `Téléphone: ${contactData.phone}` : ''}
${contactData.company ? `Entreprise: ${contactData.company}` : ''}

Message:
${contactData.message}

---
Reçu le ${new Date().toLocaleString('fr-FR')} via le formulaire de contact TCDynamics
      `.trim(),
    })

    console.log('[Email] Send result:', JSON.stringify(result))
    const emailId = result.data?.id || result.id
    console.log('[Email] Email ID:', emailId)

    return { success: true, emailId }
  } catch (error) {
    console.error('[Email] Send contact notification error:', error)
    console.error('[Email] Error details:', JSON.stringify(error, null, 2))
    return { success: false, error: error.message }
  }
}

/**
 * Send demo request notification email
 * @param {Object} demoData - Demo request data
 * @param {string} demoData.name - Requester name
 * @param {string} demoData.email - Requester email
 * @param {string} demoData.company - Company name (required)
 * @param {string} demoData.businessNeeds - Business needs description (required)
 * @param {string} [demoData.phone] - Phone number (optional)
 * @param {string} [demoData.jobTitle] - Job title (optional)
 * @param {string} [demoData.companySize] - Company size (optional)
 * @param {string} [demoData.industry] - Industry (optional)
 * @param {string} [demoData.useCase] - Use case (optional)
 * @param {string} [demoData.timeline] - Timeline (optional)
 * @param {string} [demoData.message] - Additional message (optional)
 * @param {string} [demoData.preferredDate] - Preferred demo date (optional)
 * @returns {Promise<{success: boolean, emailId?: string, error?: string}>}
 */
export async function sendDemoNotification(demoData) {
  try {
    const resend = getResendClient()
    const toEmail = (
      process.env.DEMO_EMAIL || process.env.CONTACT_EMAIL
    )?.trim()
    if (!toEmail) {
      console.error(
        '[Email] No DEMO_EMAIL or CONTACT_EMAIL environment variable found!'
      )
      return { success: false, error: 'Missing demo email configuration' }
    }
    if (!isValidEmail(toEmail)) {
      console.error(
        '[Email] DEMO_EMAIL/CONTACT_EMAIL has invalid format:',
        toEmail
      )
      return { success: false, error: 'Invalid demo email configuration' }
    }

    const result = await resend.emails.send({
      from: 'TCDynamics <contact@tcdynamics.fr>',
      to: [toEmail],
      replyTo: demoData.email,
      subject: `Demande de démo: ${escapeHtml(demoData.company)}${demoData.timeline ? ` (${escapeHtml(demoData.timeline)})` : ''}`,
      html: generateDemoEmailHTML(demoData),
      text: `
Nouvelle demande de démonstration

=== INFORMATIONS DE CONTACT ===
Nom: ${demoData.name}
Email: ${demoData.email}
${demoData.phone ? `Téléphone: ${demoData.phone}` : ''}
${demoData.jobTitle ? `Fonction: ${demoData.jobTitle}` : ''}

=== INFORMATIONS SUR L'ENTREPRISE ===
Entreprise: ${demoData.company}
${demoData.companySize ? `Taille: ${demoData.companySize}` : ''}
${demoData.industry ? `Secteur: ${demoData.industry}` : ''}

=== BESOINS ET CONTEXTE ===
Besoins métier:
${demoData.businessNeeds}

${demoData.useCase ? `Cas d'usage: ${demoData.useCase}` : ''}
${demoData.timeline ? `Timeline: ${demoData.timeline}` : ''}
${demoData.preferredDate ? `Date préférée: ${new Date(demoData.preferredDate).toLocaleDateString('fr-FR')}` : ''}

${demoData.message ? `Message additionnel:\n${demoData.message}` : ''}

---
Reçu le ${new Date().toLocaleString('fr-FR')} via le formulaire de demande de démonstration TCDynamics
      `.trim(),
    })

    console.log('[Email] Send result:', JSON.stringify(result))
    const emailId = result.data?.id || result.id
    console.log('[Email] Email ID:', emailId)

    return { success: true, emailId }
  } catch (error) {
    console.error('Send demo notification error:', error)
    return { success: false, error: error.message }
  }
}

export default {
  getResendClient,
  sendContactNotification,
  sendDemoNotification,
}
