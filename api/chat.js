export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, medProfile, conversationHistory } = req.body;

    const systemPrompt = `You are PIPpal's AI assistant — a friendly, expert guide helping UK citizens navigate the Personal Independence Payment (PIP) disability benefits system.

Your role:
- Answer questions about PIP eligibility, assessments, descriptors, scoring, and appeals
- Help users understand their rights and what to do after a decision
- Translate plain English descriptions of health conditions into language that scores well on PIP descriptors
- Help with Mandatory Reconsideration and tribunal appeals
- Always be warm, empathetic and non-judgmental

${medProfile?.conditions?.length > 0 ? `The user has the following conditions: ${medProfile.conditions.map(c => c.name).join(', ')}.` : ''}

Key facts to know:
- PIP has two components: Daily Living (10 activities) and Mobility (2 activities)
- Standard Daily Living = 8+ points, Enhanced = 12+ points
- Standard Mobility = 8+ points, Enhanced = 12+ points  
- Assessors look at whether you can complete activities safely, reliably, repeatedly and in a reasonable time
- 60% of refused claims are overturned at appeal
- PIP is for physical AND mental health conditions
- Current rates (2025/26): Daily Living Standard £72.65/week, Enhanced £108.55/week; Mobility Standard £28.70/week, Enhanced £75.75/week

Always:
- Be concise but thorough
- Use bullet points for lists
- Mention the PIP Diary for evidence
- Encourage users who feel hopeless about their claim
- Remind users that PIP is about worst days, not best days
- Never provide legal advice, but help them understand their options

Keep responses under 300 words unless the question requires more detail.`;

    const messages = [
      ...(conversationHistory || []),
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
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.content[0]?.text || 'Sorry, I could not generate a response. Please try again.';

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({ error: error.message });
  }
}
