// api/generate-blog.js — admin/manual generation (shared core in lib/)

import { pickContextTopics, generatePost } from '../lib/blog-generate-core.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic } = req.body || {};

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
