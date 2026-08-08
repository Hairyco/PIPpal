import { useEffect, useId, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import type { CtoProject } from '../data/ctoProjects';

export type GrowthRoadmapFamily =
  | 'telegram'
  | 'x'
  | 'dexscreener'
  | 'dextools'
  | 'coinzilla'
  | 'coingecko'
  | 'cmc'
  | 'ads';

export type GrowthRoadmapEvent = {
  id: string;
  label: string;
  ago: string;
  priceUsd: number;
};

export type GrowthRoadmapNode = {
  family: GrowthRoadmapFamily;
  label: string;
  logo: string;
  status: 'done' | 'current' | 'upcoming';
  history: GrowthRoadmapEvent[];
};

const FAMILY_META: Record<
  GrowthRoadmapFamily,
  { label: string; logo: string; actions: { label: string; priceUsd: number }[] }
> = {
  telegram: {
    label: 'Telegram',
    logo: '/images/partners/telegram.svg',
    actions: [
      { label: 'Pinned message', priceUsd: 150 },
      { label: 'Raid call-out', priceUsd: 200 },
    ],
  },
  x: {
    label: 'X',
    logo: '/images/partners/x.svg',
    actions: [
      { label: 'X promo post', priceUsd: 180 },
      { label: 'X space boost', priceUsd: 250 },
    ],
  },
  dexscreener: {
    label: 'DexScreener',
    logo: '/images/partners/dexscreener.ico',
    actions: [
      { label: 'Update socials', priceUsd: 99 },
      { label: 'Boosts ×10', priceUsd: 99 },
      { label: 'Token Ad 20k', priceUsd: 299 },
      { label: 'Trending bar 24h', priceUsd: 2000 },
    ],
  },
  dextools: {
    label: 'DexTools',
    logo: '/images/partners/dextools.svg',
    actions: [
      { label: 'Hot pairs', priceUsd: 350 },
      { label: 'Trend boost', priceUsd: 500 },
    ],
  },
  coinzilla: {
    label: 'Coinzilla',
    logo: '/images/partners/coinzilla.png',
    actions: [{ label: 'Display ads', priceUsd: 400 }],
  },
  coingecko: {
    label: 'CoinGecko',
    logo: '/images/partners/coingecko.png',
    actions: [{ label: 'CTO listing', priceUsd: 250 }],
  },
  cmc: {
    label: 'CoinMarketCap',
    logo: '/images/partners/coinmarketcap.png',
    actions: [{ label: 'Trending submit', priceUsd: 300 }],
  },
  ads: {
    label: 'Ad networks',
    logo: '/images/partners/cointraffic.svg',
    actions: [{ label: 'Network pack', priceUsd: 450 }],
  },
};

const FAMILY_ORDER: GrowthRoadmapFamily[] = [
  'telegram',
  'x',
  'dexscreener',
  'dextools',
  'coinzilla',
  'coingecko',
  'cmc',
  'ads',
];

function hashSeed(str: string, mod = 1000): number {
  let s = 0;
  for (let i = 0; i < str.length; i += 1) s = (s * 31 + str.charCodeAt(i)) % mod;
  return s;
}

function agoLabel(daysAgo: number): string {
  if (daysAgo < 1) return `${Math.max(1, Math.round(daysAgo * 24))}h ago`;
  if (daysAgo < 2) return '1d ago';
  return `${Math.round(daysAgo)}d ago`;
}

/** Demo timeline until live Polessia spend history is wired. */
export function growthRoadmapTimeline(project: CtoProject): GrowthRoadmapNode[] {
  const seed = hashSeed(project.ticker);
  const doneCount = Math.max(0, Math.min(project.roadmapDone, FAMILY_ORDER.length));
  const currentIdx = Math.min(doneCount, FAMILY_ORDER.length - 1);

  // Build actioned events in time order (older → newer)
  const events: { family: GrowthRoadmapFamily; event: GrowthRoadmapEvent }[] = [];
  let dayCursor = 8 + (seed % 6);

  for (let i = 0; i < doneCount; i += 1) {
    const family = FAMILY_ORDER[i];
    const meta = FAMILY_META[family];
    const action = meta.actions[0];
    events.push({
      family,
      event: {
        id: `${project.ticker}-${family}-0`,
        label: action.label,
        ago: agoLabel(dayCursor),
        priceUsd: action.priceUsd,
      },
    });
    dayCursor = Math.max(0.3, dayCursor - (1.2 + (seed % 5) / 10));

    // Revisit DexScreener (and occasionally Telegram) when the coin is further along
    if (family === 'dexscreener' && project.roadmapDone >= 3) {
      const extra = 1 + (seed % Math.min(3, meta.actions.length - 1));
      for (let e = 1; e <= extra; e += 1) {
        const act = meta.actions[e] ?? meta.actions[meta.actions.length - 1];
        events.push({
          family,
          event: {
            id: `${project.ticker}-${family}-${e}`,
            label: act.label,
            ago: agoLabel(dayCursor),
            priceUsd: act.priceUsd,
          },
        });
        dayCursor = Math.max(0.2, dayCursor - (0.8 + ((seed + e) % 4) / 10));
      }
    }
  }

  return FAMILY_ORDER.map((family, index) => {
    const meta = FAMILY_META[family];
    const history = events.filter((e) => e.family === family).map((e) => e.event);
    let status: GrowthRoadmapNode['status'] = 'upcoming';
    if (index < doneCount) status = 'done';
    else if (index === currentIdx && doneCount < FAMILY_ORDER.length) status = 'current';
    // If all done, last is done not current
    if (doneCount >= FAMILY_ORDER.length) {
      status = 'done';
    } else if (index === doneCount) {
      status = 'current';
    } else if (index < doneCount) {
      status = 'done';
    } else {
      status = 'upcoming';
    }

    return {
      family,
      label: meta.label,
      logo: meta.logo,
      status,
      history,
    };
  });
}

const TIP_MAX = 260;
const TIP_MARGIN = 12;

function HistoryTip({
  open,
  anchorRef,
  node,
  onClose,
}: {
  open: boolean;
  anchorRef: RefObject<HTMLButtonElement | null>;
  node: GrowthRoadmapNode | null;
  onClose: () => void;
}) {
  const tipId = useId();
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
    if (!open || !node) return;
    const update = () => {
      const button = anchorRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const width = Math.min(TIP_MAX, window.innerWidth - TIP_MARGIN * 2);
      const half = width / 2;
      let left = rect.left + rect.width / 2;
      left = Math.max(TIP_MARGIN + half, Math.min(left, window.innerWidth - TIP_MARGIN - half));
      let top = rect.bottom + 8;
      if (top + 140 > window.innerHeight - TIP_MARGIN) {
        top = Math.max(TIP_MARGIN, rect.top - 8 - 140);
      }
      setStyle({
        position: 'fixed',
        top,
        left,
        width,
        transform: 'translateX(-50%)',
        zIndex: 90,
      });
    };
    update();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, node, anchorRef, onClose]);

  if (!open || !node || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[85] cursor-default bg-transparent"
        aria-label="Close history"
        onClick={onClose}
      />
      <div
        id={tipId}
        role="tooltip"
        style={style}
        className="rounded-lg border border-white/12 bg-[#0c1018] px-3 py-2.5 text-left shadow-xl shadow-black/50"
      >
        <p className="text-[11px] font-semibold text-white">{node.label} history</p>
        <ul className="mt-2 space-y-2">
          {[...node.history].reverse().map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-white/80">{item.label}</p>
                <p className="mt-0.5 text-[10px] text-white/40">{item.ago}</p>
              </div>
              <span className="shrink-0 text-[11px] font-semibold tabular-nums text-[#d5ff69]">
                ${item.priceUsd}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>,
    document.body,
  );
}

