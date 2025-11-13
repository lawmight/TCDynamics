import { saveDemoRequest } from './_lib/supabase.js';
import { Resend } from 'resend';

// Disable Vercel's automatic body parsing - we'll handle it manually
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to parse request body manually
async function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get body - either from req.body (if Vercel parsed it) or parse manually
    let body;
    if (req.body && typeof req.body === 'object') {
      body = req.body;
    } else if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = await getRequestBody(req);
    }
    const {
      name,
      email,
      company,
      businessNeeds,
      phone,
      jobTitle,
      companySize,
      industry,
      useCase,
      timeline,
      message,
      preferredDate
    } = body;

    // Validate required fields
    if (!name || !email || !company || !businessNeeds) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'email', 'company', 'businessNeeds']
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    console.log('New demo request:', { name, email, company });

    // Save to Supabase
    const result = await saveDemoRequest({
      name,
      email,
      company,
      businessNeeds,
      phone,
      jobTitle,
      companySize,
      industry,
      useCase,
      timeline,
      message,
      preferredDate
    });

    if (!result.success) {
      console.error('Failed to save demo request:', result.error);
      return res.status(500).json({
        error: 'Failed to save demo request',
        details: result.error
      });
    }

    // Send email notification (direct approach)
    let emailResult = { success: false, emailId: null };
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const toEmail = (process.env.DEMO_EMAIL || 'tom.coustols@tcdynamics.fr').trim();

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .badge { display: inline-block; background: #ff6b6b; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-left: 10px; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 16px; font-weight: 600; color: #444; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e1e4e8; }
    .field { margin-bottom: 15px; }
    .field-label { font-weight: 600; color: #f5576c; margin-bottom: 5px; font-size: 13px; }
    .field-value { background: white; padding: 10px; border-radius: 4px; border-left: 3px solid #f5576c; }
    .message-box { background: white; padding: 15px; border-radius: 4px; border: 1px solid #e1e4e8; margin-top: 10px; white-space: pre-wrap; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e1e4e8; color: #888; font-size: 12px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Nouvelle demande de démo<span class="badge">PRIORITÉ HAUTE</span></h1>
    </div>
    <div class="content">
      <div class="section">
        <div class="section-title">Contact</div>
        <div class="field">
          <div class="field-label">👤 Nom:</div>
          <div class="field-value">${name}</div>
        </div>
        <div class="field">
          <div class="field-label">📧 Email:</div>
          <div class="field-value"><a href="mailto:${email}">${email}</a></div>
        </div>
        ${phone ? `<div class="field">
          <div class="field-label">📞 Téléphone:</div>
          <div class="field-value"><a href="tel:${phone}">${phone}</a></div>
        </div>` : ''}
        ${jobTitle ? `<div class="field">
          <div class="field-label">💼 Fonction:</div>
          <div class="field-value">${jobTitle}</div>
        </div>` : ''}
      </div>

      <div class="section">
        <div class="section-title">Entreprise</div>
        <div class="field">
          <div class="field-label">🏢 Société:</div>
          <div class="field-value">${company}</div>
        </div>
        ${companySize ? `<div class="field">
          <div class="field-label">👥 Taille:</div>
          <div class="field-value">${companySize}</div>
        </div>` : ''}
        ${industry ? `<div class="field">
          <div class="field-label">🏭 Secteur:</div>
          <div class="field-value">${industry}</div>
        </div>` : ''}
      </div>

      <div class="section">
        <div class="section-title">Besoins & Détails</div>
        <div class="field">
          <div class="field-label">🎯 Besoins métier:</div>
          <div class="field-value">${businessNeeds}</div>
        </div>
        ${useCase ? `<div class="field">
          <div class="field-label">💡 Cas d'usage:</div>
          <div class="field-value">${useCase}</div>
        </div>` : ''}
        ${timeline ? `<div class="field">
          <div class="field-label">⏱️ Timeline:</div>
          <div class="field-value">${timeline}</div>
        </div>` : ''}
        ${preferredDate ? `<div class="field">
          <div class="field-label">📅 Date préférée:</div>
          <div class="field-value">${preferredDate}</div>
        </div>` : ''}
        ${message ? `<div class="field">
          <div class="field-label">💬 Message complémentaire:</div>
          <div class="message-box">${message}</div>
        </div>` : ''}
      </div>

      <div class="footer">
        Reçu le ${new Date().toLocaleString('fr-FR')} via le formulaire de demande de démo TCDynamics
      </div>
    </div>
  </div>
</body>
</html>`;

      const emailResponse = await resend.emails.send({
        from: 'TCDynamics <contact@tcdynamics.fr>',
        to: [toEmail],
        replyTo: email,
        subject: `🎯 Demande de démo: ${company}${timeline ? ` (${timeline})` : ''}`,
        html: emailHtml,
        text: `Nouvelle demande de démonstration\n\n=== CONTACT ===\nNom: ${name}\nEmail: ${email}${phone ? `\nTéléphone: ${phone}` : ''}${jobTitle ? `\nFonction: ${jobTitle}` : ''}\n\n=== ENTREPRISE ===\nSociété: ${company}${companySize ? `\nTaille: ${companySize}` : ''}${industry ? `\nSecteur: ${industry}` : ''}\n\n=== BESOINS ===\nBesoins métier: ${businessNeeds}${useCase ? `\nCas d'usage: ${useCase}` : ''}${timeline ? `\nTimeline: ${timeline}` : ''}${preferredDate ? `\nDate préférée: ${preferredDate}` : ''}${message ? `\n\nMessage:\n${message}` : ''}\n\n---\nReçu le ${new Date().toLocaleString('fr-FR')} via le formulaire de demande de démo TCDynamics`
      });

      emailResult = {
        success: true,
        emailId: emailResponse.data?.id || emailResponse.id
      };
      console.log('Demo email sent successfully:', emailResult.emailId);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      console.error('Email error details:', emailError.message, emailError.stack);
      // Don't fail the request if email fails - data is already saved
    }

    res.status(200).json({
      success: true,
      message: 'Demande de démonstration envoyée',
      messageId: result.id,
      emailSent: emailResult.success,
      emailId: emailResult.emailId
    });

  } catch (error) {
    console.error('Demo form error:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
}
