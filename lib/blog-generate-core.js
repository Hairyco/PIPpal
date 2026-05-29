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

/** Blog posts use only these two categories */
export const BLOG_CATEGORIES = ['Tips', 'How To'];

/**
 * Classify a post as Tips (practical advice) or How To (step-by-step guide).
 * @param {{ title?: string, excerpt?: string, body?: string, seedTopic?: string }} input
 */
export function classifyBlogCategory({ title = '', excerpt = '', body = '', seedTopic = '' } = {}) {
  const text = `${title} ${excerpt} ${body} ${seedTopic}`.toLowerCase();
  const titleTrim = String(title).trim();

  const howToPatterns = [
    /\bhow to\b/,
    /\bhow do i\b/,
    /\bstep[- ]by[- ]step\b/,
    /\bguide\b/,
    /\bfill in\b/,
    /\bfilling in\b/,
    /\bcomplete the form\b/,
    /\bwrite a (letter|reconsideration)\b/,
    /\btemplate\b/,
    /\bwalkthrough\b/,
    /\bapply for\b/,
    /\brequest a\b/,
    /\bappeal\b.*\b(step|process|guide)\b/,
    /\btribunal\b.*\b(step|guide)\b/,
    /\bmandatory reconsideration\b/,
    /\brenewal form\b/,
  ];
  const tipPatterns = [
    /\btips?\b/,
    /\bwhat to say\b/,
    /\bwhat to include\b/,
    /\bwhat counts\b/,
    /\bwhat happens\b/,
    /\bwhat you need to know\b/,
    /\bmistakes?\b/,
    /\bchecklist\b/,
    /\bavoid\b/,
    /\bcommon\b/,
    /\bwarning\b/,
    /\bexplained\b/,
    /\bdoes it qualify\b/,
    /\bcan i\b/,
    /\bhow much\b/,
    /\bhow long\b/,
  ];

  let howToScore = 0;
  let tipScore = 0;
  for (const p of howToPatterns) if (p.test(text)) howToScore++;
  for (const p of tipPatterns) if (p.test(text)) tipScore++;

  if (/^how (to|do)/i.test(titleTrim)) howToScore += 3;
  if (/\btips?\b/i.test(titleTrim)) tipScore += 2;
  if (/\bstep[- ]by[- ]step\b/i.test(titleTrim)) howToScore += 2;

  return howToScore > tipScore ? 'How To' : 'Tips';
}

export function normalizeBlogCategory(category, meta = {}) {
  const c = String(category || '').trim();
  if (c === 'How To' || c === 'Tips') return c;
  if (c === 'How to') return 'How To';
  return classifyBlogCategory(meta);
}

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

## About PIPpal — use only these factual product points (do not invent statistics):
- PIPpal guides claimants through all 12 PIP questions in plain English
- Many users complete the in-app question flow in around 15–30 minutes (timing varies)
- Helps you express answers in clearer, more formal wording suitable for a PIP form
- Includes Assessment Prep content on what assessors look for
- Built for UK PIP claimants

## Post to write:
Topic: ${topic}

Related PIP topics for context (typical claimant questions):
${topicLines}

## Writing guidelines:
- Answer the topic question clearly in the first 2 paragraphs
- Use plain English — no jargon
- Do not claim any specific success rate, approval percentage, or guaranteed DWP decision time
- Do not mention any price, cost, payment amount, or subscription model — ever
- Weave in at most 1–2 product points from the list above where natural
- Make the reader feel the pain of doing this alone, then introduce PIPpal as optional structured help
- End with a clear CTA, for example: "PIPpal walks you through every PIP question in plain English — giving you the clearest possible chance of a successful claim."
- Tone: warm, empathetic, practical — like advice from a knowledgeable friend

Respond with ONLY a valid JSON object — no markdown, no backticks, no extra text. Use this exact structure:
{"title":"SEO title 50-60 chars with PIP keyword","slug":"url-slug","excerpt":"Meta description 150-160 chars with keyword","category":"Tips or How To","tags":["tag1","tag2"],"body":"Post body. Use # for h1, ## for h2, - for bullets. 600-900 words. Mention PIPpal helpfully where relevant. End with a strong CTA — no pricing, no invented statistics."}

Category rules — must be exactly "Tips" or "How To":
- "How To" = step-by-step guides (how to fill in a form, how to appeal, how to request something)
- "Tips" = practical advice, checklists, what to say/include, explanations, warnings, eligibility info

Important: tags must be an array of maximum 3 short strings (1-3 words each). Do not include more than 3 tags.`,
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

    parsed.category = normalizeBlogCategory(parsed.category, {
      title: parsed.title,
      excerpt: parsed.excerpt,
      body: parsed.body,
      seedTopic: topic,
    });

    return parsed;
  } catch (err) {
    console.log('JSON parse error:', err.message);
    console.log('Raw response:', text.slice(0, 200));
    return null;
  }
}
