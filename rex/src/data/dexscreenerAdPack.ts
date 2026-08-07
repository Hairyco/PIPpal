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
    detail: 'Short title shown on the Dex ad / trending chip (max 50)',
    required: true,
    products: ['token-ad', 'trending-bar'],
    spec: 'max 50 characters',
  },
  {
    id: 'ad-pitch',
    label: 'Ad pitch',
    detail: 'Short description to get people interested (Token Advertising only, max 120)',
    required: true,
    products: ['token-ad'],
    spec: 'max 120 characters',
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

/** Required to run Token Advertising via Polessia (socials optional on Dex). */
export function tokenAdPackReady(pack: DexAdPackAssets): boolean {
  return Boolean(
    pack.adTitle.trim().length > 0 &&
      pack.adTitle.trim().length <= 50 &&
      pack.adPitch.trim().length > 0 &&
      pack.adPitch.trim().length <= 120 &&
      pack.squareImageUrl,
  );
}

/** Required to run Trending Bar via Polessia (pitch optional for trending-only). */
export function trendingBarPackReady(pack: DexAdPackAssets): boolean {
  return Boolean(
    pack.adTitle.trim().length > 0 &&
      pack.adTitle.trim().length <= 50 &&
      pack.squareImageUrl,
  );
}

export function dexPaidAdsPackReady(pack: DexAdPackAssets): boolean {
  return tokenAdPackReady(pack) && trendingBarPackReady(pack);
}

/** Pack ready for the selected roadmap spend ids (dynamic). */
export function dexPackReadyForSpends(
  pack: DexAdPackAssets,
  spendIds: Iterable<string>,
): boolean {
  const set = new Set(spendIds);
  const needsTokenAd = set.has('dex-socials');
  const needsTrending = set.has('dex-trending');
  if (!needsTokenAd && !needsTrending) return true;
  if (needsTokenAd && !tokenAdPackReady(pack)) return false;
  if (needsTrending && !trendingBarPackReady(pack)) return false;
  return true;
}

export function dexAdPackMissing(pack: DexAdPackAssets): string[] {
  const missing: string[] = [];
  if (!pack.adTitle.trim()) missing.push('Ad title');
  else if (pack.adTitle.trim().length > 50) missing.push('Ad title (max 50 chars)');
  if (!pack.adPitch.trim()) missing.push('Ad pitch (Token Advertising)');
  else if (pack.adPitch.trim().length > 120) missing.push('Ad pitch (max 120 chars)');
  if (!pack.squareImageUrl) missing.push('Square ad image (1:1)');
  return missing;
}

export function dexAdPackSoftWarnings(pack: DexAdPackAssets): string[] {
  const warnings: string[] = [];
  if (!pack.websiteUrl?.trim() && !pack.xUrl?.trim() && !pack.telegramUrl?.trim()) {
    warnings.push(
      'No website or socials — optional on Dex, but raises reject/modify risk',
    );
  }
  return warnings;
}

export const DEX_AD_PACK_BLOCK_COPY =
  'Polessia cannot place DexScreener Token Ads or Trending Bar until this pack is on file. If the marketing wallet unlocks those spends without media, the spend stays queued and you will be notified.';
