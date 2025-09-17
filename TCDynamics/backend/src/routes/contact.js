const express = require('express')
const { createTransporter, emailTemplates } = require('../config/email')
const { validateData, contactSchema } = require('../utils/validation')
const { formRateLimit } = require('../middleware/security')
const { asyncHandler, handleEmailError, handleValidationError } = require('../middleware/errorHandler')

const router = express.Router()

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Envoyer un message de contact
 *     description: Permet aux utilisateurs d'envoyer un message via le formulaire de contact
 *     tags:
 *       - Contact
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactRequest'
 *           example:
 *             name: "Jean Dupont"
 *             email: "jean.dupont@example.com"
 *             phone: "+33123456789"
 *             company: "Entreprise XYZ"
 *             message: "Bonjour, je suis intéressé par vos services d'automatisation."
 *     responses:
 *       200:
 *         description: Message envoyé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais."
 *               messageId: "1234567890@example.com"
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Données invalides"
 *       429:
 *         description: Trop de requêtes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Trop de requêtes. Veuillez réessayer plus tard."
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Une erreur est survenue lors de l'envoi de votre message."
 */
router.post(
  '/contact',
  formRateLimit,
  validateData(contactSchema),
  asyncHandler(async (req, res) => {
    const { name, email, phone, company, message } = req.body

    // Créer le transporteur email
    const transporter = createTransporter()

    // Vérifier la connexion
    await transporter.verify()
    console.log('✅ Serveur email Zoho prêt - contact@workflowai.fr')

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
  })
)

module.exports = router
