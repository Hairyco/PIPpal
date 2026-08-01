/**
 * Campaign collateral checklists per platform.
 * Marketing-wallet spend pays for placements — these assets still have to exist first.
 */

export type CollateralItem = {
  id: string;
  label: string;
  detail: string;
  /** Spec hint shown next to the item */
  spec?: string;
};

export type PlatformCollateral = {
  id: string;
  name: string;
  logo: string;
  summary: string;
  items: CollateralItem[];
};

/** DexScreener enhanced token info / ads — ratios confirmed from their upload cropper. */
export const PLATFORM_COLLATERAL: PlatformCollateral[] = [
  {
    id: 'dexscreener',
    name: 'DexScreener',
    logo: '/images/partners/dexscreener.ico',
    summary:
      'Paid placements and enhanced info need creative ready before the wallet pays. Header is a wide 3:1 strip — not a square logo.',
    items: [
      {
        id: 'ds-icon',
        label: 'Token icon',
        detail: 'Square mark for lists and the pair header',
        spec: '1:1 · PNG/JPG/WebP · max ~4.5 MB',
      },
      {
        id: 'ds-header',
        label: 'Token header / banner',
        detail: 'Wide strip on the token profile (cropper enforces ratio)',
        spec: '3:1 · recommend 1200×400',
      },
      {
        id: 'ds-desc',
        label: 'Short description',
        detail: 'Plain text under the logo — keep it tight',
        spec: '~180–200 chars',
      },
      {
        id: 'ds-socials',
        label: 'Social + website links',
        detail: 'X, Telegram, Discord, site — validated URLs',
      },
      {
        id: 'ds-pay',
        label: 'Wallet ready to pay DexScreener',
        detail: 'Enhanced info / boost / ads are paid on their side — wallet balance alone is not enough without assets above',
      },
    ],
  },
  {
    id: 'coingecko',
    name: 'CoinGecko',
    logo: '/images/partners/coingecko.svg',
    summary: 'CTO listing needs clean branding and proof links before you spend listing fees.',
    items: [
      {
        id: 'cg-logo',
        label: 'Logo',
        detail: 'Clean square asset that reads at small sizes',
        spec: '1:1 · PNG preferred',
      },
      {
        id: 'cg-desc',
        label: 'Project description',
        detail: 'What the CTO is and why it exists',
      },
      {
        id: 'cg-links',
        label: 'Website + socials',
        detail: 'Live links Dex/CG reviewers can open',
      },
    ],
  },
  {
    id: 'telegram',
    name: 'Telegram',
    logo: '/images/partners/telegram.svg',
    summary: 'Pinned raids and call-outs need pack assets ready before Polessia spends.',
    items: [
      {
        id: 'tg-logo',
        label: 'Group avatar',
        detail: 'Matches the coin logo',
        spec: '1:1',
      },
      {
        id: 'tg-banner',
        label: 'Raid / pin graphic',
        detail: 'Optional wide visual for pinned announcements',
        spec: '16:9 or 3:1 works',
      },
      {
        id: 'tg-copy',
        label: 'Pin copy + CA',
        detail: 'Official contract and links ready to paste',
      },
    ],
  },
  {
    id: 'x',
    name: 'X / Twitter',
    logo: '',
    summary: 'Profile + header should match Dex before you boost attention.',
    items: [
      {
        id: 'x-avatar',
        label: 'Profile photo',
        detail: 'Same mark as the token icon',
        spec: '1:1',
      },
      {
        id: 'x-header',
        label: 'Profile header',
        detail: 'Wide brand strip — close to Dex header framing',
        spec: '3:1 · ~1500×500',
      },
    ],
  },
];

export const DEXSCREENER_HEADER = {
  ratioLabel: '3:1',
  width: 1200,
  height: 400,
  note: 'DexScreener header cropper enforces 3:1. Generate or upload at 1200×400.',
} as const;
