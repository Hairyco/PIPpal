/**
 * Reddit post text extraction for the admin blog generator.
 * Reddit app "Share" links (/r/sub/s/…) are resolved on the server (redirect + /api/info.json).
 * Direct /comments/ URLs are fetched in the browser when possible.
 */

const REDDIT_HOST = /^(?:www\.)?reddit\.com$/i;
const REDDIT_SHORT = /^redd\.it$/i;

function normalizeRedditInput(raw: string): string {
  let url = raw.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url;
}

function redditHost(hostname: string): boolean {
  return REDDIT_HOST.test(hostname) || REDDIT_SHORT.test(hostname);
}

/** Reddit mobile app Share link or redd.it short URL — needs server-side redirect resolution. */
export function isRedditShareLink(url: string): boolean {
  const u = url.trim();
  return /\/s\/[a-z0-9]+/i.test(u) || /^https?:\/\/(www\.)?redd\.it\//i.test(u);
}

export function isRedditPostUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeRedditInput(url));
    if (!redditHost(parsed.hostname)) return false;
    return (
      /\/comments\/[a-z0-9]+/i.test(parsed.pathname) ||
      /\/s\/[a-z0-9]+/i.test(parsed.pathname) ||
      REDDIT_SHORT.test(parsed.hostname)
    );
  } catch {
    return false;
  }
}

async function fetchRedditFromServer(url: string): Promise<string> {
  const res = await fetch('/api/generate-blog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'extract-reddit-url', url }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Could not read Reddit link from server');
  }
  const text = typeof data.text === 'string' ? data.text.trim() : '';
  if (!text) throw new Error('No text returned from Reddit link');
  return text;
}

function parseRedditPostIdFromPath(pathname: string): string | null {
  const m = pathname.match(/\/comments\/([a-z0-9]+)/i);
  return m ? m[1] : null;
}

async function resolveRedditPostId(url: string): Promise<string> {
  const parsed = new URL(normalizeRedditInput(url));
  const direct = parseRedditPostIdFromPath(parsed.pathname);
  if (direct) return direct;

  const res = await fetch(parsed.toString(), {
    method: 'GET',
    redirect: 'follow',
    credentials: 'omit',
  });
  const final = new URL(res.url || parsed.toString());
  const id = parseRedditPostIdFromPath(final.pathname);
  if (id) return id;

  throw new Error('NEEDS_READER');
}

async function fetchRedditJson(postId: string): Promise<string> {
  const jsonUrl = `https://www.reddit.com/comments/${postId}.json?raw_json=1&limit=1`;
  const res = await fetch(jsonUrl, { credentials: 'omit' });
  if (!res.ok) throw new Error('NEEDS_READER');

  const data = await res.json();
  const post = data?.[0]?.data?.children?.[0]?.data;
  if (!post) throw new Error('NEEDS_READER');

  const title = (post.title || '').trim();
  const selftext = (post.selftext || '').trim();
  const sub = post.subreddit ? `r/${post.subreddit}` : '';
  const parts = [sub, title, selftext].filter(Boolean);
  const text = parts.join('\n\n').trim();
  if (text.length < 20) throw new Error('NEEDS_READER');
  return text.slice(0, 12000);
}

async function fetchRedditViaReader(url: string): Promise<string> {
  const readerUrl = `https://r.jina.ai/${url}`;
  const res = await fetch(readerUrl, { credentials: 'omit' });
  if (!res.ok) throw new Error('NEEDS_READER');
  const text = (await res.text()).trim();
  if (text.length < 80) throw new Error('NEEDS_READER');
  return text.slice(0, 12000);
}

/**
 * Extract post title + body from a Reddit URL (Share links, short URLs, or /comments/ URLs).
 */
export async function extractRedditPostInBrowser(urlInput: string): Promise<string> {
  const normalized = normalizeRedditInput(urlInput);

  if (!isRedditPostUrl(normalized)) {
    throw new Error('Not a Reddit post URL');
  }

  // Reddit app "Copy link" → /r/sub/s/TOKEN — resolve on server
  if (isRedditShareLink(normalized)) {
    return fetchRedditFromServer(normalized);
  }

  try {
    const postId = await resolveRedditPostId(normalized);
    return await fetchRedditJson(postId);
  } catch (err: unknown) {
    if (err instanceof Error && err.message !== 'NEEDS_READER') throw err;
  }

  try {
    return await fetchRedditViaReader(normalized);
  } catch {
    return fetchRedditFromServer(normalized);
  }
}
