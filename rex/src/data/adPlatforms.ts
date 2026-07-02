/** Advertising & growth channels — sourced from degen/meme coin ecosystem inventory. */

export type AdPlatformCategory =
  | 'chat-native'
  | 'charting'
  | 'ad-network'
  | 'direct-media'
  | 'agency';

export type ApprovalStatus =
  | 'recommended'
  | 'pending-pm'
  | 'approved'
  | 'active'
  | 'completed';

export interface AdPlatformOption {
  id: string;
  name: string;
  description: string;
  costFrom: number;
  costTo?: number;
  duration: string;
  /** KYC required to swap away from Rex default */
  kycRequired?: boolean;
}

export interface AdPlatform {
  id: string;
  name: string;
  category: AdPlatformCategory;
  logo: string;
  brandColor: string;
  tagline: string;
  options: AdPlatformOption[];
}

export const adPlatformCategories: Record<
  AdPlatformCategory,
  { label: string; description: string }
> = {
  'chat-native': {
    label: 'Chat & community',
    description: 'Telegram call groups, pinned calls, and native channel ads — first momentum.',
  },
  charting: {
    label: 'Charting & trackers',
    description: 'DEX Screener, CMC, CoinGecko — high-intent trader traffic.',
  },
  'ad-network': {
    label: 'Crypto ad networks',
    description: 'Programmatic banners across crypto news, dashboards, and faucets.',
  },
  'direct-media': {
    label: 'Direct media buys',
    description: 'Block explorers, tier-1 newsrooms, homepage takeovers.',
  },
  agency: {
    label: 'Growth agencies',
    description: 'Coordinated callers, viral raids, and full-stack social ops.',
  },
};

