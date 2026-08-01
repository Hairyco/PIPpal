/**
 * Marketing wallet spend bundles — ordered packages founders can buy
 * up-front or queue until the marketing wallet fills from trade tax.
 */

export type BundleFunding = 'pay-now' | 'wait-wallet';

export type MarketingBundleId = 'launch-starter' | 'coingecko-cto' | 'dexscreener-ads';

export type MarketingBundle = {
  id: MarketingBundleId;
  title: string;
  summary: string;
  includes: string[];
  /** Display price — final SOL amount TBD */
  priceHint: string;
  /** Approx SOL target for wallet auto-pay (product estimate) */
  approxSol: string;
  available: boolean;
  supplierHint?: string;
};

export const marketingBundles: MarketingBundle[] = [
  {
    id: 'launch-starter',
    title: 'Launch starter',
    summary: 'Everything you need live on day one — site, social creatives, and first distribution.',
    includes: [
      'Cloned site hosted by Rex',
      'Logo + social banner (cloned or generated)',
      'One callout in the Rex master Telegram channel',
      'Change-request form after payment (edits fee TBD)',
    ],
    priceHint: 'Price TBD',
    approxSol: '~4–5 SOL',
    available: true,
    supplierHint: 'Rex ops',
  },
  {
    id: 'coingecko-cto',
    title: 'CoinGecko community takeover',
    summary: 'CoinGecko CTO listing fee — select after your coin is live.',
    includes: ['CoinGecko community takeover submission', 'Listing coordination'],
    priceHint: 'Price TBD',
    approxSol: 'TBD',
    available: false,
    supplierHint: 'CoinGecko',
  },
  {
    id: 'dexscreener-ads',
    title: 'DexScreener ads',
    summary: 'Paid DexScreener placements — pick once trading volume starts.',
    includes: ['DexScreener ad inventory', 'Creative from your logo/banner pack'],
    priceHint: 'Price TBD',
    approxSol: 'TBD',
    available: false,
    supplierHint: 'DexScreener',
  },
];

export function getMarketingBundle(id: MarketingBundleId): MarketingBundle | undefined {
  return marketingBundles.find((b) => b.id === id);
}

/** Soft signal that a site may be too complex to clone cleanly — never a hard block. */
export function assessWebsiteCloneComplexity(url: string): 'simple' | 'maybe-complex' {
  const lower = url.trim().toLowerCase();
  if (!lower) return 'simple';
  const complexHints = [
    'wordpress',
    'shopify',
    'webflow',
    'wix.com',
    'squarespace',
    '/app/',
    'dashboard',
    'login',
    'auth',
  ];
  return complexHints.some((hint) => lower.includes(hint)) ? 'maybe-complex' : 'simple';
}
