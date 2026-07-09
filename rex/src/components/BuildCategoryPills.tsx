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
      <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">Build a:</h2>
      {/* inline-flex tag cloud — reliable content-width wrapping on iOS Safari */}
      <div className="mt-5 px-0.5 leading-[2.6] sm:leading-[2.75]">
        {BUILD_PILLS.map((pill) => (
          <Link
            key={pill.categoryId}
            to={`/get-started?category=${pill.categoryId}`}
            className="mx-1 inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-white/20 bg-white/[0.04] px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:border-sky-500/40 hover:bg-sky-500/10 sm:px-4 sm:py-2 sm:text-sm"
          >
            {pill.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
