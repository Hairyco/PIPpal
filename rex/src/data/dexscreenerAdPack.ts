/**
 * DexScreener product collateral — verified from live Marketplace + Boost UI (Aug 2026).
 * Polessia cannot fulfil without required assets on file (Boosts = mint only).
 */

export type DexProductId =
  | 'token-ad'
  | 'trending-bar'
  | 'token-info'
  | 'boost'
  | 'update-socials';

export type DexAdPackField = {
  id: string;
  label: string;
  detail: string;
  required: boolean;
  products: DexProductId[];
  spec?: string;
};

/** Shared square creative used by Token Ad + Trending Bar. */
export const DEX_SQUARE_IMAGE_SPEC = {
  ratio: '1:1',
  example: '500×500px',
  minWidthPx: 100,
  formats: ['png', 'jpg', 'webp'] as const,
  maxMb: 4.5,
  label: '1:1 · PNG/JPG/WebP · min 100px wide · max 4.5 MB',
} as const;

/** Enhanced Token Info header (not Token Ad / Trending Bar). */
export const DEX_HEADER_IMAGE_SPEC = {
  ratio: '3:1',
  example: '1500×500px',
  minWidthPx: 600,
  formats: ['png', 'jpg', 'webp', 'gif'] as const,
  maxMb: 4.5,
  label: '3:1 · PNG/JPG/WebP/GIF · min 600px wide · max 4.5 MB',
} as const;

/** ETI icon (allows GIF). */
export const DEX_ICON_IMAGE_SPEC = {
  ratio: '1:1',
  example: '500×500px',
  minWidthPx: 100,
  formats: ['png', 'jpg', 'webp', 'gif'] as const,
  maxMb: 4.5,
  label: '1:1 · PNG/JPG/WebP/GIF · min 100px wide · max 4.5 MB',
} as const;

export const DEXSCREENER_AD_PRODUCTS = {
  'token-ad': {
    id: 'token-ad' as const,
    name: 'Token Advertising',
    marketplacePath: '/product/ad',
    summary: 'In-feed token ads · from $299 (pick views on /dex-ads).',
    spendIds: ['dex-token-ad', 'dex-token-ad-20k'] as const,
  },
  'trending-bar': {
    id: 'trending-bar' as const,
    name: 'Trending Bar Advertising',
    marketplacePath: '/product/trending-bar-ad',
    summary: 'Trending bar rotation · from $2,000.',
    spendIds: ['dex-trending', 'dex-trending-24h'] as const,
  },
  'token-info': {
    id: 'token-info' as const,
    name: 'Enhanced Token Info',
    marketplacePath: '/product/token-info',
    summary: 'Pair-page icon + 3:1 header + description · $299.',
    spendIds: ['dex-token-info'] as const,
  },
  boost: {
    id: 'boost' as const,
    name: 'Boosts',
    marketplacePath: null,
    pairPagePath: 'https://dexscreener.com',
    summary: 'Pair-page Boost packs (web only) · from $99. No creatives.',
    spendIds: ['dex-boost-10'] as const,
  },
  'update-socials': {
    id: 'update-socials' as const,
    name: 'Update socials',
    marketplacePath: null,
    pairPagePath: 'https://dexscreener.com',
    summary: 'Website / X / TG / Discord · $99 CTOgo fulfilment. Founder owns Dex.',
    spendIds: ['dex-update-socials', 'dex-socials'] as const,
  },
} as const;

/** Roadmap spend ids that need creative collateral (not Boost). */
export const DEX_CREATIVE_SPEND_IDS = [
  'dex-token-ad',
  'dex-token-ad-20k',
  'dex-trending',
  'dex-trending-24h',
  'dex-token-info',
  'dex-update-socials',
  'dex-socials',
] as const;

