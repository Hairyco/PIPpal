/** Fixed meme-coin 1-pager theme — structure stays locked; colors + light design notes vary. */

export type OnePagerThemeId =
  | 'white'
  | 'black'
  | 'red'
  | 'blue'
  | 'yellow'
  | 'green'
  | 'orange'
  | 'purple'
  | 'pink'
  | 'cyan'
  | 'lime'
  | 'gold'
  | 'teal'
  | 'magenta'
  | 'coral'
  | 'indigo'
  | 'violet'
  /** Legacy aliases kept for older drafts / previews. */
  | 'shib-red'
  | 'hot-pink';

export type OnePagerThemeTier = 'primary' | 'bespoke';

export type OnePagerTheme = {
  id: OnePagerThemeId;
  label: string;
  tier: OnePagerThemeTier;
  /** Swatch shown in the color bar. */
  swatch: string;
  bg: string;
  accent: string;
  accentSoft: string;
  text: string;
  muted: string;
  buyText: string;
};

function theme(
  id: OnePagerThemeId,
  label: string,
  tier: OnePagerThemeTier,
  accent: string,
  accentSoft: string,
  bg: string,
  buyText: string,
): OnePagerTheme {
  return {
    id,
    label,
    tier,
    swatch: accent,
    bg,
    accent,
    accentSoft,
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.75)',
    buyText,
  };
}

/** Classic primary accents — white / black first, then colour primaries. */
export const ONE_PAGER_PRIMARY_THEMES: OnePagerTheme[] = [
  theme('white', 'White', 'primary', '#ffffff', '#f3f3f3', '#0a0a0a', '#0a0a0a'),
  theme('black', 'Black', 'primary', '#111111', '#2a2a2a', '#f6f6f4', '#f6f6f4'),
  theme('red', 'Red', 'primary', '#e11d2e', '#ff3b4a', '#141414', '#ffffff'),
  theme('blue', 'Blue', 'primary', '#2563eb', '#60a5fa', '#0a1020', '#ffffff'),
  theme('yellow', 'Yellow', 'primary', '#f5c518', '#ffe566', '#12100a', '#12100a'),
  theme('green', 'Green', 'primary', '#22c55e', '#4ade80', '#0a1410', '#0a1410'),
];

/** Extra accents when they want something more bespoke. */
export const ONE_PAGER_BESPOKE_THEMES: OnePagerTheme[] = [
  theme('orange', 'Orange', 'bespoke', '#ff7a1a', '#ff9a4d', '#120e0a', '#120e0a'),
  theme('purple', 'Purple', 'bespoke', '#8b5cf6', '#a78bfa', '#100a18', '#ffffff'),
  theme('pink', 'Pink', 'bespoke', '#ff2d95', '#ff6bb5', '#140810', '#ffffff'),
  theme('cyan', 'Cyan', 'bespoke', '#2ee6ff', '#7af0ff', '#071018', '#071018'),
  theme('lime', 'Lime', 'bespoke', '#c8ff3d', '#d5ff69', '#090b14', '#090b14'),
  theme('gold', 'Gold', 'bespoke', '#d4a017', '#f0c14b', '#12100a', '#12100a'),
  theme('teal', 'Teal', 'bespoke', '#14b8a6', '#5eead4', '#071412', '#071412'),
  theme('magenta', 'Magenta', 'bespoke', '#d946ef', '#e879f9', '#140814', '#ffffff'),
  theme('coral', 'Coral', 'bespoke', '#ff6b4a', '#ff8f75', '#14100e', '#14100e'),
  theme('indigo', 'Indigo', 'bespoke', '#6366f1', '#818cf8', '#0c0e1a', '#ffffff'),
  theme('violet', 'Violet', 'bespoke', '#a855f7', '#c084fc', '#120a18', '#ffffff'),
];

export const ONE_PAGER_THEMES: OnePagerTheme[] = [
  ...ONE_PAGER_PRIMARY_THEMES,
  ...ONE_PAGER_BESPOKE_THEMES,
];

const LEGACY_THEME_MAP: Record<string, OnePagerThemeId> = {
  'shib-red': 'red',
  'hot-pink': 'pink',
};

export const DEFAULT_ONE_PAGER_THEME_ID: OnePagerThemeId = 'white';

export function getOnePagerTheme(id: OnePagerThemeId | string | undefined): OnePagerTheme {
  const resolved = (id && LEGACY_THEME_MAP[id]) || id;
  return ONE_PAGER_THEMES.find((t) => t.id === resolved) ?? ONE_PAGER_PRIMARY_THEMES[0];
}

export function isBespokeOnePagerTheme(id: OnePagerThemeId | string | undefined): boolean {
  const themeMatch = getOnePagerTheme(id);
  return themeMatch.tier === 'bespoke';
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
  const base = blurb.trim();
  if (!base) return '';
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
  { id: 'community', label: 'Holders', hint: 'Holder callout' },
];

export const DEFAULT_ONE_PAGER_INCLUDES: OnePagerIncludes = {
  chart: true,
  tokenomics: true,
  socials: true,
  howto: false,
  community: false,
};

/** Creative layout directions — generate picks freely; not one locked meme template. */
export type OnePagerLayoutId = 'aurora' | 'editorial' | 'noir' | 'brutal' | 'gallery';

export const ONE_PAGER_LAYOUTS: {
  id: OnePagerLayoutId;
  label: string;
  hint: string;
}[] = [
  { id: 'aurora', label: 'Aurora', hint: 'Glow, depth, modern crypto' },
  { id: 'editorial', label: 'Editorial', hint: 'Magazine polish' },
  { id: 'noir', label: 'Noir', hint: 'Cinematic & sharp' },
  { id: 'brutal', label: 'Brutal', hint: 'Oversized type energy' },
  { id: 'gallery', label: 'Gallery', hint: 'Art-first, quiet luxury' },
];

export type OnePagerLayoutPreference = OnePagerLayoutId | 'auto';

export function resolveOnePagerLayout(
  preference: OnePagerLayoutPreference | undefined,
  seed: number,
): OnePagerLayoutId {
  if (preference && preference !== 'auto') return preference;
  return ONE_PAGER_LAYOUTS[Math.abs(seed) % ONE_PAGER_LAYOUTS.length].id;
}

/** Advance to the next layout — used by “Try another look” so the page visibly changes. */
export function nextOnePagerLayout(current: OnePagerLayoutId): OnePagerLayoutId {
  const idx = ONE_PAGER_LAYOUTS.findIndex((l) => l.id === current);
  const safe = idx >= 0 ? idx : 0;
  return ONE_PAGER_LAYOUTS[(safe + 1) % ONE_PAGER_LAYOUTS.length].id;
}

/** Split multifunctional site copy into paragraphs for layout. */
export function splitSiteCopy(body: string): string[] {
  return body
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Finished-looking copy when the founder leaves fields blank — so generate never looks empty. */
export function defaultGeneratedSiteCopy(name: string, ticker: string) {
  const coin = name.trim() || 'This coin';
  const tick = ticker.trim().replace(/^\$/, '').toUpperCase() || 'CTO';
  return {
    headline: `${coin} is live`,
    body: [
      `${coin} ($${tick}) — new mint, clean page, and a clear way to buy.`,
      `Trade on CTOgo. Share the link. Keep the story sharp without the noise.`,
      `Contract, chart, and buy — all on one page.`,
    ].join('\n\n'),
    extraTitle: 'Why this page',
    extraBody: [
      'One place for the coin, the story, and the trade link.',
      'Keep it simple. Keep it loud where it matters.',
    ].join('\n\n'),
  };
}
