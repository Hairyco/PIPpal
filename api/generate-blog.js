// api/generate-blog.js — admin: blog draft OR TikTok script OR recategorize (merged for Vercel Hobby 12-fn limit)

import { pickContextTopics, generatePost, normalizeBlogCategory } from '../lib/blog-generate-core.js';

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

async function handleRecategorize(res, publishedOnly = true) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(503).json({ error: 'Supabase env not configured' });
  }

  const params = new URLSearchParams({
    select: 'id,title,excerpt,body,category,published',
    order: 'created_at.desc',
  });

  const listRes = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?${params}`, {
    headers: restHeaders(),
  });
  if (!listRes.ok) {
    return res.status(500).json({ error: `Fetch failed: ${listRes.status}` });
  }
  const rows = await listRes.json();
  const targets = publishedOnly ? rows.filter((r) => r.published !== false) : rows;

  const changes = [];
  for (const row of targets) {
    const next = normalizeBlogCategory(row.category, {
      title: row.title,
      excerpt: row.excerpt,
      body: row.body,
    });
    if (row.category === next) continue;
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${row.id}`, {
      method: 'PATCH',
      headers: restHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ category: next, updated_at: new Date().toISOString() }),
    });
    if (!patchRes.ok) {
      return res.status(500).json({ error: `Update failed for ${row.id}` });
    }
    changes.push({ id: row.id, title: row.title, from: row.category, to: next });
  }

  return res.status(200).json({ ok: true, updated: changes.length, changes });
}

async function handleTiktok(body, res) {
  const { title, excerpt, body: postBody, category } = body;
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
- You may mention that the in-app flow often takes around 15–30 minutes — do not invent success rates or guarantee DWP timelines
- End with a clear CTA: "Link in bio to try PIPpal free"
- Write in sections: [HOOK], [MAIN POINT 1], [MAIN POINT 2], [MAIN POINT 3], [CTA]
- Estimated time next to each section in seconds e.g. [HOOK - 5s]
- Warm, relatable tone — like a friend who knows about benefits
- No ** or formal language

Blog post:
Title: ${title}
Category: ${category || 'Tips'}
${excerpt ? `Summary: ${excerpt}` : ''}
${postBody ? `Content: ${postBody.slice(0, 500)}` : ''}

Write the script now:`,
        }],
      }),
    });

    const data = await response.json();
    const script = data.content?.[0]?.text?.trim() || '';

    return res.status(200).json({ script });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};

  if (body.action === 'tiktok') {
    return handleTiktok(body, res);
  }

  if (body.action === 'recategorize') {
    return handleRecategorize(res, body.publishedOnly !== false);
  }

  const { topic } = body;

  try {
    const contextTopics = pickContextTopics(topic);
    const targetTopic = topic || contextTopics[0]?.title || 'How to claim PIP successfully';
    console.log('Generating post for topic:', targetTopic);

    const post = await generatePost(targetTopic, contextTopics);

    if (!post) return res.status(500).json({ error: 'Failed to parse generated post' });

    res.status(200).json({
      post,
      generated_from: targetTopic,
    });
  } catch (err) {
    console.log('Generate blog error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
