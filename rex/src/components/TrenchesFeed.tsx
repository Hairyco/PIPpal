import { Eye, Globe, Search, Trophy, Users, Zap } from 'lucide-react';
import type { CtoProject } from '../data/ctoProjects';

export type TrenchesTab = 'new' | 'almost' | 'migrated';

type TrenchesFeedProps = {
  projects: CtoProject[];
  tab: TrenchesTab;
  onTabChange: (tab: TrenchesTab) => void;
  onOpenCoin: (ticker: string) => void;
  onBuy: (ticker: string) => void;
};

const TABS: { id: TrenchesTab; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'almost', label: 'Almost bonded' },
  { id: 'migrated', label: 'Migrated' },
];

function salt(str: string, mod = 1000): number {
  let s = 0;
  for (let i = 0; i < str.length; i += 1) s = (s * 31 + str.charCodeAt(i)) % mod;
  return s;
}

function marketCapUsd(project: CtoProject): number {
  const raw = project.marketCap.replace(/[^0-9.]/g, '');
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  if (project.marketCap.includes('M')) return n * 1_000_000;
  if (project.marketCap.includes('K')) return n * 1_000;
  return n;
}

function ageHours(project: CtoProject): number {
  return project.launchInHours != null ? project.launchInHours : 72 + salt(project.ticker, 200);
}

/** GMGN-style short age: 16m / 2h / 1d */
export function trenchesAgeLabel(project: CtoProject): string {
  const hours = ageHours(project);
  if (hours < 1) {
    const mins = Math.max(1, Math.round(hours * 60) || 1 + salt(project.ticker, 55));
    return `${mins}m`;
  }
  if (hours < 24) return `${Math.max(1, Math.round(hours))}h`;
  if (hours < 72) return `${Math.round(hours / 24)}d`;
  return 'OG';
}

function holdersNum(project: CtoProject): string {
  const raw = project.holders.replace(/[^0-9.]/g, '');
  const n = Number(raw);
  if (!Number.isFinite(n)) return project.holders;
  if (project.holders.includes('K')) return String(Math.round(n * 1000));
  return String(Math.round(n));
}

function viewingCount(project: CtoProject): string {
  return String(40 + salt(project.ticker + 'view', 900));
}

function projectSocials(project: CtoProject) {
  const slug = project.ticker.toLowerCase().replace(/[^a-z0-9]/g, '') || 'ctogo';
  return {
    x: `https://x.com/${slug}`,
    telegram: `https://t.me/${slug}`,
    website: `https://${slug}.fun`,
  };
}

function txsNum(project: CtoProject): string {
  const raw = project.txs.replace(/[^0-9]/g, '');
  return raw || String(80 + salt(project.ticker + 'tx', 400));
}

function isMigrated(project: CtoProject): boolean {
  return (
    project.sourceVenue === 'Raydium' ||
    project.sourceVenue === 'PumpSwap' ||
    project.stage === 'Live'
  );
}

function isAlmostBonded(project: CtoProject): boolean {
  if (isMigrated(project)) return false;
  const mc = marketCapUsd(project);
  const onCurve =
    project.sourceVenue === 'Pump.fun' ||
    project.sourceVenue === 'Moonshot' ||
    project.sourceVenue === 'LetsBonk';
  return onCurve && mc >= 12_000 && mc < 90_000;
}

function isNewToken(project: CtoProject): boolean {
  if (isMigrated(project) || isAlmostBonded(project)) return false;
  const hours = ageHours(project);
  return (
    project.origin === 'native_launch' ||
    project.sourceVenue === 'Pump.fun' ||
    project.sourceVenue === 'CTOgo' ||
    hours < 36
  );
}

export function filterTrenchesProjects(
  projects: CtoProject[],
  tab: TrenchesTab,
): CtoProject[] {
  const scored = projects.filter((p) => {
    if (tab === 'new') return isNewToken(p) || (!isMigrated(p) && !isAlmostBonded(p));
    if (tab === 'almost') return isAlmostBonded(p);
    return isMigrated(p);
  });
  return [...scored].sort((a, b) => ageHours(a) - ageHours(b));
}

function XLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function MetricPills({ project }: { project: CtoProject }) {
  const a = 4 + salt(project.ticker + 'a', 20);
  const b = salt(project.ticker + 'b', 12);
  const c = salt(project.ticker + 'c', 18);
  const d = 2 + salt(project.ticker + 'd', 9);
  const e = 3 + salt(project.ticker + 'e', 14);
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1">
      <span className="rounded-[4px] bg-emerald-500/20 px-1 py-px text-[9px] font-bold tabular-nums text-emerald-400">
        {a}%
      </span>
      <span className="rounded-[4px] bg-sky-500/25 px-1 py-px text-[9px] font-bold text-sky-300">
        DS
      </span>
      <span className="rounded-[4px] bg-rose-500/20 px-1 py-px text-[9px] font-bold tabular-nums text-rose-400">
        {b}%
      </span>
      <span className="rounded-[4px] bg-white/[0.06] px-1 py-px text-[9px] font-bold tabular-nums text-white/45">
        {c}%
      </span>
      <span className="rounded-[4px] bg-white/[0.06] px-1 py-px text-[9px] font-bold tabular-nums text-white/55">
        <span className="text-emerald-400">{d}%</span>
        <span className="text-white/30">/</span>
        <span className="text-rose-400">{e}%</span>
      </span>
    </div>
  );
}

