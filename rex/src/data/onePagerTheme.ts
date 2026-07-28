/** Fixed meme-coin 1-pager theme — structure stays locked; colors + light design notes vary. */

export type OnePagerThemeId =
  | 'shib-red'
  | 'lime'
  | 'orange'
  | 'cyan'
  | 'hot-pink'
  | 'gold';

export type OnePagerTheme = {
  id: OnePagerThemeId;
  label: string;
  /** Swatch shown in the color bar. */
  swatch: string;
  bg: string;
  accent: string;
  accentSoft: string;
  text: string;
  muted: string;
  buyText: string;
};

export const ONE_PAGER_THEMES: OnePagerTheme[] = [
  {
    id: 'shib-red',
    label: 'Red',
    swatch: '#e11d2e',
    bg: '#141414',
    accent: '#e11d2e',
    accentSoft: '#ff3b4a',
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.78)',
    buyText: '#ffffff',
  },
  {
    id: 'lime',
    label: 'Lime',
    swatch: '#c8ff3d',
    bg: '#090b14',
    accent: '#c8ff3d',
    accentSoft: '#d5ff69',
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.72)',
    buyText: '#090b14',
  },
  {
    id: 'orange',
    label: 'Orange',
    swatch: '#ff7a1a',
    bg: '#120e0a',
    accent: '#ff7a1a',
    accentSoft: '#ff9a4d',
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.75)',
    buyText: '#120e0a',
  },
  {
    id: 'cyan',
    label: 'Cyan',
    swatch: '#2ee6ff',
    bg: '#071018',
    accent: '#2ee6ff',
    accentSoft: '#7af0ff',
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.72)',
    buyText: '#071018',
  },
  {
    id: 'hot-pink',
    label: 'Pink',
    swatch: '#ff2d95',
    bg: '#140810',
    accent: '#ff2d95',
    accentSoft: '#ff6bb5',
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.75)',
    buyText: '#ffffff',
  },
  {
    id: 'gold',
    label: 'Gold',
    swatch: '#f5c518',
    bg: '#12100a',
    accent: '#f5c518',
    accentSoft: '#ffd84d',
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.75)',
    buyText: '#12100a',
  },
];

export const DEFAULT_ONE_PAGER_THEME_ID: OnePagerThemeId = 'shib-red';

export function getOnePagerTheme(id: OnePagerThemeId | string | undefined): OnePagerTheme {
  return ONE_PAGER_THEMES.find((t) => t.id === id) ?? ONE_PAGER_THEMES[0];
}

/** Design notes the AI (or local parser) may honor — template structure never changes. */
export const ONE_PAGER_DESIGN_LIMITS = {
  maxChars: 160,
  allowed:
    'Colour intensity, louder/quieter title, bigger/smaller mascot, punchier blurb wording, show/hide tokenomics strip. Layout stays fixed.',
  blocked: 'No new sections, no different page layout, no removing Buy / CA.',
} as const;

export type OnePagerDesignTweaks = {
  loudTitle: boolean;
  bigMascot: boolean;
  showTokenomics: boolean;
  punchyBlurb: boolean;
};

export const DEFAULT_DESIGN_TWEAKS: OnePagerDesignTweaks = {
  loudTitle: true,
  bigMascot: true,
  showTokenomics: true,
  punchyBlurb: false,
};

/** Local, free interpretation of the design comment — same knobs AI will use later. */
export function parseOnePagerDesignNote(note: string): OnePagerDesignTweaks {
  const t = note.toLowerCase();
  return {
    loudTitle: !/\b(quieter|smaller title|less loud|subtle title)\b/.test(t),
    bigMascot: !/\b(smaller (logo|mascot|image)|tiny mascot)\b/.test(t),
    showTokenomics: !/\b(hide|no|without)\s+(tokenomics|stats|supply)\b/.test(t),
    punchyBlurb: /\b(punchy|louder copy|more meme|hype|aggressive)\b/.test(t),
  };
}

export function applyPunchyBlurb(blurb: string, ticker: string): string {
  const base = blurb.trim() || 'New mint. Same community.';
  const tick = ticker.trim().replace(/^\$/, '').toUpperCase() || 'TOKEN';
  if (/community|meme|degen|based/i.test(base)) return base.slice(0, 80);
  return `${base} $${tick} stays loud.`.slice(0, 80);
}

/** Optional blocks on the simple 1-pager — keep these light, not product features. */
export type OnePagerIncludeId =
  | 'chart'
  | 'tokenomics'
  | 'socials'
  | 'howto'
  | 'community';

export type OnePagerIncludes = Record<OnePagerIncludeId, boolean>;

export const ONE_PAGER_INCLUDE_OPTIONS: {
  id: OnePagerIncludeId;
  label: string;
  hint: string;
}[] = [
  { id: 'chart', label: 'Chart', hint: 'Simple price chart' },
  { id: 'tokenomics', label: 'Tokenomics', hint: 'Supply & fees' },
  { id: 'socials', label: 'Socials', hint: 'Telegram & X' },
  { id: 'howto', label: 'How to buy', hint: 'Short steps' },
  { id: 'community', label: 'Community', hint: 'Holder callout' },
];

export const DEFAULT_ONE_PAGER_INCLUDES: OnePagerIncludes = {
  chart: true,
  tokenomics: true,
  socials: true,
  howto: false,
  community: false,
};
