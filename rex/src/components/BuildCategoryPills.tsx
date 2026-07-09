import { Link } from 'react-router-dom';
import { ArrowRight, Rocket, Store, TrendingUp } from 'lucide-react';

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

const STAGES = [
  {
    id: 'create',
    label: 'Create',
    description: 'Launch your token, site, and marketing plan for $1.',
    icon: Rocket,
  },
  {
    id: 'scale',
    label: 'Scale',
    description: 'Trade tax fills your wallet — Rex runs campaigns automatically.',
    icon: TrendingUp,
  },
  {
    id: 'exit',
    label: 'Exit',
    description: 'Sell the company to a buyer on Rex when you are ready.',
    icon: Store,
  },
] as const;

export function BuildCategoryPills() {
  return (
    <section className="container pb-8 pt-2 text-center" aria-label="Build by category">
      <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">Build a:</h2>
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

      <div className="mx-auto mt-8 max-w-3xl border-t border-white/[0.08] pt-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-sky-400/90">
          The Rex journey
        </p>
        <div className="mt-5 grid gap-4 text-left sm:grid-cols-3 sm:gap-3">
          {STAGES.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <div key={stage.id} className="relative flex flex-col items-center sm:items-start">
                {index < STAGES.length - 1 && (
                  <ArrowRight
                    className="absolute -right-2 top-5 hidden h-4 w-4 text-white/20 sm:block"
                    aria-hidden
                  />
                )}
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sky-500/25 bg-sky-500/10 text-sky-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="font-semibold text-white">{stage.label}</p>
                </div>
                <p className="mt-2 max-w-[220px] text-center text-xs leading-relaxed text-muted-foreground sm:text-left">
                  {stage.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
