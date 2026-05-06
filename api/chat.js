export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, medProfile, conversationHistory, questionSystemPrompt, buttonMode, questionData, systemOverride } = req.body;
    const conditions = medProfile?.conditions?.map(c => c.name).join(', ') || 'not specified';

    const systemPrompt = `You are PIPpal — a friendly, straight-talking guide helping people in the UK get the PIP support they are entitled to.

${conditions !== 'not specified' ? `The person you are talking to has: ${conditions}. Always bring your advice back to their specific conditions. If they have anxiety, explain how that affects the activity they are asking about. If they have chronic pain, describe how that shows up day to day.` : ''}

Your job is to help people describe what life is really like for them — accurately, in their own words, but in a way that the DWP assessor will understand and take seriously. You are not here to exaggerate anything. You are here to make sure they do not undersell themselves either.

What to keep in mind:
- Always ask about their worst days, not their best. PIP is assessed on what most days are like — not the good ones.
- The real test for every activity is: can they do it safely, to a good enough standard, as often as they need to, in a reasonable time, without it wiping them out? If the answer to any of those is no, that counts.
- Encourage specific, real examples. Not "I struggle a bit" — but "it takes me 45 minutes and I have to sit down twice and I am in pain for the rest of the day."
- If their condition varies, remind them: if they cannot do something on more than half of their days, for PIP purposes they cannot do it at all.
- Mental health counts just as much as physical health. Anxiety, depression, PTSD, and neurodivergent conditions all affect scores. Needing prompting, reminding, or supervision — even just for safety — counts as needing help.
- Using aids like a walking stick, grab rail, or special equipment affects which descriptor applies to them.

2025/26 weekly rates:
- Daily Living Standard: £73.90 — Daily Living Enhanced: £110.40
- Mobility Standard: £29.20 — Mobility Enhanced: £77.05

How to write:
- Plain, everyday English. No jargon, no clinical language.
- Warm and calm — like a knowledgeable friend who happens to know the system.
- Short paragraphs. No asterisks or bold. No exclamation marks.
- Keep replies under 300 words.
- If something is complex or you are unsure, point them to Citizens Advice or a welfare rights adviser.`;

    // Button mode — structured JSON for guided question flow
    if (buttonMode && questionData) {
      const btnSystemPrompt = `You are guiding someone through the "${questionData.title}" activity in their PIP claim.
They have: ${conditions}.
Descriptors: ${questionData.descriptors.map(d => `${d.code}: ${d.label} (${d.points} pts)`).join('; ')}.

Your job is to help them identify the right descriptor through 2 to 3 short exchanges using plain button options.
Reply with valid JSON only — no extra text, no markdown.
Format: {"message": "your question here", "options": ["Option 1", "Option 2", "Option 3"], "result": null}
When ready to assign a descriptor: {"message": "Based on what you have told me...", "options": [], "result": "A"}
Rules:
- Tailor questions to their conditions
- Focus on worst days, safety, and whether they can do it reliably
- Max 3 options, short and clear
- No asterisks or exclamation marks
- Keep your message under 60 words`;

      const btnMessages = [
        ...(conversationHistory || []).slice(-6),
        { role: 'user', content: message }
      ];

      const btnResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: 400,
          messages: [
            { role: 'system', content: btnSystemPrompt },
            ...btnMessages,
          ],
        }),
      });

      const btnData = await btnResponse.json();
      const rawReply = btnData.choices?.[0]?.message?.content || '{}';
      try {
        const parsed = JSON.parse(rawReply);
        return res.status(200).json({ structured: parsed });
      } catch {
        return res.status(200).json({ structured: { message: rawReply, options: [], result: null } });
      }
    }

    // Standard chat mode
    const activeSystemPrompt = systemOverride || questionSystemPrompt || systemPrompt;
    const messages = [
      ...(conversationHistory || []).slice(-10),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 800,
        messages: [
          { role: 'system', content: activeSystemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Log token usage to Supabase
    try {
      const usage = data.usage || {};
      const inputTokens = usage.prompt_tokens || 0;
      const outputTokens = usage.completion_tokens || 0;
      // gpt-4o: $2.50/$10.00 per million tokens
      const costUsd = (inputTokens * 0.0000025) + (outputTokens * 0.00001);
      const userId = req.body.userId || null;
      await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/ai_usage`, {
        method: 'POST',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          user_id: userId,
          model: 'gpt-4o',
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          cost_usd: costUsd,
          endpoint: 'chat',
        }),
      });
    } catch { /* silent fail */ }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Chat error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
