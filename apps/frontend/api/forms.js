import { sendContactNotification, sendDemoNotification } from './_lib/email.js'
import { withGuards } from './_lib/request-guards.js'
import { withSentry } from './_lib/sentry.js'
import { saveContact, saveDemoRequest } from './_lib/supabase.js'

// Disable Vercel's automatic body parsing - we handle size + JSON manually
export const config = {
  api: {
    bodyParser: false,
  },
}

async function handler(req, res, body) {
  try {
    const { formType } = body
    const requestId = req.requestId

    // Route to appropriate handler based on formType
    if (formType === 'demo' || formType === 'demoRequest') {
      return await handleDemoForm(req, res, body, requestId)
    } else {
      // Default to contact form
      return await handleContactForm(req, res, body, requestId)
    }
  } catch (error) {
    console.error('Form submission error:', { requestId: req.requestId, error })
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message,
      requestId: req.requestId,
    })
  }
}

async function handleContactForm(req, res, body, requestId) {
  const { name, email, message, phone, company } = body

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

  // Send email notification
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
  }

  res.status(200).json({
    success: true,
    message: 'Message envoyé avec succès',
    messageId: result.id,
    emailSent: emailResult.success,
    emailId: emailResult.emailId,
    requestId,
  })
}

async function handleDemoForm(req, res, body, requestId) {
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

  // Validate required fields
  if (!name || !email || !company || !businessNeeds) {
    return res.status(400).json({
      error: 'Champs requis manquants',
      message:
        'Veuillez remplir tous les champs obligatoires : nom, email, entreprise et besoins spécifiques.',
      required: ['name', 'email', 'company', 'businessNeeds'],
    })
  }

  if (typeof businessNeeds !== 'string') {
    return res.status(400).json({
      error: 'Invalid field type',
      message:
        'Le champ "Besoins spécifiques" doit être une chaîne de caractères.',
    })
  }

  const sanitizedBusinessNeeds = businessNeeds.trim()
  // Validate businessNeeds length (10-5000 characters)
  if (
    sanitizedBusinessNeeds.length < 10 ||
    sanitizedBusinessNeeds.length > 5000
  ) {
    return res.status(400).json({
      error: 'Validation error',
      message:
        'Le champ "Besoins spécifiques" doit contenir entre 10 et 5000 caractères.',
    })
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (typeof email !== 'string') {
    return res.status(400).json({
      error: 'Invalid email format',
      message: "L'email doit être une chaîne de caractères.",
    })
  }
  const sanitizedEmail = email.trim()
  if (!emailRegex.test(sanitizedEmail)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }

  console.log('New demo request:', {
    requestId,
    name,
  })

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
    preferredDate,
  })

  if (!result.success) {
    console.error('Failed to save demo request:', {
      requestId,
      error: result.error,
    })
    return res.status(500).json({
      error: 'Failed to save demo request',
      details: result.error,
    })
  }

  // Send email notification
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
    message,
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
  }

  res.status(200).json({
    success: true,
    message: 'Demande de démonstration envoyée',
    messageId: result.id,
    emailSent: emailResult.success,
    emailId: emailResult.emailId,
    requestId,
  })
}

// Combined allowed fields for both forms
export default withSentry(
  withGuards(handler, {
    allowedMethods: ['POST'],
    allowedFields: [
      'formType', // 'contact' or 'demo'
      'name',
      'email',
      'message',
      'phone',
      'company',
      'businessNeeds',
      'jobTitle',
      'companySize',
      'industry',
      'useCase',
      'timeline',
      'preferredDate',
      'captchaToken',
    ],
    requireCaptcha: true,
    rateLimit: {
      limit: 5,
      windowMs: 15 * 60 * 1000,
      scope: 'forms', // Combined scope
    },
    maxBodyBytes: 64 * 1024,
  })
)
