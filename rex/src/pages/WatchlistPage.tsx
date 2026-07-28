import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Trash2 } from 'lucide-react';
import { AppShell } from '../components/AppSidebar';
import { useWatchlist } from '../hooks/useWatchlist';
import { ctoProjects } from '../data/ctoProjects';

function Pct({ value }: { value: number }) {
  return (
    <span className={value >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
      {value >= 0 ? '+' : ''}
      {value.toFixed(2)}%
    </span>
  );
}

export function WatchlistPage() {
  const navigate = useNavigate();
  const { tickers, remove, count } = useWatchlist();

  const watched = tickers
    .map((ticker) => ctoProjects.find((project) => project.ticker === ticker))
    .filter((project): project is (typeof ctoProjects)[number] => Boolean(project));

  return (
    <AppShell>
      <div className="min-h-screen bg-black text-[#f5f7fb]">
        <header className="border-b border-white/[0.07] bg-black">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 pl-14 md:pl-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
            <p className="inline-flex items-center gap-1.5 font-serif text-base font-bold">
              <Star className="h-4 w-4 fill-[#c8ff3d] text-[#c8ff3d]" />
              Watchlist
            </p>
            <span className="text-sm text-white/35">{count}</span>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
          <div className="mb-5">
            <h1 className="font-serif text-3xl font-bold tracking-tight">Watchlist</h1>
            <p className="mt-1 text-sm text-white/45">
              Coins you star on discovery. Open any row to trade, or remove it here.
            </p>
          </div>

          {watched.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] px-5 py-12 text-center">
              <Star className="mx-auto h-8 w-8 text-white/25" />
              <p className="mt-3 text-sm font-semibold text-white/70">No coins watched yet</p>
              <p className="mt-1 text-xs text-white/40">
                Tap the star on any row in discovery to save it here.
              </p>
              <Link
                to="/"
                className="mt-5 inline-flex rounded-lg bg-[#c8ff3d] px-4 py-2.5 text-sm font-bold text-[#090b14] hover:bg-[#d5ff69]"
              >
                Browse discovery
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/[0.1]">
              {watched.map((project) => (
                <div
                  key={project.ticker}
                  className="flex items-center gap-3 border-b border-white/[0.06] px-3 py-3 last:border-0 hover:bg-white/[0.02]"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/?ticker=${encodeURIComponent(project.ticker)}`)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <div
                      className={`h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${project.colors} ring-1 ring-white/10`}
                    >
                      <img src={project.logo} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-1.5">
                        <p className="text-sm font-bold">{project.ticker}</p>
                        <p className="truncate text-[11px] text-white/45">{project.name}</p>
                      </div>
                      <p className="mt-0.5 text-[11px] text-white/40">{project.marketCap}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold text-white/85">{project.price}</p>
                      <p className="text-[10px] font-semibold">
                        <Pct value={project.change24h} />
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(project.ticker)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/[0.08] text-white/35 hover:border-rose-400/40 hover:text-rose-300"
                    aria-label={`Remove ${project.ticker} from watchlist`}
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AppShell>
  );
}
