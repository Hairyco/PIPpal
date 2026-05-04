// api/generate-sscs1.js
// Generates SSCS1 appeal reasons using saved PIP answers and MR outcome

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { savedAnswers, medProfile, mrOutcome, disputedActivities } = req.body || {};

  const conditionsList = medProfile?.conditions?.map(c => c.name).join(', ') || 'not specified';
  const answersText = Object.entries(savedAnswers || {})
    .map(([id, answer]) => `${id.toUpperCase()}: ${String(answer).slice(0, 300)}`)
    .join('\n\n');
  const disputedText = (disputedActivities || [])
    .map(a => `- ${a.activity}: DWP gave ${a.dwpScore} pts, claimant believes ${a.expectedScore} pts`)
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
          content: `You are helping a UK PIP claimant write their SSCS1 tribunal appeal reasons.

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

Write the appeal reasons now:`
        }],
      }),
    });

    const data = await response.json();
    const reasons = data.content?.[0]?.text?.trim() || '';
    res.status(200).json({ reasons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
