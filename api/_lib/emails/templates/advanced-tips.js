/**
 * Advanced Tips Email Template
 * Sent Day 7 to activated users
 * Following email-sequence skill: power features, expansion opportunities
 */

/**
 * Generate tips email HTML
 * @param {Object} data - User data
 * @param {string} data.firstName - User's first name
 * @param {number} data.workflowCount - Number of workflows created
 * @returns {string} HTML email content
 */
export function generateTipsHTML({ firstName = 'there', workflowCount = 1 }) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Astuces pour aller plus loin</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="font-size: 40px; margin-bottom: 10px;">⚡</div>
              <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 700;">
                Passez au niveau supérieur
              </h1>
              <p style="margin: 10px 0 0; color: #6b7280; font-size: 14px;">
                ${workflowCount} workflow${workflowCount > 1 ? 's' : ''} créé${workflowCount > 1 ? 's' : ''} — Découvrez comment aller plus loin
              </p>
            </td>
          </tr>

          <!-- Tips -->
          <tr>
            <td style="padding: 20px 30px 40px;">
              <p style="margin: 0 0 25px; color: #374151; font-size: 16px; line-height: 1.6;">
                ${firstName}, voici 3 fonctionnalités avancées pour booster votre productivité :
              </p>

              <!-- Tip 1 -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px; color: #111827; font-size: 16px;">
                  🔗 Intégrations tierces
                </h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                  Connectez Google Drive, Slack, ou votre CRM pour synchroniser automatiquement vos données.
                </p>
              </div>

              <!-- Tip 2 -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px; color: #111827; font-size: 16px;">
                  📊 Tableaux de bord personnalisés
                </h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                  Créez des vues sur mesure pour suivre les KPIs qui comptent pour votre équipe.
                </p>
              </div>

              <!-- Tip 3 -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 10px; color: #111827; font-size: 16px;">
                  🤖 Workflows conditionnels
                </h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                  Ajoutez des conditions Si/Alors pour des automatisations encore plus intelligentes.
                </p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
                    <a href="https://app.tcdynamics.fr/app/settings/integrations" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Explorer les intégrations →
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
                Besoin d'un accompagnement personnalisé ? <a href="https://tcdynamics.fr/demo" style="color: #667eea;">Réservez une session</a>
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
 * Generate tips email plain text
 */
export function generateTipsText({ firstName = 'there', workflowCount = 1 }) {
  return `
⚡ Passez au niveau supérieur

${firstName}, vous avez créé ${workflowCount} workflow${workflowCount > 1 ? 's' : ''}. Voici 3 fonctionnalités avancées pour booster votre productivité :

🔗 Intégrations tierces
Connectez Google Drive, Slack, ou votre CRM pour synchroniser automatiquement vos données.

📊 Tableaux de bord personnalisés
Créez des vues sur mesure pour suivre les KPIs qui comptent pour votre équipe.

🤖 Workflows conditionnels
Ajoutez des conditions Si/Alors pour des automatisations encore plus intelligentes.

Explorer les intégrations : https://app.tcdynamics.fr/app/settings/integrations

Besoin d'un accompagnement personnalisé ? https://tcdynamics.fr/demo

---
TCDynamics • Automatisation intelligente pour les PME
`.trim()
}

export default {
  generateHTML: generateTipsHTML,
  generateText: generateTipsText,
  subject: '⚡ 3 astuces pour décupler votre productivité',
  previewText: 'Découvrez les fonctionnalités avancées de TCDynamics.',
}