export function TrenchesFeed({
  projects,
  tab,
  onTabChange,
  onOpenCoin,
  onBuy,
}: TrenchesFeedProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-end justify-between gap-2 border-b border-white/[0.08] px-3">
        <div className="flex min-w-0 flex-1 gap-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onTabChange(t.id)}
                className={`relative shrink-0 pb-2.5 pt-1 text-[14px] transition ${
                  active ? 'font-bold text-white' : 'font-medium text-white/40'
                }`}
              >
                {t.label}
                {active ? (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-white" />
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-1 pb-2">
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-md text-white/45"
            aria-label="Search trenches"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {['P1', '%', 'Filter'].map((label) => (
          <button
            key={label}
            type="button"
            className="inline-flex h-7 shrink-0 items-center rounded-md bg-[#1c1c1e] px-2 text-[11px] font-semibold text-white/55 ring-1 ring-white/10"
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-[10px] font-medium text-white/30">Live</span>
      </div>

      {projects.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-[15px] font-semibold text-white/70">No tokens here yet</p>
          <p className="mt-1 text-[13px] text-white/35">
            Create a new mint to show up in Trenches.
          </p>
        </div>
      ) : (
        <ul className="min-h-0 flex-1">
          {projects.map((project) => {
            const socials = projectSocials(project);
            const age = trenchesAgeLabel(project);
            const trophy = salt(project.ticker + 'cup', 4);
            const bags = `${salt(project.ticker + 'bag', 3)}/${1 + salt(project.ticker + 'bag2', 4)}`;
            return (
              <li key={project.ticker}>
                <div className="flex gap-2.5 border-b border-white/[0.06] px-3 py-2.5 active:bg-white/[0.03]">
                  <button
                    type="button"
                    onClick={() => onOpenCoin(project.ticker)}
                    className="relative shrink-0"
                    aria-label={`Open $${project.ticker}`}
                  >
                    <span className="block h-[52px] w-[52px] overflow-hidden rounded-[12px] bg-[#1c1c1e] ring-1 ring-white/10">
                      <img
                        src={project.logo}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </span>
                    <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-emerald-500 px-1 py-px text-[8px] font-bold leading-none text-black ring-2 ring-black">
                      ●
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onOpenCoin(project.ticker)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-bold leading-none text-white">
                            {project.ticker}{' '}
                            <span className="font-medium text-white/40">{project.name}</span>
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold tabular-nums text-emerald-400">
                              {age}
                            </span>
                            <a
                              href={`https://x.com/search?q=${encodeURIComponent(project.ticker)}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-sky-400/80"
                              aria-label="Search"
                            >
                              <Search className="h-3 w-3" />
                            </a>
                            <a
                              href={socials.x}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-sky-400/80"
                              aria-label="X"
                            >
                              <XLogo className="h-3 w-3" />
                            </a>
                            <a
                              href={socials.website}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-sky-400/80"
                              aria-label="Website"
                            >
                              <Globe className="h-3 w-3" />
                            </a>
                            <a
                              href={socials.telegram}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="opacity-80"
                              aria-label="Telegram"
                            >
                              <img
                                src="/images/partners/telegram.svg"
                                alt=""
                                className="h-3 w-3"
                              />
                            </a>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-[11px] font-medium tabular-nums text-white/45">
                            <span className="inline-flex items-center gap-0.5">
                              <Users className="h-3 w-3" strokeWidth={2} />
                              {holdersNum(project)}
                            </span>
                            <span className="inline-flex items-center gap-0.5">
                              <Trophy className="h-3 w-3" strokeWidth={2} />
                              {trophy}
                            </span>
                            <span className="inline-flex items-center gap-0.5">
                              <span className="text-[10px] text-white/30">▣</span>
                              {bags}
                            </span>
                            <span className="inline-flex items-center gap-0.5">
                              <Eye className="h-3 w-3" strokeWidth={2} />
                              {viewingCount(project)}
                            </span>
                          </div>
                          <MetricPills project={project} />
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-[13px] font-semibold tabular-nums leading-none text-white">
                            <span className="text-[10px] font-medium text-white/35">MC </span>
                            {project.marketCap}
                          </p>
                          <p className="mt-1 text-[13px] font-semibold tabular-nums leading-none text-white">
                            <span className="text-[10px] font-medium text-white/35">V </span>
                            {project.volume24h}
                          </p>
                          <p className="mt-1.5 text-[10px] font-medium tabular-nums text-white/35">
                            F ·{' '}
                            <span className="border-b border-emerald-400/80 text-white/70">
                              TX {txsNum(project)}
                            </span>
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onBuy(project.ticker);
                            }}
                            className="mt-2 inline-flex h-8 items-center gap-1 rounded-full bg-white px-3 text-[12px] font-bold text-black active:brightness-95"
                          >
                            <Zap className="h-3.5 w-3.5" fill="currentColor" />
                            Buy
                          </button>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Combat helmet — GMGN-style Trenches glyph */
export function TrenchesHelmetIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4.5 14.5c0-4.8 3.2-8.5 7.5-8.5s7.5 3.7 7.5 8.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M3.5 15.2h17c.4 0 .7.4.6.8l-.5 2.2c-.1.5-.6.8-1.1.8H5.5c-.5 0-1-.3-1.1-.8l-.5-2.2c-.1-.4.2-.8.6-.8Z"
        fill="currentColor"
      />
      <path
        d="M9 11.2h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
