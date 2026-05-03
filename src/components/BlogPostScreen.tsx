import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Tag, Share2, ChevronRight } from 'lucide-react';
import { useAppContext } from './AppContext';
import { supabase } from '../supabaseClient';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string[];
  created_at: string;
}

export function BlogPostScreen() {
  const { goBack, navigateTo, selectedBlogSlug, hasPaid } = useAppContext();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!selectedBlogSlug) { goBack(); return; }
    fetchPost();
  }, [selectedBlogSlug]);

  const fetchPost = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', selectedBlogSlug)
      .eq('published', true)
      .single();
    setPost(data);
    setIsLoading(false);
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: post?.title, text: post?.excerpt, url: window.location.href });
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // Fallback copy
      navigator.clipboard?.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  // Render body — support simple markdown-like formatting
  const renderBody = (body: string) => {
    return body.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="font-bold text-stone-900 text-base mt-6 mb-2">{line.slice(3)}</h2>;
      if (line.startsWith('# ')) return <h1 key={i} className="font-bold text-stone-900 text-lg mt-4 mb-2">{line.slice(2)}</h1>;
      if (line.startsWith('- ')) return <li key={i} className="text-sm text-stone-600 leading-relaxed ml-4 list-disc">{line.slice(2)}</li>;
      if (line.trim() === '') return <div key={i} className="h-3" />;
      return <p key={i} className="text-sm text-stone-600 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <p className="flex-1 font-semibold text-stone-700 text-sm truncate">{post?.category || 'Blog'}</p>
        <button onClick={handleShare} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && !post && (
          <div className="text-center py-20 px-8">
            <p className="font-semibold text-stone-500">Post not found</p>
            <button onClick={goBack} className="mt-4 text-teal-700 text-sm font-bold">← Back to blog</button>
          </div>
        )}

        {!isLoading && post && (
          <div>
            {/* Hero */}
            <div className="bg-teal-700 px-5 py-8">
              {post.category && (
                <span className="inline-block text-[10px] font-bold bg-white/20 text-teal-100 px-3 py-1 rounded-full mb-3">
                  {post.category}
                </span>
              )}
              <h1 className="font-bold text-white text-xl leading-snug mb-3">{post.title}</h1>
              <div className="flex items-center gap-3 text-teal-200">
                <span className="flex items-center gap-1 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-6 space-y-1">
              {post.excerpt && (
                <p className="text-sm font-semibold text-stone-700 leading-relaxed mb-4 pb-4 border-b border-stone-100">
                  {post.excerpt}
                </p>
              )}
              {post.body && renderBody(post.body)}
            </div>

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="px-5 pb-4 flex items-center gap-2 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-stone-400" />
                {post.tags.map(tag => (
                  <span key={tag} className="text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mx-5 mb-8 bg-teal-50 rounded-2xl p-4 border border-teal-100">
              <p className="font-bold text-teal-900 text-sm mb-1">Need help with your PIP claim?</p>
              <p className="text-xs text-teal-700 leading-relaxed mb-3">PIPpal guides you through all 12 PIP questions and helps you write your claim in DWP-appropriate language.</p>
              <button
                onClick={() => navigateTo(hasPaid ? 'question_index' : 'upsell')}
                className="flex items-center gap-2 bg-teal-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-teal-800 transition-colors"
              >
                {hasPaid ? 'Continue my claim' : 'Get Full Access'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
