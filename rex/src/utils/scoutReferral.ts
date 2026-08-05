import { SCOUT_FEE_ENGINE } from '../data/chainConfig';

const STORAGE_KEY = 'ctogo-scout-ref';

export type ScoutRefRecord = {
  ref: string;
  expiresAt: number;
  capturedAt: number;
};

/** Solana base58 pubkey length band (strict full decode not required for UI attribution). */
const WALLET_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isValidScoutWallet(value: string): boolean {
  const v = value.trim();
  return WALLET_RE.test(v);
}

export function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function coinPath(ticker: string): string {
  const t = normalizeTicker(ticker) || 'TICKER';
  return `/coin/${encodeURIComponent(t)}`;
}

export function buildScoutLink(origin: string, ticker: string, wallet: string): string {
  const base = origin.replace(/\/$/, '');
  const ref = wallet.trim();
  return `${base}${coinPath(ticker)}?ref=${encodeURIComponent(ref)}`;
}

export function getActiveScoutRef(now = Date.now()): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ScoutRefRecord;
    if (!parsed?.ref || !parsed.expiresAt) return null;
    if (parsed.expiresAt <= now) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (!isValidScoutWallet(parsed.ref)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.ref;
  } catch {
    return null;
  }
}

export function clearExpiredScoutRef(now = Date.now()): void {
  getActiveScoutRef(now);
}

/** Last-click overwrite with 24h TTL. */
export function setScoutRef(wallet: string, now = Date.now()): ScoutRefRecord | null {
  const ref = wallet.trim();
  if (!isValidScoutWallet(ref)) return null;
  const record: ScoutRefRecord = {
    ref,
    capturedAt: now,
    expiresAt: now + SCOUT_FEE_ENGINE.attributionHours * 60 * 60 * 1000,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* ignore quota */
  }
  return record;
}

export function captureScoutRefFromSearch(
  search: string | URLSearchParams,
  now = Date.now(),
): string | null {
  const params =
    typeof search === 'string' ? new URLSearchParams(search.startsWith('?') ? search : `?${search}`) : search;
  const ref = params.get('ref')?.trim() ?? '';
  if (!ref) {
    clearExpiredScoutRef(now);
    return getActiveScoutRef(now);
  }
  const saved = setScoutRef(ref, now);
  return saved?.ref ?? getActiveScoutRef(now);
}

/** Demo earnings keyed by raid wallet — local until indexer exists. */
const EARNINGS_KEY = 'ctogo-scout-earnings';

export type ScoutEarningsDemo = {
  earnedSol: number;
  volumeUsd: number;
  clicks: number;
};

export type RaidEarningsPeriod = '24h' | '7d' | '30d' | 'all';

export const RAID_EARNINGS_PERIODS: { id: RaidEarningsPeriod; label: string }[] = [
  { id: '24h', label: '24h' },
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
  { id: 'all', label: 'All' },
];

/** Universal raid link — ref sticks for 24h last-click across CTOgo. */
export function buildRaidLink(origin: string, wallet: string): string {
  const base = origin.replace(/\/$/, '');
  return `${base}/?ref=${encodeURIComponent(wallet.trim())}`;
}

export function readScoutEarningsDemo(wallet: string): ScoutEarningsDemo {
  try {
    const raw = localStorage.getItem(EARNINGS_KEY);
    if (!raw) return { earnedSol: 0, volumeUsd: 0, clicks: 0 };
    const all = JSON.parse(raw) as Record<string, ScoutEarningsDemo>;
    return all[wallet] ?? { earnedSol: 0, volumeUsd: 0, clicks: 0 };
  } catch {
    return { earnedSol: 0, volumeUsd: 0, clicks: 0 };
  }
}

/** Period slice of raid earnings — proportional demo until on-chain indexer exists. */
export function raidEarningsForPeriod(
  wallet: string,
  period: RaidEarningsPeriod,
): ScoutEarningsDemo {
  const all = readScoutEarningsDemo(wallet);
  const factor: Record<RaidEarningsPeriod, number> = {
    '24h': 0.12,
    '7d': 0.38,
    '30d': 0.75,
    all: 1,
  };
  const f = factor[period];
  return {
    earnedSol: Math.round(all.earnedSol * f * 1000) / 1000,
    volumeUsd: Math.round(all.volumeUsd * f),
    clicks: Math.round(all.clicks * f),
  };
}

export function bumpScoutClickDemo(wallet: string): void {
  if (!isValidScoutWallet(wallet)) return;
  try {
    const raw = localStorage.getItem(EARNINGS_KEY);
    const all = (raw ? JSON.parse(raw) : {}) as Record<string, ScoutEarningsDemo>;
    const prev = all[wallet] ?? { earnedSol: 0, volumeUsd: 0, clicks: 0 };
    all[wallet] = { ...prev, clicks: prev.clicks + 1 };
    localStorage.setItem(EARNINGS_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export const RAID_EARNING_EVENT = 'ctogo-raid-earning';

export type RaidEarningDetail = {
  wallet: string;
  amountSol: number;
  totalEarnedSol: number;
  volumeUsd: number;
  ticker?: string;
  at: number;
};

/** Credit raid fee SOL to a wallet and broadcast so UI can bell / notify / badge. */
export function creditScoutEarningsDemo(
  wallet: string,
  amountSol: number,
  opts?: { volumeUsd?: number; ticker?: string },
): RaidEarningDetail | null {
  const ref = wallet.trim();
  // Accept full pubkeys or short local demo wallets from ConnectWalletButton.
  if ((!isValidScoutWallet(ref) && ref.length < 10) || !(amountSol > 0)) return null;
  try {
    const raw = localStorage.getItem(EARNINGS_KEY);
    const all = (raw ? JSON.parse(raw) : {}) as Record<string, ScoutEarningsDemo>;
    const prev = all[ref] ?? { earnedSol: 0, volumeUsd: 0, clicks: 0 };
    const next: ScoutEarningsDemo = {
      earnedSol: Math.round((prev.earnedSol + amountSol) * 1e6) / 1e6,
      volumeUsd: Math.round(prev.volumeUsd + (opts?.volumeUsd ?? amountSol * 200 * 100)),
      clicks: prev.clicks,
    };
    all[ref] = next;
    localStorage.setItem(EARNINGS_KEY, JSON.stringify(all));
    const detail: RaidEarningDetail = {
      wallet: ref,
      amountSol,
      totalEarnedSol: next.earnedSol,
      volumeUsd: next.volumeUsd,
      ticker: opts?.ticker,
      at: Date.now(),
    };
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(RAID_EARNING_EVENT, { detail }));
    }
    return detail;
  } catch {
    return null;
  }
}
