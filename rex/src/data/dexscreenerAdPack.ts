/**
 * DexScreener Marketplace creative requirements — verified from live order forms
 * (Token Advertising + Trending Bar Advertising), Aug 2026.
 *
 * Polessia cannot place these ads without the pack on file.
 */

export type DexAdPackField = {
  id: string;
  label: string;
  detail: string;
  required: boolean;
  /** Applies to which Dex products */
  products: Array<'token-ad' | 'trending-bar' | 'token-info'>;
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

/** Enhanced Token Info only (not Token Ad / Trending Bar). */
export const DEX_HEADER_IMAGE_SPEC = {
  ratio: '3:1',
  example: '1500×500px',
  minWidthPx: 600,
  formats: ['png', 'jpg', 'webp', 'gif'] as const,
  maxMb: 4.5,
  label: '3:1 · PNG/JPG/WebP/GIF · min 600px wide · max 4.5 MB',
} as const;

export const DEXSCREENER_AD_PRODUCTS = {
  'token-ad': {
    id: 'token-ad' as const,
    name: 'Token Advertising',
    marketplacePath: '/product/ad',
    summary: 'In-feed token ads (views packages from $299).',
  },
  'trending-bar': {
    id: 'trending-bar' as const,
    name: 'Trending Bar Advertising',
    marketplacePath: '/product/trending-bar-ad',
    summary: 'Trending bar rotation ($2,000 / 24h and up).',
  },
  'token-info': {
    id: 'token-info' as const,
    name: 'Enhanced Token Info',
    marketplacePath: '/product/token-info',
    summary: 'Profile icon + 3:1 header + description on the pair page.',
  },
} as const;

/**
 * Fields founders must provide so Polessia can complete Dex order forms.
 * Token Ad + Trending Bar share the square image; Token Ad also needs pitch + links.
 */
export const DEXSCREENER_AD_PACK_FIELDS: DexAdPackField[] = [
  {
    id: 'ad-title',
    label: 'Ad title',
    detail: 'Short title shown on the Dex ad / trending chip',
    required: true,
    products: ['token-ad', 'trending-bar'],
  },
  {
    id: 'ad-pitch',
    label: 'Ad pitch',
    detail: 'Short description to get people interested (Token Advertising only)',
    required: true,
    products: ['token-ad'],
  },
  {
    id: 'ad-square-image',
    label: 'Square ad image',
    detail: 'Used for Token Advertising and Trending Bar uploads',
    required: true,
    products: ['token-ad', 'trending-bar'],
    spec: DEX_SQUARE_IMAGE_SPEC.label,
  },
  {
    id: 'link-website',
    label: 'Website',
    detail: 'Optional on Dex form — strongly recommended for Polessia fulfilment',
    required: false,
    products: ['token-ad'],
  },
  {
    id: 'link-x',
    label: 'X / Twitter',
    detail: 'Add X link on the Token Advertising form',
    required: false,
    products: ['token-ad'],
  },
  {
    id: 'link-telegram',
    label: 'Telegram',
    detail: 'Add Telegram link on the Token Advertising form',
    required: false,
    products: ['token-ad'],
  },
  {
    id: 'link-discord',
    label: 'Discord',
    detail: 'Add Discord link on the Token Advertising form',
    required: false,
    products: ['token-ad'],
  },
  {
    id: 'eti-icon',
    label: 'Token icon (Enhanced Info)',
    detail: 'Square icon for the Dex pair page',
    required: true,
    products: ['token-info'],
    spec: '1:1 · PNG/JPG/WebP/GIF · min 100px · max 4.5 MB',
  },
  {
    id: 'eti-header',
    label: 'Token header (Enhanced Info)',
    detail: 'Wide strip on the Dex pair page',
    required: true,
    products: ['token-info'],
    spec: DEX_HEADER_IMAGE_SPEC.label,
  },
  {
    id: 'eti-description',
    label: 'Project description (Enhanced Info)',
    detail: 'Plain text on the pair details page',
    required: true,
    products: ['token-info'],
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
};

export const EMPTY_DEX_AD_PACK: DexAdPackAssets = {
  adTitle: '',
  adPitch: '',
  squareImageUrl: null,
  websiteUrl: '',
  xUrl: '',
  telegramUrl: '',
  discordUrl: '',
};

/** Required to run Token Advertising via Polessia. */
export function tokenAdPackReady(pack: DexAdPackAssets): boolean {
  return Boolean(pack.adTitle.trim() && pack.adPitch.trim() && pack.squareImageUrl);
}

/** Required to run Trending Bar via Polessia. */
export function trendingBarPackReady(pack: DexAdPackAssets): boolean {
  return Boolean(pack.adTitle.trim() && pack.squareImageUrl);
}

export function dexPaidAdsPackReady(pack: DexAdPackAssets): boolean {
  return tokenAdPackReady(pack) && trendingBarPackReady(pack);
}

export function dexAdPackMissing(pack: DexAdPackAssets): string[] {
  const missing: string[] = [];
  if (!pack.adTitle.trim()) missing.push('Ad title');
  if (!pack.adPitch.trim()) missing.push('Ad pitch (Token Advertising)');
  if (!pack.squareImageUrl) missing.push('Square ad image (1:1)');
  return missing;
}

export const DEX_AD_PACK_BLOCK_COPY =
  'Polessia cannot place DexScreener Token Ads or Trending Bar until this pack is on file. If the marketing wallet unlocks those spends without media, the spend stays queued and you will be notified.';
