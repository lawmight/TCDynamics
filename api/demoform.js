import { saveDemoRequest } from './_lib/supabase.js';
import { sendDemoNotification } from './_lib/email.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
    } = req.body;

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

    // Send email notification
    const emailResult = await sendDemoNotification({
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

    if (!emailResult.success) {
      console.error('Failed to send email notification:', emailResult.error);
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
