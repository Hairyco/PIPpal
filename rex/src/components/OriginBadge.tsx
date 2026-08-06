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

function isRaidEarnHidden(ticker: string): boolean {
  const key = ticker.trim().toUpperCase();
  if (!key) return false;
  const hidden = readHiddenRaidEarnTickers();
  // Only per-ticker hide — never treat a blank/global key as hidden for all pages
  return Object.prototype.hasOwnProperty.call(hidden, key) && hidden[key] === true;
}

function hideRaidEarnForTicker(ticker: string) {
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
}: {
  ticker: string;
  sourceVenue?: string;
  devDumpedPct?: number;
  href?: string;
}) {
  const { address, connected, connect, busy } = useConnectedWallet();
  const [copied, setCopied] = useState(false);
  const [hidden, setHidden] = useState(() => isRaidEarnHidden(ticker));

  useEffect(() => {
    setHidden(isRaidEarnHidden(ticker));
    setCopied(false);
  }, [ticker]);

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
    setHidden(true);
  };

  if (hidden) return null;

  return (
    <div className="rounded-xl border border-[#c8ff3d]/25 bg-gradient-to-br from-[#c8ff3d]/10 via-transparent to-transparent px-4 py-3.5">
      <div className="flex items-center gap-2">
        <span className="text-lg leading-none" aria-hidden>
          ⚡
        </span>
        <p className="min-w-0 flex-1 text-sm font-bold uppercase tracking-wide text-white">
          <span className="text-[#c8ff3d]">Growth:</span> Get paid instantly
        </p>
        <button
          type="button"
          onClick={hide}
          className="inline-flex h-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.1] px-2.5 text-[11px] font-semibold text-white/45 hover:border-white/20 hover:text-white"
          aria-label={`Hide raid earn for $${ticker}`}
        >
          Hide
        </button>
      </div>
      <p className="mt-1.5 pl-7 text-[12px] leading-relaxed text-white/60">
        Earn 0.4–0.5% SOL on every trade from anyone using your link.
      </p>

      {!connected || !scoutLink ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void connect()}
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#c8ff3d] px-4 text-xs font-bold text-[#090b14] hover:bg-[#d5ff69] disabled:opacity-60 sm:w-auto"
        >
          <Wallet className="h-3.5 w-3.5" />
          {busy ? 'Connecting…' : 'Connect wallet to create your link'}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void copyLink()}
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-[#c8ff3d] px-4 text-xs font-bold text-[#090b14] hover:bg-[#d5ff69] sm:w-auto"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied — ready to share' : 'Copy my share link'}
        </button>
      )}
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
