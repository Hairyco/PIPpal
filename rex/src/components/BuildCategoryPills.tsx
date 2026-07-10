import { Link } from 'react-router-dom';

const BUILD_PILLS = [
  { label: 'Blockchain', categoryId: 'defi' },
  { label: 'Gaming app', categoryId: 'gaming' },
  { label: 'AI product', categoryId: 'ai-tech' },
  { label: 'Mobile app', categoryId: 'apps' },
  { label: 'Media platform', categoryId: 'media' },
  { label: 'Fintech platform', categoryId: 'defi' },
  { label: 'Aerospace', categoryId: 'aerospace' },
  { label: 'Sports fan token', categoryId: 'sport' },
  { label: 'Music project', categoryId: 'music' },
  { label: 'Real estate', categoryId: 'real-estate' },
] as const;

type Pill = (typeof BUILD_PILLS)[number];

const ROWS: Pill[][] = [
  BUILD_PILLS.slice(0, 4),
  BUILD_PILLS.slice(4, 7),
  BUILD_PILLS.slice(7, 10),
];

function buildTrack(pills: Pill[]): Pill[] {
  const repeated = [...pills, ...pills, ...pills];
  return [...repeated, ...repeated];
}

function CategoryPill({ pill }: { pill: Pill }) {
  return (
    <Link
      to={`/get-started?category=${pill.categoryId}`}
      className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition-colors hover:border-sky-400/45 hover:bg-sky-500/15 hover:text-white"
    >
      {pill.label}
    </Link>
  );
}

function MarqueeRow({
  pills,
  animationClass,
  offset = false,
}: {
  pills: Pill[];
  animationClass: string;
  offset?: boolean;
}) {
  const track = buildTrack(pills);

  return (
    <div
      className={`layout-clip relative w-full overflow-hidden py-2 ${offset ? 'md:-mx-6' : ''}`}
    >
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#030711]/90 to-transparent sm:w-16 md:w-24`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#030711]/90 to-transparent sm:w-16 md:w-24`}
        aria-hidden
      />

      <div
        className={`flex w-max max-w-none items-center gap-3 px-3 motion-reduce:animate-none hover:[animation-play-state:paused] ${animationClass}`}
        aria-hidden={false}
      >
        {track.map((pill, index) => (
          <CategoryPill key={`${pill.categoryId}-${index}`} pill={pill} />
        ))}
      </div>
    </div>
  );
}

export function BuildCategoryPills() {
  return (
    <section className="relative z-10 pb-4 pt-2" aria-label="Build by category">
      <h2 className="container text-center font-serif text-3xl font-bold text-white md:text-4xl">
        Build a:
      </h2>

      <div className="mt-6 space-y-1 md:mt-7">
        <MarqueeRow pills={ROWS[0]} animationClass="animate-scroll-right-slow" />
        <MarqueeRow pills={ROWS[1]} animationClass="animate-scroll-left" offset />
        <MarqueeRow pills={ROWS[2]} animationClass="animate-scroll-right" />
      </div>
    </section>
  );
}
