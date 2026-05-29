/**
 * One-off: recategorize all blog_posts as Tips or How To.
 * Usage: node scripts/recategorize-blog-posts.mjs [--dry-run] [--published-only]
 * Requires VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env (or .env.local).
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { classifyBlogCategory, normalizeBlogCategory } from '../lib/blog-generate-core.js';

function loadEnvFile(name) {
  const path = resolve(process.cwd(), name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const val = m[2].trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dryRun = process.argv.includes('--dry-run');
const publishedOnly = process.argv.includes('--published-only');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

function restHeaders(extra = {}) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function fetchPosts() {
  const params = new URLSearchParams({
    select: 'id,title,excerpt,body,category,published',
    order: 'created_at.desc',
  });
  const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?${params}`, {
    headers: restHeaders(),
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function patchCategory(id, category) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?id=eq.${id}`, {
    method: 'PATCH',
    headers: restHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify({ category, updated_at: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`Patch ${id} failed: ${res.status} ${await res.text()}`);
}

const rows = await fetchPosts();
const targets = publishedOnly ? rows.filter((r) => r.published !== false) : rows;

let updated = 0;
for (const row of targets) {
  const next = normalizeBlogCategory(row.category, {
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
  });
  if (row.category === next) continue;
  console.log(`${dryRun ? '[dry-run] ' : ''}${row.category || '(none)'} → ${next}: ${row.title?.slice(0, 70)}`);
  if (!dryRun) await patchCategory(row.id, next);
  updated++;
}

console.log(`\nDone. ${updated} of ${targets.length} posts ${dryRun ? 'would be' : ''} updated.`);
