const Joi = require('joi')

/**
 * French error messages for common validation rules
 */
const MESSAGES_FR = {
  required: field => `${field} est requis`,
  email: 'Veuillez fournir une adresse email valide',
  minLength: (field, min) => `${field} doit contenir au moins ${min} caractères`,
  maxLength: (field, max) => `${field} ne peut pas dépasser ${max} caractères`,
  pattern: field => `${field} contient des caractères invalides`,
  phonePattern: 'Le numéro de téléphone contient des caractères invalides',
}

/**
 * Common validation patterns
 */
const PATTERNS = {
  phone: /^[0-9\s+\-()]+$/,
}

/**
 * Creates a validated name field (firstName, lastName, fullName)
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.min=2] - Minimum length
 * @param {number} [options.max=100] - Maximum length
 * @param {boolean} [options.required=true] - Whether field is required
 * @param {string} [options.label='Le nom'] - Field label for error messages
 * @returns {Joi.StringSchema} Joi validation schema
 *
 * @example
 * const schema = Joi.object({
 *   firstName: createNameField({ label: 'Le prénom', max: 50 }),
 *   lastName: createNameField({ label: 'Le nom de famille', max: 50 })
 * })
 */
const createNameField = (options = {}) => {
  const {
    min = 2, max = 100, required = true, label = 'Le nom',
  } = options

  let field = Joi.string().min(min).max(max)

  if (required) {
    field = field.required()
  } else {
    field = field.optional().allow('')
  }

  return field.messages({
    'string.min': MESSAGES_FR.minLength(label, min),
    'string.max': MESSAGES_FR.maxLength(label, max),
    'any.required': MESSAGES_FR.required(label),
  })
}

/**
 * Creates a validated email field
 *
 * @param {Object} options - Configuration options
 * @param {boolean} [options.required=true] - Whether field is required
 * @returns {Joi.StringSchema} Joi validation schema
 *
 * @example
 * const schema = Joi.object({
 *   email: createEmailField()
 * })
 */
const createEmailField = (options = {}) => {
  const { required = true } = options

  let field = Joi.string().email()

  if (required) {
    field = field.required()
  } else {
    field = field.optional().allow('')
  }

  return field.messages({
    'string.email': MESSAGES_FR.email,
    'any.required': MESSAGES_FR.required("L'email"),
  })
}

/**
 * Creates a validated phone field with international format support
 *
 * @param {Object} options - Configuration options
 * @param {boolean} [options.required=false] - Whether field is required
 * @returns {Joi.StringSchema} Joi validation schema
 *
 * @example
 * const schema = Joi.object({
 *   phone: createPhoneField()
 * })
 */
const createPhoneField = (options = {}) => {
  const { required = false } = options

  let field = Joi.string().pattern(PATTERNS.phone)

  if (required) {
    field = field.required()
  } else {
    field = field.optional().allow('')
  }

  return field.messages({
    'string.pattern.base': MESSAGES_FR.phonePattern,
    'any.required': MESSAGES_FR.required('Le téléphone'),
  })
}

/**
 * Creates a validated text field (company, message, etc.)
 *
 * @param {Object} options - Configuration options
 * @param {number} [options.min] - Minimum length (optional)
 * @param {number} [options.max=500] - Maximum length
 * @param {boolean} [options.required=false] - Whether field is required
 * @param {string} [options.label='Le champ'] - Field label for error messages
 * @returns {Joi.StringSchema} Joi validation schema
 *
 * @example
 * const schema = Joi.object({
 *   message: createTextField({ min: 10, max: 2000, required: true, label: 'Le message' }),
 *   company: createTextField({ max: 200, label: "L'entreprise" })
 * })
 */
const createTextField = (options = {}) => {
  const {
    min, max = 500, required = false, label = 'Le champ',
  } = options

  let field = Joi.string()

  if (min !== undefined) {
    field = field.min(min)
  }

  field = field.max(max)

  if (required) {
    field = field.required()
  } else {
    field = field.optional().allow('')
  }

  const messages = {
    'string.max': MESSAGES_FR.maxLength(label, max),
    'any.required': MESSAGES_FR.required(label),
  }

  if (min !== undefined) {
    messages['string.min'] = MESSAGES_FR.minLength(label, min)
  }

  return field.messages(messages)
}

/**
 * Creates a validated select/dropdown field
 *
 * @param {Object} options - Configuration options
 * @param {string[]} [options.values] - Allowed values (optional)
 * @param {boolean} [options.required=false] - Whether field is required
 * @param {string} [options.label='Le champ'] - Field label for error messages
 * @returns {Joi.StringSchema} Joi validation schema
 *
 * @example
 * const schema = Joi.object({
 *   employees: createSelectField({ label: "Le nombre d'employés" })
 * })
 */
const createSelectField = (options = {}) => {
  const { values, required = false, label = 'Le champ' } = options

  let field = Joi.string()

  if (values && values.length > 0) {
    field = field.valid(...values)
  }

  if (required) {
    field = field.required()
  } else {
    field = field.optional().allow('')
  }

  return field.messages({
    'any.only': `${label} doit être une valeur valide`,
    'any.required': MESSAGES_FR.required(label),
  })
}

/**
 * Pre-configured field validators for common use cases
 */
const commonFields = {
  // Name fields
  firstName: () => createNameField({ label: 'Le prénom', max: 50 }),
  lastName: () => createNameField({ label: 'Le nom de famille', max: 50 }),
  fullName: () => createNameField({ label: 'Le nom complet' }),

  // Contact fields
  email: () => createEmailField(),
  phone: () => createPhoneField(),

  // Company fields
  company: (required = false) => createTextField({
    max: 200,
    required,
    label: "Le nom de l'entreprise",
  }),

  // Message fields
  message: (options = {}) => createTextField({
    min: 10,
    max: 2000,
    required: true,
    label: 'Le message',
    ...options,
  }),

  // Select fields
  employees: () => createSelectField({ label: "Le nombre d'employés" }),

  // Description/notes fields
  notes: (max = 1000) => createTextField({
    max,
    label: 'La description',
  }),
}

module.exports = {
  // Factory functions
  createNameField,
  createEmailField,
  createPhoneField,
  createTextField,
  createSelectField,

  // Pre-configured fields
  commonFields,

  // Constants
  MESSAGES_FR,
  PATTERNS,
}
