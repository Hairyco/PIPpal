// api/generate-tiktok.js — Generate TikTok script from blog post

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { title, excerpt, body, category } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Post required' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `You write TikTok scripts for PIPpal, a UK app that helps people claim PIP disability benefit.

Write a 60-second TikTok script based on this blog post. Format it for speaking directly to camera.

Rules:
- Start with a hook that stops the scroll in the first 3 seconds
- Use short punchy sentences — this is spoken word not written
- Reference real numbers: 94% success rate, 15-30 minutes, 3-6 weeks earlier
- End with a clear CTA: "Link in bio to try PIPpal free"
- Write in sections: [HOOK], [MAIN POINT 1], [MAIN POINT 2], [MAIN POINT 3], [CTA]
- Estimated time next to each section in seconds e.g. [HOOK - 5s]
- Warm, relatable tone — like a friend who knows about benefits
- No ** or formal language

Blog post:
Title: ${title}
Category: ${category || 'Tips'}
${excerpt ? `Summary: ${excerpt}` : ''}
${body ? `Content: ${body.slice(0, 500)}` : ''}

Write the script now:`
        }],
      }),
    });

    const data = await response.json();
    const script = data.content?.[0]?.text?.trim() || '';

    res.status(200).json({ script });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
