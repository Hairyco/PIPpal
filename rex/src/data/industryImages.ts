import apps from '../assets/industries/apps.jpg';
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

const iconModules = import.meta.glob<string>('../assets/industries/icons/*.{jpg,png,svg}', {
  eager: true,
  import: 'default',
});

const icons: Record<string, string> = Object.fromEntries(
  Object.entries(iconModules).map(([path, url]) => {
    const id = path.match(/\/([^/]+)\.(jpg|png|svg)$/)?.[1] ?? '';
    return [id, url];
  }),
);

/** Vite-bundled industry image when public/ path may be missing on deploy */
export function industryImage(id: string, fallback: string): string {
  return bundled[id] ?? fallback;
}

/** Square profile icon for category headers (distinct from banner) */
export function industryIcon(id: string, fallback: string): string {
  return icons[id] ?? fallback;
}
