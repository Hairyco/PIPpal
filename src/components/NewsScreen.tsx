import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, RefreshCw, Loader2, Newspaper } from 'lucide-react';
import { useAppContext } from './AppContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Article {
  title: string;
  summary: string;
  link: string | null;
  source: string;
  date: string;
  tags: string[];
}

const ALL_TAGS = ['All', 'Official', 'Legislation', 'Rates & Payments', 'Assessment', 'Appeals', 'Tips', 'News'];

const TAG_COLOURS: Record<string, string> = {
  'Official': 'bg-blue-100 text-blue-700 border-blue-200',
  'Legislation': 'bg-purple-100 text-purple-700 border-purple-200',
  'Rates & Payments': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Assessment': 'bg-amber-100 text-amber-700 border-amber-200',
  'Appeals': 'bg-rose-100 text-rose-700 border-rose-200',
  'Tips': 'bg-teal-100 text-teal-700 border-teal-200',
  'News': 'bg-stone-100 text-stone-600 border-stone-200',
};

export function NewsScreen() {
  const { goBack } = useAppContext();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTag, setActiveTag] = useState('All');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchNews = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.articles && data.articles.length > 0) {
        setArticles(data.articles);
        setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const filteredArticles = activeTag === 'All'
    ? articles
    : articles.filter(a => a.tags.includes(activeTag));

  // Only show tags that have articles
  const availableTags = ['All', ...ALL_TAGS.slice(1).filter(tag =>
    articles.some(a => a.tags.includes(tag))
  )];

  return (
    <div className="flex flex-col h-full bg-stone-50">

      {/* Header */}
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-stone-900 text-lg">PIP News</h1>
          {lastUpdated && <p className="text-[10px] text-stone-400">Updated {lastUpdated}</p>}
        </div>
        <button onClick={fetchNews} disabled={isLoading} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-all disabled:opacity-40">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tag filter pills */}
      {!isLoading && !error && (
        <div className="bg-white border-b border-stone-100 px-5 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  activeTag === tag
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-teal-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 pb-10">

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            <p className="text-sm text-stone-500">Fetching the latest PIP news…</p>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center">
              <Newspaper className="w-7 h-7 text-stone-400" />
            </div>
            <div>
              <p className="font-semibold text-stone-700 mb-1">Could not load news</p>
              <p className="text-sm text-stone-400 leading-relaxed">Check your connection and try again.</p>
            </div>
            <button onClick={fetchNews} className="bg-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-teal-800 transition-colors">
              Try again
            </button>
          </div>
        )}

        {/* Articles */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-stone-400">No articles found for this category.</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredArticles.map((article, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm"
                  >
                    {/* Tags */}
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      {article.tags.map(tag => (
                        <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TAG_COLOURS[tag] || TAG_COLOURS['News']}`}>
                          {tag}
                        </span>
                      ))}
                      <span className="text-[10px] text-stone-400 ml-auto">{article.date}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-stone-900 text-sm leading-snug mb-2">{article.title}</h3>

                    {/* Summary */}
                    <p className="text-xs text-stone-600 leading-relaxed mb-3">{article.summary}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-stone-400">{article.source}</span>
                      {article.link && (
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-800 transition-colors"
                        >
                          Read on GOV.UK <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  );
}