import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles, Wallet } from 'lucide-react';
import { AppShell } from '../components/AppSidebar';
import { MarketingWalletHeroVisual } from '../components/MarketingWalletHeroVisual';
import { formatBpsPercent, FEE_TIERS } from '../data/chainConfig';

const LAUNCH_MKT = formatBpsPercent(FEE_TIERS[0].marketingBps);

export function MarketingWalletPage() {
  return (
    <AppShell>
      <div className="min-h-screen bg-black text-[#f5f7fb]">
        <header className="border-b border-white/[0.07] bg-black">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 pl-14 md:pl-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
            <p className="font-serif text-base font-bold">Marketing wallet</p>
            <Link to="/fees" className="text-sm text-[#c8ff3d] hover:text-[#d5ff69]">
              Fees
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
          <div className="overflow-hidden rounded-2xl border border-[#2aabee]/30 bg-gradient-to-br from-[#2aabee]/[0.16] via-[#2aabee]/[0.04] to-transparent">
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#2aabee]/20 text-[#2aabee]">
                  <Wallet className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-300/90">
                    Automated growth
                  </p>
                  <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-white">
                    One-click marketing
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
                    Thinks, builds and markets your product autonomously. Every trade on CTOgo puts{' '}
                    {LAUNCH_MKT} into your coin’s marketing wallet. When you reach each milestone,
                    spend unlocks — socials, callouts, more — automatically.
                  </p>
                </div>
              </div>

              <MarketingWalletHeroVisual />

              <ul className="mt-6 grid gap-2 sm:grid-cols-3">
                {[
                  {
                    title: 'Fills from trades',
                    body: `${LAUNCH_MKT} of volume → vault at launch`,
                  },
                  {
                    title: 'Spends on autopilot',
                    body: 'Milestones unlock placements in order',
                  },
                  {
                    title: 'Can’t be drained',
                    body: 'Protocol vault — not a free founder key',
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
                  List a CTO · add vault
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
            </div>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
