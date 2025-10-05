const express = require('express')
const { createTransporter, emailTemplates } = require('../config/email')
const { validateData, contactSchema } = require('../utils/validation')
const { formRateLimit } = require('../middleware/security')
const { logger } = require('../utils/logger')

const router = express.Router()

// Route pour le formulaire de contact
router.post(
  '/contact',
  formRateLimit,
  validateData(contactSchema),
  async (req, res) => {
    try {
      const { name, email, phone, company, message } = req.body

      // Créer le transporteur email
      const transporter = createTransporter()

      // Vérifier la connexion
      await transporter.verify()
      logger.info('Serveur email Zoho prêt', {
        emailService: 'contact@workflowai.fr',
      })

      // Préparer l'email
      const emailData = emailTemplates.contact({
        name,
        email,
        phone,
        company,
        message,
      })

      // Envoyer l'email
      const info = await transporter.sendMail({
        from: `"TCDynamics Contact" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Vous recevez l'email
        replyTo: email, // Le client peut répondre directement
        ...emailData,
      })

      logger.info('Email envoyé avec succès', {
        messageId: info.messageId,
        sender: email,
        recipient: process.env.EMAIL_USER,
      })

      // Réponse de succès
      res.status(200).json({
        success: true,
        message:
          'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
        messageId: info.messageId,
      })
    } catch (error) {
      logger.error("Erreur lors de l'envoi de l'email de contact", {
        error: error.message,
        submitterEmail: email ?? 'unknown',
        action: 'send_contact_email',
      })

      res.status(500).json({
        success: false,
        message:
          "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer plus tard.",
      })
    }
  }
)

module.exports = router
