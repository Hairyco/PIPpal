/** Persisted CTOgo launch/list for the signed-in creator dashboard. */

export type UserCtoLaunch = {
  name: string;
  ticker: string;
  contract: string;
  mode: 'launch' | 'add';
  logoUrl?: string | null;
  marketingAttached?: boolean;
  websiteUrl?: string;
  twitter?: string;
  telegramInvite?: string | null;
  savedAt: string;
};

const STORAGE_KEY = 'ctogo-user-cto-launch';

export function saveUserCtoLaunch(launch: UserCtoLaunch): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(launch));
  } catch {
    // ignore quota
  }
}

export function loadUserCtoLaunch(): UserCtoLaunch | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserCtoLaunch>;
    if (!parsed.ticker?.trim() || !parsed.name?.trim()) return null;
    return {
      name: parsed.name.trim(),
      ticker: parsed.ticker.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''),
      contract: parsed.contract?.trim() ?? '',
      mode: parsed.mode === 'add' ? 'add' : 'launch',
      logoUrl: parsed.logoUrl ?? null,
      marketingAttached: Boolean(parsed.marketingAttached),
      websiteUrl: parsed.websiteUrl ?? '',
      twitter: parsed.twitter ?? '',
      telegramInvite: parsed.telegramInvite ?? null,
      savedAt: parsed.savedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function clearUserCtoLaunch(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hasUserCtoLaunch(): boolean {
  return loadUserCtoLaunch() !== null;
}
