import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'ctogo-watchlist';
const EVENT = 'ctogo-watchlist-change';

function readTickers(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string' && item.length > 0);
  } catch {
    return [];
  }
}

function writeTickers(tickers: string[]) {
  const unique = [...new Set(tickers)];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  } catch {
    // ignore quota / private mode
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useWatchlist() {
  const [tickers, setTickers] = useState<string[]>(() =>
    typeof window === 'undefined' ? [] : readTickers(),
  );

  useEffect(() => {
    const sync = () => setTickers(readTickers());
    window.addEventListener('storage', sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  const starred = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const ticker of tickers) map[ticker] = true;
    return map;
  }, [tickers]);

  const toggle = (ticker: string) => {
    const next = tickers.includes(ticker)
      ? tickers.filter((item) => item !== ticker)
      : [...tickers, ticker];
    writeTickers(next);
    setTickers(next);
  };

  const remove = (ticker: string) => {
    if (!tickers.includes(ticker)) return;
    const next = tickers.filter((item) => item !== ticker);
    writeTickers(next);
    setTickers(next);
  };

  return {
    tickers,
    starred,
    count: tickers.length,
    isStarred: (ticker: string) => Boolean(starred[ticker]),
    toggle,
    remove,
  };
}
