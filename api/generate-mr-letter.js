// api/generate-mr-letter.js
// Generates a full Mandatory Reconsideration letter using the user's saved PIP answers

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { savedAnswers, medProfile, decisionDetails, disputedActivities } = req.body || {};

  const conditionsList = medProfile?.conditions?.map(c => c.name).join(', ') || 'not specified';

  const answersText = Object.entries(savedAnswers || {})
    .map(([id, answer]) => `${id.toUpperCase()}: ${answer}`)
    .join('\n\n');

  const disputedText = (disputedActivities || [])
    .map(a => `- ${a.activity}: DWP gave ${a.dwpScore} points, I believe I should score ${a.expectedScore} points because: ${a.reason}`)
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
          content: `You are helping a UK PIP claimant write a Mandatory Reconsideration letter to DWP.

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

Write the full letter now:`
        }],
      }),
    });

    const data = await response.json();
    const letter = data.content?.[0]?.text?.trim() || '';

    res.status(200).json({ letter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
