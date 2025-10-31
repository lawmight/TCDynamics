export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, company, businessNeeds } = req.body;

    // Validate required fields
    if (!name || !email || !businessNeeds) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'email', 'businessNeeds']
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // For MVP, we'll just log the demo request
    console.log('New demo request:', { name, email, company, businessNeeds });

    // TODO: Save to database
    // TODO: Send email notification

    const messageId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.status(200).json({
      success: true,
      message: 'Demande de démonstration envoyée',
      messageId,
      emailSent: false // TODO: implement email sending
    });

  } catch (error) {
    console.error('Demo form error:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
}
