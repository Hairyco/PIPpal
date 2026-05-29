// api/generate-blog.js — admin: blog draft OR TikTok script OR recategorize (merged for Vercel Hobby 12-fn limit)

import {
  pickContextTopics,
  generatePost,
  normalizeBlogCategory,
  normalizeBlogSaveTags,
  extractImageText,
  extractUrlText,
  extractRedditUrlText,
  normalizeReferenceUrl,
  parseImageInput,
  slugifyTitle,
  MAX_IMAGE_BASE64_LENGTH,
} from '../lib/blog-generate-core.js';

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

async function slugTaken(slug, excludeId = null) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/blog_posts?select=id&slug=eq.${encodeURIComponent(slug)}&limit=1`,
    { headers: restHeaders() },
  );
  if (!res.ok) return true;
  const rows = await res.json();
  if (!Array.isArray(rows) || !rows.length) return false;
  if (excludeId && rows[0].id === excludeId) return false;
  return true;
}

async function ensureUniqueSlug(baseSlug, excludeId = null) {
  let s = String(baseSlug || '')
    .replace(/[^a-z0-9-]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  if (!s) s = 'pip-guide';
  let candidate = s;
  for (let n = 0; n < 30; n++) {
    if (!(await slugTaken(candidate, excludeId))) return candidate;
    candidate = n === 0 ? `${s}-2` : `${s}-${n + 2}`;
  }
  return `${s}-${Date.now().toString(36)}`;
}

function buildBlogRow(input, { archived = false } = {}) {
  const title = String(input.title || '').trim();
  const slug = String(input.slug || slugifyTitle(title)).trim().toLowerCase();
  const category = normalizeBlogCategory(input.category, {
    title,
    excerpt: input.excerpt,
    body: input.body,
  });
  return {
    title,
    slug,
    excerpt: input.excerpt || '',
    body: input.body || '',
    category: category === 'How To' || category === 'Tips' ? category : 'Tips',
    tags: normalizeBlogSaveTags(input.tags, { archived }),
    published: !!input.published,
    updated_at: new Date().toISOString(),
  };
}

async function saveBlogPost(input, { archived = false } = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase env not configured');
  }
  if (!input?.title?.trim()) throw new Error('Title required');

  const id = input.id || null;
  const row = buildBlogRow(input, { archived });

  if (id) {
    if (await slugTaken(row.slug, id)) {
      row.slug = await ensureUniqueSlug(row.slug, id);
    }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: restHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(row),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`Update failed: ${res.status} ${text.slice(0, 200)}`);
    const rows = JSON.parse(text || '[]');
    if (!rows.length) throw new Error('Update did not return a row');
    return rows[0];
  }

  row.slug = await ensureUniqueSlug(row.slug);
  row.created_at = new Date().toISOString();
  row.published = row.published && !archived ? row.published : false;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts`, {
    method: 'POST',
    headers: restHeaders({ Prefer: 'return=representation' }),
    body: JSON.stringify(row),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Insert failed: ${res.status} ${text.slice(0, 200)}`);
  const rows = JSON.parse(text || '[]');
  if (!rows.length) throw new Error('Insert did not return a row');
  return rows[0];
}

async function handleSave(body, res) {
  try {
    const { post, archived = false } = body;
    if (!post?.title?.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const saved = await saveBlogPost(post, { archived: !!archived });
    return res.status(200).json({ ok: true, post: saved });
  } catch (err) {
    console.error('Blog save error:', err.message);
    return res.status(500).json({ error: err.message || 'Save failed' });
  }
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

  if (body.action === 'save') {
    return handleSave(body, res);
  }

  if (body.action === 'extract-image-text') {
    const { image } = body;
    if (!image) return res.status(400).json({ error: 'Image required' });
    const parsed = parseImageInput(image);
    if (!parsed) return res.status(400).json({ error: 'Invalid image format' });
    if (parsed.base64.length > MAX_IMAGE_BASE64_LENGTH) {
      return res.status(400).json({ error: 'Image too large — use a file under 4MB' });
    }
    try {
      const text = await extractImageText(image);
      return res.status(200).json({ text });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  if (body.action === 'extract-url-text') {
    const { url } = body;
    if (!url) return res.status(400).json({ error: 'URL required' });
    try {
      const text = await extractUrlText(url);
      return res.status(200).json({ text, url: normalizeReferenceUrl(url) });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  if (body.action === 'extract-reddit-url') {
    const { url } = body;
    if (!url) return res.status(400).json({ error: 'URL required' });
    try {
      const text = await extractRedditUrlText(url);
      return res.status(200).json({ text, url: normalizeReferenceUrl(url) });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  const { topic, imageText, image, url, urlText } = body;

  try {
    const referenceParts = [];
    if (typeof imageText === 'string' && imageText.trim()) referenceParts.push(imageText.trim());
    if (typeof urlText === 'string' && urlText.trim()) referenceParts.push(urlText.trim());

    if (!referenceParts.length && image) {
      const parsed = parseImageInput(image);
      if (!parsed) return res.status(400).json({ error: 'Invalid image format' });
      if (parsed.base64.length > MAX_IMAGE_BASE64_LENGTH) {
        return res.status(400).json({ error: 'Image too large — use a file under 4MB' });
      }
      referenceParts.push(await extractImageText(image));
    }

    if (!referenceParts.length && url) {
      referenceParts.push(await extractUrlText(url));
    }

    const referenceText = referenceParts.join('\n\n---\n\n').slice(0, 8000);

    if (!topic && !referenceText) {
      return res.status(400).json({ error: 'Provide a topic, reference image, or both' });
    }

    const contextTopics = pickContextTopics(topic);
    const targetTopic =
      topic ||
      (referenceText ? referenceText.slice(0, 80).replace(/\s+/g, ' ').trim() : '') ||
      contextTopics[0]?.title ||
      'How to claim PIP successfully';
    console.log('Generating post for topic:', targetTopic, referenceText ? '(with reference text)' : '');

    const post = await generatePost(targetTopic, contextTopics, { referenceText: referenceText || undefined });

    if (!post) return res.status(500).json({ error: 'Failed to parse generated post' });

    let saved = null;
    try {
      saved = await saveBlogPost({ ...post, published: false });
    } catch (saveErr) {
      console.error('Auto-save draft failed:', saveErr.message);
      try {
        saved = await saveBlogPost({ ...post, published: false }, { archived: true });
      } catch (archiveErr) {
        console.error('Archive save failed:', archiveErr.message);
      }
    }

    return res.status(200).json({
      post: saved
        ? {
            title: saved.title,
            slug: saved.slug,
            excerpt: saved.excerpt,
            body: saved.body,
            category: saved.category,
            tags: saved.tags,
            published: saved.published,
            id: saved.id,
          }
        : post,
      generated_from: targetTopic,
      auto_saved: !!saved,
    });
  } catch (err) {
    console.log('Generate blog error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
