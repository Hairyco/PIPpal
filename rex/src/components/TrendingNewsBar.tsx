import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { TRENDING_NEWS_TAGS, type NewsTagId } from '../data/trendingNews';

type TrendingNewsBarProps = {
  /** Optional active tag highlight when already on /news */
  activeTagId?: NewsTagId | 'all' | null;
};

export function TrendingNewsBar({ activeTagId = null }: TrendingNewsBarProps) {
  return (
    <div className="flex shrink-0 items-center gap-2 overflow-x-auto px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Link
        to="/news"
        className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-[#d5ff69] transition hover:text-white"
      >
        <Flame className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
        Trending from News
      </Link>
      <div className="flex w-max items-center gap-1.5 pr-1">
        {TRENDING_NEWS_TAGS.map((tag) => {
          const active = activeTagId === tag.id;
          return (
            <Link
              key={tag.id}
              to={`/news?tag=${encodeURIComponent(tag.id)}`}
              className={`inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-[11px] font-semibold transition ${
                active
                  ? 'bg-[#c8ff3d]/15 text-[#d5ff69] ring-1 ring-[#c8ff3d]/45'
                  : 'bg-[#1c1c1e] text-white/65 ring-1 ring-white/10 hover:text-white'
              }`}
            >
              {tag.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
