// api/generate-blog.js
// Generates SEO blog posts targeting PIP claimant questions

// Common PIP questions sourced from Reddit/forums — used as fallback when Reddit is blocked
const PIP_TOPICS = [
  { title: "How do I fill in a PIP form with anxiety?", subreddit: "PIP_UK", score: 450 },
  { title: "My PIP was rejected — can I appeal?", subreddit: "DWPhelp", score: 380 },
  { title: "What counts as a good day vs bad day for PIP?", subreddit: "PIP_UK", score: 320 },
  { title: "PIP assessment tips — what to say", subreddit: "BenefitsAdviceUK", score: 290 },
  { title: "How long does a PIP decision take?", subreddit: "PIP_UK", score: 250 },
  { title: "Can I get PIP for depression and anxiety?", subreddit: "PIP_UK", score: 230 },
  { title: "PIP for ADHD — does it qualify?", subreddit: "PIP_UK", score: 210 },
  { title: "What happens at a PIP telephone assessment?", subreddit: "PIP_UK", score: 200 },
  { title: "PIP mandatory reconsideration — how does it work?", subreddit: "DWPhelp", score: 190 },
  { title: "How much is PIP worth per week in 2025?", subreddit: "BenefitsAdviceUK", score: 180 },
  { title: "PIP for fibromyalgia — what to include", subreddit: "PIP_UK", score: 170 },
  { title: "Can I work and still claim PIP?", subreddit: "PIP_UK", score: 160 },
];

async function fetchRedditQuestions() {
  const subreddits = ['PIP_UK', 'DWPhelp', 'BenefitsAdviceUK'];
  const questions = [];

  for (const sub of subreddits) {
    try {
      const res = await fetch(
        `https://www.reddit.com/r/${sub}/hot.json?limit=10`,
        { headers: { 'User-Agent': 'PIPpal/1.0' }, signal: AbortSignal.timeout(4000) }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const posts = data?.data?.children || [];
      for (const post of posts) {
        const p = post.data;
        if (p.title && p.score > 5) {
          questions.push({ title: p.title, subreddit: p.subreddit, score: p.score, url: `https://reddit.com${p.permalink}` });
        }
      }
    } catch { continue; }
  }

  // Fall back to hardcoded topics if Reddit is blocked
  if (questions.length === 0) {
    console.log('Reddit blocked — using hardcoded PIP topics');
    return PIP_TOPICS;
  }

  questions.sort((a, b) => b.score - a.score);
  return questions.slice(0, 15);
}

async function generatePost(topic, questions) {
  const redditContext = questions.slice(0, 8)
    .map(q => `- "${q.title}" (r/${q.subreddit}, ${q.score} upvotes)`)
    .join('\n');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are a content writer for PIPpal, a UK service that helps people claim Personal Independence Payment (PIP).

## About PIPpal — use these facts naturally throughout the post:
- PIPpal guides claimants through all 12 PIP questions in plain English
- Average completion time: 15-30 minutes (vs weeks of confusion alone)
- 94% success rate for users who complete their claim with PIPpal
- Get your decision 3-6 weeks earlier than average claimants
- Translates your answers into DWP-appropriate language automatically
- Includes Assessment Prep — know exactly what assessors look for
- Costs £12.99 one-time — no subscription
- Used by thousands of claimants across the UK

## Post to write:
Topic: ${topic}

Real questions PIP claimants are asking online:
${redditContext}

## Writing guidelines:
- Answer the topic question clearly in the first 2 paragraphs
- Use plain English — no jargon
- Weave in 2-3 of PIPpal's key stats naturally (not all at once)
- Make the reader feel the pain of doing this alone, then introduce PIPpal as the solution
- End with a strong CTA: "PIPpal helps thousands of claimants complete their PIP form in 15-30 minutes with a 94% success rate. Try it for £12.99 — a fraction of what you could receive."
- Tone: warm, empathetic, practical — like advice from a knowledgeable friend

Respond with ONLY a valid JSON object — no markdown, no backticks, no extra text. Use this exact structure:
{"title":"SEO title 50-60 chars with PIP keyword","slug":"url-slug","excerpt":"Meta description 150-160 chars with keyword","category":"Tips","tags":["tag1","tag2"],"body":"Post body. Use # for h1, ## for h2, - for bullets. 600-900 words. Include PIPpal stats naturally. End with strong CTA."}`
      }],
    }),
  });

  const data = await response.json();
  let text = data.content?.[0]?.text?.trim() || '';

  // Strip any markdown code fences if present
  text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    const parsed = JSON.parse(text);

    // Calculate SEO metrics
    const wordCount = (parsed.body || '').split(/\s+/).length;
    const titleLen = (parsed.title || '').length;
    const excerptLen = (parsed.excerpt || '').length;
    const keyword = 'PIP';
    const bodyLower = (parsed.body || '').toLowerCase();
    const titleLower = (parsed.title || '').toLowerCase();
    const excerptLower = (parsed.excerpt || '').toLowerCase();
    const keywordInBody = (bodyLower.match(/\bpip\b/g) || []).length;

    let score = 0;
    if (titleLen >= 50 && titleLen <= 60) score += 20; else if (titleLen >= 40) score += 10;
    if (excerptLen >= 150 && excerptLen <= 160) score += 20; else if (excerptLen >= 120) score += 10;
    if (titleLower.includes('pip')) score += 20;
    if (excerptLower.includes('pip')) score += 15;
    if (keywordInBody >= 5) score += 15; else if (keywordInBody >= 3) score += 10;
    if (wordCount >= 600) score += 10;

    parsed.seo = {
      title_length: titleLen,
      excerpt_length: excerptLen,
      keyword,
      keyword_in_title: titleLower.includes('pip'),
      keyword_in_excerpt: excerptLower.includes('pip'),
      keyword_in_body: keywordInBody,
      word_count: wordCount,
      readability: wordCount > 800 ? 'Medium' : 'Easy',
      score,
    };

    return parsed;
  } catch (err) {
    console.log('JSON parse error:', err.message);
    console.log('Raw response:', text.slice(0, 200));
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic } = req.body || {};

  try {
    const questions = await fetchRedditQuestions();
    const targetTopic = topic || questions[0]?.title || 'How to claim PIP successfully';
    console.log('Generating post for topic:', targetTopic);

    const post = await generatePost(targetTopic, questions);

    if (!post) return res.status(500).json({ error: 'Failed to parse generated post' });

    res.status(200).json({
      post,
      reddit_sources: questions.filter(q => q.url).slice(0, 5),
      generated_from: targetTopic,
    });
  } catch (err) {
    console.log('Generate blog error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
