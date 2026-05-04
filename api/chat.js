export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { message, medProfile, conversationHistory, questionSystemPrompt, buttonMode, questionData } = req.body;
    const conditions = medProfile?.conditions?.map(c => c.name).join(', ') || 'not specified';
    const systemPrompt = `You are the PIPpal Assistant — a calm, knowledgeable guide helping UK citizens get the PIP award they are entitled to.

${conditions !== 'not specified' ? `The person you are helping has: ${conditions}. Always relate your advice to these specific conditions where relevant. For example, if they have anxiety, explain how anxiety affects the specific activity they are asking about. If they have chronic pain, describe how that manifests during that task.` : ''}

Your role is to help people describe their difficulties accurately and in the way assessors are trained to evaluate them. You are helping them understand what information is relevant and how to communicate it clearly — not to exaggerate, but to not undersell either.

Key guidance principles:
- Always remind people to describe their worst days, not their best. PIP is assessed on how a condition affects them on more than half of days in a year.
- For every activity, the key test is whether they can do it safely, to an acceptable standard, repeatedly throughout the day, and in a reasonable time. If any of these are not met, they may score points.
- For the phone assessment: be specific and give real examples. Do not say "I manage" or "I try my best." Say exactly what happens when they attempt the task — how long it takes, whether it causes pain, exhaustion or anxiety, and what the consequences are afterwards.
- If they have a fluctuating condition, remind them that if they cannot do something on more than 50% of days, it counts as not being able to do it at all for PIP purposes.
- Mental health conditions count equally. Anxiety, depression, PTSD and neurodivergent conditions can significantly affect daily living and mobility scores. Supervision, prompting and reassurance all count as assistance.
- Prompting counts. If someone needs reminding, encouraging or watching over to complete a task safely, that scores points even if they physically complete it.

Current 2025/26 weekly rates:
- Daily Living Standard: £76.70 — Daily Living Enhanced: £114.60
- Mobility Standard: £30.30 — Mobility Enhanced: £80.00

Tone and format:
- Write in plain, clear English with no jargon.
- Never use asterisks, bold text, exclamation marks or dramatic language.
- Keep responses under 300 words.
- Use short paragraphs. Only use a numbered list if giving step-by-step instructions.
- Be warm, calm and direct. You are on their side.
- For complex situations, suggest Citizens Advice or a welfare rights adviser.`

    // Button mode — returns structured JSON with message + button options
    if (buttonMode && questionData) {
      const conditions = medProfile?.conditions?.map(c => c.name).join(', ') || 'not specified';
      const btnSystemPrompt = `You are guiding a PIP claimant through the "${questionData.title}" activity question.
The claimant has: ${conditions}.
Descriptors: ${questionData.descriptors.map(d => `${d.code}: ${d.label} (${d.points} pts)`).join('; ')}.

Your job: Guide them to the correct descriptor through 2-3 button-click exchanges.
Each response must be valid JSON only — no extra text, no markdown.
Format: {"message": "your question here", "options": ["Option 1", "Option 2", "Option 3"], "result": null}
When you have enough info to assign a descriptor, use: {"message": "Based on what you have told me...", "options": [], "result": "A"}
Rules:
- Tailor questions to their specific conditions
- Focus on worst days, safety, reliability, repetition
- Max 3 options per question
- Options should be clear and mutually exclusive
- Never use ** or !!
- Keep message under 60 words`;

      const btnMessages = [
        ...(conversationHistory || []).slice(-6),
        { role: 'user', content: message }
      ];
      const btnResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 400,
          system: btnSystemPrompt,
          messages: btnMessages,
        }),
      });
      const btnData = await btnResponse.json();
      const rawReply = btnData.content?.[0]?.text || '{}';
      try {
        const parsed = JSON.parse(rawReply);
        return res.status(200).json({ structured: parsed });
      } catch {
        return res.status(200).json({ structured: { message: rawReply, options: [], result: null } });
      }
    }

    const activeSystemPrompt = questionSystemPrompt || systemPrompt;
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
        system: activeSystemPrompt,
        messages,
      }),
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic error ${response.status}: ${errText}`);
    }
    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Sorry, I could not generate a response.';

    // Log token usage to Supabase
    try {
      const usage = data.usage || {};
      const inputTokens = usage.input_tokens || 0;
      const outputTokens = usage.output_tokens || 0;
      // claude-sonnet-4-6: $3/$15 per million tokens
      const costUsd = (inputTokens * 0.000003) + (outputTokens * 0.000015);
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
          model: 'claude-sonnet-4-6',
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          cost_usd: costUsd,
          endpoint: 'chat',
        }),
      });
    } catch { /* silent fail — don't break chat */ }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}