import { useCallback, useEffect, useState } from 'react';

/** Free public Solana RPC — rate-limited; fine for UI balance reads. */
const DEFAULT_RPC =
  (typeof import.meta !== 'undefined' &&
    (import.meta as { env?: { VITE_SOLANA_RPC?: string } }).env?.VITE_SOLANA_RPC) ||
  'https://api.mainnet-beta.solana.com';

const LAMPORTS_PER_SOL = 1_000_000_000;

export type SolBalanceState = {
  sol: number | null;
  lamports: number | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export async function fetchSolBalanceLamports(
  address: string,
  rpcUrl = DEFAULT_RPC,
): Promise<number> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getBalance',
      params: [address],
    }),
  });
  if (!res.ok) throw new Error(`RPC ${res.status}`);
  const json = (await res.json()) as {
    result?: { value?: number };
    error?: { message?: string };
  };
  if (json.error?.message) throw new Error(json.error.message);
  const value = json.result?.value;
  if (typeof value !== 'number') throw new Error('No balance');
  return value;
}

export function formatSolAmount(sol: number, digits = 4): string {
  if (!Number.isFinite(sol)) return '—';
  if (sol === 0) return '0';
  if (sol < 0.0001) return sol.toExponential(2);
  return sol.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

export function useSolBalance(address: string | null | undefined): SolBalanceState {
  const [lamports, setLamports] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!address) {
      setLamports(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const value = await fetchSolBalanceLamports(address);
        if (!cancelled) {
          setLamports(value);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setLamports(null);
          setError(e instanceof Error ? e.message : 'Balance unavailable');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, tick]);

  return {
    sol: lamports == null ? null : lamports / LAMPORTS_PER_SOL,
    lamports,
    loading,
    error,
    refresh,
  };
}
