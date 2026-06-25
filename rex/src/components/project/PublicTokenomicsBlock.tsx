import { Lock, TrendingUp } from 'lucide-react';
import { BONDING_CURVE_SUMMARY } from '../../data/bondingCurve';
import { FOUNDER_ALLOCATION_PERCENT, tokenSupplySlices } from '../../data/founderTokenomics';

export function PublicTokenomicsBlock() {
  return (
    <div className="dex-card">
      <div className="relative z-[1]">
        <h2 className="font-semibold text-white">Token supply</h2>
        <p className="mt-1 text-xs text-muted-foreground">{BONDING_CURVE_SUMMARY}</p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-sky-300/90">
          <TrendingUp className="h-3 w-3" />
          Bonding curve · founder and share-pool tokens unlock after KYC + vesting
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {tokenSupplySlices.map((slice) => (
            <div
              key={slice.id}
              className={`rounded-lg border px-3 py-2 ${
                slice.id === 'founder'
                  ? 'border-sky-500/25 bg-sky-500/5'
                  : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <p className="text-sm font-bold text-white">{slice.percent}%</p>
              <p className="text-xs text-muted-foreground">{slice.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3 w-3 text-sky-400" />
          Founder {FOUNDER_ALLOCATION_PERCENT}% locked until verified founder completes KYC
        </p>
      </div>
    </div>
  );
}
