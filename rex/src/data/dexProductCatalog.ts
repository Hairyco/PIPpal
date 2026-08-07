/**
 * DexScreener product families + exact packs (live Marketplace + Boost UI, Aug 2026).
 * Founders pick family → pack on /dex-ads; Approve queues offerKey.
 */

export type DexFamilyId =
  | 'boost'
  | 'token-ad'
  | 'trending'
  | 'token-info'
  | 'update-socials';

export type DexPack = {
  offerKey: string;
  family: DexFamilyId;
  label: string;
  priceUsd: number;
  /** Short detail e.g. "12h" / "20k views" */
  detail: string;
  impressions?: number;
  boostCount?: number;
  duration?: string;
};

export type DexFamily = {
  id: DexFamilyId;
  name: string;
  summary: string;
  /** Wallet unlock hint (matches roadmap tiers) */
  unlockTierUsd: number;
  collateral: 'mint' | 'token-ad' | 'trending' | 'token-info' | 'socials';
  packs: DexPack[];
};

export const DEX_FAMILIES: DexFamily[] = [
  {
    id: 'boost',
    name: 'Boosts',
    summary: 'Pair-page Boost packs (web only). No creatives — mint only.',
    unlockTierUsd: 500,
    collateral: 'mint',
    packs: [
      {
        offerKey: 'dex-boost-10',
        family: 'boost',
        label: '10 boosts · 12h',
        priceUsd: 99,
        detail: '12 hours',
        boostCount: 10,
        duration: '12h',
      },
      {
        offerKey: 'dex-boost-30',
        family: 'boost',
        label: '30 boosts',
        priceUsd: 249,
        detail: '30×',
        boostCount: 30,
      },
      {
        offerKey: 'dex-boost-50',
        family: 'boost',
        label: '50 boosts',
        priceUsd: 399,
        detail: '50×',
        boostCount: 50,
      },
      {
        offerKey: 'dex-boost-100',
        family: 'boost',
        label: '100 boosts',
        priceUsd: 899,
        detail: '100×',
        boostCount: 100,
      },
      {
        offerKey: 'dex-boost-500',
        family: 'boost',
        label: '500 boosts · Golden Ticker',
        priceUsd: 3999,
        detail: '500× · Golden Ticker unlock',
        boostCount: 500,
      },
    ],
  },
  {
    id: 'token-ad',
    name: 'Token Advertising',
    summary: 'In-feed Marketplace ads. Title, pitch, 1:1 square.',
    unlockTierUsd: 500,
    collateral: 'token-ad',
    packs: [
      {
        offerKey: 'dex-token-ad-20k',
        family: 'token-ad',
        label: '20k views',
        priceUsd: 299,
        detail: '20,000 impressions',
        impressions: 20000,
      },
      {
        offerKey: 'dex-token-ad-50k',
        family: 'token-ad',
        label: '50k views',
        priceUsd: 699,
        detail: '50,000 impressions',
        impressions: 50000,
      },
      {
        offerKey: 'dex-token-ad-100k',
        family: 'token-ad',
        label: '100k views',
        priceUsd: 999,
        detail: '100,000 impressions',
        impressions: 100000,
      },
      {
        offerKey: 'dex-token-ad-200k',
        family: 'token-ad',
        label: '200k views',
        priceUsd: 1999,
        detail: '200,000 impressions',
        impressions: 200000,
      },
      {
        offerKey: 'dex-token-ad-400k',
        family: 'token-ad',
        label: '400k views',
        priceUsd: 3999,
        detail: '400,000 impressions',
        impressions: 400000,
      },
      {
        offerKey: 'dex-token-ad-800k',
        family: 'token-ad',
        label: '800k views',
        priceUsd: 6999,
        detail: '800,000 impressions',
        impressions: 800000,
      },
    ],
  },
  {
    id: 'trending',
    name: 'Trending Bar',
    summary: 'Trending bar rotation. Title + same 1:1 square as Token Ad.',
    unlockTierUsd: 2000,
    collateral: 'trending',
    packs: [
      {
        offerKey: 'dex-trending-24h',
        family: 'trending',
        label: 'Trending Bar · 24h',
        priceUsd: 2000,
        detail: '24 hours',
        duration: '24h',
      },
      {
        offerKey: 'dex-trending-48h',
        family: 'trending',
        label: 'Trending Bar · 48h',
        priceUsd: 4000,
        detail: '48 hours',
        duration: '48h',
      },
      {
        offerKey: 'dex-trending-7d',
        family: 'trending',
        label: 'Trending Bar · 7d',
        priceUsd: 14000,
        detail: '7 days',
        duration: '7d',
      },
    ],
  },
  {
    id: 'token-info',
    name: 'Enhanced Token Info',
    summary: 'Pair-page description + icon + 3:1 header.',
    unlockTierUsd: 1000,
    collateral: 'token-info',
    packs: [
      {
        offerKey: 'dex-token-info',
        family: 'token-info',
        label: 'Enhanced Token Info',
        priceUsd: 299,
        detail: 'One-time profile enhancement',
      },
    ],
  },
  {
    id: 'update-socials',
    name: 'Update socials',
    summary:
      'Website / X / Telegram / Discord on Dex. Founder owns Dex — Polessia fulfils only if you opt in.',
    unlockTierUsd: 500,
    collateral: 'socials',
    packs: [
      {
        offerKey: 'dex-update-socials',
        family: 'update-socials',
        label: 'Update socials',
        priceUsd: 99,
        detail: 'CTOgo fulfilment · Dex form is free',
      },
    ],
  },
];

