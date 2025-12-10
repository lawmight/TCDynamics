import { saveDemoRequest } from './_lib/supabase.js'
import { sendDemoNotification } from './_lib/email.js'
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
    const {
      name,
      email,
      company,
      businessNeeds,
      phone,
      jobTitle,
      companySize,
      industry,
      useCase,
      timeline,
      message,
      preferredDate,
    } = body
    const requestId = req.requestId

    // Validate required fields
    if (!name || !email || !company || !businessNeeds) {
      return res.status(400).json({
        error: 'Champs requis manquants',
        message: 'Veuillez remplir tous les champs obligatoires : nom, email, entreprise et besoins spécifiques.',
        required: ['name', 'email', 'company', 'businessNeeds']
      })
    }

    if (typeof businessNeeds !== 'string') {
      return res.status(400).json({
        error: 'Invalid field type',
        message: 'Le champ "Besoins spécifiques" doit être une chaîne de caractères.'
      })
    }

    const sanitizedBusinessNeeds = businessNeeds.trim()
    // Validate businessNeeds length (10-5000 characters)
    if (sanitizedBusinessNeeds.length < 10 || sanitizedBusinessNeeds.length > 5000) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Le champ "Besoins spécifiques" doit contenir entre 10 et 5000 caractères.'
      })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (typeof email !== 'string') {
      return res.status(400).json({
        error: 'Invalid email format',
        message: "L'email doit être une chaîne de caractères."
      })
    }
    const sanitizedEmail = email.trim()
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    console.log('New demo request:', { requestId, name, email: sanitizedEmail, company })

    // Save to Supabase
    const result = await saveDemoRequest({
      name,
      email: sanitizedEmail,
      company,
      businessNeeds: sanitizedBusinessNeeds,
      phone,
      jobTitle,
      companySize,
      industry,
      useCase,
      timeline,
      message,
      preferredDate
    })

    if (!result.success) {
      console.error('Failed to save demo request:', { requestId, error: result.error })
      return res.status(500).json({
        error: 'Failed to save demo request',
        details: result.error
      })
    }

    // Send email notification using shared utility function
    const emailResult = await sendDemoNotification({
      name,
      email: sanitizedEmail,
      phone,
      jobTitle,
      company,
      companySize,
      industry,
      businessNeeds: sanitizedBusinessNeeds,
      useCase,
      timeline,
      preferredDate,
      message
    })

    if (emailResult.success) {
      console.log('Demo email sent successfully:', {
        requestId,
        emailId: emailResult.emailId,
      })
    } else {
      console.error('Failed to send email notification:', {
        requestId,
        error: emailResult.error,
      })
      // Don't fail the request if email fails - data is already saved
    }

    res.status(200).json({
      success: true,
      message: 'Demande de démonstration envoyée',
      messageId: result.id,
      emailSent: emailResult.success,
      emailId: emailResult.emailId,
      requestId,
    })

  } catch (error) {
    console.error('Demo form error:', { requestId: req.requestId, error })
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message,
      requestId: req.requestId,
    })
  }
}

export default withSentry(withGuards(handler, {
  allowedMethods: ['POST'],
  allowedFields: [
    'name',
    'email',
    'company',
    'businessNeeds',
    'phone',
    'jobTitle',
    'companySize',
    'industry',
    'useCase',
    'timeline',
    'message',
    'preferredDate',
    'captchaToken',
  ],
  requireCaptcha: true,
  rateLimit: {
    limit: 5,
    windowMs: 15 * 60 * 1000,
    scope: 'demo',
  },
  maxBodyBytes: 64 * 1024,
}))
