import { ctoProjects, resolveV1Mint, shortMint } from '../data/ctoProjects';
import { generateCtoLogoDataUrl } from './ctoCollateralGenerate';

export type LaunchCoinMeta = {
  mint: string;
  name: string;
  ticker: string;
  logoUrl: string;
  source: 'catalog' | 'pump-demo';
  venueLabel: string;
  blurb: string;
};

function hashSeed(input: string): number {
  return input.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

const DEMO_NAMES = [
  ['Rug Rabbit', 'RRBT'],
  ['Ghost Founder', 'GHOST'],
  ['Dump Daily', 'DUMP'],
  ['Exit Liquidity', 'EXIT'],
  ['Moon Pigeon', 'MPEG'],
  ['Pixel Goblin', 'GOB'],
  ['Night Shift', 'NITE'],
  ['Cashback Cat', 'CBACK'],
];

/**
 * Resolve coin metadata for the Launch Wizard.
 * Prefers catalog matches; otherwise synthesizes a Pump-style demo from the mint
 * until a live Pump/DexScreener API is wired.
 */
export async function resolveLaunchCoin(mintRaw: string): Promise<LaunchCoinMeta | null> {
  const mint = mintRaw.trim();
  if (mint.length < 32) return null;

  // Simulate network lookup.
  await new Promise((r) => setTimeout(r, 450));

  const catalogHit = ctoProjects.find((p) => resolveV1Mint(p) === mint || p.v1Mint === mint);
  if (catalogHit) {
    const logoUrl =
      catalogHit.logo ||
      generateCtoLogoDataUrl({
        projectName: catalogHit.name,
        ticker: catalogHit.ticker,
      });
    return {
      mint,
      name: catalogHit.name,
      ticker: catalogHit.ticker,
      logoUrl,
      source: 'catalog',
      venueLabel: catalogHit.sourceVenue ?? 'Solana',
      blurb: `${catalogHit.name} community takeover on CTOgo.`,
    };
  }

  const seed = hashSeed(mint);
  const [name, ticker] = DEMO_NAMES[seed % DEMO_NAMES.length];
  const logoUrl = generateCtoLogoDataUrl({ projectName: name, ticker, salt: seed });

  return {
    mint,
    name,
    ticker,
    logoUrl,
    source: 'pump-demo',
    venueLabel: 'Pump.fun',
    blurb: `${name} community takeover — relaunched on CTOgo.`,
  };
}

export function formatMintPreview(mint: string): string {
  return shortMint(mint.trim());
}
