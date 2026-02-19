import { sendContactNotification, sendDemoNotification } from './_lib/email.js'
import { saveContact, saveDemoRequest } from './_lib/mongodb-db.js'
import { withGuards } from './_lib/request-guards.js'
import { sanitizeString } from './_lib/sanitize.js'
import { withSentry } from './_lib/sentry.js'
import { validateFormData } from './_lib/validation.js'

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
    const msg = error?.message || ''
    const isMongoConfig =
      /MONGODB_URI|MongoDB configuration missing/i.test(msg) ||
      (error?.name === 'MongoServerSelectionError' && !process.env.MONGODB_URI)

    if (isMongoConfig) {
      console.warn('Form submission skipped: database not configured', {
        requestId: req.requestId,
      })
      return res.status(503).json({
        error: 'Service indisponible',
        message:
          'Base de données non configurée. Définissez MONGODB_URI dans .env pour le développement local.',
        requestId: req.requestId,
      })
    }

    console.error('Form submission error:', { requestId: req.requestId, error })
    res.status(500).json({
      error: 'Erreur serveur',
      message: msg || 'Une erreur inattendue est survenue',
      requestId: req.requestId,
    })
  }
}

export async function handleContactForm(req, res, body, requestId) {
  const { name, email, message, phone, company } = body

  const sanitized = {
    name: sanitizeString(name ?? ''),
    email: typeof email === 'string' ? sanitizeString(email).trim() : email,
    message: typeof message === 'string' ? sanitizeString(message).trim() : message,
    phone: sanitizeString(phone ?? ''),
    company: sanitizeString(company ?? ''),
  }

  const { valid, errors: validationErrors, warnings: validationWarnings } =
    validateFormData(sanitized, 'contact')

  if (!valid) {
    return res.status(400).json({
      error: 'Validation échouée',
      message: 'Certains champs contiennent des erreurs de validation.',
      errors: validationErrors,
      warnings:
        validationWarnings.length > 0 ? validationWarnings : undefined,
      requestId,
    })
  }

  console.log('New contact form submission:', {
    requestId,
    name: sanitized.name,
    email: sanitized.email,
  })

  // Save to MongoDB
  const result = await saveContact({
    name: sanitized.name,
    email: sanitized.email,
    message: sanitized.message,
    phone: sanitized.phone,
    company: sanitized.company,
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
    name: sanitized.name,
    email: sanitized.email,
    message: sanitized.message,
    phone: sanitized.phone,
    company: sanitized.company,
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

export async function handleDemoForm(req, res, body, requestId) {
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

  const sanitized = {
    name: sanitizeString(name ?? ''),
    email: typeof email === 'string' ? sanitizeString(email).trim() : email,
    company: sanitizeString(company ?? ''),
    businessNeeds: typeof businessNeeds === 'string' ? sanitizeString(businessNeeds).trim() : businessNeeds ?? '',
    phone: sanitizeString(phone ?? ''),
    jobTitle: sanitizeString(jobTitle ?? ''),
    companySize: sanitizeString(companySize ?? ''),
    industry: sanitizeString(industry ?? ''),
    useCase: sanitizeString(useCase ?? ''),
    timeline: sanitizeString(timeline ?? ''),
    message: typeof message === 'string' ? sanitizeString(message).trim() : message ?? '',
    preferredDate: typeof preferredDate === 'string' ? sanitizeString(preferredDate).trim() : preferredDate ?? '',
  }

  const { valid, errors: validationErrors, warnings: validationWarnings } =
    validateFormData(
      {
        name: sanitized.name,
        email: sanitized.email,
        company: sanitized.company,
        businessNeeds: sanitized.businessNeeds,
        phone: sanitized.phone,
        companySize: sanitized.companySize,
        industry: sanitized.industry,
        useCase: sanitized.useCase,
        timeline: sanitized.timeline,
      },
      'demo'
    )

  if (!valid) {
    return res.status(400).json({
      error: 'Validation échouée',
      message: 'Certains champs contiennent des erreurs de validation.',
      errors: validationErrors,
      warnings:
        validationWarnings.length > 0 ? validationWarnings : undefined,
      requestId,
    })
  }

  console.log('New demo request:', {
    requestId,
    name: sanitized.name,
  })

  // Save to MongoDB
  const result = await saveDemoRequest({
    name: sanitized.name,
    email: sanitized.email,
    company: sanitized.company,
    businessNeeds: sanitized.businessNeeds,
    phone: sanitized.phone,
    jobTitle: sanitized.jobTitle,
    companySize: sanitized.companySize,
    industry: sanitized.industry,
    useCase: sanitized.useCase,
    timeline: sanitized.timeline,
    message: sanitized.message,
    preferredDate: sanitized.preferredDate,
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
    name: sanitized.name,
    email: sanitized.email,
    phone: sanitized.phone,
    jobTitle: sanitized.jobTitle,
    company: sanitized.company,
    companySize: sanitized.companySize,
    industry: sanitized.industry,
    businessNeeds: sanitized.businessNeeds,
    useCase: sanitized.useCase,
    timeline: sanitized.timeline,
    preferredDate: sanitized.preferredDate,
    message: sanitized.message,
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
