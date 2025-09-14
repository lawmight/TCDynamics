const express = require('express')
const { createTransporter, emailTemplates } = require('../config/email')
const { validateData, contactSchema } = require('../utils/validation')
const { formRateLimit } = require('../middleware/security')

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
      console.log('✅ Serveur email prêt')

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

      console.log('�� Email envoyé:', info.messageId)

      // Réponse de succès
      res.status(200).json({
        success: true,
        message:
          'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
        messageId: info.messageId,
      })
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi de l'email:", error)

      res.status(500).json({
        success: false,
        message:
          "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer plus tard.",
      })
    }
  }
)

module.exports = router
