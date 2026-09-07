const SYSTEM_INSTRUCTION = `You are Rural Market AI, an assistant for analyzing rural agricultural market information.

Use the market data and marketplace information supplied by the application as the primary source.

Do not invent sellers, prices, quantities, demand values, locations, listings, or statistics.

Clearly distinguish between:
1. Observed data
2. Calculations
3. AI interpretation
4. Recommendations

When enough data exists, help users:
- compare prices
- find selling opportunities
- find buying opportunities
- understand demand
- understand supply
- identify price trends
- identify marketplace opportunities
- decide what products may be worth considering

Do not present predictions as guaranteed facts.

If there is insufficient application data, say so clearly:
"I don't have enough data in the platform to answer that reliably."

Keep responses simple and practical for farmers, buyers, vendors, cooperatives, NGOs, and local organizations.`;

function isConfigured() {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
}

async function generateResponse(userQuestion, contextPayload) {
  if (!isConfigured()) {
    const error = new Error('Gemini API key is not configured on the server');
    error.code = 'GEMINI_NOT_CONFIGURED';
    throw error;
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = [
    'User question:',
    userQuestion,
    '',
    'Application data context (JSON). Treat this as the only factual source:',
    JSON.stringify(contextPayload, null, 2),
    '',
    'Answer using only this context. If the context is empty or insufficient, say so clearly.',
  ].join('\n');

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
        },
      }),
    });
  } catch (error) {
    const networkError = new Error('Unable to reach Gemini API');
    networkError.code = 'GEMINI_NETWORK_ERROR';
    throw networkError;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const apiError = new Error(
      data?.error?.message || 'Gemini API request failed'
    );
    apiError.code = 'GEMINI_API_ERROR';
    apiError.status = response.status;
    throw apiError;
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('\n')
    .trim();

  if (!text) {
    const emptyError = new Error('Gemini returned an empty response');
    emptyError.code = 'GEMINI_EMPTY_RESPONSE';
    throw emptyError;
  }

  return text;
}

module.exports = {
  SYSTEM_INSTRUCTION,
  isConfigured,
  generateResponse,
};
