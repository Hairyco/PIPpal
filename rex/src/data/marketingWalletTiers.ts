import { BadgeCheck, Clock, Shield, Wallet, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { formatSpendCost } from './marketingSpendFlow';

export type MarketingWalletTierId = 'tier-1' | 'tier-2' | 'tier-3';

export interface MarketingSpendExample {
  label: string;
  cost: number;
  note?: string;
}

export interface MarketingWalletTier {
  id: MarketingWalletTierId;
  tier: 1 | 2 | 3;
  title: string;
  walletRangeLabel: string;
  minWalletUsd: number;
  maxWalletUsd?: number;
  icon: LucideIcon;
  summary: string;
  requirements: string[];
  examples: MarketingSpendExample[];
  accent: 'sky' | 'amber' | 'violet';
  kycRequired: boolean;
}

/** Provisional tier boundaries — Tier 2+ thresholds may be refined before mainnet. */
export const MARKETING_WALLET_TIER_2_MIN_USD = 5_000;
export const MARKETING_WALLET_TIER_3_MIN_USD = 25_000;

/** Minimum token age before engaging a whitelisted supplier for product build. */
export const WHITELISTED_SUPPLIER_MIN_AGE_MONTHS = 6;

export const marketingWalletTiers: MarketingWalletTier[] = [
  {
    id: 'tier-1',
    tier: 1,
    title: 'Tier 1 — Automated growth',
    walletRangeLabel: 'Up to $4,999',
    minWalletUsd: 0,
    maxWalletUsd: MARKETING_WALLET_TIER_2_MIN_USD - 1,
    icon: Zap,
    accent: 'sky',
    kycRequired: false,
    summary:
      'Trade tax fills your marketing wallet. Rex auto-purchases community and charting placements — no founder action required.',
    requirements: [
      'Included with your $1 launch',
      'Rex-managed vendor packages at each wallet threshold',
      'Spend capped below Tier 2 until higher balances unlock',
    ],
    examples: [
      { label: 'Telegram caller pin', cost: 150 },
      { label: 'DexScreener enhanced info', cost: 500 },
      { label: 'DexScreener banner', cost: 2_500 },
      { label: 'Community ad burst', cost: 1_200, note: 'Typical Week 2–3 bundle' },
    ],
  },
  {
    id: 'tier-2',
    tier: 2,
    title: 'Tier 2 — Founder-approved spend',
    walletRangeLabel: `$${MARKETING_WALLET_TIER_2_MIN_USD.toLocaleString()}+`,
    minWalletUsd: MARKETING_WALLET_TIER_2_MIN_USD,
    maxWalletUsd: MARKETING_WALLET_TIER_3_MIN_USD - 1,
    icon: BadgeCheck,
    accent: 'amber',
    kycRequired: true,
    summary:
      'Larger campaigns unlock once your marketing wallet crosses $5,000. Founder KYC is required before Rex executes Tier 2 spend.',
    requirements: [
      `Marketing wallet balance ≥ $${MARKETING_WALLET_TIER_2_MIN_USD.toLocaleString()}`,
      'Founder KYC completed and verified',
      'You approve packages — or Rex runs defaults until KYC is done',
    ],
    examples: [
      { label: 'DexScreener trending bar', cost: 3_000 },
      { label: 'Coinzilla display run', cost: 5_000 },
      { label: 'DEXTools spotlight', cost: 4_500 },
      { label: 'Multi-platform growth push', cost: 7_500, note: 'Typical Tier 2 bundle' },
    ],
  },
  {
    id: 'tier-3',
    tier: 3,
    title: 'Tier 3 — Scale & premium media',
    walletRangeLabel: `$${MARKETING_WALLET_TIER_3_MIN_USD.toLocaleString()}+`,
    minWalletUsd: MARKETING_WALLET_TIER_3_MIN_USD,
    icon: Shield,
    accent: 'violet',
    kycRequired: true,
    summary:
      'Premium listings, agency-style bursts, and high-impact media — only when the wallet sustains Tier 3 balances and KYC is complete.',
    requirements: [
      `Marketing wallet balance ≥ $${MARKETING_WALLET_TIER_3_MIN_USD.toLocaleString()}`,
      'Founder KYC required (same as Tier 2)',
      'Rex PM review on largest packages before execution',
    ],
    examples: [
      { label: 'CoinMarketCap awareness', cost: 12_000 },
      { label: 'CoinGecko boost package', cost: 15_000 },
      { label: 'Agency raid + KOL bundle', cost: 20_000 },
      { label: 'Tier 3 scale campaign', cost: 25_000, note: 'Full cross-channel push' },
    ],
  },
];

export const whitelistedSupplierPolicy = {
  title: 'Product build — whitelisted suppliers',
  minAgeMonths: WHITELISTED_SUPPLIER_MIN_AGE_MONTHS,
  summary:
    'Large product builds (apps, contracts, physical goods) use vetted whitelisted suppliers — separate from day-to-day marketing wallet spend.',
  rules: [
    `Token must be live on Rex for at least ${WHITELISTED_SUPPLIER_MIN_AGE_MONTHS} months before engaging a whitelisted supplier`,
    'Supplier scope, milestones, and escrow are Rex PM–approved',
    'Build budget comes from your roadmap wallet — not automatic marketing tax spend',
    'Marketing wallet tiers still fund ads and growth; suppliers deliver the product roadmap',
  ],
};

export function getTierForWalletBalance(usd: number): MarketingWalletTier {
  if (usd >= MARKETING_WALLET_TIER_3_MIN_USD) {
    return marketingWalletTiers[2];
  }
  if (usd >= MARKETING_WALLET_TIER_2_MIN_USD) {
    return marketingWalletTiers[1];
  }
  return marketingWalletTiers[0];
}

export function formatWalletRange(tier: MarketingWalletTier): string {
  if (tier.maxWalletUsd != null) {
    return `$${tier.minWalletUsd.toLocaleString()} – $${tier.maxWalletUsd.toLocaleString()}`;
  }
  return `$${tier.minWalletUsd.toLocaleString()}+`;
}

export { formatSpendCost };