export type SelectedDexPack = {
  offerKey: string;
  family: DexFamilyId;
};

/** Default Polessia seed packs (cheapest of each critical family). Update socials ON. */
export const POLESSIA_DEFAULT_DEX_PACKS: SelectedDexPack[] = [
  { offerKey: 'dex-boost-10', family: 'boost' },
  { offerKey: 'dex-token-ad-20k', family: 'token-ad' },
  { offerKey: 'dex-update-socials', family: 'update-socials' },
];

/** Legacy / short keys → canonical pack offerKey. */
export const DEX_OFFER_KEY_ALIASES: Record<string, string> = {
  'dex-token-ad': 'dex-token-ad-20k',
  'dex-trending': 'dex-trending-24h',
  /** Break old Token Ad alias — socials is its own SKU now */
  'dex-socials': 'dex-update-socials',
};

export function canonicalDexOfferKey(key: string): string {
  const k = String(key || '').trim();
  return DEX_OFFER_KEY_ALIASES[k] || k;
}

export function getDexFamily(id: DexFamilyId): DexFamily | undefined {
  return DEX_FAMILIES.find((f) => f.id === id);
}

export function getDexPack(offerKey: string): DexPack | undefined {
  const key = canonicalDexOfferKey(offerKey);
  for (const family of DEX_FAMILIES) {
    const pack = family.packs.find((p) => p.offerKey === key);
    if (pack) return pack;
  }
  return undefined;
}

export function getFamilyForOfferKey(offerKey: string): DexFamily | undefined {
  const pack = getDexPack(offerKey);
  return pack ? getDexFamily(pack.family) : undefined;
}

export function allDexOfferKeys(): string[] {
  return DEX_FAMILIES.flatMap((f) => f.packs.map((p) => p.offerKey));
}

export function formatDexPackPrice(priceUsd: number): string {
  return priceUsd >= 1000
    ? `$${(priceUsd / 1000).toFixed(priceUsd % 1000 === 0 ? 0 : 1)}K`
    : `$${priceUsd}`;
}

/** Replace any prior pack in the same family with the new one. */
export function upsertSelectedDexPack(
  selected: SelectedDexPack[],
  next: SelectedDexPack,
): SelectedDexPack[] {
  const family = getFamilyForOfferKey(next.offerKey)?.id || next.family;
  return [
    ...selected.filter((s) => s.family !== family && s.offerKey !== next.offerKey),
    { offerKey: canonicalDexOfferKey(next.offerKey), family },
  ];
}

export function removeSelectedDexPack(
  selected: SelectedDexPack[],
  offerKeyOrFamily: string,
): SelectedDexPack[] {
  const key = canonicalDexOfferKey(offerKeyOrFamily);
  const asFamily = offerKeyOrFamily as DexFamilyId;
  return selected.filter(
    (s) => s.offerKey !== key && s.family !== asFamily,
  );
}

export function selectedDexPacksInvoiceUsd(selected: SelectedDexPack[]): number {
  return selected.reduce((sum, s) => {
    const pack = getDexPack(s.offerKey);
    return sum + (pack?.priceUsd || 0);
  }, 0);
}
