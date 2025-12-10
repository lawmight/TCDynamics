import { saveContact } from './_lib/supabase.js'
import { sendContactNotification } from './_lib/email.js'
import { withGuards } from './_lib/request-guards.js'
import { withSentry } from './_lib/sentry.js'

// Disable Vercel's automatic body parsing - we handle size + JSON manually
export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res, body) {
  try {
    const { name, email, message, phone, company } = body
    const requestId = req.requestId

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Champs requis manquants',
        message:
          'Veuillez remplir tous les champs obligatoires : nom, email et message.',
        required: ['name', 'email', 'message'],
      })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (typeof email !== 'string') {
      return res.status(400).json({
        error: 'Format email invalide',
        message: "L'email doit être une chaîne de caractères.",
      })
    }
    const sanitizedEmail = email.trim()
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({
        error: 'Format email invalide',
        message: 'Veuillez entrer une adresse email valide.',
      })
    }

    // Validate message length (per schema: 10-5000 characters)
    if (typeof message !== 'string') {
      return res.status(400).json({
        error: 'Longueur du message invalide',
        message: 'Le message doit être une chaîne de caractères.',
      })
    }
    const sanitizedMessage = message.trim()
    if (sanitizedMessage.length < 10 || sanitizedMessage.length > 5000) {
      return res.status(400).json({
        error: 'Longueur du message invalide',
        message: 'Le message doit contenir entre 10 et 5000 caractères.',
      })
    }

    console.log('New contact form submission:', {
      requestId,
      name,
      email: sanitizedEmail,
    })

    // Save to Supabase
    const result = await saveContact({
      name,
      email: sanitizedEmail,
      message: sanitizedMessage,
      phone,
      company,
      source: 'website',
    })

    if (!result.success) {
      console.error('Failed to save contact:', { requestId, error: result.error })
      return res.status(500).json({
        error: 'Failed to save contact',
        details: result.error,
      })
    }

    // Send email notification using shared utility function
    const emailResult = await sendContactNotification({
      name,
      email: sanitizedEmail,
      message: sanitizedMessage,
      phone,
      company,
    })

    if (emailResult.success) {
      console.log('Contact email sent successfully:', emailResult.emailId)
    } else {
      console.error('Failed to send email notification:', {
        requestId,
        error: emailResult.error,
      })
      // Don't fail the request if email fails - data is already saved
    }

    res.status(200).json({
      success: true,
      message: 'Message envoyé avec succès',
      messageId: result.id,
      emailSent: emailResult.success,
      emailId: emailResult.emailId,
      requestId,
    })
  } catch (error) {
    console.error('Contact form error:', { requestId: req.requestId, error })
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message,
      requestId: req.requestId,
    })
  }
}

export default withSentry(withGuards(handler, {
  allowedMethods: ['POST'],
  allowedFields: ['name', 'email', 'message', 'phone', 'company', 'captchaToken'],
  requireCaptcha: true,
  rateLimit: {
    limit: 5,
    windowMs: 15 * 60 * 1000,
    scope: 'contact',
  },
  maxBodyBytes: 64 * 1024,
}))
