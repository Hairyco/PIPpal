// api/generate-coc-answers.js
// Generates updated PIP answers showing what has changed since last assessment

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { savedAnswers, medProfile, changes } = req.body || {};

  const conditionsList = medProfile?.conditions?.map(c => c.name).join(', ') || 'not specified';
  const answersText = Object.entries(savedAnswers || {})
    .map(([id, answer]) => `${id.toUpperCase()}: ${String(answer).slice(0, 400)}`)
    .join('\n\n');
  const changesText = (changes || [])
    .map(c => `${c.activity}: ${c.whatChanged}`)
    .join('\n');

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
        messages: [{
          role: 'user',
          content: `You are helping a UK PIP claimant update their answers for a Change of Circumstances review.

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

Write the updated answers now:`
        }],
      }),
    });

    const data = await response.json();
    const updatedAnswers = data.content?.[0]?.text?.trim() || '';
    res.status(200).json({ updatedAnswers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
