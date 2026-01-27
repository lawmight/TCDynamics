/**
 * Onboarding Reminder Email Template
 * Sent Day 3 if onboarding not completed
 * Following email-sequence skill: social proof, urgency without pressure
 */

/**
 * Generate reminder email HTML
 * @param {Object} data - User data
 * @param {string} data.firstName - User's first name
 * @param {number} data.stepsCompleted - Number of onboarding steps completed
 * @param {number} data.totalSteps - Total onboarding steps
 * @returns {string} HTML email content
 */
export function generateReminderHTML({
  firstName = 'there',
  stepsCompleted = 0,
  totalSteps = 4,
}) {
  const progressPercent = Math.round((stepsCompleted / totalSteps) * 100)

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre compte vous attend</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 700;">
                ${firstName}, votre compte vous attend ! 👋
              </h1>
            </td>
          </tr>

          <!-- Progress Bar -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #e5e7eb; border-radius: 9999px; height: 8px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100%; width: ${progressPercent}%; border-radius: 9999px;"></div>
              </div>
              <p style="margin: 10px 0 0; color: #6b7280; font-size: 14px; text-align: center;">
                ${stepsCompleted}/${totalSteps} étapes complétées
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 30px 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Nous avons remarqué que vous n'avez pas encore terminé la configuration de votre compte. Pas de souci, ça prend moins de 5 minutes !
              </p>

              <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #166534; font-size: 14px;">
                  💡 <strong>Le saviez-vous ?</strong> Nos clients gagnent en moyenne 8 heures par semaine grâce à l'automatisation.
                </p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
                    <a href="https://app.tcdynamics.fr/onboarding" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Reprendre où j'en étais →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Help Section -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 15px; color: #374151; font-size: 14px; text-align: center;">
                Besoin d'aide ? Notre équipe est là pour vous :
              </p>
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 0 10px;">
                    <a href="https://tcdynamics.fr/docs" style="color: #667eea; text-decoration: none; font-size: 14px;">📚 Documentation</a>
                  </td>
                  <td style="padding: 0 10px;">
                    <a href="mailto:support@tcdynamics.fr" style="color: #667eea; text-decoration: none; font-size: 14px;">💬 Support</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

/**
 * Generate reminder email plain text
 */
export function generateReminderText({
  firstName = 'there',
  stepsCompleted = 0,
  totalSteps = 4,
}) {
  return `
${firstName}, votre compte vous attend ! 👋

Vous avez complété ${stepsCompleted}/${totalSteps} étapes de la configuration.

Nous avons remarqué que vous n'avez pas encore terminé la configuration de votre compte. Pas de souci, ça prend moins de 5 minutes !

💡 Le saviez-vous ? Nos clients gagnent en moyenne 8 heures par semaine grâce à l'automatisation.

Reprendre la configuration : https://app.tcdynamics.fr/onboarding

Besoin d'aide ?
- Documentation : https://tcdynamics.fr/docs
- Support : support@tcdynamics.fr

---
TCDynamics • Automatisation intelligente pour les PME
`.trim()
}

export default {
  generateHTML: generateReminderHTML,
  generateText: generateReminderText,
  subject: '{{firstName}}, votre compte vous attend !',
  previewText: 'Plus que quelques minutes pour terminer la configuration.',
}
