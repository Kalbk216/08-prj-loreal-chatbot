// Copy this code into your Cloudflare Worker script

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const apiKey = env.OPENAI_API_KEY;
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const userInput = await request.json();

    const requestBody = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a friendly L'Oréal beauty advisor chatbot. You ONLY answer questions about L'Oréal products, skincare, haircare, makeup, fragrances, and beauty routines.

If a user asks about anything unrelated to L'Oréal or beauty/skincare topics (e.g. politics, coding, sports, unrelated brands), politely decline and steer the conversation back to L'Oréal products and routines.

Keep responses friendly, concise, and helpful — like a knowledgeable in-store beauty advisor.`
        },
        ...userInput.messages
      ],
      max_completion_tokens: 300,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), { headers: corsHeaders });
  }
};