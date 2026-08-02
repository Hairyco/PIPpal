import { useMemo, useState } from 'react';
import { Check, Copy, Link2, Wallet } from 'lucide-react';
import { useConnectedWallet } from '../ConnectWalletButton';
import { SolanaLogo } from '../SolanaLogo';
import { SolWalletPanel } from '../SolWalletPanel';
import { SCOUT_FEE_ENGINE, formatBpsPercent } from '../../data/chainConfig';
import { formatSolAmount } from '../../hooks/useSolBalance';
import {
  buildScoutLink,
  bumpScoutClickDemo,
  readScoutEarningsDemo,
} from '../../utils/scoutReferral';

type ScoutDashboardProps = {
  symbol: string;
  /** Optional compact layout for Overview share card. */
  compact?: boolean;
  className?: string;
};

export function ScoutDashboard({ symbol, compact = false, className = '' }: ScoutDashboardProps) {
  const { address, connected, connect, busy } = useConnectedWallet();
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ctogo.vercel.app';
  const scoutLink = address ? buildScoutLink(origin, symbol, address) : null;
  const earnings = useMemo(
    () => (address ? readScoutEarningsDemo(address) : { earnedSol: 0, volumeUsd: 0, clicks: 0 }),
    [address, copied],
  );

  const scoutPct = formatBpsPercent(SCOUT_FEE_ENGINE.scoutBps);

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

  return (
    <div className={`space-y-5 ${className}`}>
      {!compact ? (
        <div>
          <p className="font-serif text-xl font-bold tracking-tight text-white">Scout</p>
          <p className="mt-1.5 text-sm text-white/45">
            Share your link. Earn {scoutPct} instant SOL on CTOgo swaps attributed to you — filled
            into your wallet when the fee engine is live on-chain. Not paid from the marketing
            wallet roadmap.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm font-semibold text-white">Share & earn</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/45">
            {scoutPct} scout cut · {SCOUT_FEE_ENGINE.attributionHours}h last-click · streams to your
            wallet
          </p>
        </div>
      )}

      {!compact ? <SolWalletPanel showScoutEarnings /> : null}

      {!connected ? (
        compact ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void connect()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8ff3d] px-4 py-3 text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69] disabled:opacity-60"
          >
            <Wallet className="h-4 w-4" />
            {busy ? 'Connecting…' : 'Connect wallet for scout link'}
          </button>
        ) : null
      ) : (
        <div className="space-y-3">
          {compact ? (
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2">
              <SolanaLogo className="h-7 w-7 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-white/35">Scout earned</p>
                <p className="font-mono text-[13px] font-semibold text-[#d5ff69]">
                  {formatSolAmount(earnings.earnedSol, 3)} SOL
                </p>
              </div>
            </div>
          ) : null}

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3">
            <p className="text-[11px] font-medium text-white/40">Your scout link</p>
            <p className="mt-1 break-all font-mono text-[12px] text-white/70">{scoutLink}</p>
            <button
              type="button"
              onClick={() => void copyLink()}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#c8ff3d] px-3 py-2.5 text-[12px] font-bold text-[#090b14] transition hover:bg-[#d5ff69]"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy my scout link'}
            </button>
          </div>

          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-white/35">
            <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Rate is protocol-fixed at {scoutPct} — SOL routes in the swap tx into your balance above.
            No withdraw button.
          </p>
        </div>
      )}

      {!compact ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 text-[12px] leading-relaxed text-white/45">
          <p className="font-medium text-white/70">Fee split on every CTOgo swap</p>
          <ul className="mt-2 space-y-1">
            <li>{formatBpsPercent(SCOUT_FEE_ENGINE.scoutBps)} → scout wallet (you)</li>
            <li>
              {formatBpsPercent(SCOUT_FEE_ENGINE.marketingBps)} → marketing wallet (roadmap)
            </li>
            <li>{formatBpsPercent(SCOUT_FEE_ENGINE.platformBps)} → CTOgo</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
