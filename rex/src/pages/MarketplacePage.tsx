import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Layout, BackLink } from '../components/Layout';
import {
  IndependentCard,
  InfluencerCard,
  StudioCard,
} from '../components/marketplace/MarketplaceCards';
import { devStudios, projectDeliverables } from '../data/devStudios';
import { talentPool } from '../data/talentPool';
import { influencers } from '../data/influencers';

type MarketplaceTab = 'studios' | 'independent' | 'influencers';

const TABS: { id: MarketplaceTab; label: string }[] = [
  { id: 'studios', label: 'Studios' },
  { id: 'independent', label: 'Independent' },
  { id: 'influencers', label: 'Influencers' },
];

function skillLabel(id: string): string {
  return projectDeliverables.find((d) => d.id === id)?.label ?? id;
}

function parseTab(value: string | null): MarketplaceTab {
  if (value === 'independent' || value === 'influencers') return value;
  return 'studios';
}

export function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseTab(searchParams.get('tab'));
  const [query, setQuery] = useState('');

  const setTab = (next: MarketplaceTab) => {
    setSearchParams({ tab: next });
  };

  const filteredStudios = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return devStudios;
    return devStudios.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.specialty.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [query]);

  const filteredTalent = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return talentPool;
    return talentPool.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q) ||
        t.specialty.toLowerCase().includes(q) ||
        t.skills.some((s) => skillLabel(s).toLowerCase().includes(q)),
    );
  }, [query]);

  const filteredInfluencers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return influencers;
    return influencers.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.role.toLowerCase().includes(q) ||
        i.specialty.toLowerCase().includes(q) ||
        i.platforms.some((p) => p.toLowerCase().includes(q)),
    );
  }, [query]);

  const activeList =
    tab === 'studios'
      ? filteredStudios
      : tab === 'independent'
        ? filteredTalent
        : filteredInfluencers;

  const tabLabel = TABS.find((t) => t.id === tab)?.label ?? 'Studios';

  return (
    <Layout>
      <div className="container py-8 pb-16">
        <BackLink />

        <div className="mt-6 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-400">Marketplace</p>
          <h1 className="mt-2 font-serif text-3xl text-white md:text-4xl">Explore {tabLabel}</h1>
          <p className="mt-2 text-muted-foreground">
            Browse vetted {tabLabel.toLowerCase()} ready to work on your Rex project.
          </p>
        </div>

        <div className="mt-8 flex w-full flex-col gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search marketplace…"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
            />
          </div>

          <div className="flex w-full rounded-xl border border-white/10 bg-white/[0.03] p-1">
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

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
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

        <div className="mt-10 text-center">
          <Link to="/get-started" className="dex-btn">
            Shortlist for your project
          </Link>
        </div>
      </div>
    </Layout>
  );
}
