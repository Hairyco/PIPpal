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
    <section className="container pb-6 pt-1 text-center" aria-label="Build by category">
      <h2 className="font-serif text-2xl font-bold text-white md:text-3xl">Build a</h2>
      <div className="mx-auto mt-3 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
        {BUILD_PILLS.map((pill) => (
          <Link
            key={pill.categoryId}
            to={`/get-started?category=${pill.categoryId}`}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/90 transition-colors hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-white sm:text-sm"
          >
            {pill.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
