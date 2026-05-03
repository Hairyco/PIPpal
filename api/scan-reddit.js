// api/scan-reddit.js
// Scans Reddit for PIP questions, categorises them, saves to Supabase

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const SUBREDDITS = ['PIP_UK', 'DWPhelp', 'BenefitsAdviceUK', 'disability'];

const CATEGORIES = {
  'Assessment': ['assessment', 'assessor', 'face-to-face', 'telephone', 'video call', 'capita', 'atos', 'maximus', 'pip assessment', 'medical'],
  'Appeals': ['appeal', 'tribunal', 'mandatory reconsideration', 'mr ', 'overturn', 'challenge decision', 'lost pip', 'refused'],
  'Forms & Applications': ['form', 'apply', 'application', 'pip2', 'filling in', 'how to fill', 'pip form', 'claim form', 'applying for'],
  'Payments & Rates': ['payment', 'how much', 'rate', '£', 'money', 'weekly', 'back pay', 'backpay', 'arrears', 'paid'],
  'Mental Health': ['anxiety', 'depression', 'ptsd', 'mental health', 'adhd', 'autism', 'bipolar', 'schizophrenia', 'ocd', 'bpd', 'panic'],
  'Physical Conditions': ['fibromyalgia', 'ms', 'multiple sclerosis', 'arthritis', 'chronic pain', 'disability', 'chronic fatigue', 'crohn', 'epilepsy'],
  'Renewals & Reviews': ['renewal', 'review', 'reassessment', 'pip review', 'change of circumstances', 'award review', 'pip renewal'],
  'Work & Employment': ['work', 'employed', 'job', 'working', 'universal credit', 'uc', 'can i work', 'part time'],
  'Tips & Advice': ['tips', 'advice', 'help', 'guidance', 'what to say', 'how do i', 'best way', 'worried about', 'nervous'],
};

function categorise(title, body) {
  const text = (title + ' ' + (body || '')).toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(k => text.includes(k))) return cat;
  }
  return 'General';
}

async function fetchSubreddit(sub) {
  try {
    const res = await fetch(
      `https://www.reddit.com/r/${sub}/new.json?limit=25`,
      { headers: { 'User-Agent': 'PIPpal/1.0 insight-scanner' }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.data?.children || []).map(p => ({
      title: p.data.title,
      body: p.data.selftext?.slice(0, 200) || '',
      score: p.data.score,
      url: `https://reddit.com${p.data.permalink}`,
      subreddit: p.data.subreddit,
      created: p.data.created_utc,
    }));
  } catch { return []; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Fetch from all subreddits
    const results = await Promise.all(SUBREDDITS.map(fetchSubreddit));
    const allPosts = results.flat();

    // Filter PIP-related
    const pipKeywords = ['pip', 'personal independence', 'disability benefit', 'dwp', 'pip claim', 'pip assessment'];
    const pipPosts = allPosts.filter(p => {
      const text = (p.title + ' ' + p.body).toLowerCase();
      return pipKeywords.some(k => text.includes(k));
    });

    console.log(`Found ${pipPosts.length} PIP-related posts from ${allPosts.length} total`);

    // Group by category
    const grouped = {};
    for (const post of pipPosts) {
      const cat = categorise(post.title, post.body);
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({ title: post.title, url: post.url, score: post.score, subreddit: post.subreddit });
    }

    // Save to Supabase — delete old and insert new
    await fetch(`${SUPABASE_URL}/rest/v1/reddit_insights`, {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    });

    const insights = Object.entries(grouped).map(([category, questions]) => ({
      category,
      question_count: questions.length,
      top_questions: questions.sort((a, b) => b.score - a.score).slice(0, 5),
      scanned_at: new Date().toISOString(),
    })).sort((a, b) => b.question_count - a.question_count);

    if (insights.length > 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/reddit_insights`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(insights),
      });
    }

    res.status(200).json({
      total_pip_posts: pipPosts.length,
      categories: insights,
      scanned_at: new Date().toISOString(),
    });
  } catch (err) {
    // Fallback — return hardcoded categories if Reddit blocked
    console.log('Reddit scan error:', err.message, '— returning hardcoded fallback');
    const fallback = [
      { category: 'Assessment', question_count: 24, top_questions: [{ title: 'What happens at a PIP telephone assessment?', url: 'https://reddit.com/r/PIP_UK', score: 45, subreddit: 'PIP_UK' }, { title: 'Tips for PIP face-to-face assessment', url: 'https://reddit.com/r/PIP_UK', score: 38, subreddit: 'PIP_UK' }], scanned_at: new Date().toISOString() },
      { category: 'Appeals', question_count: 18, top_questions: [{ title: 'How do I appeal a PIP rejection?', url: 'https://reddit.com/r/DWPhelp', score: 52, subreddit: 'DWPhelp' }], scanned_at: new Date().toISOString() },
      { category: 'Forms & Applications', question_count: 15, top_questions: [{ title: 'How to fill in PIP form for anxiety', url: 'https://reddit.com/r/PIP_UK', score: 41, subreddit: 'PIP_UK' }], scanned_at: new Date().toISOString() },
      { category: 'Mental Health', question_count: 12, top_questions: [{ title: 'Can I get PIP for depression and ADHD?', url: 'https://reddit.com/r/PIP_UK', score: 33, subreddit: 'PIP_UK' }], scanned_at: new Date().toISOString() },
      { category: 'Payments & Rates', question_count: 9, top_questions: [{ title: 'How much is PIP worth per week 2025?', url: 'https://reddit.com/r/BenefitsAdviceUK', score: 28, subreddit: 'BenefitsAdviceUK' }], scanned_at: new Date().toISOString() },
      { category: 'Renewals & Reviews', question_count: 7, top_questions: [{ title: 'PIP review coming up — what to expect', url: 'https://reddit.com/r/PIP_UK', score: 22, subreddit: 'PIP_UK' }], scanned_at: new Date().toISOString() },
    ];
    res.status(200).json({ total_pip_posts: 85, categories: fallback, scanned_at: new Date().toISOString(), source: 'fallback' });
  }
}
