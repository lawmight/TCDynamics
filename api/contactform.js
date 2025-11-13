import { saveContact } from './_lib/supabase.js';
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
    const { name, email, message, phone, company } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'email', 'message']
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate message length (per schema: 10-5000 characters)
    if (message.trim().length < 10 || message.length > 5000) {
      return res.status(400).json({
        error: 'Message length must be between 10 and 5000 characters'
      });
    }

    console.log('New contact form submission:', { name, email });

    // Save to Supabase
    const result = await saveContact({
      name,
      email,
      message,
      phone,
      company,
      source: 'website'
    });

    if (!result.success) {
      console.error('Failed to save contact:', result.error);
      return res.status(500).json({
        error: 'Failed to save contact',
        details: result.error
      });
    }

    // Send email notification (direct approach)
    let emailResult = { success: false, emailId: null };
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const toEmail = (process.env.CONTACT_EMAIL || 'tom.coustols@tcdynamics.fr').trim();

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 20px; }
    .field-label { font-weight: 600; color: #667eea; margin-bottom: 5px; }
    .field-value { background: white; padding: 12px; border-radius: 4px; border-left: 3px solid #667eea; }
    .message-box { background: white; padding: 15px; border-radius: 4px; border: 1px solid #e1e4e8; margin-top: 10px; white-space: pre-wrap; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e1e4e8; color: #888; font-size: 12px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 Nouveau message de contact</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">👤 Nom:</div>
        <div class="field-value">${name}</div>
      </div>
      <div class="field">
        <div class="field-label">📧 Email:</div>
        <div class="field-value"><a href="mailto:${email}">${email}</a></div>
      </div>
      ${company ? `<div class="field">
        <div class="field-label">🏢 Entreprise:</div>
        <div class="field-value">${company}</div>
      </div>` : ''}
      ${phone ? `<div class="field">
        <div class="field-label">📞 Téléphone:</div>
        <div class="field-value"><a href="tel:${phone}">${phone}</a></div>
      </div>` : ''}
      <div class="field">
        <div class="field-label">💬 Message:</div>
        <div class="message-box">${message}</div>
      </div>
      <div class="footer">
        Reçu le ${new Date().toLocaleString('fr-FR')} via le formulaire de contact TCDynamics
      </div>
    </div>
  </div>
</body>
</html>`;

      const emailResponse = await resend.emails.send({
        from: 'TCDynamics <contact@tcdynamics.fr>',
        to: [toEmail],
        replyTo: email,
        subject: `Nouveau message de ${name}${company ? ` (${company})` : ''}`,
        html: emailHtml,
        text: `Nouveau message de contact\n\nNom: ${name}\nEmail: ${email}${phone ? `\nTéléphone: ${phone}` : ''}${company ? `\nEntreprise: ${company}` : ''}\n\nMessage:\n${message}\n\n---\nReçu le ${new Date().toLocaleString('fr-FR')} via le formulaire de contact TCDynamics`
      });

      emailResult = {
        success: true,
        emailId: emailResponse.data?.id || emailResponse.id
      };
      console.log('Contact email sent successfully:', emailResult.emailId);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      console.error('Email error details:', emailError.message, emailError.stack);
      // Don't fail the request if email fails - data is already saved
    }

    res.status(200).json({
      success: true,
      message: 'Message envoyé avec succès',
      messageId: result.id,
      emailSent: emailResult.success,
      emailId: emailResult.emailId
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
}
