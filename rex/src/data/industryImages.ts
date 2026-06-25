import apps from '../assets/industries/apps.svg';
import ai from '../assets/industries/ai.jpg';
import celebrityCoins from '../assets/industries/celebrity-coins.jpg';
import defi from '../assets/industries/defi.jpg';
import media from '../assets/industries/media.jpg';

const bundled: Record<string, string> = {
  apps,
  'ai-tech': ai,
  defi,
  'celebrity-coins': celebrityCoins,
  media,
};

/** Vite-bundled industry image when public/ path may be missing on deploy */
export function industryImage(id: string, fallback: string): string {
  return bundled[id] ?? fallback;
}
