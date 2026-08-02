import { SolanaLogo } from './SolanaLogo';
import { useConnectedWallet } from './ConnectWalletButton';
import { formatSolAmount, useSolBalance } from '../hooks/useSolBalance';
import { readScoutEarningsDemo } from '../utils/scoutReferral';
import { SCOUT_FEE_ENGINE, formatBpsPercent } from '../data/chainConfig';
import { Wallet } from 'lucide-react';

type SolWalletPanelProps = {
  /** Show scout earnings row under balance. */
  showScoutEarnings?: boolean;
  className?: string;
};

function shorten(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function SolWalletPanel({ showScoutEarnings = true, className = '' }: SolWalletPanelProps) {
  const { address, connected, connect, busy } = useConnectedWallet();
  const { sol, loading, error, refresh } = useSolBalance(address);
  const earnings = address ? readScoutEarningsDemo(address) : { earnedSol: 0, volumeUsd: 0, clicks: 0 };
  const scoutPct = formatBpsPercent(SCOUT_FEE_ENGINE.scoutBps);

  if (!connected || !address) {
    return (
      <div className={`rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <SolanaLogo className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Your SOL wallet</p>
            <p className="mt-0.5 text-[12px] text-white/45">
              Scout commissions ({scoutPct}) fill this balance as instant SOL.
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void connect()}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8ff3d] px-4 py-3 text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69] disabled:opacity-60"
        >
          <Wallet className="h-4 w-4" />
          {busy ? 'Connecting…' : 'Connect wallet'}
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <SolanaLogo className="h-12 w-12 shrink-0 rounded-full ring-1 ring-white/10" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-white/40">SOL balance</p>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {loading && sol == null ? (
              <p className="font-serif text-2xl font-bold tabular-nums text-white/40">…</p>
            ) : (
              <p className="font-serif text-2xl font-bold tabular-nums text-white">
                {formatSolAmount(sol ?? 0)}
                <span className="ml-1.5 text-base font-semibold text-white/50">SOL</span>
              </p>
            )}
          </div>
          <p className="mt-1 font-mono text-[11px] text-white/35" title={address}>
            {shorten(address)}
          </p>
          {error ? (
            <p className="mt-1 text-[11px] text-amber-300/90">
              Couldn’t load balance ·{' '}
              <button type="button" onClick={refresh} className="underline hover:text-amber-200">
                Retry
              </button>
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={refresh}
          className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium text-white/40 transition hover:bg-white/[0.05] hover:text-white/70"
        >
          Refresh
        </button>
      </div>

      {showScoutEarnings ? (
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-3">
          <div className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2.5">
            <p className="text-[10px] font-medium text-white/35">Scout earned</p>
            <p className="mt-0.5 flex items-center gap-1.5 font-mono text-sm font-semibold text-[#d5ff69]">
              <SolanaLogo className="h-4 w-4" />
              {formatSolAmount(earnings.earnedSol, 3)} SOL
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2.5">
            <p className="text-[10px] font-medium text-white/35">Referred volume</p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-white">
              ${earnings.volumeUsd.toLocaleString()}
            </p>
          </div>
        </div>
      ) : null}

      <p className="mt-3 text-[11px] leading-relaxed text-white/35">
        {scoutPct} of attributed CTOgo swaps streams into this wallet as SOL when the fee engine is
        live — no claim button.
      </p>
    </div>
  );
}
