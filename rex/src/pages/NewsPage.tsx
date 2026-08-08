import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Flame, Newspaper, Rocket } from 'lucide-react';
import { CtoGoLogo } from '../components/CtoGoLogo';
import { AppSidebar, AppSidebarProvider } from '../components/AppSidebar';
import { TrendingNewsBar } from '../components/TrendingNewsBar';
import { ctoProjects } from '../data/ctoProjects';
import {
  newsTagById,
  newsTagLabel,
  storiesForTag,
  totalCoinsLaunched,
  type NewsTagId,
  type TrendingNewsStory,
} from '../data/trendingNews';

function logoForTicker(ticker: string): string | null {
  const hit = ctoProjects.find((p) => p.ticker.toUpperCase() === ticker.toUpperCase());
  return hit?.logo ?? null;
}

function StoryCard({ story }: { story: TrendingNewsStory }) {
  const tickers = story.tickers ?? [];
  return (
    <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#161618] to-[#0e0e10]">
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/news?tag=${encodeURIComponent(story.tagId)}`}
              className="inline-flex rounded-full bg-[#c8ff3d]/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#d5ff69] ring-1 ring-[#c8ff3d]/25"
            >
              {newsTagLabel(story.tagId)}
            </Link>
            <span className="text-[10px] font-medium tabular-nums text-white/35">
              {story.when} · {story.source}
            </span>
          </div>
          <h2 className="mt-2 text-[15px] font-bold leading-snug tracking-tight text-white">
            {story.title}
          </h2>
        </div>
        <div
          className="shrink-0 rounded-xl bg-[#c8ff3d]/10 px-2.5 py-2 text-center ring-1 ring-[#c8ff3d]/25"
          title="Coins launched on this narrative"
        >
          <p className="text-[16px] font-black tabular-nums leading-none text-[#d5ff69]">
            {story.coinsLaunched}
          </p>
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-white/45">
            launched
          </p>
        </div>
      </div>

      <div className="px-3.5 py-3">
        <p className="text-[13px] leading-relaxed text-white/55">{story.context}</p>

        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-white/40">
          <Rocket className="h-3 w-3 text-[#c8ff3d]/80" strokeWidth={2} />
          <span>
            {story.coinsLaunched} coin{story.coinsLaunched === 1 ? '' : 's'} launched
            {tickers.length > 0 ? ' · featured' : ''}
          </span>
        </div>

        {tickers.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {tickers.map((ticker) => {
              const logo = logoForTicker(ticker);
              return (
                <Link
                  key={ticker}
                  to={`/coin/${encodeURIComponent(ticker)}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#1c1c1e] pl-1 pr-2.5 text-[12px] font-semibold text-white/85 ring-1 ring-white/10 transition hover:bg-[#2a2a2c] hover:text-[#d5ff69]"
                >
                  {logo ? (
                    <span className="h-6 w-6 overflow-hidden rounded-full ring-1 ring-white/15">
                      <img src={logo} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </span>
                  ) : (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-[9px] font-bold text-white/50">
                      $
                    </span>
                  )}
                  ${ticker}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function NewsPage() {
  const [params] = useSearchParams();
  const rawTag = params.get('tag');
  const matched = newsTagById(rawTag);
  const activeTag: NewsTagId | 'all' = matched?.id ?? 'all';

  const stories = useMemo(() => storiesForTag(activeTag), [activeTag]);
  const launchedTotal = useMemo(() => totalCoinsLaunched(stories), [stories]);

  return (
    <AppSidebarProvider>
      <AppSidebar />
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col bg-black text-white">
        <header className="flex shrink-0 items-center gap-3 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
              <Flame className="h-3 w-3" fill="currentColor" strokeWidth={0} />
              News
            </p>
            <h1 className="truncate text-[18px] font-bold tracking-tight">
              {activeTag === 'all' ? 'Trending News' : newsTagLabel(activeTag)}
            </h1>
          </div>
          <div className="shrink-0 rounded-2xl bg-[#121214] px-3 py-2 text-right ring-1 ring-white/10">
            <p className="text-[15px] font-black tabular-nums leading-none text-[#d5ff69]">
              {launchedTotal}
            </p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-white/40">
              coins launched
            </p>
          </div>
          <Link
            to="/?tab=trenches"
            className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#1c1c1e] ring-1 ring-white/10"
            aria-label="Trenches"
          >
            <CtoGoLogo size={28} className="rounded-full" />
          </Link>
        </header>

        <TrendingNewsBar activeTagId={activeTag} showBack backTo="/?tab=trenches" />

        <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 pb-2.5 pt-2.5">
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
          <p className="text-[11px] text-white/40">
            {stories.length} stor{stories.length === 1 ? 'y' : 'ies'} · {launchedTotal} launched
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
            <ul className="space-y-3">
              {stories.map((story) => (
                <li key={story.id}>
                  <StoryCard story={story} />
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </AppSidebarProvider>
  );
}