export const DEXSCREENER_AD_PACK_FIELDS: DexAdPackField[] = [
  {
    id: 'ad-title',
    label: 'Ad title',
    detail: 'Short title on Token Ad / Trending Bar (max 50)',
    required: true,
    products: ['token-ad', 'trending-bar'],
    spec: 'max 50 characters',
  },
  {
    id: 'ad-pitch',
    label: 'Ad pitch',
    detail: 'Short description for Token Advertising only (max 120)',
    required: true,
    products: ['token-ad'],
    spec: 'max 120 characters',
  },
  {
    id: 'ad-square-image',
    label: 'Square ad image',
    detail: 'Token Advertising and Trending Bar uploads',
    required: true,
    products: ['token-ad', 'trending-bar'],
    spec: DEX_SQUARE_IMAGE_SPEC.label,
  },
  {
    id: 'link-website',
    label: 'Website',
    detail: 'Optional on Dex — recommended for fulfilment',
    required: false,
    products: ['token-ad'],
  },
  {
    id: 'link-x',
    label: 'X / Twitter',
    detail: 'Optional Token Advertising link',
    required: false,
    products: ['token-ad'],
  },
  {
    id: 'link-telegram',
    label: 'Telegram',
    detail: 'Optional Token Advertising link',
    required: false,
    products: ['token-ad'],
  },
  {
    id: 'link-discord',
    label: 'Discord',
    detail: 'Optional Token Advertising link',
    required: false,
    products: ['token-ad'],
  },
  {
    id: 'eti-description',
    label: 'Project description (Enhanced Info)',
    detail: 'Plain text on the pair details page',
    required: true,
    products: ['token-info'],
  },
  {
    id: 'eti-icon',
    label: 'Token icon (Enhanced Info)',
    detail: 'Square icon for the pair page',
    required: true,
    products: ['token-info'],
    spec: DEX_ICON_IMAGE_SPEC.label,
  },
  {
    id: 'eti-header',
    label: 'Token header (Enhanced Info)',
    detail: 'Wide strip on the token profile',
    required: true,
    products: ['token-info'],
    spec: DEX_HEADER_IMAGE_SPEC.label,
  },
];

export type DexAdPackAssets = {
  adTitle: string;
  adPitch: string;
  /** Square 1:1 creative for Token Ad + Trending Bar */
  squareImageUrl: string | null;
  websiteUrl: string;
  xUrl: string;
  telegramUrl: string;
  discordUrl: string;
  /** Enhanced Token Info */
  etiDescription: string;
  etiIconUrl: string | null;
  etiHeaderUrl: string | null;
  etiSupplyDescription: string;
};

export const EMPTY_DEX_AD_PACK: DexAdPackAssets = {
  adTitle: '',
  adPitch: '',
  squareImageUrl: null,
  websiteUrl: '',
  xUrl: '',
  telegramUrl: '',
  discordUrl: '',
  etiDescription: '',
  etiIconUrl: null,
  etiHeaderUrl: null,
  etiSupplyDescription: '',
};

/** Normalize partial / legacy stored packs. */
export function normalizeDexAdPack(
  partial?: Partial<DexAdPackAssets> | null,
): DexAdPackAssets {
  return { ...EMPTY_DEX_AD_PACK, ...(partial || {}) };
}

export function tokenAdPackReady(pack: DexAdPackAssets): boolean {
  return Boolean(
    pack.adTitle.trim().length > 0 &&
      pack.adTitle.trim().length <= 50 &&
      pack.adPitch.trim().length > 0 &&
      pack.adPitch.trim().length <= 120 &&
      pack.squareImageUrl,
  );
}

export function trendingBarPackReady(pack: DexAdPackAssets): boolean {
  return Boolean(
    pack.adTitle.trim().length > 0 &&
      pack.adTitle.trim().length <= 50 &&
      pack.squareImageUrl,
  );
}

export function tokenInfoPackReady(pack: DexAdPackAssets): boolean {
  return Boolean(
    pack.etiDescription.trim().length > 0 &&
      pack.etiIconUrl &&
      pack.etiHeaderUrl,
  );
}

/** Boosts need only a mint (provided by the project at Approve). */
export function boostPackReady(mint?: string | null): boolean {
  return Boolean(mint && String(mint).trim().length >= 32);
}

/** Update socials — at least one link required. */
export function socialsUpdatePackReady(pack: DexAdPackAssets): boolean {
  return Boolean(
    pack.websiteUrl?.trim() ||
      pack.xUrl?.trim() ||
      pack.telegramUrl?.trim() ||
      pack.discordUrl?.trim(),
  );
}

export function dexPaidAdsPackReady(pack: DexAdPackAssets): boolean {
  return tokenAdPackReady(pack) && trendingBarPackReady(pack);
}

function keyFamily(id: string): string {
  const k = String(id);
  if (k.startsWith('dex-boost')) return 'boost';
  if (k.startsWith('dex-token-ad')) return 'token-ad';
  if (k.startsWith('dex-trending')) return 'trending';
  if (k === 'dex-token-info') return 'token-info';
  if (k === 'dex-update-socials' || k === 'dex-socials') return 'update-socials';
  return k;
}

