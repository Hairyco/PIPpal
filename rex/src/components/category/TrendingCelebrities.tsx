import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Newspaper, RefreshCw, Sparkles } from 'lucide-react';
import {
  fetchCelebrityTrends,
  getStartedUrlForTrend,
  type CelebrityTrend,
} from '../../utils/celebrityTrending';

function TrendingPillBar({
  trends,
  loading,
}: {
  trends: CelebrityTrend[];
  loading: boolean;
}) {
  if (loading && trends.length === 0) {
    return (
      <div className="mt-4 flex gap-2 overflow-x-auto pb-0.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 shrink-0 animate-pulse rounded-full border border-white/5 bg-white/[0.04]"
          />
        ))}
      </div>
    );
  }

  if (trends.length === 0) return null;

  return (
    <div className="mt-4 flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:thin]">
      {trends.map((trend) => (
        <Link
          key={trend.id}
          to={getStartedUrlForTrend(trend)}
          title={trend.headline}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-medium text-sky-300 transition-colors hover:border-sky-500/50 hover:bg-sky-500/20"
        >
          <Sparkles className="h-3 w-3 opacity-70" />
          {trend.celebrity}
        </Link>
      ))}
    </div>
  );
}

export function TrendingCelebrities() {
  const [expanded, setExpanded] = useState(false);
  const [trends, setTrends] = useState<CelebrityTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    const result = await fetchCelebrityTrends();
    setTrends(result.trends);
    setLive(result.live);
    setLoading(false);
    if (!result.live && result.trends.length === 0) setError(true);
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="dex-card overflow-hidden">
      <div className="relative z-[1] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            className="min-w-0 flex-1 text-left"
            aria-expanded={expanded}
          >
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-sky-400" />
              <span className="text-xs font-medium uppercase tracking-wider text-sky-400">
                Live inspiration
              </span>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Trending celebrities in the news
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Rex scans entertainment headlines so you can launch a coin around whoever is trending
              right now.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            aria-label={expanded ? 'Collapse trending celebrities' : 'Expand trending celebrities'}
          >
            <ChevronDown
              className={`h-5 w-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        <TrendingPillBar trends={trends} loading={loading} />

        {expanded && (
          <>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span
                  className={`inline-flex h-2 w-2 rounded-full ${live ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  aria-hidden
                />
                {loading
                  ? 'Scanning news feeds…'
                  : live
                    ? 'Updated from live entertainment news'
                    : 'Showing cached trends — live scan unavailable'}
              </div>
              <button
                type="button"
                onClick={() => void load()}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {error && !loading && trends.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Could not load trends. Try refreshing in a moment.
              </p>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {trends.map((trend) => (
                  <Link
                    key={`card-${trend.id}`}
                    to={getStartedUrlForTrend(trend)}
                    className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-sky-500/35 hover:bg-sky-500/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-white group-hover:text-sky-300">
                          {trend.celebrity}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {trend.headline}
                        </p>
                      </div>
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-400 opacity-60 group-hover:opacity-100" />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        {trend.source}
                        {trend.date ? ` · ${trend.date}` : ''}
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium text-sky-400">
                        Create coin
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
