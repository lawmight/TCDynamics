export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, sessionId } = req.body;
    const conversationId = sessionId || `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message requis' });
    }

    // Check if OpenAI is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(503).json({ error: 'Service IA non configuré' });
    }

    // For MVP, we'll use OpenAI directly (you can switch to Azure OpenAI later)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // or gpt-4 for better responses
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant IA helpful pour TCDynamics, une entreprise française spécialisée dans l\'automatisation et l\'IA. Réponds en français de manière professionnelle et helpful.'
          },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer une réponse.';

    // TODO: Save conversation to database
    console.log('AI Chat:', { conversationId, userMessage: message, aiResponse });

    res.status(200).json({
      success: true,
      response: aiResponse,
      conversationId
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({
      error: 'Erreur du service IA',
      message: error.message
    });
  }
}
