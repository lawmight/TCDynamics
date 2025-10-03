const express = require('express')
const { createTransporter, emailTemplates } = require('../config/email')
const { validateData, demoSchema } = require('../utils/validation')
const { formRateLimit } = require('../middleware/security')

const router = express.Router()

// Route pour le formulaire de démo
router.post(
  '/demo',
  formRateLimit,
  validateData(demoSchema),
  async (req, res) => {
    try {
      const { firstName, lastName, email, phone, company, employees, needs } =
        req.body

      // Créer le transporteur email
      const transporter = createTransporter()

      // Vérifier la connexion
      await transporter.verify()
      console.log(
        '✅ Serveur email Zoho prêt pour la démo - contact@workflowai.fr'
      )

      // Préparer l'email
      const emailData = emailTemplates.demo({
        firstName,
        lastName,
        email,
        phone,
        company,
        employees,
        needs,
      })

      // Envoyer l'email
      const info = await transporter.sendMail({
        from: `"TCDynamics Demo" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Vous recevez l'email
        replyTo: email, // Le client peut répondre directement
        ...emailData,
      })

      console.log('�� Email de démo envoyé:', info.messageId)

      // Réponse de succès
      res.status(200).json({
        success: true,
        message:
          'Votre demande de démonstration a été enregistrée. Notre équipe vous contactera dans les 2 heures.',
        messageId: info.messageId,
      })
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi de la demande de démo:", error)

      res.status(500).json({
        success: false,
        message:
          "Une erreur est survenue lors de l'enregistrement de votre demande. Veuillez réessayer plus tard.",
      })
    }
  }
)

module.exports = router
