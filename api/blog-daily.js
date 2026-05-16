// api/blog-daily.js — Vercel cron: generate up to 2 drafts per UTC day (single free Hobby cron run).
// Schedule in vercel.json. Set CRON_SECRET; Vercel sends Authorization: Bearer <CRON_SECRET>.

import {
  pickContextTopics,
  pickSeedTopicForAutomation,
  generatePost,
  DAILY_CRON_TAG,
} from '../lib/blog-generate-core.js';

const DAILY_CRON_POSTS_TARGET = 2;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function restHeaders(extra = {}) {
  return {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function fetchRecentPosts() {
  const params = new URLSearchParams({
    select: 'title,slug,created_at,tags',
    order: 'created_at.desc',
    limit: '120',
  });
  const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?${params}`, {
    headers: restHeaders(),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`blog_posts list failed: ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json();
}

function startOfUtcDayIso() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0)).toISOString();
}

function countDailyCronPostsTodayUtc(rows) {
  const start = startOfUtcDayIso();
  let n = 0;
  for (const r of rows || []) {
    if (!r.created_at || r.created_at < start) continue;
    const tags = r.tags;
    if (Array.isArray(tags) && tags.includes(DAILY_CRON_TAG)) n++;
  }
  return n;
}

async function slugTaken(slug) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/blog_posts?select=id&slug=eq.${encodeURIComponent(slug)}&limit=1`,
    { headers: restHeaders() },
  );
  if (!res.ok) return true;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0;
}

async function ensureUniqueSlug(baseSlug) {
  let s = baseSlug.replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  if (!s) s = 'pip-guide';
  let candidate = s;
  for (let n = 0; n < 30; n++) {
    if (!(await slugTaken(candidate))) return candidate;
    candidate = n === 0 ? `${s}-2` : `${s}-${n + 2}`;
  }
  return `${s}-${Date.now().toString(36)}`;
}

async function insertDraft(post) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts`, {
    method: 'POST',
    headers: restHeaders({
      Prefer: 'return=representation',
    }),
    body: JSON.stringify(post),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Insert failed: ${res.status} ${text.slice(0, 400)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return [{ ok: true }];
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(503).json({ error: 'Supabase env not configured' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    let recent = await fetchRecentPosts();
    const existingToday = countDailyCronPostsTodayUtc(recent);

    if (existingToday >= DAILY_CRON_POSTS_TARGET) {
      return res.status(200).json({
        skipped: true,
        reason: 'daily_cron_quota_reached',
        daily_cron_posts_today: existingToday,
        target_per_day: DAILY_CRON_POSTS_TARGET,
      });
    }

    const toCreate = DAILY_CRON_POSTS_TARGET - existingToday;
    const drafts = [];

    for (let i = 0; i < toCreate; i++) {
      recent = await fetchRecentPosts();
      const seedTopic = pickSeedTopicForAutomation(recent);
      const contextTopics = pickContextTopics(seedTopic);
      console.log(`Daily blog (${i + 1}/${toCreate}): generating for seed:`, seedTopic);

      const post = await generatePost(seedTopic, contextTopics);
      if (!post) {
        return res.status(500).json({
          error: 'Failed to parse generated post',
          drafts_created: drafts,
        });
      }

      const baseSlug = (post.slug || '').trim() || 'pip-post';
      const slug = await ensureUniqueSlug(baseSlug);
      const tags = Array.isArray(post.tags) ? [...new Set([...post.tags, DAILY_CRON_TAG])] : [DAILY_CRON_TAG];

      const row = {
        title: post.title || 'PIP guide',
        slug,
        excerpt: post.excerpt || '',
        body: post.body || '',
        category: post.category || 'Tips',
        tags,
        published: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const inserted = await insertDraft(row);
      const saved = Array.isArray(inserted) ? inserted[0] : inserted;

      drafts.push({
        id: saved?.id,
        title: row.title,
        slug: row.slug,
        seed_topic: seedTopic,
      });
    }

    return res.status(200).json({
      ok: true,
      drafts,
      draft: drafts[drafts.length - 1],
    });
  } catch (err) {
    console.error('blog-daily:', err);
    return res.status(500).json({ error: err.message || 'blog-daily failed' });
  }
}
