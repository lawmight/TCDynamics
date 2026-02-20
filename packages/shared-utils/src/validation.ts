/**
 * @tcd/shared-utils - Validation
 * Pure validation functions with no external dependencies
 * Faithfully ported from api/_lib/validation.js (400 lines)
 *
 * These are the CANONICAL implementations. Consumers (api, backend)
 * should import from here rather than maintaining their own copies.
 */

import type { ValidationResult } from '@tcd/shared-types/forms'
import {
    CompanySizeOptions
} from '@tcd/shared-types/forms'

/**
 * Email validation with comprehensive checks
 */
export const validateEmail = (email: unknown): ValidationResult => {
  const warnings: string[] = []

  if (!email || typeof email !== 'string') {
    return {
      valid: false,
      errors: ["L'email est requis et doit être une chaîne de caractères"],
      warnings: [],
    }
  }

  const trimmedEmail = email.trim()

  if (trimmedEmail.length === 0) {
    return {
      valid: false,
      errors: ["L'email ne peut pas être vide"],
      warnings: [],
    }
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    return {
      valid: false,
      errors: ["Format d'email invalide"],
      warnings: [],
    }
  }

  // Length validation (RFC 5321)
  if (trimmedEmail.length > 254) {
    return {
      valid: false,
      errors: ["L'email est trop long (maximum 254 caractères)"],
      warnings: [],
    }
  }

  // Domain validation (RFC 1035)
  const domain = trimmedEmail.split('@')[1]
  if (domain && domain.length > 63) {
    return {
      valid: false,
      errors: ["Le domaine de l'email est trop long"],
      warnings: [],
    }
  }

  // Warning for common disposable email patterns
  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'throwaway.email',
    'maildrop.cc',
    'temp-mail.org',
  ]

  if (
    disposableDomains.some((d: string) =>
      trimmedEmail.toLowerCase().includes(d)
    )
  ) {
    warnings.push(
      'Adresse email temporaire détectée - veuillez utiliser une adresse email professionnelle'
    )
  }

  return { valid: true, errors: [], warnings }
}

/**
 * Name validation with cultural sensitivity
 */
export const validateName = (
  name: unknown,
  fieldName: string = 'Nom'
): ValidationResult => {
  const warnings: string[] = []

  if (!name || typeof name !== 'string') {
    return {
      valid: false,
      errors: [
        `Le ${fieldName.toLowerCase()} est requis et doit être une chaîne de caractères`,
      ],
      warnings: [],
    }
  }

  const trimmedName = name.trim()

  if (trimmedName.length === 0) {
    return {
      valid: false,
      errors: [`Le ${fieldName.toLowerCase()} ne peut pas être vide`],
      warnings: [],
    }
  }

  if (trimmedName.length < 2) {
    return {
      valid: false,
      errors: [
        `Le ${fieldName.toLowerCase()} doit contenir au moins 2 caractères`,
      ],
      warnings: [],
    }
  }

  if (trimmedName.length > 100) {
    return {
      valid: false,
      errors: [
        `Le ${fieldName.toLowerCase()} est trop long (maximum 100 caractères)`,
      ],
      warnings: [],
    }
  }

  // Check for only whitespace or special characters
  if (!/[a-zA-ZÀ-ÿ\u00C0-\u017F]/.test(trimmedName)) {
    warnings.push(
      `${fieldName} ne contient que des caractères spéciaux ou des chiffres`
    )
  }

  // Check for excessive consecutive characters
  if (/(.)(\1){3,}/.test(trimmedName)) {
    warnings.push(`${fieldName} contient des caractères répétés`)
  }

  return { valid: true, errors: [], warnings }
}

/**
 * Message validation with content analysis
 */
