import { Clock, Info, Wallet } from 'lucide-react';
import { KYC_FEE } from '../../data/claimPricing';
import {
  formatSpendCost,
  formatWalletRange,
  marketingWalletTiers,
  whitelistedSupplierPolicy,
  MARKETING_WALLET_TIER_2_MIN_USD,
  MARKETING_WALLET_TIER_3_MIN_USD,
} from '../../data/marketingWalletTiers';
import { PolessiaLogo } from '../PolessiaLogo';

interface MarketingWalletTiersPanelProps {
  compact?: boolean;
}

export function MarketingWalletTiersPanel({ compact = false }: MarketingWalletTiersPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-sky-400">
            <Wallet className="h-3.5 w-3.5" />
            Marketing wallet spend tiers
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Buy/sell tax on every trade fills your marketing wallet. Polessia auto-buys placements at
            thresholds — bigger spends unlock in Tier 2 and Tier 3 (provisional limits below).
          </p>
        </div>
        <PolessiaLogo variant="powered" size="xs" className="shrink-0" />
      </div>

      {!compact && <WalletTierBar />}

      <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
        {marketingWalletTiers.map((tier) => {
          const Icon = tier.icon;
          const border =
            tier.accent === 'sky'
              ? 'border-sky-500/25'
              : tier.accent === 'amber'
                ? 'border-amber-500/25'
                : 'border-violet-500/25';
          const badgeBg =
            tier.accent === 'sky'
              ? 'bg-sky-500/15 text-sky-300'
              : tier.accent === 'amber'
                ? 'bg-amber-500/15 text-amber-200'
                : 'bg-violet-500/15 text-violet-200';

          return (
            <div
              key={tier.id}
              className={`rounded-xl border ${border} bg-white/[0.02] p-4`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`rounded-lg p-1.5 ${badgeBg}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">Tier {tier.tier}</p>
                    <p className="text-[10px] text-muted-foreground">{formatWalletRange(tier)}</p>
                  </div>
                </div>
                {tier.kycRequired && (
                  <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium text-amber-200">
                    KYC
                  </span>
                )}
              </div>

              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{tier.summary}</p>

              {!compact && (
                <>
                  <ul className="mt-3 space-y-1.5">
                    {tier.requirements.map((req) => (
                      <li
                        key={req}
                        className="flex gap-2 text-[11px] leading-relaxed text-muted-foreground"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sky-400/80" />
                        {req}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 border-t border-white/10 pt-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Example spend
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {tier.examples.map((ex) => (
                        <li
                          key={ex.label}
                          className="flex items-baseline justify-between gap-2 text-[11px]"
                        >
                          <span className="text-foreground/90">{ex.label}</span>
                          <span className="shrink-0 font-medium text-sky-300">
                            {formatSpendCost(ex.cost)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
          <div>
            <p className="text-sm font-medium text-white">{whitelistedSupplierPolicy.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {whitelistedSupplierPolicy.summary}
            </p>
            <ul className="mt-2 space-y-1.5">
              {whitelistedSupplierPolicy.rules.map((rule) => (
                <li
                  key={rule}
                  className="flex gap-2 text-[11px] leading-relaxed text-muted-foreground"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-400/80" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-2 rounded-lg border border-sky-500/15 bg-sky-500/[0.04] px-3 py-2.5">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-400" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Tier 2 unlocks at{' '}
          <span className="text-foreground">${MARKETING_WALLET_TIER_2_MIN_USD.toLocaleString()}+</span>{' '}
          with KYC (${KYC_FEE}). Tier 3 from{' '}
          <span className="text-foreground">${MARKETING_WALLET_TIER_3_MIN_USD.toLocaleString()}+</span>.
          Whitelisted product suppliers require{' '}
          <span className="text-foreground">{whitelistedSupplierPolicy.minAgeMonths} months</span>{' '}
          live — exact tier figures may change before mainnet.
        </p>
      </div>
    </div>
  );
}

function WalletTierBar() {
  const markers = [
    { label: '$0', pct: 0 },
    { label: '$150', pct: 8 },
    { label: '$500', pct: 18 },
    { label: '$2.5K', pct: 38 },
    { label: `Tier 2 · $${(MARKETING_WALLET_TIER_2_MIN_USD / 1000).toFixed(0)}K`, pct: 58 },
    { label: `Tier 3 · $${(MARKETING_WALLET_TIER_3_MIN_USD / 1000).toFixed(0)}K`, pct: 88 },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="mb-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Wallet balance →</span>
        <span className="text-emerald-400/90">Auto-spend unlocks</span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-500 via-amber-400 to-violet-500"
          style={{ width: '72%' }}
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-amber-300/90"
          style={{ left: '58%' }}
          title="Tier 2 KYC gate"
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-violet-300/90"
          style={{ left: '88%' }}
          title="Tier 3"
        />
      </div>
      <div className="relative mt-3 h-8">
        {markers.map((m) => (
          <span
            key={m.label}
            className="absolute -translate-x-1/2 text-[9px] text-muted-foreground"
            style={{ left: `${m.pct}%` }}
          >
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
