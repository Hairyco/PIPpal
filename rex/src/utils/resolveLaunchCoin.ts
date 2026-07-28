import { ctoProjects, resolveV1Mint, shortMint, type SourceVenue } from '../data/ctoProjects';
import { generateCtoLogoDataUrl } from './ctoCollateralGenerate';

export type LaunchCoinMeta = {
  mint: string;
  name: string;
  ticker: string;
  logoUrl: string;
  source: 'catalog' | 'demo';
  venueLabel: string;
  blurb: string;
};

function hashSeed(input: string): number {
  return input.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

const DEMO_COINS: { name: string; ticker: string; venue: SourceVenue }[] = [
  { name: 'Pepe Coin', ticker: 'PEPE', venue: 'Pump.fun' },
  { name: 'Ghost Founder', ticker: 'GHOST', venue: 'Moonshot' },
  { name: 'Dump Daily', ticker: 'DUMP', venue: 'Pump.fun' },
  { name: 'Exit Liquidity', ticker: 'EXIT', venue: 'Raydium' },
  { name: 'Moon Pigeon', ticker: 'MPEG', venue: 'LetsBonk' },
  { name: 'Pixel Goblin', ticker: 'GOB', venue: 'Pump.fun' },
  { name: 'Night Shift', ticker: 'NITE', venue: 'Moonshot' },
  { name: 'Cashback Cat', ticker: 'CBACK', venue: 'Raydium' },
];

/** Launch wizard default mint — always resolves to Pepe for a clear demo. */
export const LAUNCH_DEMO_MINT = '7xKp9mN2qR4sT6uV8wX0yZ1aB3cD5eF7gH9jK2mNp';

/**
 * Resolve coin metadata for the Launch Wizard.
 * Prefers catalog matches (any venue). Unknown mints get a demo placeholder
 * until live DexScreener / launchpad APIs are wired — venues are not Pump-only.
 */
export async function resolveLaunchCoin(mintRaw: string): Promise<LaunchCoinMeta | null> {
  const mint = mintRaw.trim();
  if (mint.length < 32) return null;

  await new Promise((r) => setTimeout(r, 450));

  if (mint === LAUNCH_DEMO_MINT) {
    const logoUrl = generateCtoLogoDataUrl({
      projectName: 'Pepe Coin',
      ticker: 'PEPE',
      salt: 7,
    });
    return {
      mint,
      name: 'Pepe Coin',
      ticker: 'PEPE',
      logoUrl,
      source: 'demo',
      venueLabel: 'Pump.fun',
      blurb: '',
    };
  }

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
      blurb: '',
    };
  }

  const seed = hashSeed(mint);
  const demo = DEMO_COINS[seed % DEMO_COINS.length];
  const logoUrl = generateCtoLogoDataUrl({
    projectName: demo.name,
    ticker: demo.ticker,
    salt: seed,
  });

  return {
    mint,
    name: demo.name,
    ticker: demo.ticker,
    logoUrl,
    source: 'demo',
    venueLabel: demo.venue,
    blurb: '',
  };
}

export function formatMintPreview(mint: string): string {
  return shortMint(mint.trim());
}
