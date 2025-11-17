import { saveDemoRequest } from './_lib/supabase.js';
import { sendDemoNotification } from './_lib/email.js';

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
        error: 'Champs requis manquants',
        message: 'Veuillez remplir tous les champs obligatoires : nom, email, entreprise et besoins spécifiques.',
        required: ['name', 'email', 'company', 'businessNeeds']
      });
    }

    // Validate businessNeeds length (10-5000 characters)
    if (businessNeeds.trim().length < 10 || businessNeeds.trim().length > 5000) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Le champ "Besoins spécifiques" doit contenir entre 10 et 5000 caractères.'
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

    // Send email notification using shared utility function
    const emailResult = await sendDemoNotification({
      name,
      email,
      phone,
      jobTitle,
      company,
      companySize,
      industry,
      businessNeeds,
      useCase,
      timeline,
      preferredDate,
      message
    });

    if (emailResult.success) {
      console.log('Demo email sent successfully:', emailResult.emailId);
    } else {
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
