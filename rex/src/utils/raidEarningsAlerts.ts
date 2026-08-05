import type { RaidEarningDetail } from './scoutReferral';

const NOTICES_KEY = 'ctogo-raid-payout-notices';
const SEEN_KEY = 'ctogo-raid-earnings-seen';
export const RAID_ALERTS_CHANGED = 'ctogo-raid-alerts-changed';

export type RaidPayoutNotice = {
  id: string;
  wallet: string;
  amountSol: number;
  totalEarnedSol: number;
  ticker?: string;
  at: number;
  read: boolean;
};

function emitChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(RAID_ALERTS_CHANGED));
}

function readNotices(): RaidPayoutNotice[] {
  try {
    const raw = localStorage.getItem(NOTICES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RaidPayoutNotice[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeNotices(list: RaidPayoutNotice[]) {
  try {
    localStorage.setItem(NOTICES_KEY, JSON.stringify(list.slice(0, 40)));
  } catch {
    /* ignore */
  }
}

function readSeenMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeSeenMap(map: Record<string, number>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function listRaidPayoutNotices(wallet?: string | null): RaidPayoutNotice[] {
  const all = readNotices();
  if (!wallet) return all;
  return all.filter((n) => n.wallet === wallet);
}

export function unreadRaidPayoutCount(wallet?: string | null): number {
  return listRaidPayoutNotices(wallet).filter((n) => !n.read).length;
}

/** Lime dot on wallet — true when total earned exceeds last amount the user opened/viewed. */
export function hasRaidEarningsBadge(wallet: string, currentEarnedSol: number): boolean {
  if (!wallet || currentEarnedSol <= 0) return false;
  const seen = readSeenMap()[wallet] ?? 0;
  return currentEarnedSol > seen + 1e-9;
}

export function markRaidEarningsSeen(wallet: string, currentEarnedSol: number): void {
  if (!wallet) return;
  const map = readSeenMap();
  map[wallet] = currentEarnedSol;
  writeSeenMap(map);
  emitChange();
}

export function pushRaidPayoutNotice(detail: RaidEarningDetail): RaidPayoutNotice {
  const notice: RaidPayoutNotice = {
    id: `raid-${detail.wallet.slice(0, 8)}-${detail.at}`,
    wallet: detail.wallet,
    amountSol: detail.amountSol,
    totalEarnedSol: detail.totalEarnedSol,
    ticker: detail.ticker,
    at: detail.at,
    read: false,
  };
  const next = [notice, ...readNotices().filter((n) => n.id !== notice.id)];
  writeNotices(next);
  emitChange();
  return notice;
}

export function markRaidNoticeRead(id: string): void {
  const next = readNotices().map((n) => (n.id === id ? { ...n, read: true } : n));
  writeNotices(next);
  emitChange();
}

export function formatRaidNoticeTime(at: number): string {
  const mins = Math.max(0, Math.round((Date.now() - at) / 60_000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
