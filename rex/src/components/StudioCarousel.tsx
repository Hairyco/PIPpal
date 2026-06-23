import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import { liveProjects, type FeaturedLiveProject } from '../data/liveProjects';

function TokenIcon({ symbol }: { symbol: string }) {
  const hue = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: `hsl(${hue} 60% 45%)` }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}

function ProjectCard({ project }: { project: FeaturedLiveProject }) {
  const positive = project.change24h >= 0;

  return (
    <Link
      to={`/category/${project.categoryId}`}
      className="dex-card w-[280px] shrink-0 transition-opacity hover:opacity-90 md:w-[300px]"
    >
      <div className="relative z-[1] flex items-center gap-3">
        <TokenIcon symbol={project.symbol} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-lg text-foreground">{project.name}</h3>
            {project.verified && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-sky-400" aria-label="Verified" />
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {project.symbol} · {project.category}
          </p>
        </div>
      </div>

      <div className="relative z-[1] flex items-center justify-between text-sm">
        <span className="text-muted-foreground">MCAP {project.marketCap}</span>
        <span className={positive ? 'text-emerald-400' : 'text-rose-400'}>
          {positive ? '+' : ''}
          {project.change24h.toFixed(1)}%
        </span>
      </div>
    </Link>
  );
}

export function StudioCarousel() {
  const doubled = [...liveProjects, ...liveProjects];

  return (
    <section className="my-16">
      <div className="container">
        <h2 className="mb-4 font-serif text-4xl text-white">Live Projects</h2>
        <p className="mb-8 max-w-xl text-muted-foreground">
          Real projects building on Rex right now — with roadmaps, marketing wallets, and verified
          milestones.
        </p>
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent md:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent md:w-24" />

        <div className="flex w-max animate-scroll-left gap-4 px-4 hover:[animation-play-state:paused]">
          {doubled.map((project, i) => (
            <ProjectCard key={`${project.id}-${i}`} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
