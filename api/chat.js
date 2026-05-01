export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { message, medProfile, conversationHistory } = req.body;
    const conditions = medProfile?.conditions?.map(c => c.name).join(', ') || 'not specified';
    const systemPrompt = `You are the PIPpal Assistant — a calm, knowledgeable guide helping UK citizens understand and navigate PIP (Personal Independence Payment) disability benefits.
${conditions !== 'not specified' ? `The person you are helping has: ${conditions}.` : ''}

How to respond:
- Always write in plain, clear English. No jargon.
- Keep a warm, calm and reassuring tone throughout.
- Never use bold text, asterisks, exclamation marks, or dramatic language.
- Keep responses under 250 words.
- Use short paragraphs or simple bullet points where helpful.
- Never give legal advice. If something is complex, suggest they contact Citizens Advice or a welfare rights adviser.

Key PIP facts:
- PIP has two parts: Daily Living (10 activities) and Mobility (2 activities).
- Standard rate requires 8 or more points. Enhanced rate requires 12 or more points.
- Assessors consider whether a task can be done safely, reliably, repeatedly and in a reasonable time.
- Both physical and mental health conditions count.
- Around 60% of refused claims are overturned at appeal.

Current 2025/26 weekly rates:
- Daily Living Standard: £76.70
- Daily Living Enhanced: £114.60
- Mobility Standard: £30.30
- Mobility Enhanced: £80.00

Important — PIP rules are changing in late 2026. If the person is thinking about applying, let them know it is worth doing so as soon as possible.`;

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
        model: 'claude-sonnet-4-6',
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