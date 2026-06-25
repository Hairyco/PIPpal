import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Search } from 'lucide-react';
import { industries, type Industry } from '../data/industries';

const featuredIds = new Set(['meme-coins', 'aerospace']);

const PREVIEW_COUNT = 4;

type CardSize = 'preview' | 'compact';

function imageAspect(size: CardSize): string {
  if (size === 'compact') return 'aspect-[16/9]';
  return 'aspect-[16/10]';
}

function IndustryCard({ industry, size }: { industry: Industry; size: CardSize }) {
  const featured = featuredIds.has(industry.id);
  const isCompact = size === 'compact';

  return (
    <Link
      to={`/category/${industry.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0e17] transition-all duration-300 hover:border-sky-500/25 hover:shadow-[0_12px_40px_-16px_rgba(14,165,233,0.25)] ${isCompact ? 'rounded-lg' : 'rounded-2xl'}`}
    >
      <div className={`relative overflow-hidden ${imageAspect(size)}`}>
        <img
          src={industry.image}
          alt={industry.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] via-[#0a0e17]/20 to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 via-transparent to-indigo-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {featured && !isCompact && (
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-md">
            Featured
          </span>
        )}
      </div>

      <div className={`relative border-t border-white/[0.06] ${isCompact ? 'p-3' : 'p-4 sm:p-5'}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span
              className={`font-medium uppercase tracking-[0.15em] text-sky-400/90 ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}
            >
              {industry.tag}
            </span>
            <h3
              className={`mt-1 font-serif text-white ${isCompact ? 'text-base leading-snug' : 'mt-1.5 text-xl sm:text-2xl'}`}
            >
              {industry.name}
            </h3>
          </div>
          <span
            className={`flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-colors group-hover:border-sky-500/30 group-hover:bg-sky-500/10 group-hover:text-sky-400 ${isCompact ? 'h-6 w-6' : 'h-8 w-8'}`}
          >
            <ArrowUpRight className={isCompact ? 'h-3 w-3' : 'h-4 w-4'} />
          </span>
        </div>

        <p
          className={`leading-relaxed text-muted-foreground ${isCompact ? 'mt-1 line-clamp-1 text-xs' : 'mt-2 line-clamp-2 text-sm'}`}
        >
          {industry.description}
        </p>

        {!isCompact && (
          <p className="mt-4 text-xs font-medium text-white/35">
            {industry.projectCount.toLocaleString()} active projects
          </p>
        )}
      </div>
    </Link>
  );
}

interface IndustryGridProps {
  /** Show every category (categories page). Default: preview of 4 on homepage. */
  showAll?: boolean;
}

function matchesIndustryQuery(industry: Industry, query: string): boolean {
  const haystack = [
    industry.name,
    industry.description,
    industry.tag,
    industry.id.replace(/-/g, ' '),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

export function IndustryGrid({ showAll = false }: IndustryGridProps) {
  const [query, setQuery] = useState('');
  const cardSize: CardSize = showAll ? 'compact' : 'preview';

  const displayed = useMemo(() => {
    if (!showAll) return industries.slice(0, PREVIEW_COUNT);
    const q = query.trim().toLowerCase();
    if (!q) return industries;
    return industries.filter((industry) => matchesIndustryQuery(industry, q));
  }, [showAll, query]);

  return (
    <section className={showAll ? '' : 'container my-20'}>
      <div className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${showAll ? 'mb-8' : 'mb-10'}`}>
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-400">Categories</p>
          <h2 className={`mt-2 font-serif text-white ${showAll ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'}`}>
            {showAll ? 'All categories' : 'Explore big ideas that become reality.'}
          </h2>
        </div>
        <p className="max-w-xs text-sm text-muted-foreground">
          {showAll
            ? query.trim()
              ? `${displayed.length} of ${industries.length} sectors`
              : `${industries.length} sectors where Rex projects launch, fundraise, and deliver.`
            : 'Curated sectors where Rex projects launch, fundraise, and deliver within the ecosystem'}
        </p>
      </div>

      {showAll && (
        <div className="relative mb-6 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories…"
            className={`w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 text-base text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30 ${query ? 'pr-14' : 'pr-4'}`}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {showAll && query.trim() && displayed.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No categories match &ldquo;{query.trim()}&rdquo;. Try a different search.
        </p>
      ) : (
        <div
          className={
            showAll
              ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
              : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5'
          }
        >
          {displayed.map((industry) => (
            <IndustryCard key={industry.id} industry={industry} size={cardSize} />
          ))}
        </div>
      )}

      {!showAll && industries.length > PREVIEW_COUNT && (
        <div className="mt-8 flex justify-center">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-300"
          >
            View all categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
