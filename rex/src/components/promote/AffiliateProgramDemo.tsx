import { useState } from 'react';
import { Check, Copy, Link2, Users, Wallet, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DemoPreviewBadge } from './DemoPreviewBadge';
import { affiliateProgramDefaults } from '../../data/promotePricing';
import { SCOUT_FEE_ENGINE, formatBpsPercent } from '../../data/chainConfig';
import { coinPath } from '../../utils/scoutReferral';

const SCOUT_PCT = formatBpsPercent(SCOUT_FEE_ENGINE.scoutBps);

export function AffiliateProgramDemo({
  projectName,
  symbol,
}: {
  projectName: string;
  symbol: string;
}) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ctogo.vercel.app';
  const sampleLink = `${origin}${coinPath(symbol)}?ref=YOUR_WALLET`;

  const copyLink = () => {
    void navigator.clipboard.writeText(sampleLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="dex-card relative min-w-0 overflow-hidden">
      <div className="relative z-[1] min-w-0 p-4 sm:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-sky-400" />
            <span className="text-xs font-medium uppercase tracking-wider text-sky-400">
              Scout programme
            </span>
            <DemoPreviewBadge />
          </div>
          <h2 className="mt-2 break-words text-lg font-semibold text-white">
            Community & scouts earn {SCOUT_PCT} on shared buys
          </h2>
          <p className="mt-1 break-words text-sm text-muted-foreground">
            Anyone shares {projectName} with their wallet as <code className="text-sky-300">?ref=</code>.
            Attributed CTOgo swaps stream {SCOUT_PCT} SOL to their wallet. Marketing wallet still gets{' '}
            {formatBpsPercent(SCOUT_FEE_ENGINE.marketingBps)} for roadmap spend — separate buckets.
          </p>
        </div>

        <div className="mt-5 flex min-w-0 items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3">
          <Zap className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
          <p className="min-w-0 break-words text-xs text-muted-foreground">
            <span className="font-medium text-white">Protocol-fixed rate.</span> Scout cut is always{' '}
            {SCOUT_PCT} of swap volume — no founder commission slider. {affiliateProgramDefaults.attributionLabel}.
          </p>
        </div>

        <div className="mt-4 break-words rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-200/90">
          Instant SOL routing ships with the on-chain fee engine. Coin pages, scout links, and 24h
          attribution are live in the app now.
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Sample scout link</p>
            <div className="flex min-w-0 gap-2">
              <code className="min-w-0 flex-1 break-all rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-sky-300">
                {sampleLink}
              </code>
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-3 text-xs text-white/70 hover:text-white"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <Link
            to={coinPath(symbol)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#c8ff3d] px-4 py-2.5 text-sm font-semibold text-[#090b14] transition hover:bg-[#d5ff69]"
          >
            <Link2 className="h-4 w-4" />
            Open ${symbol} coin page
          </Link>

          <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
            <p className="text-xs text-muted-foreground">
              Scouts do not drain your marketing wallet. Roadmap spend (pins, DexScreener) stays on
              the {formatBpsPercent(SCOUT_FEE_ENGINE.marketingBps)} cut only.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
