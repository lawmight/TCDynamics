import { saveConversation } from './_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, sessionId, userEmail } = req.body;
    const conversationId = sessionId || `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message requis' });
    }

    // Check if OpenAI is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(503).json({ error: 'Service IA non configuré' });
    }

    // NOTE: Week 5 TODO - Switch to Azure OpenAI with singleton pattern
    // For now, using OpenAI directly
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
    const tokensUsed = data.usage?.total_tokens || 0;

    // Save conversation to Supabase
    const result = await saveConversation({
      sessionId: conversationId,
      userMessage: message,
      aiResponse,
      userEmail: userEmail || null,
      metadata: {
        model: 'gpt-3.5-turbo',
        tokens_used: tokensUsed,
        temperature: 0.7
      }
    });

    if (!result.success) {
      console.error('Failed to save conversation:', result.error);
      // Don't fail the request if conversation logging fails
      // Just log the error and continue
    }

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
