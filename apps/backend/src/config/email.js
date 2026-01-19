const nodemailer = require('nodemailer')

// Configuration du transporteur email
const createTransporter = () => nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  // Configuration spécifique pour Zoho Mail
  connectionTimeout: 60000,
  greetingTimeout: 30000,
})

// Templates d'emails
const emailTemplates = {
  contact: data => ({
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

  demo: data => ({
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

module.exports = {
  createTransporter,
  emailTemplates,
}
