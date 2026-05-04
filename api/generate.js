// api/generate.js
// Merged generator — replaces generate-mr-letter.js, generate-sscs1.js, generate-coc-answers.js
// Reduces serverless function count from 14 → 12 (Vercel Hobby plan limit)
// Pass { type: 'mr-letter' | 'sscs1' | 'coc-answers', ...data } in the request body

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, savedAnswers, medProfile, decisionDetails, disputedActivities, mrOutcome, changes } = req.body || {};

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

  } else {
    return res.status(400).json({ error: `Unknown type: ${type}` });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text?.trim() || '';
    res.status(200).json({ [responseKey]: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
