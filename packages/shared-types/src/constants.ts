/**
 * @tcd/shared-types - Constants
 * Shared French error messages, regex patterns, and validation constants
 * Extracted from api/_lib/validation.js and backend validationHelpers.js
 */

/** Common French error messages for validation */
export const MESSAGES_FR = {
  required: (field: string) => `${field} est requis`,
  email: 'Veuillez fournir une adresse email valide',
  emailRequired: "L'email est requis et doit être une chaîne de caractères",
  emailEmpty: "L'email ne peut pas être vide",
  emailInvalid: "Format d'email invalide",
  emailTooLong: "L'email est trop long (maximum 254 caractères)",
  emailDomainTooLong: "Le domaine de l'email est trop long",
  emailDisposable:
    'Adresse email temporaire détectée - veuillez utiliser une adresse email professionnelle',
  minLength: (field: string, min: number) =>
    `${field} doit contenir au moins ${min} caractères`,
  maxLength: (field: string, max: number) =>
    `${field} ne peut pas dépasser ${max} caractères`,
  tooLong: (field: string, max: number) =>
    `${field} est trop long (maximum ${max} caractères)`,
  pattern: (field: string) => `${field} contient des caractères invalides`,
  phonePattern: 'Le numéro de téléphone contient des caractères invalides',
  phoneInvalid: 'Format de numéro de téléphone invalide',
  phoneShort: 'Numéro de téléphone très court',
  phoneLong: 'Numéro de téléphone très long',
  empty: (field: string) => `${field} ne peut pas être vide`,
  stringRequired: (field: string) =>
    `Le ${field} est requis et doit être une chaîne de caractères`,
  specialCharsOnly: (field: string) =>
    `${field} ne contient que des caractères spéciaux ou des chiffres`,
  repeatedChars: (field: string) => `${field} contient des caractères répétés`,
  tooFewWords: (field: string) =>
    `${field} semble trop court en termes de mots`,
  spamDetected:
    'Le message contient des éléments qui pourraient être considérés comme du spam',
  tooMuchPunctuation: 'Le message contient trop de signes de ponctuation',
  tooManyCaps: 'Le message contient trop de majuscules',
  invalidData: 'Données invalides',
  unknownSchema: (schema: string) =>
    `Schéma de validation inconnu: ${schema}`,
  invalidCompanySize: "Taille d'entreprise invalide",
  invalidTimeline: 'Timeline invalide',
  duplicateEmail: 'Cette adresse email existe déjà',
} as const

/** Common validation patterns */
export const PATTERNS = {
  /** Basic email format */
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  /** Phone number (digits, spaces, plus, dashes, parentheses) */
  phone: /^[0-9\s+\-()]+$/,
  /** International phone format */
  phoneInternational: /^[+]?[\d\s\-()]{7,15}$/,
  /** Letters (including accented characters) */
  letters: /[a-zA-ZÀ-ÿ\u00C0-\u017F]/,
  /** Excessive consecutive characters */
  repeatedChars: /(.)\1{3,}/,
} as const

/** List of known disposable email domains */
export const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  'tempmail.org',
  'guerrillamail.com',
  'throwaway.email',
  'maildrop.cc',
  'temp-mail.org',
] as const

/** Spam detection patterns */
export const SPAM_PATTERNS = [
  /http[s]?:\/\/[^\s]+/gi,
  /(?:\d{3}[-.\s]??\d{2}[-.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-.\s]??\d{4}|\d{3}\.\d{3}\.\d{4})/g,
  /(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
] as const
