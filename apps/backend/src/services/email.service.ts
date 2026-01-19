/**
 * Email service
 * Handles email sending using Nodemailer
 */

import nodemailer, { Transporter } from 'nodemailer'
import { EnvironmentConfig } from '../config/environment'

let transporter: Transporter | null = null

/**
 * Initialize email transporter
 */
export function initializeEmailService(
  config: EnvironmentConfig['email'],
): Transporter {
  if (transporter) {
    return transporter
  }

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    // Configuration spécifique pour Zoho Mail
    connectionTimeout: 60000,
    greetingTimeout: 30000,
  })

  return transporter
}

/**
 * Email templates
 */
export interface EmailTemplate {
  subject: string
  html: string
}

export interface ContactEmailData {
  name: string
  email: string
  phone?: string
  company?: string
  message: string
}

export interface DemoEmailData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company: string
  employees?: string
  needs?: string
}

export const emailTemplates = {
  contact: (data: ContactEmailData): EmailTemplate => ({
    subject: `Nouveau message de ${data.name} - TCDynamics`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Nouveau message de contact</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nom:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Téléphone:</strong> ${data.phone || 'Non renseigné'}</p>
          <p><strong>Entreprise:</strong> ${data.company || 'Non renseigné'}</p>
        </div>
        <div style="background: #fff; padding: 20px; border-left: 4px solid #667eea;">
          <h3>Message:</h3>
          <p style="white-space: pre-wrap;">${data.message}</p>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Message reçu le ${new Date().toLocaleString('fr-FR')}
        </p>
      </div>
    `,
  }),

  demo: (data: DemoEmailData): EmailTemplate => ({
    subject: `Demande de démo de ${data.firstName} ${data.lastName} - TCDynamics`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Nouvelle demande de démonstration</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nom:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Téléphone:</strong> ${data.phone || 'Non renseigné'}</p>
          <p><strong>Entreprise:</strong> ${data.company}</p>
          <p><strong>Nombre d'employés:</strong> ${data.employees || 'Non renseigné'}</p>
        </div>
        <div style="background: #fff; padding: 20px; border-left: 4px solid #667eea;">
          <h3>Besoins spécifiques:</h3>
          <p style="white-space: pre-wrap;">${data.needs || 'Aucun besoin spécifique mentionné'}</p>
        </div>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Demande reçue le ${new Date().toLocaleString('fr-FR')}
        </p>
      </div>
    `,
  }),
}

/**
 * Send email
 */
export async function sendEmail(
  to: string,
  template: EmailTemplate,
  from?: string,
): Promise<void> {
  if (!transporter) {
    throw new Error('Email service not initialized. Call initializeEmailService first.')
  }

  await transporter.sendMail({
    from: from || process.env.EMAIL_USER || 'contact@tcdynamics.fr',
    to,
    subject: template.subject,
    html: template.html,
  })
}

/**
 * Send contact form email
 */
export async function sendContactEmail(
  data: ContactEmailData,
  recipientEmail: string = process.env.EMAIL_USER || 'contact@tcdynamics.fr',
): Promise<void> {
  const template = emailTemplates.contact(data)
  await sendEmail(recipientEmail, template)
}

/**
 * Send demo request email
 */
export async function sendDemoEmail(
  data: DemoEmailData,
  recipientEmail: string = process.env.EMAIL_USER || 'contact@tcdynamics.fr',
): Promise<void> {
  const template = emailTemplates.demo(data)
  await sendEmail(recipientEmail, template)
}
