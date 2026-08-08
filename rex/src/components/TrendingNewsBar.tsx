import { Link } from 'react-router-dom';
import { ArrowLeft, Flame } from 'lucide-react';
import { TRENDING_NEWS_TAGS, type NewsTagId } from '../data/trendingNews';

type TrendingNewsBarProps = {
  /** Optional active tag highlight when already on /news */
  activeTagId?: NewsTagId | 'all' | null;
  /** Back control — used on /news to return to Trenches */
  showBack?: boolean;
  backTo?: string;
};

function TagPill({
  tagId,
  label,
  active,
}: {
  tagId: NewsTagId;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={`/news?tag=${encodeURIComponent(tagId)}`}
      className={`inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-[11px] font-semibold transition ${
        active
          ? 'bg-[#c8ff3d]/15 text-[#d5ff69] ring-1 ring-[#c8ff3d]/45'
          : 'bg-[#1c1c1e] text-white/65 ring-1 ring-white/10 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );
}

export function TrendingNewsBar({
  activeTagId = null,
  showBack = false,
  backTo = '/?tab=trenches',
}: TrendingNewsBarProps) {
  /** Two identical runs so scroll-right’s -50% → 0% loop is seamless. */
  const marqueeTags = [...TRENDING_NEWS_TAGS, ...TRENDING_NEWS_TAGS];

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 py-2">
      {showBack ? (
        <Link
          to={backTo}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1c1c1e] text-white/70 ring-1 ring-white/10 transition hover:text-white"
          aria-label="Back to Trenches"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
        </Link>
      ) : null}
      <Link
        to="/news"
        className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-[#d5ff69] transition hover:text-white"
      >
        <Flame className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
        Trending News
      </Link>

      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div
          className="flex w-max items-center gap-1.5 pr-1 motion-reduce:animate-none animate-scroll-right-news hover:[animation-play-state:paused]"
          aria-label="Trending news tags"
        >
          {marqueeTags.map((tag, index) => (
            <TagPill
              key={`${tag.id}-${index}`}
              tagId={tag.id}
              label={tag.label}
              active={activeTagId === tag.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
