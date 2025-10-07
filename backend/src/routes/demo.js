const express = require('express')
const { validateData, demoSchema } = require('../utils/validation')
const { formRateLimit } = require('../middleware/security')
const { createEmailRouteHandler } = require('../utils/routeFactory')

const router = express.Router()

// Route pour le formulaire de démo
// Uses factory pattern for consistent email handling
router.post(
  '/demo',
  formRateLimit,
  validateData(demoSchema),
  createEmailRouteHandler({
    templateName: 'demo',
    routeName: 'demo',
    successMessage:
      'Votre demande de démonstration a été enregistrée. Notre équipe vous contactera dans les 2 heures.',
    errorMessage:
      "Une erreur est survenue lors de l'enregistrement de votre demande. Veuillez réessayer plus tard.",
  })
)

module.exports = router
