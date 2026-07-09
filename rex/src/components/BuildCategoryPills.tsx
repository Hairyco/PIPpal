import { Link } from 'react-router-dom';

const BUILD_PILLS = [
  { label: 'Blockchain', categoryId: 'defi' },
  { label: 'Gaming app', categoryId: 'gaming' },
  { label: 'AI product', categoryId: 'ai-tech' },
  { label: 'Mobile app', categoryId: 'apps' },
  { label: 'Media platform', categoryId: 'media' },
  { label: 'Meme coin', categoryId: 'meme-coins' },
  { label: 'Celebrity token', categoryId: 'celebrity-coins' },
  { label: 'Sports fan token', categoryId: 'sport' },
  { label: 'Music project', categoryId: 'music' },
  { label: 'Real estate', categoryId: 'real-estate' },
] as const;

export function BuildCategoryPills() {
  return (
    <section className="container pb-8 pt-2 text-center" aria-label="Build by category">
      <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">Build a</h2>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
        {BUILD_PILLS.map((pill) => (
          <Link
            key={pill.categoryId}
            to={`/get-started?category=${pill.categoryId}`}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-white"
          >
            {pill.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