function TimelineNode({
  node,
  historyOpen,
  onToggleHistory,
}: {
  node: GrowthRoadmapNode;
  historyOpen: boolean;
  onToggleHistory: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const count = node.history.length;
  const isReuse = count > 1;
  const isDone = node.status === 'done';
  const isCurrent = node.status === 'current';

  return (
    <div className="relative z-[1] flex w-14 shrink-0 flex-col items-center gap-1.5">
      <button
        ref={btnRef}
        type="button"
        disabled={!isDone || count === 0}
        onClick={(e) => {
          e.stopPropagation();
          if (isDone && count > 0) onToggleHistory();
        }}
        className={`relative grid h-10 w-10 place-items-center rounded-full transition ${
          isDone
            ? 'bg-[#1c1c1e] ring-2 ring-[#c8ff3d]/55'
            : isCurrent
              ? 'bg-[#12141a] ring-2 ring-[#c8ff3d]/35 ring-dashed'
              : 'bg-[#12141a] ring-1 ring-white/15'
        } ${isDone && count > 0 ? 'cursor-pointer hover:ring-[#c8ff3d]/85' : 'cursor-default'}`}
        aria-label={
          isReuse
            ? `${node.label}: ${count} spends — view history`
            : isDone
              ? `${node.label}: ${node.history[0]?.label ?? 'done'}`
              : isCurrent
                ? `${node.label}: next up`
                : `${node.label}: upcoming`
        }
        aria-expanded={historyOpen}
      >
        {isDone ? (
          <>
            <img src={node.logo} alt="" className="h-5 w-5 object-contain" draggable={false} />
            {isReuse ? (
              <span className="absolute -bottom-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#c8ff3d] px-0.5 text-[9px] font-bold tabular-nums text-[#090b14] ring-1 ring-black">
                {count}
              </span>
            ) : null}
          </>
        ) : (
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isCurrent ? 'bg-[#c8ff3d]' : 'bg-white/20'
            }`}
          />
        )}
      </button>
      <p
        className={`max-w-[3.5rem] truncate text-center text-[9px] font-medium leading-tight ${
          isDone || isCurrent ? 'text-white/70' : 'text-white/30'
        }`}
      >
        {node.label}
      </p>
      <HistoryTip
        open={historyOpen}
        anchorRef={btnRef}
        node={historyOpen ? node : null}
        onClose={onToggleHistory}
      />
    </div>
  );
}

export function GrowthRoadmapSheet({
  project,
  onClose,
}: {
  project: CtoProject;
  onClose: () => void;
}) {
  const titleId = useId();
  const nodes = growthRoadmapTimeline(project);
  const [historyFamily, setHistoryFamily] = useState<GrowthRoadmapFamily | null>(null);

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        aria-label="Close roadmap"
        onClick={onClose}
      />
      <div className="relative z-[1] w-full max-w-lg animate-[slideUpSheet_0.32s_ease-out] rounded-t-2xl border border-white/[0.1] border-b-0 bg-[#12141a] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-16px_48px_rgba(0,0,0,0.55)] sm:rounded-2xl sm:border-b sm:pb-4">
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-white/20 sm:hidden" aria-hidden />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p id={titleId} className="text-[17px] font-semibold tracking-tight text-white">
              ${project.ticker} roadmap
            </p>
            <p className="mt-0.5 text-[12px] text-white/45">
              {project.roadmapDone}/{project.roadmapTotal} · {project.roadmapMilestone}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg px-2 py-1 text-[12px] font-medium text-white/45 hover:bg-white/[0.05] hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mt-5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="relative flex min-w-max items-start gap-0 px-1 pt-1">
            <div
              className="pointer-events-none absolute left-6 right-6 top-[1.3rem] h-px bg-white/15"
              aria-hidden
            />
            {nodes.map((node) => (
              <TimelineNode
                key={node.family}
                node={node}
                historyOpen={historyFamily === node.family}
                onToggleHistory={() =>
                  setHistoryFamily((prev) => (prev === node.family ? null : node.family))
                }
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-white text-[15px] font-semibold text-[#090b14] transition hover:bg-white/90"
        >
          Got it
        </button>
        <style>{`
          @keyframes slideUpSheet {
            from { transform: translateY(110%); opacity: 0.6; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>,
    document.body,
  );
}