export const adPlatforms: AdPlatform[] = [
  {
    id: 'telegram-calls',
    name: 'Telegram call groups',
    category: 'chat-native',
    logo: '/images/partners/telegram.svg',
    brandColor: '#229ED9',
    tagline: 'Paid caller groups — pinned shills & AMA slots',
    options: [
      {
        id: 'tg-call-basic',
        name: 'Call-out post',
        description: 'Single shill/call update with contract address in a mid-tier caller group.',
        costFrom: 75,
        costTo: 200,
        duration: '24h',
      },
      {
        id: 'tg-call-pinned',
        name: 'Pinned message (24–72h)',
        description: 'Message locked to top of a public caller channel for sustained visibility.',
        costFrom: 150,
        costTo: 400,
        duration: '24–72h',
      },
      {
        id: 'tg-call-ama',
        name: 'AMA slot',
        description: 'Dedicated text or voice AMA window with a crypto influencer caller.',
        costFrom: 300,
        costTo: 800,
        duration: '1 session',
        kycRequired: true,
      },
    ],
  },
  {
    id: 'telegram-ads',
    name: 'Telegram Ad Platform',
    category: 'chat-native',
    logo: '/images/partners/telegram.svg',
    brandColor: '#229ED9',
    tagline: 'Native text ads at the bottom of large public channels',
    options: [
      {
        id: 'tg-ad-text',
        name: 'Channel text ad',
        description: 'Single-sentence native ad served in high-traffic public channels.',
        costFrom: 100,
        costTo: 350,
        duration: '7 days',
      },
    ],
  },
  {
    id: 'thekollab',
    name: 'theKOLLAB',
    category: 'agency',
    logo: '/images/partners/thekollab.svg',
    brandColor: '#a855f7',
    tagline: 'Alpha caller syndicate — simultaneous multi-account calls',
    options: [
      {
        id: 'kollab-burst',
        name: 'Syndicate call burst',
        description: 'Coordinated calls across dozens of accounts to simulate organic trend.',
        costFrom: 500,
        costTo: 1500,
        duration: '48h window',
        kycRequired: true,
      },
    ],
  },
  {
    id: 'dexscreener',
    name: 'DEX Screener',
    category: 'charting',
    logo: '/images/partners/dexscreener.ico',
    brandColor: '#00c805',
    tagline: 'Enhanced info, banners & trending visibility',
    options: [
      {
        id: 'ds-enhanced',
        name: 'Enhanced token info',
        description: 'Logo, website, socials, and custom banner on your pair profile.',
        costFrom: 299,
        duration: 'One-time',
      },
      {
        id: 'ds-banner',
        name: 'Banner marketplace',
        description: 'Programmatic banner impressions on competing project charts.',
        costFrom: 299,
        costTo: 2500,
        duration: 'Impression pack',
      },
      {
        id: 'ds-trending',
        name: 'Trending bar push',
        description: 'Volume/engagement coordination to trigger trending dashboard inclusion.',
        costFrom: 300,
        costTo: 1000,
        duration: 'Campaign',
        kycRequired: true,
      },
    ],
  },
  {
    id: 'dextools',
    name: 'DEXTools',
    category: 'charting',
    logo: '/images/partners/dextools.svg',
    brandColor: '#0ea5e9',
    tagline: 'Pair spotlight & featured placement',
    options: [
      {
        id: 'dx-spotlight',
        name: 'Spotlight placement',
        description: 'Featured pair spotlight on DEXTools for active traders.',
        costFrom: 7500,
        duration: '7 days',
      },
    ],
  },
  {
    id: 'coinzilla',
    name: 'Coinzilla',
    category: 'ad-network',
    logo: '/images/partners/coinzilla.svg',
    brandColor: '#f97316',
    tagline: 'Programmatic banners, pop-unders & sticky mobile',
    options: [
      {
        id: 'cz-display',
        name: 'Display campaign',
        description: 'HTML5 banners across crypto news outlets and dashboards.',
        costFrom: 2500,
        costTo: 8000,
        duration: '14 days',
      },
      {
        id: 'cz-popunder',
        name: 'Pop-under script',
        description: 'Background tab open to chart/site — high-velocity degen traffic.',
        costFrom: 1500,
        costTo: 5000,
        duration: '7 days',
        kycRequired: true,
      },
    ],
  },
  {
    id: 'bitmedia',
    name: 'Bitmedia.io',
    category: 'ad-network',
    logo: '/images/partners/bitmedia.svg',
    brandColor: '#6366f1',
    tagline: 'Flexible CPC/CPM for smaller initial budgets',
    options: [
      {
        id: 'bm-cpm',
        name: 'CPM banner run',
        description: 'Accessible programmatic banners with click-fraud filters.',
        costFrom: 500,
        costTo: 2000,
        duration: '14 days',
      },
    ],
  },
  {
    id: 'blockchain-ads',
    name: 'Blockchain-Ads',
    category: 'ad-network',
    logo: '/images/partners/blockchain-ads.svg',
    brandColor: '#14b8a6',
    tagline: 'On-chain wallet targeting for active swappers',
    options: [
      {
        id: 'ba-wallet',
        name: 'Wallet-targeted banners',
        description: 'Show ads to addresses linked to meme holders and DEX swappers.',
        costFrom: 2000,
        costTo: 6000,
        duration: '14 days',
        kycRequired: true,
      },
    ],
  },
  {
    id: 'cointraffic',
    name: 'Cointraffic',
    category: 'ad-network',
    logo: '/images/partners/cointraffic.svg',
    brandColor: '#eab308',
    tagline: 'Native in-article ads on curated crypto publishers',
    options: [
      {
        id: 'ct-native',
        name: 'Native article ads',
        description: 'Side-panel slide-ins and floating mobile overlays on news domains.',
        costFrom: 800,
        costTo: 3000,
        duration: '14 days',
      },
    ],
  },
  {
    id: 'coinsniper',
    name: 'CoinSniper',
    category: 'charting',
    logo: '/images/partners/coinsniper.svg',
    brandColor: '#ef4444',
    tagline: 'Promoted pinned grid & interstitial pop-ups',
    options: [
      {
        id: 'cs-featured',
        name: 'Featured pinned grid',
        description: 'Fixed to top row on home page, bypassing organic vote counters.',
        costFrom: 200,
        costTo: 600,
        duration: '7 days',
      },
      {
        id: 'cs-popup',
        name: 'Interstitial pop-up',
        description: 'Full-screen ad on site visit or upvote attempt.',
        costFrom: 350,
        costTo: 900,
        duration: '7 days',
      },
    ],
  },
  {
    id: 'coinmarketcap',
    name: 'CoinMarketCap',
    category: 'charting',
    logo: '/images/partners/coinmarketcap.svg',
    brandColor: '#3861fb',
    tagline: 'Sponsored search & premium banners',
    options: [
      {
        id: 'cmc-search',
        name: 'Sponsored search dropdown',
        description: 'Pinned recommendation when users search for assets.',
        costFrom: 3000,
        costTo: 8000,
        duration: '30 days',
        kycRequired: true,
      },
    ],
  },
  {
    id: 'coingecko',
    name: 'CoinGecko',
    category: 'charting',
    logo: '/images/partners/coingecko.svg',
    brandColor: '#8dc647',
    tagline: 'Community boosting & native timeline placement',
    options: [
      {
        id: 'cg-boost',
        name: 'Community boost',
        description: 'Sponsored placement in proprietary social timelines.',
        costFrom: 1500,
        costTo: 4000,
        duration: '14 days',
        kycRequired: true,
      },
    ],
  },
  {
    id: 'solscan',
    name: 'Solscan',
    category: 'direct-media',
    logo: '/images/partners/solscan.svg',
    brandColor: '#9945FF',
    tagline: 'Block explorer header/footer banners',
    options: [
      {
        id: 'solscan-banner',
        name: 'Explorer banner',
        description: 'Capture traders confirming swap completion on-chain.',
        costFrom: 2000,
        costTo: 5000,
        duration: '7 days',
        kycRequired: true,
      },
    ],
  },
  {
    id: 'surgence',
    name: 'Surgence Labs',
    category: 'agency',
    logo: '/images/partners/surgence.svg',
    brandColor: '#ec4899',
    tagline: 'Twitter viral raids & Solana influencer alignment',
    options: [
      {
        id: 'sur-raid',
        name: 'Viral raid package',
        description: 'Coordinated X raids and top-tier ecosystem influencer posts.',
        costFrom: 2500,
        costTo: 8000,
        duration: 'Campaign',
        kycRequired: true,
      },
    ],
  },
  {
    id: 'whiz',
    name: 'Whiz Marketers',
    category: 'agency',
    logo: '/images/partners/whiz.svg',
    brandColor: '#22c55e',
    tagline: 'Pre-launch Telegram scaling & pump.fun dynamics',
    options: [
      {
        id: 'whiz-prelaunch',
        name: 'Pre-bonding social push',
        description: 'Guerrilla Telegram scaling and community asset design before graduation.',
        costFrom: 1000,
        costTo: 3500,
        duration: '14 days',
      },
    ],
  },
];

export function getAdPlatform(id: string): AdPlatform | undefined {
  return adPlatforms.find((p) => p.id === id);
}

export function getAdPlatformOption(platformId: string, optionId: string): AdPlatformOption | undefined {
  return getAdPlatform(platformId)?.options.find((o) => o.id === optionId);
}

export function formatAdCost(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  }
  return `$${amount}`;
}
