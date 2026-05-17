import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Tag, Share2 } from 'lucide-react';
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
  const { goBack, navigateTo, selectedBlogSlug, setSelectedBlogSlug, hasPaid } = useAppContext();

  // Track blog view
  React.useEffect(() => {
    if (selectedBlogSlug) {
      supabase.from('blog_clicks').insert({ slug: selectedBlogSlug, type: 'view' }).then(() => undefined);
    }
  }, [selectedBlogSlug]);

  const openTagFilter = (tag: string) => {
    navigateTo('blog');
    // Store tag filter in sessionStorage for BlogScreen to pick up
    sessionStorage.setItem('blog_tag_filter', tag);
  };
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

  // Render inline bold — convert **text** to <strong>
  const renderInline = (text: string, key: number) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return (
      <span key={key}>
        {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-stone-900">{part}</strong> : part)}
      </span>
    );
  };

  // Render body — support markdown-like formatting
  const renderBody = (body: string) => {
    const lines = body.split('\n');
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listItems: React.ReactNode[] = [];

    const flushList = (i: number) => {
      if (listItems.length > 0) {
        elements.push(<ul key={`ul-${i}`} className="ml-4 mb-3 space-y-1">{listItems}</ul>);
        listItems = [];
        inList = false;
      }
    };

    lines.forEach((line, i) => {
      if (line.startsWith('## ')) {
        flushList(i);
        elements.push(<h2 key={i} className="font-bold text-stone-900 text-base mt-6 mb-2">{renderInline(line.slice(3), i)}</h2>);
      } else if (line.startsWith('# ')) {
        flushList(i);
        elements.push(<h1 key={i} className="font-bold text-stone-900 text-lg mt-4 mb-2">{renderInline(line.slice(2), i)}</h1>);
      } else if (line.startsWith('- ')) {
        inList = true;
        listItems.push(<li key={i} className="text-sm text-stone-600 leading-relaxed list-disc">{renderInline(line.slice(2), i)}</li>);
      } else if (line.trim() === '') {
        flushList(i);
        elements.push(<div key={i} className="h-2" />);
      } else {
        flushList(i);
        elements.push(<p key={i} className="text-sm text-stone-600 leading-relaxed">{renderInline(line, i)}</p>);
      }
    });
    flushList(lines.length);
    return elements;
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
                  <button key={tag} onClick={() => openTagFilter(tag)}
                    className="text-[11px] text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full hover:bg-teal-100 transition-colors font-medium">
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mx-5 mb-8 bg-stone-900 rounded-2xl p-5">
              <p className="font-bold text-white text-base mb-1">Ready to claim PIP?</p>
              <p className="text-xs text-stone-300 leading-relaxed mb-4">Complete your form with plain-English guidance in about 15 minutes.</p>
              <button
                onClick={() => {
                  supabase.from('blog_clicks').insert({ slug: selectedBlogSlug || '', type: 'cta_click' }).then(() => undefined);
                  navigateTo(hasPaid ? 'question_index' : 'upsell');
                }}
                className="w-full bg-orange-500 text-white text-sm font-bold py-3.5 rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
              >
                → Start my PIP claim
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
