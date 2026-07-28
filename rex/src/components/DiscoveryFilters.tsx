import { SlidersHorizontal, X } from 'lucide-react';

export type RangeFilter = { min: number; max: number };
export type VolumeFilter = 'any' | 'gt10k' | 'gt50k' | 'gt100k';

export type DiscoveryFilterState = {
  age: RangeFilter;
  marketCap: RangeFilter;
  holders: RangeFilter;
  volume: VolumeFilter;
};

/** Age stops in hours. Last stop is open-ended (7d+ / older). */
export const AGE_STEPS = [
  { value: 0, label: 'New' },
  { value: 1, label: '1h' },
  { value: 6, label: '6h' },
  { value: 12, label: '12h' },
  { value: 24, label: '1d' },
  { value: 72, label: '3d' },
  { value: 168, label: '7d' },
  { value: Number.POSITIVE_INFINITY, label: '7d+' },
] as const;

/** Market cap stops in USD. */
export const MCAP_STEPS = [
  { value: 0, label: '$0' },
  { value: 50_000, label: '$50K' },
  { value: 100_000, label: '$100K' },
  { value: 250_000, label: '$250K' },
  { value: 500_000, label: '$500K' },
  { value: 1_000_000, label: '$1M' },
  { value: 5_000_000, label: '$5M' },
  { value: Number.POSITIVE_INFINITY, label: '$5M+' },
] as const;

/** Holder count stops. */
export const HOLDERS_STEPS = [
  { value: 0, label: '0' },
  { value: 500, label: '500' },
  { value: 1_000, label: '1K' },
  { value: 2_500, label: '2.5K' },
  { value: 5_000, label: '5K' },
  { value: 10_000, label: '10K' },
  { value: 25_000, label: '25K' },
  { value: Number.POSITIVE_INFINITY, label: '25K+' },
] as const;

const VOLUME_OPTIONS: { id: VolumeFilter; label: string }[] = [
  { id: 'any', label: 'Any' },
  { id: 'gt10k', label: '>$10K' },
  { id: 'gt50k', label: '>$50K' },
  { id: 'gt100k', label: '>$100K' },
];

export const DEFAULT_DISCOVERY_FILTERS: DiscoveryFilterState = {
  age: { min: 0, max: AGE_STEPS.length - 1 },
  marketCap: { min: 0, max: MCAP_STEPS.length - 1 },
  holders: { min: 0, max: HOLDERS_STEPS.length - 1 },
  volume: 'any',
};

function isFullRange(range: RangeFilter, stepCount: number) {
  return range.min === 0 && range.max === stepCount - 1;
}

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
  if (!isFullRange(filters.age, AGE_STEPS.length)) n += 1;
  if (!isFullRange(filters.marketCap, MCAP_STEPS.length)) n += 1;
  if (!isFullRange(filters.holders, HOLDERS_STEPS.length)) n += 1;
  if (filters.volume !== 'any') n += 1;
  return n;
}

export function formatRangeLabel(
  range: RangeFilter,
  steps: ReadonlyArray<{ label: string }>,
): string {
  if (isFullRange(range, steps.length)) return 'Any';
  const lo = steps[range.min]?.label ?? '?';
  const hi = steps[range.max]?.label ?? '?';
  if (range.min === range.max) return lo;
  return `${lo}–${hi}`;
}

function valueInRange(
  value: number,
  range: RangeFilter,
  steps: ReadonlyArray<{ value: number }>,
): boolean {
  const minV = steps[range.min]?.value ?? 0;
  const maxV = steps[range.max]?.value ?? Number.POSITIVE_INFINITY;
  if (value < minV) return false;
  if (Number.isFinite(maxV)) {
    // Inclusive upper bound for finite stops
    if (value > maxV) return false;
  }
  // Open-ended max (Infinity label like 7d+ / $5M+) includes everything >= min
  return true;
}

