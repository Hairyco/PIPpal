import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Flame, Newspaper } from 'lucide-react';
import { CtoGoLogo } from '../components/CtoGoLogo';
import { AppSidebar, AppSidebarMenuButton, AppSidebarProvider } from '../components/AppSidebar';
import { TrendingNewsBar } from '../components/TrendingNewsBar';
import {
  newsTagById,
  newsTagLabel,
  storiesForTag,
  type NewsTagId,
} from '../data/trendingNews';

export function NewsPage() {
  const [params] = useSearchParams();
  const rawTag = params.get('tag');
  const matched = newsTagById(rawTag);
  const activeTag: NewsTagId | 'all' = matched?.id ?? 'all';

  const stories = useMemo(() => storiesForTag(activeTag), [activeTag]);

  return (
    <AppSidebarProvider>
      <AppSidebar />
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col bg-black text-white">
        <header className="flex shrink-0 items-center gap-2 px-3 pb-1 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <AppSidebarMenuButton />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
              <Flame className="h-3 w-3" fill="currentColor" strokeWidth={0} />
              News
            </p>
            <h1 className="truncate text-[17px] font-bold tracking-tight">
              {activeTag === 'all' ? 'Trending News' : newsTagLabel(activeTag)}
            </h1>
          </div>
          <Link
            to="/?tab=trenches"
            className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[#1c1c1e] ring-1 ring-white/10"
            aria-label="Home"
          >
            <CtoGoLogo size={28} className="rounded-full" />
          </Link>
        </header>

        <TrendingNewsBar activeTagId={activeTag} showBack backTo="/?tab=trenches" />

        <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 pb-2 pt-2">
          <Link
            to="/news"
            className={`inline-flex h-8 items-center rounded-full px-3 text-[12px] font-semibold ${
              activeTag === 'all'
                ? 'bg-[#c8ff3d] text-[#090b14]'
                : 'bg-[#1c1c1e] text-white/60 ring-1 ring-white/10'
            }`}
          >
            All stories
          </Link>
          <p className="text-[11px] text-white/35">
            {stories.length} item{stories.length === 1 ? '' : 's'}
          </p>
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">
          {stories.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <Newspaper className="mx-auto h-8 w-8 text-white/25" />
              <p className="mt-3 text-[15px] font-semibold text-white/70">No stories yet</p>
              <p className="mt-1 text-[13px] text-white/35">Try another tag from the bar above.</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {stories.map((story) => (
                <li key={story.id}>
                  <article className="rounded-2xl border border-white/[0.08] bg-[#121214] p-3.5">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/news?tag=${encodeURIComponent(story.tagId)}`}
                        className="inline-flex rounded-full bg-[#c8ff3d]/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#d5ff69]"
                      >
                        {newsTagLabel(story.tagId)}
                      </Link>
                      <span className="text-[10px] font-medium tabular-nums text-white/35">
                        {story.when} · {story.source}
                      </span>
                    </div>
                    <h2 className="mt-2 text-[15px] font-bold leading-snug text-white">
                      {story.title}
                    </h2>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">
                      {story.context}
                    </p>
                    {story.tickers && story.tickers.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {story.tickers.map((ticker) => (
                          <Link
                            key={ticker}
                            to={`/coin/${encodeURIComponent(ticker)}`}
                            className="inline-flex h-7 items-center rounded-full bg-[#1c1c1e] px-2.5 text-[11px] font-semibold text-white/75 ring-1 ring-white/10 transition hover:text-[#d5ff69]"
                          >
                            ${ticker}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </article>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </AppSidebarProvider>
  );
}
