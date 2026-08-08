import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { AppShell } from '../components/AppSidebar';
import { MarketingWalletHeroVisual } from '../components/MarketingWalletHeroVisual';
import { PolessiaLogo } from '../components/PolessiaLogo';
import { formatBpsPercent, LAUNCH_FEE_ENGINE, LIST_FEE_ENGINE, MARKETING_FILL_SHORT } from '../data/chainConfig';

const LIST_MKT = formatBpsPercent(LIST_FEE_ENGINE.marketingBps);
const LAUNCH_MKT = formatBpsPercent(LAUNCH_FEE_ENGINE.marketingBps);

export function MarketingWalletPage() {
  return (
    <AppShell>
      <div className="min-h-screen bg-black text-[#f5f7fb]">
        <header className="border-b border-white/[0.07] bg-black">
          <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-3 pr-14 sm:px-4 sm:pr-16">
            <Link
              to="/launch?mode=list"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-1 py-1.5 text-sm text-white/55 transition hover:bg-white/[0.04] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <p className="min-w-0 flex-1 truncate text-center font-serif text-base font-bold">
              Marketing wallet
            </p>
            <Link
              to="/fees"
              className="shrink-0 text-sm text-[#c8ff3d] hover:text-[#d5ff69]"
            >
              Fees
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
          <div className="overflow-hidden rounded-2xl border border-[#2aabee]/30 bg-gradient-to-br from-[#2aabee]/[0.16] via-[#2aabee]/[0.04] to-transparent">
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <PolessiaLogo
                  variant="mark"
                  size="md"
                  className="mt-0.5 shrink-0 [&_img]:h-11 [&_img]:w-11 [&_img]:rounded-xl"
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-300/90">
                    Automated growth
                  </p>
                  <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-white">
                    One-click marketing
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
                    Markets your coin autonomously.
                  </p>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
                    Every trade on CTOgo puts {MARKETING_FILL_SHORT} into your coin’s marketing
                    wallet ({LIST_MKT} on List · {LAUNCH_MKT} on Launch). When you reach each
                    milestone, spend unlocks — socials, callouts, more — managed automatically.
                  </p>
                </div>
              </div>

              <MarketingWalletHeroVisual />

              <ul className="mt-6 grid gap-2 sm:grid-cols-3">
                {[
                  {
                    title: 'Fills from trades',
                    body: `${MARKETING_FILL_SHORT} of volume → wallet`,
                  },
                  {
                    title: 'Spends on autopilot',
                    body: 'Milestones unlock placements in order',
                  },
                  {
                    title: 'Can’t be drained',
                    body: 'Protocol wallet — not a free founder key',
                  },
                ].map((item) => (
                  <li
                    key={item.title}
                    className="rounded-xl border border-white/[0.08] bg-black/25 px-3 py-3"
                  >
                    <p className="flex items-center gap-1.5 text-[12px] font-semibold text-white/90">
                      <Sparkles className="h-3.5 w-3.5 text-[#d5ff69]" />
                      {item.title}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-white/45">{item.body}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to="/launch?mode=list"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#c8ff3d] px-4 py-2.5 text-xs font-bold text-[#090b14] hover:bg-[#d5ff69]"
                >
                  List a CTO · add wallet
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/advertise"
                  className="inline-flex items-center rounded-lg border border-white/[0.12] px-4 py-2.5 text-xs font-semibold text-white/70 hover:text-white"
                >
                  Advertise
                </Link>
                <Link
                  to="/faq#marketing-wallet"
                  className="inline-flex items-center rounded-lg border border-white/[0.12] px-4 py-2.5 text-xs font-semibold text-white/70 hover:text-white"
                >
                  FAQ
                </Link>
              </div>

              <div className="mt-6 flex justify-center border-t border-white/[0.06] pt-4">
                <PolessiaLogo variant="powered" size="sm" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
