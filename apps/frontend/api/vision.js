export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl } = req.body;

    // Type-check imageUrl before calling string methods
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
      return res.status(400).json({ error: 'URL d\'image requise' });
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      return res.status(400).json({ error: 'URL d\'image invalide' });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(503).json({ error: 'Service Vision non configuré' });
    }

    // Use OpenAI Vision API (GPT-4o)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image and describe what you see. If there\'s text, extract it. Provide a detailed caption and any readable text.'
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI Vision API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content || 'Impossible d\'analyser l\'image.';

    // Extract text if possible (simple extraction)
    const textMatch = analysis.match(/text[^:]*:?\s*([^.]*)/i);
    const extractedText = textMatch ? textMatch[1].trim() : '';

    res.status(200).json({
      success: true,
      response: `Image analysée: ${analysis.substring(0, 100)}...`,
      caption: analysis,
      text: extractedText,
      description: analysis
    });

  } catch (error) {
    console.error('Vision API error:', error);
    res.status(500).json({
      error: 'Erreur du service de vision',
      message: error.message
    });
  }
}
