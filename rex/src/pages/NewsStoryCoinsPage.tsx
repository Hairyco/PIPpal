import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Flame, Rocket } from 'lucide-react';
import { CtoGoLogo } from '../components/CtoGoLogo';
import { AppSidebar, AppSidebarProvider } from '../components/AppSidebar';
import { Sparkline } from '../components/Sparkline';
import { TrenchesToolbar } from '../components/TrenchesToolbar';
import { trenchesAgeLabel } from '../components/TrenchesFeed';
import { ctoProjects, type CtoProject } from '../data/ctoProjects';
import {
  newsTagLabel,
  storyById,
  tickersForStory,
} from '../data/trendingNews';

function formatPct(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

export function NewsStoryCoinsPage() {
  const { storyId = '' } = useParams();
  const navigate = useNavigate();
  const story = storyById(storyId);

  const catalogTickers = useMemo(() => ctoProjects.map((p) => p.ticker), []);

  const projects = useMemo(() => {
    if (!story) return [] as CtoProject[];
    const tickers = tickersForStory(story, catalogTickers);
    return tickers
      .map((t) => ctoProjects.find((p) => p.ticker.toUpperCase() === t) ?? null)
      .filter((p): p is CtoProject => Boolean(p));
  }, [story, catalogTickers]);

  if (!story) {
    return (
      <AppSidebarProvider>
        <AppSidebar />
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col items-center justify-center bg-black px-6 text-center text-white">
          <p className="text-[15px] font-semibold text-white/70">Story not found</p>
          <Link
            to="/news"
            className="mt-4 inline-flex h-10 items-center rounded-full bg-[#c8ff3d] px-5 text-[13px] font-bold text-[#090b14]"
          >
            Back to news
          </Link>
        </div>
      </AppSidebarProvider>
    );
  }

  return (
    <AppSidebarProvider>
      <AppSidebar />
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col bg-black text-white">
        <header className="flex shrink-0 items-center gap-2 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={() => navigate(`/news?tag=${encodeURIComponent(story.tagId)}`)}
            className="grid h-9 w-9 place-items-center rounded-full bg-[#1c1c1e] text-white/70 ring-1 ring-white/10"
            aria-label="Back to news"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
              <Flame className="h-3 w-3" fill="currentColor" strokeWidth={0} />
              {newsTagLabel(story.tagId)}
            </p>
            <h1 className="truncate text-[16px] font-bold tracking-tight">{story.title}</h1>
          </div>
          <div className="shrink-0 rounded-2xl bg-[#121214] px-2.5 py-1.5 text-right ring-1 ring-white/10">
            <p className="text-[14px] font-black tabular-nums leading-none text-[#d5ff69]">
              {projects.length}
            </p>
            <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-wide text-white/40">
              coins
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

        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.06] px-3 pb-2.5">
          <p className="text-[12px] text-white/45">
            {story.coinsLaunched} launched on this narrative
          </p>
          <Link
            to={`/launch?mode=create&name=${encodeURIComponent(newsTagLabel(story.tagId))}&ticker=${encodeURIComponent(
              newsTagLabel(story.tagId).replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase() || 'CTO',
            )}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#c8ff3d] px-3 text-[11px] font-bold text-[#090b14]"
          >
            <Rocket className="h-3.5 w-3.5" strokeWidth={2.5} />
            Create
          </Link>
        </div>

        <TrenchesToolbar />

        <div className="grid shrink-0 grid-cols-[42px_minmax(0,1fr)_44px_4.25rem_3.75rem] items-center gap-x-1.5 px-3 pb-1 pt-1 text-[10px] font-medium text-white/35">
          <div className="col-span-2">Coin / Ticker</div>
          <div className="text-center">Chart</div>
          <div className="text-right">MC / 24h</div>
          <div className="text-right">Trade</div>
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {projects.length === 0 ? (
            <p className="px-5 py-12 text-center text-[13px] text-white/40">No coins listed yet.</p>
          ) : (
            <ul>
              {projects.map((project) => {
                const up = project.change24h >= 0;
                const age = trenchesAgeLabel(project);
                return (
                  <li key={project.ticker}>
                    <div className="grid w-full grid-cols-[42px_minmax(0,1fr)_44px_4.25rem_3.75rem] items-center gap-x-1.5 border-b border-white/[0.06] px-3 py-[9px]">
                      <button
                        type="button"
                        onClick={() => navigate(`/coin/${encodeURIComponent(project.ticker)}`)}
                        className="relative shrink-0 text-left"
                        aria-label={`Open $${project.ticker}`}
                      >
                        <span className="block h-[42px] w-[42px] overflow-hidden rounded-[10px] bg-[#1c1c1e] ring-1 ring-white/10">
                          <img
                            src={project.logo}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/coin/${encodeURIComponent(project.ticker)}`)}
                        className="min-w-0 pr-0.5 text-left"
                      >
                        <div className="flex min-w-0 items-center gap-1.5">
                          <p className="min-w-0 truncate text-[14px] font-semibold leading-none text-white">
                            {project.name}
                          </p>
                          <span className="shrink-0 rounded-[4px] bg-[#2a2a2c] px-1.5 py-[2px] text-[10px] font-semibold leading-none text-white/55">
                            ${project.ticker}
                          </span>
                          <span
                            className="shrink-0 text-[11px] font-semibold tabular-nums text-emerald-400"
                            title="Age"
                          >
                            {age}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium tabular-nums leading-none text-white/40">
                          {project.holders} holders · {project.volume24h} vol
                        </p>
                      </button>

                      <div className="flex items-center justify-center">
                        <Sparkline
                          seed={`${project.ticker}-news`}
                          changePct={project.change24h}
                          width={40}
                          height={22}
                        />
                      </div>

                      <div className="min-w-0 text-right">
                        <p className="truncate text-[13px] font-semibold tabular-nums leading-none text-white">
                          {project.marketCap}
                        </p>
                        <p
                          className={`mt-1 truncate text-[11px] font-medium tabular-nums leading-none ${
                            up ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {formatPct(project.change24h)}
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => navigate(`/coin/${encodeURIComponent(project.ticker)}`)}
                          className="inline-flex h-8 items-center justify-center rounded-full bg-[#c8ff3d] px-2.5 text-[11px] font-bold text-[#090b14] active:brightness-95"
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </main>
      </div>
    </AppSidebarProvider>
  );
}
