import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Loader2, Newspaper, ExternalLink, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { useAppContext } from './AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { decodeHtmlEntities } from '../utils/htmlEntities';

interface Article {
  title: string;
  body: string;
  link: string | null;
  source: string;
  date: string;
  tags: string[];
}

const ALL_TAGS = ['All', 'Official', 'Legislation', 'Rates & Payments', 'Assessment', 'Appeals', 'News'];

const TAG_STYLES: Record<string, { pill: string; accent: string; icon: string }> = {
  'Official':        { pill: 'bg-blue-100 text-blue-700 border-blue-200',    accent: 'bg-blue-500',    icon: '🏛️' },
  'Legislation':     { pill: 'bg-purple-100 text-purple-700 border-purple-200', accent: 'bg-purple-500', icon: '⚖️' },
  'Rates & Payments':{ pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', accent: 'bg-emerald-500', icon: '💷' },
  'Assessment':      { pill: 'bg-amber-100 text-amber-700 border-amber-200',  accent: 'bg-amber-500',   icon: '📋' },
  'Appeals':         { pill: 'bg-rose-100 text-rose-700 border-rose-200',     accent: 'bg-rose-500',    icon: '⚡' },
  'News':            { pill: 'bg-stone-100 text-stone-600 border-stone-200',  accent: 'bg-stone-400',   icon: '📰' },
};

function getStyle(tag: string) {
  return TAG_STYLES[tag] || TAG_STYLES['News'];
}

export function NewsScreen() {
  const { goBack, navigateTo, setAssistantQuestion, setAssistantContext, hasPaid } = useAppContext();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTag, setActiveTag] = useState('All');
  const [lastUpdated, setLastUpdated] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('pip_news_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [sortNewest, setSortNewest] = useState(true);

  const toggleBookmark = (title: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title); else next.add(title);
      try { localStorage.setItem('pip_news_bookmarks', JSON.stringify([...next])); } catch { void 0; }
      return next;
    });
  };

  const fetchNews = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.articles && data.articles.length > 0) {
        const normalized: Article[] = data.articles.map((a: Article) => ({
          ...a,
          title: decodeHtmlEntities(String(a.title ?? '')),
          body: decodeHtmlEntities(String(a.body ?? '')),
        }));
        setArticles(normalized);
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

  const tagFiltered = activeTag === 'All'
    ? articles
    : articles.filter(a => a.tags.includes(activeTag));
  const filteredArticles = (showBookmarksOnly
    ? tagFiltered.filter(a => bookmarks.has(a.title))
    : tagFiltered
  ).slice().sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return sortNewest
      ? new Date(b.date).getTime() - new Date(a.date).getTime()
      : new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const availableTags = ['All', ...ALL_TAGS.slice(1).filter(tag => articles.some(a => a.tags.includes(tag)))];

  // Feature article is the first one
  const featured = filteredArticles[0];
  const rest = filteredArticles.slice(1);

  // Group articles by date for section headers
  function formatDateLabel(dateStr: string): string {
    if (!dateStr) return 'Recent';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const isToday = date.toDateString() === today.toDateString();
      const isYesterday = date.toDateString() === yesterday.toDateString();
      if (isToday) return 'Today';
      if (isYesterday) return 'Yesterday';
      return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    } catch {
      return dateStr;
    }
  }

  // Group articles by date label
  const groupedArticles: { label: string; articles: typeof filteredArticles }[] = [];
  filteredArticles.forEach((article, i) => {
    const label = formatDateLabel(article.date);
    const existing = groupedArticles.find(g => g.label === label);
    if (existing) {
      existing.articles.push(article);
    } else {
      groupedArticles.push({ label, articles: [article] });
    }
  });

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
          <button
            onClick={() => setSortNewest(s => !s)}
            className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-full transition-all"
          >
            {sortNewest ? '↓ Newest' : '↑ Oldest'}
          </button>
        </div>
        <button
          onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${showBookmarksOnly ? 'bg-teal-100 text-teal-700' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
        >
          <Bookmark className="w-4 h-4" />
        </button>
        <button onClick={fetchNews} disabled={isLoading} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 disabled:opacity-40 transition-all">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tag pills */}
      {!isLoading && !error && (
        <div className="bg-white border-b border-stone-100 px-5 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {availableTags.map(tag => (
              <button key={tag} onClick={() => { setActiveTag(tag); setExpanded(null); }}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  activeTag === tag ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-stone-600 border-stone-200 hover:border-teal-300'
                }`}>
                {tag !== 'All' && <span className="mr-1">{getStyle(tag).icon}</span>}
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-10">

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            <p className="text-sm text-stone-500">Fetching the latest PIP news…</p>
            <p className="text-xs text-stone-400">This takes a few seconds</p>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-8">
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
        {!isLoading && !error && filteredArticles.length === 0 && (
          <div className="text-center py-16 px-8">
            <p className="text-sm text-stone-400">No articles in this category yet.</p>
          </div>
        )}

        {!isLoading && !error && filteredArticles.length > 0 && (
          <div className="px-5 mt-4 pb-6 space-y-6">
            {groupedArticles.map(({ label, articles: groupArticles }) => {
              // Compute global index offset for expanded state
              const groupStartIndex = filteredArticles.indexOf(groupArticles[0]);
              return (
                <div key={label}>
                  {/* Date section header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-black text-stone-900 uppercase tracking-widest shrink-0">
                      {label}
                    </span>
                    <div className="flex-1 h-px bg-stone-200" />
                  </div>

                  <div className="space-y-3">
                    <AnimatePresence>
                      {groupArticles.map((article, j) => {
                        const i = groupStartIndex + j;
                        const style = getStyle(article.tags[0]);
                        const isExpanded = expanded === i;
                        const isFeatured = i === 0;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: j * 0.04 }}
                            className={`rounded-2xl border shadow-sm overflow-hidden ${isFeatured ? 'bg-teal-700 border-teal-600' : 'bg-white border-stone-100'}`}
                          >
                            {!isFeatured && <div className={`h-0.5 ${style.accent}`} />}

                            <div className="flex items-start gap-2 px-4 pt-3 pb-0">
                              <button
                                onClick={() => setExpanded(isExpanded ? null : i)}
                                className="flex-1 text-left"
                              >
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-lg shrink-0">{style.icon}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isFeatured ? 'bg-white/20 text-teal-100 border-teal-500' : style.pill}`}>
                                    {article.tags[0]}
                                  </span>
                                  {article.source && (
                                    <span className={`text-[10px] truncate max-w-[100px] ${isFeatured ? 'text-teal-300' : 'text-stone-400'}`}>
                                      {article.source}
                                    </span>
                                  )}
                                </div>
                                <h3 className={`font-bold text-sm leading-snug ${isFeatured ? 'text-white' : 'text-stone-900'}`}>{article.title}</h3>
                                {!isExpanded && (
                                  <p className={`text-xs mt-1 line-clamp-2 leading-relaxed mb-3 ${isFeatured ? 'text-teal-100' : 'text-stone-500'}`}>{article.body}</p>
                                )}
                              </button>
                              <div className="flex flex-col items-center gap-1 shrink-0 ml-1">
                                <button
                                  onClick={() => toggleBookmark(article.title)}
                                  className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${bookmarks.has(article.title) ? (isFeatured ? 'text-yellow-300' : 'text-teal-600') : (isFeatured ? 'text-teal-300 hover:text-white' : 'text-stone-300 hover:text-teal-600')}`}
                                >
                                  {bookmarks.has(article.title)
                                    ? <BookmarkCheck className="w-4 h-4" />
                                    : <Bookmark className="w-4 h-4" />
                                  }
                                </button>
                                <ChevronRight
                                  onClick={() => setExpanded(isExpanded ? null : i)}
                                  className={`w-4 h-4 shrink-0 transition-transform cursor-pointer ${isExpanded ? 'rotate-90' : ''} ${isFeatured ? 'text-teal-300' : 'text-stone-300'}`}
                                />
                              </div>
                            </div>

                            {isExpanded && (
                              <div className={`px-4 pb-4 border-t ${isFeatured ? 'border-teal-600' : 'border-stone-50'}`}>
                                <p className={`text-sm leading-relaxed pt-3 ${isFeatured ? 'text-teal-100' : 'text-stone-600'}`}>{article.body}</p>
                                <div className="flex items-center justify-between mt-3">
                                  <span className={`text-[11px] font-medium ${isFeatured ? 'text-teal-300' : 'text-stone-400'}`}>{article.source}</span>
                                  {article.link && (
                                    <a href={article.link} target="_blank" rel="noopener noreferrer"
                                      className={`flex items-center gap-1 text-[11px] font-bold transition-colors ${isFeatured ? 'text-teal-200 hover:text-white' : 'text-teal-700 hover:text-teal-800'}`}>
                                      Read original <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
