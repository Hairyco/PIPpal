import { SlidersHorizontal, X } from 'lucide-react';

export type AgeFilter = 'any' | 'lt1h' | 'lt6h' | 'lt24h' | 'lt7d' | 'live';
export type McapFilter = 'any' | 'lt100k' | '100k_500k' | '500k_1m' | 'gt1m';
export type HoldersFilter = 'any' | 'lt1k' | '1k_5k' | '5k_10k' | 'gt10k';
export type VolumeFilter = 'any' | 'gt10k' | 'gt50k' | 'gt100k';

export type DiscoveryFilterState = {
  age: AgeFilter;
  marketCap: McapFilter;
  holders: HoldersFilter;
  volume: VolumeFilter;
};

export const DEFAULT_DISCOVERY_FILTERS: DiscoveryFilterState = {
  age: 'any',
  marketCap: 'any',
  holders: 'any',
  volume: 'any',
};

const AGE_OPTIONS: { id: AgeFilter; label: string }[] = [
  { id: 'any', label: 'Any' },
  { id: 'lt1h', label: '<1h' },
  { id: 'lt6h', label: '<6h' },
  { id: 'lt24h', label: '<24h' },
  { id: 'lt7d', label: '<7d' },
  { id: 'live', label: 'Live' },
];

const MCAP_OPTIONS: { id: McapFilter; label: string }[] = [
  { id: 'any', label: 'Any' },
  { id: 'lt100k', label: '<$100K' },
  { id: '100k_500k', label: '$100K–$500K' },
  { id: '500k_1m', label: '$500K–$1M' },
  { id: 'gt1m', label: '>$1M' },
];

const HOLDERS_OPTIONS: { id: HoldersFilter; label: string }[] = [
  { id: 'any', label: 'Any' },
  { id: 'lt1k', label: '<1K' },
  { id: '1k_5k', label: '1K–5K' },
  { id: '5k_10k', label: '5K–10K' },
  { id: 'gt10k', label: '>10K' },
];

const VOLUME_OPTIONS: { id: VolumeFilter; label: string }[] = [
  { id: 'any', label: 'Any' },
  { id: 'gt10k', label: '>$10K' },
  { id: 'gt50k', label: '>$50K' },
  { id: 'gt100k', label: '>$100K' },
];

export function parseCompactAmount(value: string): number {
  const cleaned = value.replace(/[$,\s]/g, '').toUpperCase();
  const match = cleaned.match(/^([\d.]+)([KMB])?$/);
  if (!match) return Number(cleaned) || 0;
  const n = Number(match[1]);
  if (!Number.isFinite(n)) return 0;
  const mult = match[2] === 'K' ? 1e3 : match[2] === 'M' ? 1e6 : match[2] === 'B' ? 1e9 : 1;
  return n * mult;
}

export function countActiveDiscoveryFilters(filters: DiscoveryFilterState): number {
  let n = 0;
  if (filters.age !== 'any') n += 1;
  if (filters.marketCap !== 'any') n += 1;
  if (filters.holders !== 'any') n += 1;
  if (filters.volume !== 'any') n += 1;
  return n;
}

