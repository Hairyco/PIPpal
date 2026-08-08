import { Check, Copy, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ORIGIN_META, type ProjectOrigin } from '../data/ctoProjects';
import { bumpScoutClickDemo, buildScoutLink } from '../utils/scoutReferral';
import { useConnectedWallet } from './ConnectWalletButton';

const HIDE_RAID_EARN_KEY = 'ctogo-hide-raid-earn';

function readHiddenRaidEarnTickers(): Record<string, true> {
  try {
    const raw = localStorage.getItem(HIDE_RAID_EARN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as Record<string, true>;
  } catch {
    return {};
  }
}

export function isRaidEarnHidden(ticker: string): boolean {
  const key = ticker.trim().toUpperCase();
  if (!key) return false;
  const hidden = readHiddenRaidEarnTickers();
  // Only per-ticker hide — never treat a blank/global key as hidden for all pages
  return Object.prototype.hasOwnProperty.call(hidden, key) && hidden[key] === true;
}

export function hideRaidEarnForTicker(ticker: string) {
  const key = ticker.trim().toUpperCase();
  if (!key) return;
  try {
    const next = { ...readHiddenRaidEarnTickers(), [key]: true as const };
    // Drop accidental empty keys from older builds
    delete (next as Record<string, true | undefined>)[''];
    localStorage.setItem(HIDE_RAID_EARN_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function clearRaidEarnHiddenForTicker(ticker: string) {
  const key = ticker.trim().toUpperCase();
  if (!key) return;
  try {
    const next = { ...readHiddenRaidEarnTickers() };
    delete next[key];
    delete (next as Record<string, true | undefined>)[''];
    localStorage.setItem(HIDE_RAID_EARN_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function OriginBadge({
  origin,
  compact = false,
}: {
  origin: ProjectOrigin;
  compact?: boolean;
}) {
  const meta = ORIGIN_META[origin];
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${meta.badgeClass}`}
      title={meta.description}
    >
      <span aria-hidden>{meta.emoji}</span>
      {compact ? meta.short : meta.label}
    </span>
  );
}

/** Raid earn CTA — formerly “Launch {ticker} CTO”. */
export function MigrateToV2Banner({
  ticker,
  placement = 'top',
  dismissed,
  onDismissedChange,
}: {
  ticker: string;
  sourceVenue?: string;
  devDumpedPct?: number;
  href?: string;
  /** `top` = primary (hideable). `footer` = only when top was hidden. */
  placement?: 'top' | 'footer';
  /** Controlled dismiss state from parent (keeps top + footer in sync). */
  dismissed?: boolean;
  onDismissedChange?: (hidden: boolean) => void;
}) {
  const { address, connected, connect, busy } = useConnectedWallet();
  const [copied, setCopied] = useState(false);
  const [localHidden, setLocalHidden] = useState(() => isRaidEarnHidden(ticker));
  const hidden = dismissed ?? localHidden;

  useEffect(() => {
    const next = isRaidEarnHidden(ticker);
    setLocalHidden(next);
    setCopied(false);
    if (dismissed === undefined) onDismissedChange?.(next);
  }, [ticker]); // eslint-disable-line react-hooks/exhaustive-deps -- sync on ticker only

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ctogo.vercel.app';
  const scoutLink = address ? buildScoutLink(origin, ticker, address) : null;

  const copyLink = async () => {
    if (!scoutLink || !address) return;
    try {
      await navigator.clipboard.writeText(scoutLink);
      bumpScoutClickDemo(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const hide = () => {
    hideRaidEarnForTicker(ticker);
    setLocalHidden(true);
    onDismissedChange?.(true);
  };

  const restoreToTop = () => {
    clearRaidEarnHiddenForTicker(ticker);
    setLocalHidden(false);
    onDismissedChange?.(false);
  };

  if (placement === 'top' && hidden) return null;
  if (placement === 'footer' && !hidden) return null;

  const compact = placement === 'footer';

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0c12] ${
        compact ? 'border-dashed' : ''
      }`}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-[#c8ff3d]"
        aria-hidden
      />
      {!compact ? (
        <div
          className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#c8ff3d]/[0.07] blur-2xl"
          aria-hidden
        />
      ) : null}

      <div
        className={`relative flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 ${
          compact ? 'py-3' : 'py-3.5'
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c8ff3d]/80">
                Growth
              </p>
              <p
                className={`mt-0.5 font-semibold tracking-tight text-white ${
                  compact ? 'text-[14px]' : 'text-[15px]'
                }`}
              >
                Get paid instantly
              </p>
            </div>
            {placement === 'top' ? (
              <button
                type="button"
                onClick={hide}
                className="inline-flex h-7 shrink-0 items-center justify-center rounded-md px-2 text-[11px] font-medium text-white/35 transition hover:bg-white/[0.05] hover:text-white/70 sm:hidden"
                aria-label={`Hide raid earn for $${ticker}`}
              >
                Hide
              </button>
            ) : null}
          </div>
          <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-white/45">
            Earn{' '}
            <span className="font-semibold tabular-nums text-white/75">0.4–0.5% SOL</span> on trades
            from your link. This share opens <span className="text-white/70">${ticker}</span> first.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {!connected || !scoutLink ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void connect()}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[#c8ff3d] px-3.5 text-[12px] font-bold text-[#090b14] transition hover:bg-[#d5ff69] disabled:opacity-60 sm:flex-none"
            >
              <Wallet className="h-3.5 w-3.5" />
              {busy ? 'Connecting…' : 'Connect wallet'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void copyLink()}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#c8ff3d] px-3.5 text-[12px] font-bold text-[#090b14] transition hover:bg-[#d5ff69] sm:flex-none"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : `Copy $${ticker} link`}
            </button>
          )}
          {placement === 'top' ? (
            <button
              type="button"
              onClick={hide}
              className="hidden h-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] px-2.5 text-[11px] font-medium text-white/40 transition hover:border-white/15 hover:text-white/70 sm:inline-flex"
              aria-label={`Hide raid earn for $${ticker}`}
            >
              Hide
            </button>
          ) : (
            <button
              type="button"
              onClick={restoreToTop}
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] px-2.5 text-[11px] font-medium text-white/45 transition hover:border-white/15 hover:text-white/70"
            >
              Pin to top
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Native V2 coin that still has a linked previous mint. */
export function UpgradedOnCtogoBanner({
  ticker,
}: {
  ticker: string;
  onViewV1?: () => void;
}) {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <div className="rounded-xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 via-transparent to-transparent px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300/90">
            Upgraded on CTOgo
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/55">
            You&apos;re on the CTOgo mint for ${ticker}. Trade stays here — switch V1 / V2 on the
            chart to view the previous mint.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setHidden(true)}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.1] px-2.5 text-[11px] font-semibold text-white/45 hover:border-white/20 hover:text-white"
          aria-label="Hide upgrade notice"
        >
          Hide
        </button>
      </div>
    </div>
  );
}
