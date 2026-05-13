// Shared blog generation for admin + daily cron (no Reddit).

/** @typedef {{ title: string, score?: number }} PipTopic */

/** @type {PipTopic[]} */
export const PIP_TOPICS = [
  { title: 'How do I fill in a PIP form with anxiety?', score: 450 },
  { title: 'My PIP was rejected — can I appeal?', score: 380 },
  { title: 'What counts as a good day vs bad day for PIP?', score: 320 },
  { title: 'PIP assessment tips — what to say', score: 290 },
  { title: 'How long does a PIP decision take?', score: 250 },
  { title: 'Can I get PIP for depression and anxiety?', score: 230 },
  { title: 'PIP for ADHD — does it qualify?', score: 210 },
  { title: 'What happens at a PIP telephone assessment?', score: 200 },
  { title: 'PIP mandatory reconsideration — how does it work?', score: 190 },
  { title: 'How much is PIP worth per week in 2025?', score: 180 },
  { title: 'PIP for fibromyalgia — what to include', score: 170 },
  { title: 'Can I work and still claim PIP?', score: 160 },
  { title: 'PIP evidence checklist — what to send', score: 155 },
  { title: 'PIP renewal form: how to keep your award', score: 154 },
  { title: 'PIP tribunal: step-by-step guide', score: 153 },
  { title: 'Reading your PIP assessment report', score: 152 },
  { title: 'PIP descriptors explained in plain English', score: 151 },
  { title: 'Planning and following journeys — PIP daily living', score: 150 },
  { title: 'Mobility: the 50-metre rule and PIP', score: 149 },
  { title: 'PIP for chronic pain — what works on the form', score: 148 },
  { title: 'PIP for arthritis — tips for the assessment', score: 147 },
  { title: 'PIP and Universal Credit — what you should know', score: 146 },
  { title: 'How to request a PIP home assessment', score: 145 },
  { title: 'PIP reconsideration letter template ideas', score: 144 },
  { title: 'PIP form: preparing your medications box', score: 143 },
  { title: 'Face-to-face PIP assessment — practical tips', score: 142 },
  { title: 'PIP for autism — supporting your claim', score: 141 },
  { title: 'PIP for chronic fatigue — describing symptoms clearly', score: 140 },
  { title: 'PIP short award — what happens at review', score: 139 },
  { title: 'Sending extra evidence after you claimed PIP', score: 138 },
  { title: 'PIP and studying — does it affect a claim?', score: 137 },
  { title: 'PIP appointee — claiming for someone else', score: 136 },
  { title: 'Night needs and PIP — what counts', score: 135 },
  { title: 'Cooking and nutrition descriptors for PIP', score: 134 },
  { title: 'Dressing and undressing — PIP examples', score: 133 },
];

export const DAILY_CRON_TAG = 'daily-cron';

export function slugifyTitle(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Shuffle copy (Fisher–Yates) */
export function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickContextTopics(topic) {
  const pool = shuffle(PIP_TOPICS);
  const explicit = PIP_TOPICS.find((t) => t.title === topic);
  if (explicit) {
    const rest = pool.filter((t) => t.title !== topic).slice(0, 7);
    return [explicit, ...rest];
  }
  return pool.slice(0, 8);
}

/**
 * Pick a seed topic we have not covered recently (avoids near-duplicates).
 * @param {Array<{ title: string, slug: string, created_at: string }>} recentRows
 */
export function pickSeedTopicForAutomation(recentRows, daysRecent = 56) {
  const cutoff = Date.now() - daysRecent * 86400000;
  const recent = (recentRows || []).filter((r) => new Date(r.created_at).getTime() >= cutoff);

  const candidates = shuffle([...PIP_TOPICS].sort((a, b) => (b.score || 0) - (a.score || 0)));

  for (const { title } of candidates) {
    const needle = title.slice(0, 22).toLowerCase();
    const seedSlug = slugifyTitle(title);
    const clash = recent.some((p) => {
      const t = (p.title || '').toLowerCase();
      const sl = (p.slug || '').toLowerCase();
      return t.includes(needle) || sl === seedSlug || sl.startsWith(seedSlug + '-');
    });
    if (!clash) return title;
  }

  const extras = [
    'PIP claims: common mistakes to avoid',
    'PIP form timing: when to start your answers',
    'PIP and relationships: carer impact on your form',
  ];
  const day = new Date();
  const extra = extras[day.getUTCFullYear() % extras.length];
  return extra;
}

export async function generatePost(topic, contextTopics) {
  const topicLines = contextTopics
    .slice(0, 8)
    .map((q) => `- "${q.title}"`)
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
      messages: [
        {
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

Related PIP topics for context (typical claimant questions):
${topicLines}

## Writing guidelines:
- Answer the topic question clearly in the first 2 paragraphs
- Use plain English — no jargon
- Weave in 2-3 of PIPpal's key stats naturally (not all at once)
- Make the reader feel the pain of doing this alone, then introduce PIPpal as the solution
- End with a strong CTA: "PIPpal helps thousands of claimants complete their PIP form in 15-30 minutes with a 94% success rate. Try it for £12.99 — a fraction of what you could receive."
- Tone: warm, empathetic, practical — like advice from a knowledgeable friend

Respond with ONLY a valid JSON object — no markdown, no backticks, no extra text. Use this exact structure:
{"title":"SEO title 50-60 chars with PIP keyword","slug":"url-slug","excerpt":"Meta description 150-160 chars with keyword","category":"Tips","tags":["tag1","tag2"],"body":"Post body. Use # for h1, ## for h2, - for bullets. 600-900 words. Include PIPpal stats naturally. End with strong CTA."}`,
        },
      ],
    }),
  });

  const data = await response.json();
  let text = data.content?.[0]?.text?.trim() || '';

  text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    const parsed = JSON.parse(text);

    const wordCount = (parsed.body || '').split(/\s+/).length;
    const titleLen = (parsed.title || '').length;
    const excerptLen = (parsed.excerpt || '').length;
    const keyword = 'PIP';
    const bodyLower = (parsed.body || '').toLowerCase();
    const titleLower = (parsed.title || '').toLowerCase();
    const excerptLower = (parsed.excerpt || '').toLowerCase();
    const keywordInBody = (bodyLower.match(/\bpip\b/g) || []).length;

    let score = 0;
    if (titleLen >= 50 && titleLen <= 60) score += 20;
    else if (titleLen >= 40) score += 10;
    if (excerptLen >= 150 && excerptLen <= 160) score += 20;
    else if (excerptLen >= 120) score += 10;
    if (titleLower.includes('pip')) score += 20;
    if (excerptLower.includes('pip')) score += 15;
    if (keywordInBody >= 5) score += 15;
    else if (keywordInBody >= 3) score += 10;
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
