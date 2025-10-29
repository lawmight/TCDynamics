const express = require('express')
const { validateData, contactSchema } = require('../utils/validation')
const { formRateLimit } = require('../middleware/security')
const { createEmailRouteHandler } = require('../utils/routeFactory')

const router = express.Router()

// Route pour le formulaire de contact
// Uses factory pattern for consistent email handling
router.post(
  '/contact',
  formRateLimit,
  validateData(contactSchema),
  createEmailRouteHandler({
    templateName: 'contact',
    routeName: 'contact',
    successMessage:
      'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
    errorMessage:
      "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer plus tard.",
  })
)

module.exports = router
