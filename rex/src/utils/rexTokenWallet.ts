import { REX_TOKEN_SYMBOL } from '../data/rexToken';

const BALANCE_KEY = 'rex-token-balance';

export function getRexTokenBalance(): number {
  try {
    const raw = localStorage.getItem(BALANCE_KEY);
    if (!raw) return 0;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

export function setRexTokenBalance(amount: number): void {
  try {
    localStorage.setItem(BALANCE_KEY, String(Math.max(0, Math.floor(amount))));
  } catch {
    // ignore
  }
}

export function addRexTokens(amount: number): number {
  const next = getRexTokenBalance() + Math.floor(amount);
  setRexTokenBalance(next);
  return next;
}

export function spendRexTokens(amount: number): { ok: true; balance: number } | { ok: false; balance: number } {
  const current = getRexTokenBalance();
  if (current < amount) {
    return { ok: false, balance: current };
  }
  const next = current - amount;
  setRexTokenBalance(next);
  return { ok: true, balance: next };
}

export function hasEnoughRex(amount: number): boolean {
  return getRexTokenBalance() >= amount;
}

export function rexBalanceLabel(): string {
  return `${getRexTokenBalance().toLocaleString()} ${REX_TOKEN_SYMBOL}`;
}
