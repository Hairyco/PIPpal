import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { industries } from '../data/industries';

const featuredIds = new Set(['meme-coins', 'aerospace']);

function cardSpan(id: string): string {
  if (id === 'meme-coins') return 'sm:col-span-2 lg:col-span-2 lg:row-span-2';
  if (id === 'aerospace') return 'lg:col-span-2';
  return '';
}

function imageAspect(id: string): string {
  if (id === 'meme-coins') return 'aspect-[16/11] lg:aspect-auto lg:min-h-[280px] lg:flex-1';
  if (id === 'aerospace') return 'aspect-[16/10] lg:aspect-[21/9]';
  return 'aspect-[16/10]';
}

export function IndustryGrid() {
  return (
    <section className="container my-20">
      <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-400">
            Categories
          </p>
          <h2 className="mt-2 font-serif text-3xl text-white md:text-4xl">
            Explore big ideas that become reality.
          </h2>
        </div>
        <p className="max-w-xs text-sm text-muted-foreground">
          Curated sectors where Rex projects launch, fundraise, and deliver within the ecosystem
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-flow-dense lg:grid-cols-4 lg:gap-5">
        {industries.map((industry) => {
          const featured = featuredIds.has(industry.id);
          const tall = industry.id === 'meme-coins';

          return (
            <Link
              key={industry.id}
              to={`/category/${industry.id}`}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0e17] transition-all duration-300 hover:border-sky-500/25 hover:shadow-[0_20px_60px_-20px_rgba(14,165,233,0.25)] ${cardSpan(industry.id)} ${tall ? 'lg:flex lg:min-h-[420px]' : ''}`}
            >
              <div
                className={`relative overflow-hidden ${imageAspect(industry.id)} ${tall ? 'lg:flex-1' : ''}`}
              >
                <img
                  src={industry.image}
                  alt={industry.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] via-[#0a0e17]/20 to-transparent opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 via-transparent to-indigo-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {featured && (
                  <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-md">
                    Featured
                  </span>
                )}
              </div>

              <div className={`relative border-t border-white/[0.06] p-4 sm:p-5 ${tall ? 'lg:shrink-0' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-sky-400/90">
                      {industry.tag}
                    </span>
                    <h3 className="mt-1.5 font-serif text-xl text-white sm:text-2xl">
                      {industry.name}
                    </h3>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-colors group-hover:border-sky-500/30 group-hover:bg-sky-500/10 group-hover:text-sky-400">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {industry.description}
                </p>

                <p className="mt-4 text-xs font-medium text-white/35">
                  {industry.projectCount.toLocaleString()} active projects
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
