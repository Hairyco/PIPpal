import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, ChevronRight, Clock, Tag } from 'lucide-react';
import { useAppContext } from './AppContext';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  created_at: string;
}

const CATEGORY_STYLES: Record<string, string> = {
  'Tips': 'bg-teal-100 text-teal-700 border-teal-200',
  'News': 'bg-blue-100 text-blue-700 border-blue-200',
  'Legislation': 'bg-purple-100 text-purple-700 border-purple-200',
  'Success Stories': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'How To': 'bg-amber-100 text-amber-700 border-amber-200',
  'Appeals': 'bg-rose-100 text-rose-700 border-rose-200',
};

function getCategoryStyle(category: string) {
  return CATEGORY_STYLES[category] || 'bg-stone-100 text-stone-600 border-stone-200';
}

export function BlogScreen() {
  const { goBack, navigateTo, setSelectedBlogSlug } = useAppContext();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('All');

  useEffect(() => {
    fetchPosts();
    // Pick up tag filter from blog post screen
    const tagFilter = sessionStorage.getItem('blog_tag_filter');
    if (tagFilter) {
      setActiveTag(tagFilter);
      sessionStorage.removeItem('blog_tag_filter');
    }
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, category, tags, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false });
    setPosts(data || []);
    setIsLoading(false);
  };

  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];
  const allTags = Array.from(new Set(posts.flatMap(p => p.tags || []))).sort();
  const allFilters = [...categories, ...allTags.filter(t => !categories.includes(t))];
  const filtered = activeTag === 'All' ? posts
    : posts.filter(p => p.category === activeTag || (p.tags || []).includes(activeTag));
  const filtered = filteredByTag || posts;

  const openPost = (slug: string) => {
    setSelectedBlogSlug(slug);
    navigateTo('blog_post');
  };

  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* Header */}
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-stone-900 text-lg">PIPpal Blog</h1>
          <p className="text-[10px] text-stone-400">Guides, tips and PIP insights</p>
        </div>
        <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-teal-600" />
        </div>
      </div>

      {/* Category pills */}
      {allFilters.length > 1 && (
        <div className="bg-white border-b border-stone-100 px-5 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {allFilters.map(cat => (
              <button key={cat} onClick={() => setActiveTag(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  activeTag === cat ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-stone-600 border-stone-200 hover:border-teal-300'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-10">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-stone-200 mx-auto mb-3" />
            <p className="font-semibold text-stone-500 text-sm">No posts yet</p>
            <p className="text-xs text-stone-400 mt-1">Check back soon for PIP guides and tips</p>
          </div>
        )}

        <AnimatePresence>
          {filtered.map((post, i) => (
            <motion.button
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => openPost(post.slug)}
              className="w-full bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden text-left hover:border-teal-200 active:scale-[0.99] transition-all"
            >
              <div className="h-0.5 bg-teal-700" />
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {post.category && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryStyle(post.category)}`}>
                      {post.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[10px] text-stone-400">
                    <Clock className="w-3 h-3" />
                    {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h2 className="font-bold text-stone-900 text-sm leading-snug mb-1.5">{post.title}</h2>
                {post.excerpt && (
                  <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  {post.tags?.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <Tag className="w-3 h-3 text-stone-300" />
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] text-stone-400">{tag}</span>
                      ))}
                    </div>
                  )}
                  <span className="flex items-center gap-1 text-[11px] font-bold text-teal-700 ml-auto">
                    Read more <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
