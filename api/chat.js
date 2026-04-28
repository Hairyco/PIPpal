export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, medProfile, conversationHistory } = req.body;
    const conditions = medProfile?.conditions?.map(c => c.name).join(', ') || 'not specified';

    const systemPrompt = `You are PIPpal's guidance assistant — a friendly expert helping UK citizens navigate PIP (Personal Independence Payment) disability benefits.

${conditions !== 'not specified' ? `The user has: ${conditions}.` : ''}

Key facts:
- PIP has Daily Living (10 activities) and Mobility (2 activities) components
- Standard = 8+ points, Enhanced = 12+ points for each component
- Assessors check: safely, reliably, repeatedly, in reasonable time
- 60% of refused claims overturned at appeal
- PIP covers physical AND mental health conditions
- Rates 2025/26: Daily Living Standard £72.65/wk, Enhanced £108.55/wk; Mobility Standard £28.70/wk, Enhanced £75.75/wk

Be warm, concise, under 250 words. Use bullet points for lists.`;

    const messages = [
      ...(conversationHistory || []).slice(-10),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Sorry, I could not generate a response.';
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Chat error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}