/** Age in hours for filtering. Null launch age = older than 7d. */
function projectAgeHours(launchInHours: number | null): number {
  if (launchInHours == null) return 24 * 14;
  return launchInHours;
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
  if (!isFullRange(filters.age, AGE_STEPS.length)) {
    if (!valueInRange(projectAgeHours(project.launchInHours), filters.age, AGE_STEPS)) {
      return false;
    }
  }

  if (!isFullRange(filters.marketCap, MCAP_STEPS.length)) {
    if (!valueInRange(parseCompactAmount(project.marketCap), filters.marketCap, MCAP_STEPS)) {
      return false;
    }
  }

  if (!isFullRange(filters.holders, HOLDERS_STEPS.length)) {
    if (!valueInRange(parseCompactAmount(project.holders), filters.holders, HOLDERS_STEPS)) {
      return false;
    }
  }

  if (filters.volume !== 'any') {
    const vol = parseCompactAmount(project.volume24h);
    if (filters.volume === 'gt10k' && vol <= 1e4) return false;
    if (filters.volume === 'gt50k' && vol <= 5e4) return false;
    if (filters.volume === 'gt100k' && vol <= 1e5) return false;
  }

  return true;
}

function DualRangeSlider({
  label,
  steps,
  value,
  onChange,
}: {
  label: string;
  steps: ReadonlyArray<{ label: string }>;
  value: RangeFilter;
  onChange: (next: RangeFilter) => void;
}) {
  const last = steps.length - 1;
  const active = !isFullRange(value, steps.length);
  const spanLabel = formatRangeLabel(value, steps);
  const fillLeft = (value.min / last) * 100;
  const fillRight = (value.max / last) * 100;

  const setMin = (raw: number) => {
    const next = Math.min(Math.max(0, raw), value.max);
    onChange({ min: next, max: value.max });
  };
  const setMax = (raw: number) => {
    const next = Math.max(Math.min(last, raw), value.min);
    onChange({ min: value.min, max: next });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">{label}</p>
        <p className={`text-[11px] font-semibold tabular-nums ${active ? 'text-[#d5ff69]' : 'text-white/40'}`}>
          {spanLabel}
        </p>
      </div>

      <div className="relative mt-4 h-6">
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/[0.08]" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#c8ff3d]/70"
          style={{ left: `${fillLeft}%`, right: `${100 - fillRight}%` }}
        />
        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={value.min}
          onChange={(event) => setMin(Number(event.target.value))}
          className="discovery-range absolute inset-0 z-[2] w-full appearance-none bg-transparent"
          aria-label={`${label} minimum`}
        />
        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={value.max}
          onChange={(event) => setMax(Number(event.target.value))}
          className="discovery-range absolute inset-0 z-[3] w-full appearance-none bg-transparent"
          aria-label={`${label} maximum`}
        />
      </div>

      <div className="mt-1.5 flex justify-between text-[9px] font-medium text-white/25">
        <span>{steps[0].label}</span>
        <span>{steps[last].label}</span>
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
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal
      aria-labelledby="discovery-filters-title"
    >
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

        <div className="mt-5 space-y-5">
          <DualRangeSlider
            label="Age"
            steps={AGE_STEPS}
            value={filters.age}
            onChange={(age) => onChange({ ...filters, age })}
          />
          <DualRangeSlider
            label="Market cap"
            steps={MCAP_STEPS}
            value={filters.marketCap}
            onChange={(marketCap) => onChange({ ...filters, marketCap })}
          />
          <DualRangeSlider
            label="Holders"
            steps={HOLDERS_STEPS}
            value={filters.holders}
            onChange={(holders) => onChange({ ...filters, holders })}
          />

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">Volume 24h</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {VOLUME_OPTIONS.map((option) => {
                const active = filters.volume === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onChange({ ...filters, volume: option.id })}
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

        <style>{`
          .discovery-range {
            pointer-events: none;
            height: 1.5rem;
            margin: 0;
          }
          .discovery-range::-webkit-slider-thumb {
            pointer-events: auto;
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 9999px;
            background: #c8ff3d;
            border: 2px solid #090b14;
            box-shadow: 0 0 0 1px rgba(200, 255, 61, 0.35);
            cursor: pointer;
            position: relative;
            z-index: 5;
          }
          .discovery-range::-moz-range-thumb {
            pointer-events: auto;
            width: 18px;
            height: 18px;
            border-radius: 9999px;
            background: #c8ff3d;
            border: 2px solid #090b14;
            box-shadow: 0 0 0 1px rgba(200, 255, 61, 0.35);
            cursor: pointer;
          }
          .discovery-range::-webkit-slider-runnable-track {
            background: transparent;
            height: 1.5rem;
          }
          .discovery-range::-moz-range-track {
            background: transparent;
            height: 1.5rem;
          }
        `}</style>
      </div>
    </div>
  );
}
