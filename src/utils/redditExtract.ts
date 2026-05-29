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

async function resolveRedditPostId(urlInput: string): Promise<string> {
  let postId = parseRedditPostId(urlInput);
  if (postId) return postId;

  if (/redd\.it/i.test(urlInput)) {
    const res = await fetch(urlInput.trim(), { redirect: 'follow' });
    postId = parseRedditPostId(res.url);
    if (postId) return postId;
  }

  throw new Error('Use a full Reddit post link (must include /comments/… in the URL).');
}

export async function extractRedditPostInBrowser(urlInput: string): Promise<string> {
  const postId = await resolveRedditPostId(urlInput);
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
