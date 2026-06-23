import { Link } from 'react-router-dom';
import { industries } from '../data/industries';

export function IndustryGrid() {
  return (
    <section className="container my-16">
      <h2 className="mb-6 max-w-2xl text-xl font-normal text-muted-foreground sm:mb-8 sm:text-2xl md:text-3xl">
        Explore the categories where ideas become reality.
      </h2>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:grid-cols-3">
        {industries.map((industry) => (
          <Link
            key={industry.id}
            to={`/category/${industry.id}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-lg text-left sm:aspect-[16/10] sm:rounded-2xl"
          >
            <img
              src={industry.image}
              alt={industry.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10 sm:from-black/90 sm:via-black/40" />

            <div className="absolute inset-x-0 bottom-0 p-2 sm:p-5">
              <span className="inline-block rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm sm:rounded-md sm:px-2.5 sm:py-1 sm:text-xs">
                {industry.tag}
              </span>

              <h3 className="mt-1 line-clamp-2 text-[11px] font-bold leading-tight text-white sm:mt-2.5 sm:line-clamp-none sm:text-2xl md:text-[1.65rem]">
                {industry.name}
              </h3>

              <p className="mt-1.5 line-clamp-2 hidden text-sm text-white/70 sm:block">
                {industry.description}
              </p>

              <p className="mt-1 text-[9px] font-medium text-white/50 sm:mt-2 sm:text-xs">
                <span className="sm:hidden">{industry.projectCount.toLocaleString()}</span>
                <span className="hidden sm:inline">
                  {industry.projectCount.toLocaleString()} projects
                </span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
