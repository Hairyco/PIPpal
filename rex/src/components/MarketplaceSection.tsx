import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { devStudios, projectDeliverables } from '../data/devStudios';
import { talentPool } from '../data/talentPool';
import { influencers } from '../data/influencers';
import {
  IndependentCard,
  InfluencerCard,
  StudioCard,
} from './marketplace/MarketplaceCards';

type MarketplaceTab = 'studios' | 'independent' | 'influencers';

const TABS: { id: MarketplaceTab; label: string }[] = [
  { id: 'studios', label: 'Studios' },
  { id: 'independent', label: 'Independent' },
  { id: 'influencers', label: 'Influencers' },
];

const PREVIEW_COUNT = 2;

function skillLabel(id: string): string {
  return projectDeliverables.find((d) => d.id === id)?.label ?? id;
}

export function MarketplaceSection() {
  const [tab, setTab] = useState<MarketplaceTab>('studios');
  const [query, setQuery] = useState('');

  const filteredStudios = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? devStudios
      : devStudios.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.specialty.toLowerCase().includes(q) ||
            s.tags.some((t) => t.toLowerCase().includes(q)),
        );
    return list.slice(0, PREVIEW_COUNT);
  }, [query]);

  const filteredTalent = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? talentPool
      : talentPool.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.role.toLowerCase().includes(q) ||
            t.specialty.toLowerCase().includes(q) ||
            t.skills.some((s) => skillLabel(s).toLowerCase().includes(q)),
        );
    return list.slice(0, PREVIEW_COUNT);
  }, [query]);

  const filteredInfluencers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? influencers
      : influencers.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            i.role.toLowerCase().includes(q) ||
            i.specialty.toLowerCase().includes(q) ||
            i.platforms.some((p) => p.toLowerCase().includes(q)),
        );
    return list.slice(0, PREVIEW_COUNT);
  }, [query]);

  const activeList =
    tab === 'studios'
      ? filteredStudios
      : tab === 'independent'
        ? filteredTalent
        : filteredInfluencers;

  return (
    <section className="container my-20">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-400">Marketplace</p>
          <h2 className="mt-2 font-serif text-3xl text-white md:text-4xl">Search marketplace</h2>
          <p className="mt-2 text-muted-foreground">Creators ready to build your project</p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl lg:shrink-0">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by skill, role, or studio…"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
            />
          </div>

          <div className="flex w-full rounded-xl border border-white/10 bg-white/[0.03] p-1 sm:w-auto sm:min-w-[320px]">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-sky-500/15 text-sky-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {tab === 'studios' &&
          filteredStudios.map((studio) => <StudioCard key={studio.id} studio={studio} />)}
        {tab === 'independent' &&
          filteredTalent.map((worker) => <IndependentCard key={worker.id} worker={worker} />)}
        {tab === 'influencers' &&
          filteredInfluencers.map((influencer) => (
            <InfluencerCard key={influencer.id} influencer={influencer} />
          ))}
      </div>

      {activeList.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          No matches for &ldquo;{query}&rdquo;. Try a different search.
        </p>
      )}

      <Link
        to={`/marketplace?tab=${tab}`}
        className="dex-btn mt-5 flex w-full items-center justify-center py-3"
      >
        Explore
      </Link>
    </section>
  );
}
