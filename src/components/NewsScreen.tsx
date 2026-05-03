import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Loader2, Newspaper, ExternalLink, ChevronRight } from 'lucide-react';
import { useAppContext } from './AppContext';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { goBack, navigateTo, setAssistantQuestion } = useAppContext();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTag, setActiveTag] = useState('All');
  const [lastUpdated, setLastUpdated] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

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

  const availableTags = ['All', ...ALL_TAGS.slice(1).filter(tag => articles.some(a => a.tags.includes(tag)))];

  // Feature article is the first one
  const featured = filteredArticles[0];
  const rest = filteredArticles.slice(1);

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
          <div>
            {/* Featured article */}
            {featured && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-5 mt-5"
              >
                <div className="bg-teal-700 rounded-2xl overflow-hidden shadow-sm">
                  {/* Category bar */}
                  <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                    <span className="text-base">{getStyle(featured.tags[0])?.icon || '📰'}</span>
                    <span className="text-xs font-bold text-teal-200 uppercase tracking-wider">{featured.tags[0]}</span>
                    <span className="text-[10px] text-teal-300 ml-auto">{featured.date}</span>
                  </div>
                  <div className="px-4 pb-4">
                    <h2 className="font-bold text-white text-base leading-snug mb-2">{featured.title}</h2>
                    <p className="text-base text-teal-100 leading-relaxed mb-3">{featured.body}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-teal-300 font-medium">{featured.source}</span>
                      {featured.link && (
                        <a href={featured.link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-bold text-white bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30 transition-colors">
                          Source <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Rest of articles */}
            <div className="px-5 mt-4 space-y-3">
              <AnimatePresence>
                {rest.map((article, i) => {
                  const style = getStyle(article.tags[0]);
                  const isExpanded = expanded === i;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
                    >
                      {/* Accent bar */}
                      <div className={`h-0.5 ${style.accent}`} />

                      <button
                        onClick={() => setExpanded(isExpanded ? null : i)}
                        className="w-full text-left px-4 py-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg shrink-0 mt-0.5">{style.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.pill}`}>
                                {article.tags[0]}
                              </span>
                              <span className="text-[10px] text-stone-400">{article.date}</span>
                            </div>
                            <h3 className="font-bold text-stone-900 text-sm leading-snug">{article.title}</h3>
                            {!isExpanded && (
                              <p className="text-sm text-stone-500 mt-1 line-clamp-3 leading-relaxed">{article.body}</p>
                            )}
                          </div>
                          <ChevronRight className={`w-4 h-4 text-stone-300 shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </button>

                      {/* Expanded */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-stone-50">
                          <p className="text-base text-stone-600 leading-relaxed pt-3">{article.body}</p>
                          <div className="mt-3 bg-teal-50 rounded-xl p-3 border border-teal-100">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Dig deeper</p>
                              <span className="text-[9px] text-teal-500 font-medium">Full Access</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {['What does this mean for me?', 'How does this affect my claim?', 'What should I do next?'].map(q => (
                                <button
                                  key={q}
                                  onClick={() => {
                                    setAssistantQuestion(q);
                                    navigateTo('home');
                                  }}
                                  className="text-[11px] font-semibold bg-white text-teal-700 border border-teal-200 px-3 py-1.5 rounded-full hover:bg-teal-100 transition-colors active:scale-95"
                                >
                                  {q}
                                </button>
                              ))}
                            </div>
                            <p className="text-[10px] text-stone-400 mt-1.5 leading-relaxed">Opens PIPpal Assistant — tap the chat icon on the home screen</p>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-[11px] text-stone-400 font-medium">{article.source}</span>
                            {article.link && (
                              <a href={article.link} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-800 transition-colors">
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
        )}
      </div>
    </div>
  );
}
