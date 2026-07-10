import { Link } from 'react-router-dom';
import { ArrowRight, Rocket, Store, TrendingUp } from 'lucide-react';

const STAGES = [
  {
    label: 'Create',
    icon: Rocket,
    description: 'Launch your token, site, and marketing plan for $1.',
  },
  {
    label: 'Scale',
    icon: TrendingUp,
    description: 'Trade tax fills your wallet — Rex runs campaigns and builds your product.',
  },
  {
    label: 'Exit',
    icon: Store,
    description: 'List on Rex and sell to a buyer when you are ready.',
  },
] as const;

function ExitOfferMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e17] shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#111820] px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        </div>
        <p className="mx-auto truncate text-[10px] text-muted-foreground">
          rex.app/dashboard/exit
        </p>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-sky-400">
          Founder dashboard
        </p>
        <p className="mt-1 text-sm font-semibold text-white">FitTrack · FITT</p>

        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400">
            New offer
          </p>
          <p className="mt-2 text-sm font-medium text-white">You have received an offer</p>
          <p className="mt-1 font-serif text-2xl font-bold text-emerald-300">$1.2M</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Strategic buyer · includes product, Rex listing, and marketing assets
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-md bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-200">
              Review offer
            </span>
            <span className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-muted-foreground">
              Message buyer
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-[10px] text-muted-foreground">Marketing wallet</p>
            <p className="mt-0.5 text-sm font-semibold text-white">$84K</p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-[10px] text-muted-foreground">Listed</p>
            <p className="mt-0.5 text-sm font-semibold text-white">Exit marketplace</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RexJourneySection() {
  return (
    <section className="container my-16 md:my-20" aria-label="Create, scale, exit">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-400">
            The Rex journey
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-white md:text-4xl">
            Create. Scale. Exit.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
            Rex is not just a launchpad — it is a full growth engine. Build on Rex, let trade tax
            fund marketing and product, then sell the company to a buyer when the time is right.
          </p>

          <ol className="mt-8 space-y-5">
            {STAGES.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <li key={stage.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-300">
                      <Icon className="h-4 w-4" />
                    </span>
                    {index < STAGES.length - 1 && (
                      <span className="mt-2 h-full w-px flex-1 bg-white/10" aria-hidden />
                    )}
                  </div>
                  <div className="pb-1 pt-1">
                    <p className="font-semibold text-white">{stage.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{stage.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <Link
            to="/get-started"
            className="dex-btn mt-8 inline-flex items-center gap-2 text-sm"
          >
            Start for $1
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ExitOfferMockup />
      </div>
    </section>
  );
}
