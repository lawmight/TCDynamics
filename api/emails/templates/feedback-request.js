/**
 * Feedback Request Email Template
 * Sent Day 14 to all users
 * Following email-sequence skill: NPS survey, optional feedback form
 */

/**
 * Generate feedback email HTML
 * @param {Object} data - User data
 * @param {string} data.firstName - User's first name
 * @param {string} data.feedbackUrl - URL for the feedback form
 * @returns {string} HTML email content
 */
export function generateFeedbackHTML({
  firstName = 'there',
  feedbackUrl = 'https://app.tcdynamics.fr/feedback',
}) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre avis compte</title>
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
                ${firstName}, votre avis nous intéresse ! 💬
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 30px 30px;">
              <p style="margin: 0 0 25px; color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
                Cela fait 2 semaines que vous utilisez TCDynamics.<br>
                Comment se passe votre expérience jusqu'ici ?
              </p>

              <!-- NPS Scale -->
              <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px; text-align: center;">
                Recommanderiez-vous TCDynamics à un collègue ?
              </p>

              <table role="presentation" style="margin: 0 auto 30px;">
                <tr>
                  ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                    .map(
                      n => `
                    <td style="padding: 0 3px;">
                      <a href="${feedbackUrl}?score=${n}" style="display: inline-block; width: 36px; height: 36px; line-height: 36px; text-align: center; border-radius: 50%; font-size: 14px; font-weight: 600; text-decoration: none; ${
                        n <= 6
                          ? 'background-color: #fef2f2; color: #dc2626;'
                          : n <= 8
                            ? 'background-color: #fef9c3; color: #ca8a04;'
                            : 'background-color: #dcfce7; color: #16a34a;'
                      }">${n}</a>
                    </td>
                  `
                    )
                    .join('')}
                </tr>
              </table>

              <div style="text-align: center; margin-bottom: 30px;">
                <span style="color: #9ca3af; font-size: 12px;">0 = Pas du tout • 10 = Absolument</span>
              </div>

              <!-- Alternative CTA -->
              <div style="text-align: center;">
                <a href="${feedbackUrl}" style="color: #667eea; text-decoration: none; font-size: 14px;">
                  Ou laissez-nous un commentaire détaillé →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #374151; font-size: 14px; text-align: center;">
                Merci de prendre le temps de nous répondre !
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                Vos retours nous aident à améliorer TCDynamics chaque jour.
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
 * Generate feedback email plain text
 */
export function generateFeedbackText({
  firstName = 'there',
  feedbackUrl = 'https://app.tcdynamics.fr/feedback',
}) {
  return `
${firstName}, votre avis nous intéresse ! 💬

Cela fait 2 semaines que vous utilisez TCDynamics. Comment se passe votre expérience jusqu'ici ?

Recommanderiez-vous TCDynamics à un collègue ?
(0 = Pas du tout • 10 = Absolument)

Donnez votre avis : ${feedbackUrl}

Merci de prendre le temps de nous répondre !
Vos retours nous aident à améliorer TCDynamics chaque jour.

---
TCDynamics • Automatisation intelligente pour les PME
`.trim()
}

export default {
  generateHTML: generateFeedbackHTML,
  generateText: generateFeedbackText,
  subject: 'Comment se passe votre expérience avec TCDynamics ?',
  previewText: 'Votre avis compte — 30 secondes pour nous aider à améliorer.',
}
