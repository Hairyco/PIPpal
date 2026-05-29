/** Extract Reddit post text in the browser (avoids server IP blocks). */

export function isRedditPostUrl(input: string): boolean {
  return /reddit\.com|redd\.it/i.test(input.trim());
}

export function parseRedditPostId(url: string): string | null {
  const normalized = url.trim();
  const commentsMatch = normalized.match(/\/comments\/([a-z0-9]+)/i);
  if (commentsMatch) return commentsMatch[1];
  const shortMatch = normalized.match(/redd\.it\/([a-z0-9]+)/i);
  if (shortMatch) return shortMatch[1];
  return null;
}

function normalizeRedditInput(urlInput: string): string {
  const raw = urlInput.trim();
  if (!raw) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^redd\.it\//i.test(raw)) return `https://${raw}`;
  if (/^www\.reddit\.com/i.test(raw)) return `https://${raw}`;
  if (/^reddit\.com/i.test(raw)) return `https://${raw}`;
  return raw;
}

async function fetchRedditJson(postId: string): Promise<string> {
  const jsonUrl = `https://www.reddit.com/comments/${postId}.json?raw_json=1&limit=1`;

  const res = await fetch(jsonUrl, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(
      `Reddit returned ${res.status}. Copy the post text and paste it in the box below instead.`,
    );
  }

  const data = await res.json();
  const post = data?.[0]?.data?.children?.[0]?.data;
  if (!post) {
    throw new Error('Reddit post not found. Check the link or paste the text manually.');
  }

  const parts: string[] = [];
  if (post.title) parts.push(String(post.title));
  if (post.selftext) parts.push(String(post.selftext));

  const text = parts.join('\n\n').trim();
  if (text.length < 20) {
    throw new Error('This Reddit post has little or no text. Paste the content manually.');
  }

  return text.slice(0, 12000);
}

/** Reader proxy — works in browser when Reddit JSON is blocked or share links won't redirect. */
async function fetchRedditViaReader(url: string): Promise<string> {
  const readerUrl = `https://r.jina.ai/${url}`;
  const res = await fetch(readerUrl, { headers: { Accept: 'text/plain' } });
  if (!res.ok) throw new Error(`Reader returned ${res.status}`);
  let text = (await res.text()).trim();
  const markdownIdx = text.indexOf('Markdown Content:');
  if (markdownIdx !== -1) text = text.slice(markdownIdx + 'Markdown Content:'.length).trim();
  if (text.length < 40) throw new Error('Reader returned too little text');
  return text.slice(0, 12000);
}

/** Follow redirects until we land on a URL with a post id (works for /s/ share links). */
async function resolveRedditPostId(urlInput: string): Promise<string> {
  const normalized = normalizeRedditInput(urlInput);
  let postId = parseRedditPostId(normalized);
  if (postId) return postId;

  // redd.it, /s/ share links — follow redirects in the browser (may fail CORS)
  if (/reddit\.com|redd\.it/i.test(normalized)) {
    try {
      const res = await fetch(normalized, {
        redirect: 'follow',
        credentials: 'omit',
      });
      postId = parseRedditPostId(res.url);
      if (postId) return postId;
    } catch {
      /* CORS or network — try reader below */
    }
  }

  throw new Error('NEEDS_READER');
}

export async function extractRedditPostInBrowser(urlInput: string): Promise<string> {
  const normalized = normalizeRedditInput(urlInput);

  try {
    const postId = await resolveRedditPostId(normalized);
    return await fetchRedditJson(postId);
  } catch (err: any) {
    if (err?.message !== 'NEEDS_READER') throw err;
  }

  // Share links / short links when redirect fetch is blocked — reader proxy
  try {
    return await fetchRedditViaReader(normalized);
  } catch {
    throw new Error(
      'Could not read that Reddit link. Open the post on Reddit, copy the address bar URL (contains /comments/), or paste the post text below.',
    );
  }
}
