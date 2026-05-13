// api/generate.js
// Merged generator — replaces generate-mr-letter.js, generate-sscs1.js, generate-coc-answers.js
// Reduces serverless function count from 14 → 12 (Vercel Hobby plan limit)
// Pass { type: 'mr-letter' | 'sscs1' | 'coc-answers' | 'coc-walkthrough-copy', ...data } in the request body

async function openaiChat(system, user, { jsonObject = false, maxTokens = 2000 } = {}) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');
  const body = {
    model: 'gpt-4o',
    max_tokens: maxTokens,
    temperature: jsonObject ? 0.65 : 0.55,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  };
  if (jsonObject) body.response_format = { type: 'json_object' };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return (data.choices?.[0]?.message?.content || '').trim();
}

async function anthropicComplete(prompt, maxTokens = 2000) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  return (data.content?.[0]?.text || '').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    type,
    savedAnswers,
    medProfile,
    decisionDetails,
    disputedActivities,
    mrOutcome,
    changes,
    baseCopy,
  } = req.body || {};

  const conditionsList = medProfile?.conditions?.map(c => c.name).join(', ') || 'not specified';

  let prompt = '';
  let responseKey = '';

  // ── MR LETTER ──────────────────────────────────────────────────────────────
  if (type === 'mr-letter') {
    const answersText = Object.entries(savedAnswers || {})
      .map(([id, answer]) => `${id.toUpperCase()}: ${answer}`)
      .join('\n\n');

    const disputedText = (disputedActivities || [])
      .map(a => `- ${a.activity}: DWP gave ${a.dwpScore} points, I believe I should score ${a.expectedScore} points because: ${a.reason}`)
      .join('\n');

    prompt = `You are helping a UK PIP claimant write a Mandatory Reconsideration letter to DWP.

Write a complete, professional MR letter based on this information:

CONDITIONS: ${conditionsList}

DECISION DETAILS:
${decisionDetails || 'Not provided'}

ACTIVITIES BEING DISPUTED:
${disputedText || 'To be identified from answers below'}

CLAIMANT'S SAVED PIP ANSWERS:
${answersText}

Rules for the letter:
- Use formal letter format with [YOUR NAME], [YOUR ADDRESS], [DATE], [YOUR NI NUMBER], [REFERENCE NUMBER] as placeholders
- Open by clearly stating this is a request for Mandatory Reconsideration
- For each disputed activity: state what DWP scored, quote what the claimant actually experiences from their answers, name the specific descriptor that should apply, and apply the SAFES rule (Safely, Acceptable standard, Frequently, Enough time, Sustainably)
- Reference the PA4 assessment report where relevant
- Use plain, clear English — no jargon
- Be specific and factual — use the claimant's own words from their answers
- End with a request for a full review and contact details placeholder
- Do not use ** for bold — use plain text
- Do not make up details not provided
- If disputed activities not specified, identify the strongest ones from the answers

Write the full letter now:`;
    responseKey = 'letter';

  // ── SSCS1 APPEAL REASONS ──────────────────────────────────────────────────
  } else if (type === 'sscs1') {
    const answersText = Object.entries(savedAnswers || {})
      .map(([id, answer]) => `${id.toUpperCase()}: ${String(answer).slice(0, 300)}`)
      .join('\n\n');

    const disputedText = (disputedActivities || [])
      .map(a => `- ${a.activity}: DWP gave ${a.dwpScore} pts, claimant believes ${a.expectedScore} pts`)
      .join('\n');

    prompt = `You are helping a UK PIP claimant write their SSCS1 tribunal appeal reasons.

CONDITIONS: ${conditionsList}

MANDATORY RECONSIDERATION OUTCOME:
${mrOutcome || 'Mandatory Reconsideration was unsuccessful'}

DISPUTED ACTIVITIES:
${disputedText || 'To be identified from answers'}

CLAIMANT'S SAVED PIP ANSWERS:
${answersText}

Write clear, structured SSCS1 appeal reasons. Format:

GROUNDS OF APPEAL

For each disputed activity, write a paragraph that:
1. States which descriptor should apply and why
2. Uses the SAFES rule (Safely, Acceptable standard, Frequently, Enough time, Sustainably) — if they fail any one of these they cannot do the activity reliably
3. Draws specifically from their own words in the answers above
4. Notes what the assessor got wrong based on the MR outcome

Keep language clear and factual. No jargon. No ** formatting. Use plain text.
End with a brief closing statement requesting the tribunal overturn the decision.

Write the appeal reasons now:`;
    responseKey = 'reasons';

  // ── CHANGE OF CIRCUMSTANCES ───────────────────────────────────────────────
  } else if (type === 'coc-answers') {
    const answersText = Object.entries(savedAnswers || {})
      .map(([id, answer]) => `${id.toUpperCase()}: ${String(answer).slice(0, 400)}`)
      .join('\n\n');

    const changesText = (changes || [])
      .map(c => `${c.activity}: ${c.whatChanged}`)
      .join('\n');

    prompt = `You are helping a UK PIP claimant update their answers for a Change of Circumstances review.

CONDITIONS: ${conditionsList}

WHAT HAS CHANGED (as described by the claimant):
${changesText}

THEIR PREVIOUS ANSWERS (for context):
${answersText}

Write updated answers for the activities where things have changed. For each one:
1. Acknowledge what they could do before
2. Clearly describe how it has worsened
3. Apply the SAFES rule — Safely, Acceptable standard, Frequently, Enough time, Sustainably
4. Use the claimant's own words where possible
5. Be specific with times and frequencies
6. Mention any new aids, supervision, or prompting now needed

Also write a brief covering paragraph (2-3 sentences) explaining the overall change in circumstances.

Plain English only. No ** formatting. Be specific and factual.

Write the updated answers now:`;
    responseKey = 'updatedAnswers';

  // ── COC WALKTHROUGH MICROCOPY — warm rewrite via ChatGPT ───────────────────
  } else if (type === 'coc-walkthrough-copy') {
    if (!baseCopy || typeof baseCopy !== 'object') {
      return res.status(400).json({ error: 'baseCopy JSON is required from the client.' });
    }

    const conditionsCue = conditionsList !== 'not specified' ? conditionsList : 'general UK PIP claimant';

    const system = `You are the voice of PIPpal, an app that helps people in the UK with their PIP (Personal Independence Payment) claims. Your job is to personalise the wording of the app's on-screen text so it feels warm, human, and reassuring for this specific user.

Write like a kind, knowledgeable friend — not a government form, not a chatbot, not a call centre script. Use plain, everyday British English. Short sentences. Keep it calm and gentle.

Rules:
- Return a single valid JSON object with EXACTLY the same keys and structure as the input. Do not add keys, remove keys, or rename anything.
- Only rewrite string values — never change keys, numbers, booleans, or arrays that aren't strings.
- Arrays must keep the same number of items (e.g. worthItems must stay exactly 3 items).
- Do not use markdown, bullet points, asterisks (**), or emoji in any string value.
- Do not mention ChatGPT, OpenAI, or any AI product.
- Where the original text warns about reassessment risk, keep the warning honest but phrase it gently — don't bury it, don't make it scarier than it needs to be.
- Keep button labels short (3–5 words max). Keep loading messages brief. Keep hint text friendly but concise.
- The user is likely tired, anxious, or dealing with a lot. Every word should feel like it comes from someone who genuinely wants to help.`;

    const user = `This user's conditions (use lightly for context, do not diagnose or make assumptions): ${conditionsCue}

Here is the JSON to personalise. Rewrite the string values in your warm, human voice. Keep every key, every structure, and every array length exactly as-is:

${JSON.stringify(baseCopy)}`;

    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ error: 'OpenAI unavailable', walkthroughCopy: null });
      }
      const raw = await openaiChat(system, user, { jsonObject: true, maxTokens: 4000 });
      const parsed = JSON.parse(raw || '{}');
      return res.status(200).json({ walkthroughCopy: parsed });
    } catch (err) {
      console.error('coc-walkthrough-copy:', err.message);
      return res.status(500).json({ error: err.message, walkthroughCopy: null });
    }

  } else {
    return res.status(400).json({ error: `Unknown type: ${type}` });
  }

  const openAiSystem =
    type === 'coc-answers'
      ? `You are PIPpal — calm, humane support for UK PIP claimants. Write in plain, warm spoken English someone exhausted can follow; never cold or jargon-heavy. Honour their lived experience without inventing facts. No markdown or **.`
      : type === 'mr-letter'
        ? `You help UK claimants draft Mandatory Reconsideration letters with clarity and dignity — professional plain English, factual, no markdown.`
        : `You help UK PIP tribunal appeals with factual plain English — no markdown.`;

  try {
    let text = '';
    const maxTok = type === 'coc-answers' ? 2400 : 2000;

    if (process.env.OPENAI_API_KEY) {
      try {
        text = await openaiChat(openAiSystem, prompt, { jsonObject: false, maxTokens: maxTok });
      } catch (e) {
        console.error('generate.js OpenAI:', e.message);
      }
    }
    if (!text && process.env.ANTHROPIC_API_KEY) {
      text = await anthropicComplete(prompt, maxTok);
    }
    if (!text) {
      return res.status(503).json({ error: 'No LLM configured or responses were empty.' });
    }

    res.status(200).json({ [responseKey]: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
