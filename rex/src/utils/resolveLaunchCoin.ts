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

const DEMO_COINS: {
  name: string;
  ticker: string;
  venue: SourceVenue;
  logo: string;
}[] = [
  { name: 'Pepe Coin', ticker: 'PEPE', venue: 'Pump.fun', logo: '/meme-logos/peponk.png' },
  { name: 'Ghost Founder', ticker: 'GHOST', venue: 'Moonshot', logo: '/meme-logos/lunar-lad.png' },
  { name: 'Dump Daily', ticker: 'DUMP', venue: 'Pump.fun', logo: '/meme-logos/tendies.png' },
  { name: 'Exit Liquidity', ticker: 'EXIT', venue: 'Raydium', logo: '/meme-logos/unicorn-fart-dust.png' },
  { name: 'Moon Pigeon', ticker: 'MPEG', venue: 'LetsBonk', logo: '/meme-logos/batcat.png' },
  { name: 'Pixel Goblin', ticker: 'GOB', venue: 'Pump.fun', logo: '/meme-logos/choctopus.png' },
  { name: 'Night Shift', ticker: 'NITE', venue: 'Moonshot', logo: '/meme-logos/robinhood-dog.png' },
  { name: 'Cashback Cat', ticker: 'CBACK', venue: 'Raydium', logo: '/meme-logos/wiki-cat.png' },
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
    return {
      mint,
      name: 'Pepe Coin',
      ticker: 'PEPE',
      /** Same class of asset as board / discovery rows — full-bleed meme art. */
      logoUrl: '/meme-logos/peponk.png',
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

  return {
    mint,
    name: demo.name,
    ticker: demo.ticker,
    logoUrl: demo.logo,
    source: 'demo',
    venueLabel: demo.venue,
    blurb: '',
  };
}

export function formatMintPreview(mint: string): string {
  return shortMint(mint.trim());
}
