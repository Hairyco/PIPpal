const modules = import.meta.glob<string>('../assets/marketplace/banners/*.jpg', {
  eager: true,
  import: 'default',
});

/** Vite-bundled banner URLs keyed by filename without extension */
export const marketplaceBanners: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => {
    const id = path.match(/\/([^/]+)\.jpg$/)?.[1] ?? '';
    return [id, url];
  }),
);

export function banner(id: string): string {
  return marketplaceBanners[id] ?? '';
}
