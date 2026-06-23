import { Link } from 'react-router-dom';
import { industries } from '../data/industries';

export function IndustryGrid() {
  return (
    <section className="container my-16">
      <h2 className="mb-8 max-w-2xl text-2xl font-normal text-muted-foreground md:text-3xl">
        Explore the categories where ideas become reality.
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((industry) => (
          <Link
            key={industry.id}
            to={`/category/${industry.id}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl text-left sm:aspect-[16/10]"
          >
            <img
              src={industry.image}
              alt={industry.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

            <div className="absolute inset-x-0 bottom-0 p-5">
              <span className="inline-block rounded-md bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {industry.tag}
              </span>

              <h3 className="mt-2.5 text-2xl font-bold text-white md:text-[1.65rem]">
                {industry.name}
              </h3>

              <p className="mt-1.5 line-clamp-2 text-sm text-white/70">
                {industry.description}
              </p>

              <p className="mt-2 text-xs font-medium text-white/50">
                {industry.projectCount.toLocaleString()} projects
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
