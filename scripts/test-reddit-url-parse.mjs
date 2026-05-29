/**
 * Quick sanity checks for Reddit URL helpers (no network).
 * Run: node scripts/test-reddit-url-parse.mjs
 */
import {
  normalizeReferenceUrl,
} from '../lib/blog-generate-core.js';

// Inline copies of private helpers for unit-style checks without exporting them
const DEFAULT_REDDIT_USER_AGENT =
  'PIPpalBlogBot/1.0 (contact: daley_cutler@hotmail.co.uk)';

function isRedditHost(hostname) {
  const h = String(hostname || '')
    .toLowerCase()
    .replace(/^www\./, '');
  if (h === 'redd.it') return true;
  return /(^|\.)reddit\.com$/i.test(h);
}

function canonicalRedditPostUrl(url) {
  try {
    const parsed = new URL(url);
    if (!isRedditHost(parsed.hostname)) return null;
    const idMatch = parsed.pathname.match(/\/comments\/([a-z0-9]+)/i);
    if (!idMatch) return null;
    const postId = idMatch[1];
    const subMatch = parsed.pathname.match(/^\/r\/([^/]+)\/comments\//i);
    const sub = subMatch ? subMatch[1] : null;
    const slugMatch = parsed.pathname.match(
      new RegExp(`/comments/${postId}/([^/]+)`, 'i'),
    );
    const slug = slugMatch && slugMatch[1] !== 'comment' ? slugMatch[1] : '';
    parsed.protocol = 'https:';
    parsed.hostname = 'www.reddit.com';
    parsed.search = '';
    parsed.hash = '';
    parsed.pathname = sub
      ? slug
        ? `/r/${sub}/comments/${postId}/${slug}/`
        : `/r/${sub}/comments/${postId}/`
      : `/comments/${postId}/`;
    return parsed.toString();
  } catch {
    return null;
  }
}

function toRedditJsonUrl(url) {
  const canonical = canonicalRedditPostUrl(url);
  if (!canonical) return null;
  const parsed = new URL(canonical);
  let path = parsed.pathname.replace(/\/$/, '');
  if (!path.endsWith('.json')) path += '.json';
  parsed.pathname = path;
  return parsed.toString();
}

const cases = [
  [
    'https://www.reddit.com/r/ukpersonalfinance/comments/1abc123/some_title_here/',
    'https://www.reddit.com/r/ukpersonalfinance/comments/1abc123/some_title_here/',
  ],
  [
    'https://reddit.com/r/test/comments/xyz789',
    'https://www.reddit.com/r/test/comments/xyz789/',
  ],
  [
    'https://old.reddit.com/r/benefits/comments/abc123def/title_slug/',
    'https://www.reddit.com/r/benefits/comments/abc123def/title_slug/',
  ],
  [
    'https://www.reddit.com/comments/onlyid123/',
    'https://www.reddit.com/comments/onlyid123/',
  ],
];

let failed = 0;
for (const [input, expectedCanonical] of cases) {
  const got = canonicalRedditPostUrl(normalizeReferenceUrl(input));
  if (got !== expectedCanonical) {
    console.error('canonical FAIL', { input, expectedCanonical, got });
    failed++;
  }
  const json = toRedditJsonUrl(input);
  if (!json || !json.endsWith('.json')) {
    console.error('json FAIL', { input, json });
    failed++;
  }
}

if (process.env.REDDIT_FETCH_USER_AGENT) {
  console.log('REDDIT_FETCH_USER_AGENT set (override)');
} else {
  console.log('Default UA:', DEFAULT_REDDIT_USER_AGENT);
}

console.log(failed ? `${failed} check(s) failed` : 'All URL parse checks passed');
process.exit(failed ? 1 : 0);