export function matchesDiscoveryFilters(
  project: {
    launchInHours: number | null;
    marketCap: string;
    holders: string;
    volume24h: string;
  },
  filters: DiscoveryFilterState,
): boolean {
  if (filters.age !== 'any') {
    const hours = project.launchInHours;
    if (filters.age === 'live') {
      if (hours != null) return false;
    } else if (hours == null) {
      return false;
    } else if (filters.age === 'lt1h' && hours >= 1) {
      return false;
    } else if (filters.age === 'lt6h' && hours >= 6) {
      return false;
    } else if (filters.age === 'lt24h' && hours >= 24) {
      return false;
    } else if (filters.age === 'lt7d' && hours >= 24 * 7) {
      return false;
    }
  }

  if (filters.marketCap !== 'any') {
    const mcap = parseCompactAmount(project.marketCap);
    if (filters.marketCap === 'lt100k' && mcap >= 1e5) return false;
    if (filters.marketCap === '100k_500k' && (mcap < 1e5 || mcap > 5e5)) return false;
    if (filters.marketCap === '500k_1m' && (mcap < 5e5 || mcap > 1e6)) return false;
    if (filters.marketCap === 'gt1m' && mcap <= 1e6) return false;
  }

  if (filters.holders !== 'any') {
    const holders = parseCompactAmount(project.holders);
    if (filters.holders === 'lt1k' && holders >= 1e3) return false;
    if (filters.holders === '1k_5k' && (holders < 1e3 || holders > 5e3)) return false;
    if (filters.holders === '5k_10k' && (holders < 5e3 || holders > 1e4)) return false;
    if (filters.holders === 'gt10k' && holders <= 1e4) return false;
  }

  if (filters.volume !== 'any') {
    const vol = parseCompactAmount(project.volume24h);
    if (filters.volume === 'gt10k' && vol <= 1e4) return false;
    if (filters.volume === 'gt50k' && vol <= 5e4) return false;
    if (filters.volume === 'gt100k' && vol <= 1e5) return false;
  }

  return true;
}

function ChipRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
                active
                  ? 'bg-[#c8ff3d] text-[#090b14]'
                  : 'border border-white/[0.08] bg-white/[0.03] text-white/55 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type DiscoveryFiltersProps = {
  open: boolean;
  filters: DiscoveryFilterState;
  onChange: (next: DiscoveryFilterState) => void;
  onClose: () => void;
  onClear: () => void;
  resultCount: number;
};

export function DiscoveryFiltersPanel({
  open,
  filters,
  onChange,
  onClose,
  onClear,
  resultCount,
}: DiscoveryFiltersProps) {
  if (!open) return null;

  const activeCount = countActiveDiscoveryFilters(filters);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal aria-labelledby="discovery-filters-title">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        aria-label="Close filters"
        onClick={onClose}
      />
      <div className="relative z-[1] w-full max-w-md rounded-t-2xl border border-white/10 bg-[#0a0c12] p-4 shadow-[0_-24px_60px_rgba(0,0,0,0.65)] sm:rounded-2xl sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#c8ff3d]/12 text-[#d5ff69]">
              <SlidersHorizontal className="h-4 w-4" />
            </span>
            <div>
              <p id="discovery-filters-title" className="font-serif text-lg font-bold text-white">
                Filters
              </p>
              <p className="text-[11px] text-white/40">
                {resultCount} coin{resultCount === 1 ? '' : 's'}
                {activeCount > 0 ? ` · ${activeCount} active` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.08] text-white/50 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <ChipRow
            label="Age"
            options={AGE_OPTIONS}
            value={filters.age}
            onChange={(age) => onChange({ ...filters, age })}
          />
          <ChipRow
            label="Market cap"
            options={MCAP_OPTIONS}
            value={filters.marketCap}
            onChange={(marketCap) => onChange({ ...filters, marketCap })}
          />
          <ChipRow
            label="Holders"
            options={HOLDERS_OPTIONS}
            value={filters.holders}
            onChange={(holders) => onChange({ ...filters, holders })}
          />
          <ChipRow
            label="Volume 24h"
            options={VOLUME_OPTIONS}
            value={filters.volume}
            onChange={(volume) => onChange({ ...filters, volume })}
          />
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClear}
            disabled={activeCount === 0}
            className="flex-1 rounded-lg border border-white/[0.1] px-3 py-2.5 text-sm font-semibold text-white/55 transition hover:text-white disabled:opacity-35"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-[1.4] rounded-lg bg-[#c8ff3d] px-3 py-2.5 text-sm font-bold text-[#090b14] hover:bg-[#d5ff69]"
          >
            Show {resultCount}
          </button>
        </div>
      </div>
    </div>
  );
}
