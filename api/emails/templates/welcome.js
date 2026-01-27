/**
 * Welcome Email Template
 * Sent immediately after user signup
 * Following email-sequence skill: clear value prop, single CTA
 */

/**
 * Generate welcome email HTML
 * @param {Object} data - User data
 * @param {string} data.firstName - User's first name
 * @param {string} data.email - User's email
 * @returns {string} HTML email content
 */
export function generateWelcomeHTML({ firstName = 'there' }) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue chez TCDynamics</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Bienvenue, ${firstName} ! 🎉
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Merci de nous rejoindre ! Vous venez de faire le premier pas vers l'automatisation de vos processus métier.
              </p>

              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                Avec TCDynamics, vous allez pouvoir :
              </p>

              <ul style="margin: 0 0 30px; padding-left: 20px; color: #374151;">
                <li style="margin-bottom: 10px;">✨ Automatiser le traitement de vos documents</li>
                <li style="margin-bottom: 10px;">🚀 Créer des workflows personnalisés sans code</li>
                <li style="margin-bottom: 10px;">📊 Suivre vos performances en temps réel</li>
                <li style="margin-bottom: 10px;">🔒 Sécuriser vos données avec des standards RGPD</li>
              </ul>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
                    <a href="https://app.tcdynamics.fr/onboarding" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Commencer l'onboarding →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-align: center;">
                Des questions ? Répondez directement à cet email.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                TCDynamics • Automatisation intelligente pour les PME
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
 * Generate welcome email plain text
 * @param {Object} data - User data
 * @param {string} data.firstName - User's first name
 * @returns {string} Plain text email content
 */
export function generateWelcomeText({ firstName = 'there' }) {
  return `
Bienvenue, ${firstName} ! 🎉

Merci de nous rejoindre ! Vous venez de faire le premier pas vers l'automatisation de vos processus métier.

Avec TCDynamics, vous allez pouvoir :
- Automatiser le traitement de vos documents
- Créer des workflows personnalisés sans code
- Suivre vos performances en temps réel
- Sécuriser vos données avec des standards RGPD

Commencez maintenant : https://app.tcdynamics.fr/onboarding

Des questions ? Répondez directement à cet email.

---
TCDynamics • Automatisation intelligente pour les PME
`.trim()
}

export default {
  generateHTML: generateWelcomeHTML,
  generateText: generateWelcomeText,
  subject: 'Bienvenue chez TCDynamics ! 🎉',
  previewText: 'Votre compte est prêt. Commencez à automatiser dès maintenant.',
}