export const validateMessage = (
  message: unknown,
  minLength: number = 10,
  maxLength: number = 5000,
  fieldName: string = 'Message'
): ValidationResult => {
  const warnings: string[] = []

  if (!message || typeof message !== 'string') {
    return {
      valid: false,
      errors: [
        `Le ${fieldName.toLowerCase()} est requis et doit être une chaîne de caractères`,
      ],
      warnings: [],
    }
  }

  const trimmedMessage = message.trim()

  if (trimmedMessage.length === 0) {
    return {
      valid: false,
      errors: [`Le ${fieldName.toLowerCase()} ne peut pas être vide`],
      warnings: [],
    }
  }

  if (trimmedMessage.length < minLength) {
    return {
      valid: false,
      errors: [
        `Le ${fieldName.toLowerCase()} doit contenir au moins ${minLength} caractères`,
      ],
      warnings: [],
    }
  }

  if (trimmedMessage.length > maxLength) {
    return {
      valid: false,
      errors: [
        `Le ${fieldName.toLowerCase()} est trop long (maximum ${maxLength} caractères)`,
      ],
      warnings: [],
    }
  }

  // Check for excessive whitespace
  const words = trimmedMessage.split(/\s+/)
  if (words.length < 3) {
    warnings.push(`${fieldName} semble trop court en termes de mots`)
  }

  // Check for potential spam patterns
  const spamPatterns = [
    /http[s]?:\/\/[^\s]+/gi,
    /(?:\d{3}[-.\s]??\d{2}[-.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-.\s]??\d{4}|\d{3}\.\d{3}\.\d{4})/g,
    /(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
  ]

  const hasSpamPatterns = spamPatterns.some((pattern: RegExp) =>
    pattern.test(trimmedMessage)
  )
  if (hasSpamPatterns) {
    warnings.push(
      'Le message contient des éléments qui pourraient être considérés comme du spam'
    )
  }

  // Check for excessive punctuation
  const exclamationCount = (trimmedMessage.match(/!/g) || []).length
  const questionCount = (trimmedMessage.match(/\?/g) || []).length
  const capsCount = (trimmedMessage.match(/[A-Z]/g) || []).length

  if (exclamationCount > 3 || questionCount > 3) {
    warnings.push('Le message contient trop de signes de ponctuation')
  }

  if (capsCount > trimmedMessage.length * 0.3) {
    warnings.push('Le message contient trop de majuscules')
  }

  return { valid: true, errors: [], warnings }
}

/**
 * Phone validation with international format support
 */
export const validatePhone = (phone: unknown): ValidationResult => {
  const warnings: string[] = []

  if (!phone || typeof phone !== 'string') {
    return {
      valid: true, // Phone is optional
      errors: [],
      warnings: [],
    }
  }

  const cleanedPhone = phone.replace(/[^\d+]/g, '')

  if (cleanedPhone.length > 0) {
    // Basic phone number validation
    const phonePattern = /^[+]?[\d\s\-()]{7,15}$/
    if (!phonePattern.test(phone)) {
      return {
        valid: false,
        errors: ['Format de numéro de téléphone invalide'],
        warnings: [],
      }
    }

    // Warning for very short numbers
    if (cleanedPhone.length < 7) {
      warnings.push('Numéro de téléphone très court')
    }

    // Warning for very long numbers
    if (cleanedPhone.length > 15) {
      warnings.push('Numéro de téléphone très long')
    }
  }

  return { valid: true, errors: [], warnings }
}

/**
 * Form-specific validation schemas
 */
export const validationSchemas: Record<
  string,
  Record<string, (value: unknown) => ValidationResult>
> = {
  contact: {
    name: (value) => validateName(value, 'Nom'),
    email: validateEmail,
    message: (value) => validateMessage(value, 10, 5000, 'Message'),
    phone: validatePhone,
    company: (value) =>
      !value
        ? { valid: true, errors: [], warnings: [] }
        : validateName(value, 'Entreprise'),
  },

  demo: {
    name: (value) => validateName(value, 'Nom'),
    email: validateEmail,
    businessNeeds: (value) =>
      validateMessage(value, 10, 5000, 'Besoins spécifiques'),
    phone: validatePhone,
    company: (value) => validateName(value, 'Entreprise'),
    companySize: (value) => {
      if (!value) return { valid: true, errors: [], warnings: [] }
      return (CompanySizeOptions as readonly string[]).includes(value as string)
        ? { valid: true, errors: [], warnings: [] }
        : {
            valid: false,
            errors: ["Taille d'entreprise invalide"],
            warnings: [],
          }
    },
    industry: (value) =>
      !value
        ? { valid: true, errors: [], warnings: [] }
        : validateName(value, "Secteur d'activité"),
    useCase: (value) =>
      !value
        ? { valid: true, errors: [], warnings: [] }
        : validateMessage(value, 5, 500, "Cas d'usage"),
    timeline: (value) => {
      if (!value) return { valid: true, errors: [], warnings: [] }
      const validTimelines = [
        'Moins de 1 mois',
        '1-3 mois',
        '3-6 mois',
        '6-12 mois',
        'Plus de 12 mois',
      ]
      return validTimelines.includes(value as string)
        ? { valid: true, errors: [], warnings: [] }
        : { valid: false, errors: ['Timeline invalide'], warnings: [] }
    },
  },
}

/**
 * Apply validation schema to form data
 */
export const validateFormData = (
  formData: Record<string, unknown>,
  schema: string
): ValidationResult => {
  const schemaDefinition = validationSchemas[schema]
  if (!schemaDefinition) {
    return {
      valid: false,
      errors: [`Schéma de validation inconnu: ${schema}`],
      warnings: [],
    }
  }

  const allErrors: string[] = []
  const allWarnings: string[] = []

  for (const [field, validator] of Object.entries(schemaDefinition)) {
    const fieldValue = formData[field]
    const result = validator(fieldValue)

    if (!result.valid) {
      allErrors.push(...result.errors.map((error: string) => `${field}: ${error}`))
    }

    if (result.warnings.length > 0) {
      allWarnings.push(
        ...result.warnings.map((warning: string) => `${field}: ${warning}`)
      )
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  }
}
