const Joi = require('joi')

// Schéma de validation pour le formulaire de contact
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'string.max': 'Le nom ne peut pas dépasser 100 caractères',
    'any.required': 'Le nom est requis',
  }),

  email: Joi.string().email().required().messages({
    'string.email': 'Veuillez fournir une adresse email valide',
    'any.required': "L'email est requis",
  }),

  phone: Joi.string()
    .pattern(/^[0-9\s\+\-\(\)]+$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base':
        'Le numéro de téléphone contient des caractères invalides',
    }),

  company: Joi.string().max(200).optional().allow('').messages({
    'string.max': "Le nom de l'entreprise ne peut pas dépasser 200 caractères",
  }),

  message: Joi.string().min(10).max(2000).required().messages({
    'string.min': 'Le message doit contenir au moins 10 caractères',
    'string.max': 'Le message ne peut pas dépasser 2000 caractères',
    'any.required': 'Le message est requis',
  }),
})

// Schéma de validation pour le formulaire de démo
const demoSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Le prénom doit contenir au moins 2 caractères',
    'string.max': 'Le prénom ne peut pas dépasser 50 caractères',
    'any.required': 'Le prénom est requis',
  }),

  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'string.max': 'Le nom ne peut pas dépasser 50 caractères',
    'any.required': 'Le nom est requis',
  }),

  email: Joi.string().email().required().messages({
    'string.email': 'Veuillez fournir une adresse email valide',
    'any.required': "L'email est requis",
  }),

  phone: Joi.string()
    .pattern(/^[0-9\s\+\-\(\)]+$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base':
        'Le numéro de téléphone contient des caractères invalides',
    }),

  company: Joi.string().min(2).max(200).required().messages({
    'string.min': "Le nom de l'entreprise doit contenir au moins 2 caractères",
    'string.max': "Le nom de l'entreprise ne peut pas dépasser 200 caractères",
    'any.required': "Le nom de l'entreprise est requis",
  }),

  employees: Joi.string().optional().allow('').messages({
    'any.only': "Le nombre d'employés doit être une valeur valide",
  }),

  needs: Joi.string().max(1000).optional().allow('').messages({
    'string.max':
      'La description des besoins ne peut pas dépasser 1000 caractères',
  }),
})

// Fonction de validation générique
const validateData = schema => {
  return (req, res, next) => {
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
}

module.exports = {
  contactSchema,
  demoSchema,
  validateData,
}
