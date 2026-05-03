// api/generate-blog.js
// Fetches Reddit questions and generates SEO blog posts

async function fetchRedditQuestions() {
  const subreddits = ['PIP_UK', 'DWPhelp', 'BenefitsAdviceUK', 'disability'];
  const questions = [];

  for (const sub of subreddits) {
    try {
      const res = await fetch(
        `https://www.reddit.com/r/${sub}/hot.json?limit=10`,
        { headers: { 'User-Agent': 'PIPpal/1.0 blog-generator' }, signal: AbortSignal.timeout(5000) }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const posts = data?.data?.children || [];
      for (const post of posts) {
        const p = post.data;
        if (p.title && p.score > 5) {
          questions.push({
            title: p.title,
            body: p.selftext?.slice(0, 300) || '',
            score: p.score,
            url: `https://reddit.com${p.permalink}`,
            subreddit: p.subreddit,
          });
        }
      }
    } catch { continue; }
  }

  // Sort by score
  questions.sort((a, b) => b.score - a.score);
  return questions.slice(0, 15);
}

async function generatePost(topic, redditContext) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are a content writer for PIPpal, a UK service that helps people claim Personal Independence Payment (PIP).

Write a blog post that:
1. Targets people searching for help with PIP claims
2. Answers a real question PIP claimants have
3. Naturally positions PIPpal as the solution
4. Is SEO-optimised for UK benefit claimants
5. Uses plain English — no jargon

Topic to cover: ${topic}

Real questions from PIP claimants online:
${redditContext}

Write the blog post in this exact JSON format (respond with ONLY valid JSON, no markdown):
{
  "title": "SEO optimised title (50-60 chars, include 'PIP' naturally)",
  "slug": "url-friendly-slug-with-hyphens",
  "excerpt": "Meta description (150-160 chars, compelling, includes main keyword)",
  "category": "one of: Tips, How To, Appeals, Legislation, News, Success Stories",
  "tags": ["tag1", "tag2", "tag3"],
  "body": "Full post body using # for main headings, ## for subheadings, - for bullet points. 600-900 words. End with a section about how PIPpal helps.",
  "seo": {
    "title_length": 0,
    "excerpt_length": 0,
    "keyword": "main target keyword",
    "keyword_in_title": true,
    "keyword_in_excerpt": true,
    "word_count": 0,
    "readability": "Easy/Medium/Hard",
    "score": 0
  }
}`
      }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text?.trim() || '';

  try {
    const parsed = JSON.parse(text);
    // Calculate real SEO metrics
    const wordCount = parsed.body?.split(' ').length || 0;
    const titleLen = parsed.title?.length || 0;
    const excerptLen = parsed.excerpt?.length || 0;
    const keyword = parsed.seo?.keyword || '';
    const keywordInTitle = parsed.title?.toLowerCase().includes(keyword.toLowerCase());
    const keywordInExcerpt = parsed.excerpt?.toLowerCase().includes(keyword.toLowerCase());
    const keywordInBody = (parsed.body?.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;

    let score = 0;
    if (titleLen >= 50 && titleLen <= 60) score += 20;
    else if (titleLen >= 40 && titleLen <= 70) score += 10;
    if (excerptLen >= 150 && excerptLen <= 160) score += 20;
    else if (excerptLen >= 120 && excerptLen <= 180) score += 10;
    if (keywordInTitle) score += 20;
    if (keywordInExcerpt) score += 15;
    if (keywordInBody >= 3) score += 15;
    if (wordCount >= 600) score += 10;

    parsed.seo = {
      title_length: titleLen,
      excerpt_length: excerptLen,
      keyword,
      keyword_in_title: keywordInTitle,
      keyword_in_excerpt: keywordInExcerpt,
      keyword_in_body: keywordInBody,
      word_count: wordCount,
      readability: wordCount > 800 ? 'Medium' : 'Easy',
      score,
    };

    return parsed;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic } = req.body || {};

  try {
    // Fetch Reddit questions
    const questions = await fetchRedditQuestions();
    const redditContext = questions.slice(0, 8).map(q => `- "${q.title}" (r/${q.subreddit}, ${q.score} upvotes)`).join('\n');

    // Generate post
    const targetTopic = topic || (questions[0]?.title || 'How to claim PIP successfully');
    const post = await generatePost(targetTopic, redditContext);

    if (!post) return res.status(500).json({ error: 'Failed to generate post' });

    res.status(200).json({
      post,
      reddit_sources: questions.slice(0, 5),
      generated_from: targetTopic,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
