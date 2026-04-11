/**
 * First Value Email Template
 * Sent when user activates their first workflow
 * Following email-sequence skill: celebrate success, suggest next step
 */

/**
 * Generate first value email HTML
 * @param {Object} data - User data
 * @param {string} data.firstName - User's first name
 * @param {string} data.workflowName - Name of the first workflow
 * @returns {string} HTML email content
 */
export function generateFirstValueHTML({
  firstName = 'there',
  workflowName = 'votre workflow',
}) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Félicitations pour votre premier workflow !</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with celebration -->
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">🚀</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                Premier workflow activé !
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Bravo ${firstName} ! Vous avez activé <strong>"${workflowName}"</strong> avec succès.
              </p>

              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                C'est le début de votre transformation digitale. Votre workflow est maintenant en train de travailler pour vous, automatiquement.
              </p>

              <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px; color: #1e40af; font-size: 16px;">Et maintenant ?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  <li style="margin-bottom: 8px;">Créez un second workflow pour doubler votre productivité</li>
                  <li style="margin-bottom: 8px;">Invitez votre équipe pour collaborer</li>
                  <li style="margin-bottom: 8px;">Explorez les intégrations disponibles</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
                    <a href="https://app.tcdynamics.fr/app/workflows/new" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Créer un autre workflow →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
                Continue comme ça ! 💪
              </p>
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
 * Generate first value email plain text
 */
export function generateFirstValueText({
  firstName = 'there',
  workflowName = 'votre workflow',
}) {
  return `
🚀 Premier workflow activé !

Bravo ${firstName} ! Vous avez activé "${workflowName}" avec succès.

C'est le début de votre transformation digitale. Votre workflow est maintenant en train de travailler pour vous, automatiquement.

Et maintenant ?
- Créez un second workflow pour doubler votre productivité
- Invitez votre équipe pour collaborer
- Explorez les intégrations disponibles

Créer un autre workflow : https://app.tcdynamics.fr/app/workflows/new

Continue comme ça ! 💪

---
TCDynamics • Automatisation intelligente pour les PME
`.trim()
}

export default {
  generateHTML: generateFirstValueHTML,
  generateText: generateFirstValueText,
  subject: '🚀 Félicitations ! Votre premier workflow est actif',
  previewText:
    'Votre automatisation est en marche. Découvrez les prochaines étapes.',
}
