/**
 * @tcd/shared-types - Form Types
 * Shared form data types, validation result shape, and contact statuses
 * Extracted from api/_lib/models/Contact.js and validation schemas
 */

/** Validation result returned by all validators */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/** Contact status lifecycle */
export const ContactStatus = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  CLOSED: 'closed',
} as const

export type ContactStatusValue =
  (typeof ContactStatus)[keyof typeof ContactStatus]

/** Contact form submission data */
export interface ContactFormData {
  name: string
  email: string
  phone?: string | null
  company?: string | null
  message: string
  source?: string
  type?: string
  clerkId?: string | null
}

/** Demo request form data */
export interface DemoFormData {
  name: string
  email: string
  phone?: string | null
  company: string
  businessNeeds: string
  companySize?: string
  industry?: string
  useCase?: string
  timeline?: string
}

/** Valid company size options */
export const CompanySizeOptions = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
] as const

export type CompanySize = (typeof CompanySizeOptions)[number]

/** Valid timeline options */
export const TimelineOptions = [
  'Moins de 1 mois',
  '1-3 mois',
  '3-6 mois',
  '6-12 mois',
  'Plus de 12 mois',
] as const

export type Timeline = (typeof TimelineOptions)[number]
