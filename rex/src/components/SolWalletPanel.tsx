import { SolanaLogo } from './SolanaLogo';
import { useConnectedWallet } from './ConnectWalletButton';
import { formatSolAmount, useSolBalance } from '../hooks/useSolBalance';
import { readScoutEarningsDemo } from '../utils/scoutReferral';
import { SCOUT_FEE_ENGINE, formatBpsPercent } from '../data/chainConfig';
import { Wallet } from 'lucide-react';

type SolWalletPanelProps = {
  showScoutEarnings?: boolean;
  className?: string;
};

function shorten(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

/** Compact wallet summary for Wallet / Scout tabs — header pill is primary (Axiom-style). */
export function SolWalletPanel({ showScoutEarnings = true, className = '' }: SolWalletPanelProps) {
  const { address, connected, connect, busy } = useConnectedWallet();
  const { sol, loading, error, refresh } = useSolBalance(address);
  const earnings = address ? readScoutEarningsDemo(address) : { earnedSol: 0, volumeUsd: 0, clicks: 0 };
  const scoutPct = formatBpsPercent(SCOUT_FEE_ENGINE.scoutBps);

  if (!connected || !address) {
    return (
      <div className={`rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#12141c] px-2.5">
            <Wallet className="h-3.5 w-3.5 text-white/55" />
            <SolanaLogo className="h-4 w-4" />
            <span className="font-mono text-[12px] font-semibold text-white/40">0</span>
          </span>
          <p className="min-w-0 text-[12px] leading-relaxed text-white/45">
            Connect to see your SOL balance in the header — scout commissions ({scoutPct}) fill it.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void connect()}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#c8ff3d] px-4 py-2.5 text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69] disabled:opacity-60"
        >
          <Wallet className="h-4 w-4" />
          {busy ? 'Connecting…' : 'Connect wallet'}
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 ${className}`}>
      <p className="text-[11px] text-white/40">
        Same balance as the header pill · {shorten(address)}
      </p>
      <div className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#12141c] px-3">
        <Wallet className="h-3.5 w-3.5 text-white/55" />
        <span className="h-3.5 w-px bg-white/[0.12]" aria-hidden />
        <SolanaLogo className="h-4 w-4" />
        <span className="font-mono text-[13px] font-semibold tabular-nums text-white">
          {loading && sol == null ? '…' : formatSolAmount(sol ?? 0, 4)}
        </span>
        <span className="text-[11px] font-medium text-white/40">SOL</span>
      </div>
      {error ? (
        <p className="mt-2 text-[11px] text-amber-300/90">
          Couldn’t load ·{' '}
          <button type="button" onClick={refresh} className="underline">
            Retry
          </button>
        </p>
      ) : null}

      {showScoutEarnings ? (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3 text-[12px]">
          <span className="text-white/40">Scout earned</span>
          <span className="inline-flex items-center gap-1 font-mono font-semibold text-[#d5ff69]">
            <SolanaLogo className="h-3.5 w-3.5" />
            {formatSolAmount(earnings.earnedSol, 3)} SOL
          </span>
        </div>
      ) : null}
    </div>
  );
}
