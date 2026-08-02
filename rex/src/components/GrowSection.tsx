import { Link } from 'react-router-dom';
import { Megaphone, Users } from 'lucide-react';
import { DemoPreviewBadge } from './promote/DemoPreviewBadge';

export function GrowSection() {
  return (
    <section className="container my-20">
      <div className="dex-card overflow-hidden">
        <div className="relative z-[1] p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-400">Grow</p>
            <DemoPreviewBadge />
          </div>
          <h2 className="mt-2 font-serif text-2xl text-white md:text-3xl">
            Grow with Raiders
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Community and raiders share coin links with their wallet as ref. They earn 0.55% instant
            SOL on attributed CTOgo swaps while your marketing wallet still fills at 0.40% for
            roadmap spend.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Megaphone className="h-5 w-5 text-sky-400" />
              <p className="mt-3 font-medium text-white">For founders</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                List or launch — every coin page includes Raid share & earn. Marketing wallet funds
                roadmap; raiders earn separately.
              </p>
              <Link to="/launch" className="dex-btn mt-4 inline-flex text-sm">
                List or launch
              </Link>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Users className="h-5 w-5 text-sky-400" />
              <p className="mt-3 font-medium text-white">For raiders</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Open a coin page, connect your wallet, copy your raid link, and raid. Commissions
                fill your wallet when the fee engine is live.
              </p>
              <Link
                to="/affiliates"
                className="mt-4 inline-flex items-center rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-sky-400/40 hover:bg-white/10"
              >
                Browse raid coins
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
