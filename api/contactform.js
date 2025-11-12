import { saveContact } from './_lib/supabase.js';
import { sendContactNotification } from './_lib/email.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message, phone, company } = req.body;

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

    // Send email notification
    const emailResult = await sendContactNotification({
      name,
      email,
      message,
      phone,
      company
    });

    if (!emailResult.success) {
      console.error('Failed to send email notification:', emailResult.error);
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
