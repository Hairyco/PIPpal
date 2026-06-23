import { Star } from 'lucide-react';
import { studios, type Studio } from '../data/studios';

function StudioCard({ studio }: { studio: Studio }) {
  return (
    <div className="dex-card w-[280px] shrink-0 md:w-[300px]">
      <div className="relative z-[1] flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: studio.color }}
        >
          {studio.initials}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg text-foreground">{studio.name}</h3>
          <p className="truncate text-sm text-muted-foreground">{studio.specialty}</p>
        </div>
      </div>

      <div className="relative z-[1] flex items-center justify-between text-sm text-muted-foreground">
        <span>{studio.projects} projects delivered</span>
        <span className="flex items-center gap-1 text-foreground">
          <Star className="h-3.5 w-3.5 fill-sky-400 text-sky-400" />
          {studio.rating}
        </span>
      </div>
    </div>
  );
}

export function StudioCarousel() {
  const doubled = [...studios, ...studios];

  return (
    <section className="my-16">
      <div className="container">
        <h2 className="mb-4 font-serif text-4xl text-white">Partner Studios</h2>
        <p className="mb-8 max-w-xl text-muted-foreground">
          Vetted development studios ready to build your product when funding milestones are hit.
        </p>
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent md:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent md:w-24" />

        <div className="flex w-max animate-scroll-left gap-4 px-4 hover:[animation-play-state:paused]">
          {doubled.map((studio, i) => (
            <StudioCard key={`${studio.id}-${i}`} studio={studio} />
          ))}
        </div>
      </div>
    </section>
  );
}
