export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;

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

    // For MVP, we'll just log the contact and return success
    // In production, you'd save to database and send email
    console.log('New contact form submission:', { name, email, message });

    // TODO: Save to database (Supabase, Firebase, etc.)
    // TODO: Send email notification

    const messageId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.status(200).json({
      success: true,
      message: 'Message envoyé avec succès',
      messageId,
      emailSent: false // TODO: implement email sending
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
}
