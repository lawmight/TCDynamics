const Joi = require('joi')
const { commonFields } = require('./validationHelpers')

// Schéma de validation pour le formulaire de contact
// Uses reusable validation helpers for consistency
const contactSchema = Joi.object({
  name: commonFields.fullName(),
  email: commonFields.email(),
  phone: commonFields.phone(),
  company: commonFields.company(false), // optional
  message: commonFields.message(),
})

// Schéma de validation pour le formulaire de démo
// Uses reusable validation helpers for consistency
const demoSchema = Joi.object({
  firstName: commonFields.firstName(),
  lastName: commonFields.lastName(),
  email: commonFields.email(),
  phone: commonFields.phone(),
  company: commonFields.company(true), // required
  employees: commonFields.employees(),
  needs: commonFields.notes(1000),
})

// Fonction de validation générique
const validateData = schema => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  })

  if (error) {
    const errorMessages = error.details.map(detail => detail.message)
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: errorMessages,
    })
  }

  req.body = value // Utiliser les données nettoyées
  next()
}

module.exports = {
  contactSchema,
  demoSchema,
  validateData,
}