function needsTokenAd(set: Set<string>): boolean {
  for (const id of set) {
    if (keyFamily(id) === 'token-ad') return true;
  }
  return false;
}

function needsTrending(set: Set<string>): boolean {
  for (const id of set) {
    if (keyFamily(id) === 'trending') return true;
  }
  return false;
}

function needsBoost(set: Set<string>): boolean {
  for (const id of set) {
    if (keyFamily(id) === 'boost') return true;
  }
  return false;
}

function needsSocials(set: Set<string>): boolean {
  for (const id of set) {
    if (keyFamily(id) === 'update-socials') return true;
  }
  return false;
}

/** Pack ready for the selected roadmap spend ids. */
export function dexPackReadyForSpends(
  pack: DexAdPackAssets,
  spendIds: Iterable<string>,
  mint?: string | null,
): boolean {
  const set = new Set(spendIds);
  if (needsTokenAd(set) && !tokenAdPackReady(pack)) return false;
  if (needsTrending(set) && !trendingBarPackReady(pack)) return false;
  if (set.has('dex-token-info') && !tokenInfoPackReady(pack)) return false;
  if (needsBoost(set) && !boostPackReady(mint)) return false;
  if (needsSocials(set) && !socialsUpdatePackReady(pack)) return false;
  return true;
}

/** Missing items across all creative products (wizard summary). */
export function dexAdPackMissing(pack: DexAdPackAssets): string[] {
  const missing: string[] = [];
  if (!pack.adTitle.trim()) missing.push('Ad title');
  else if (pack.adTitle.trim().length > 50) missing.push('Ad title (max 50 chars)');
  if (!pack.adPitch.trim()) missing.push('Ad pitch (Token Advertising)');
  else if (pack.adPitch.trim().length > 120) missing.push('Ad pitch (max 120 chars)');
  if (!pack.squareImageUrl) missing.push('Square ad image (1:1)');
  if (!pack.etiDescription.trim()) missing.push('ETI description');
  if (!pack.etiIconUrl) missing.push('ETI icon (1:1)');
  if (!pack.etiHeaderUrl) missing.push('ETI header (3:1)');
  if (!socialsUpdatePackReady(pack)) missing.push('At least one social / website link');
  return missing;
}

/** Missing items only for selected spends (Approve gate). */
export function dexAdPackMissingForSpends(
  pack: DexAdPackAssets,
  spendIds: Iterable<string>,
  mint?: string | null,
): string[] {
  const set = new Set(spendIds);
  const missing: string[] = [];
  if (needsTokenAd(set)) {
    if (!pack.adTitle.trim()) missing.push('Token Ad: title');
    else if (pack.adTitle.trim().length > 50) missing.push('Token Ad: title (max 50)');
    if (!pack.adPitch.trim()) missing.push('Token Ad: pitch');
    else if (pack.adPitch.trim().length > 120) missing.push('Token Ad: pitch (max 120)');
    if (!pack.squareImageUrl) missing.push('Token Ad: square image');
  }
  if (needsTrending(set)) {
    if (!pack.adTitle.trim()) missing.push('Trending Bar: title');
    else if (pack.adTitle.trim().length > 50) missing.push('Trending Bar: title (max 50)');
    if (!pack.squareImageUrl) missing.push('Trending Bar: square image');
  }
  if (set.has('dex-token-info')) {
    if (!pack.etiDescription.trim()) missing.push('Token Info: description');
    if (!pack.etiIconUrl) missing.push('Token Info: icon');
    if (!pack.etiHeaderUrl) missing.push('Token Info: header');
  }
  if (needsBoost(set) && !boostPackReady(mint)) {
    missing.push('Boosts: token mint required');
  }
  if (needsSocials(set) && !socialsUpdatePackReady(pack)) {
    missing.push('Update socials: at least one link (website / X / TG / Discord)');
  }
  return missing;
}

export function dexAdPackSoftWarnings(pack: DexAdPackAssets): string[] {
  const warnings: string[] = [];
  if (!pack.websiteUrl?.trim() && !pack.xUrl?.trim() && !pack.telegramUrl?.trim()) {
    warnings.push(
      'No website or socials — optional on Token Ad, but raises reject/modify risk',
    );
  }
  return warnings;
}

export const DEX_AD_PACK_BLOCK_COPY =
  'Polessia cannot place DexScreener ads until required creatives are on file. Pick exact packs on Dex Ads. Boosts need mint only. Update socials needs at least one link. Founder owns Dex — we never claim your token profile.';
