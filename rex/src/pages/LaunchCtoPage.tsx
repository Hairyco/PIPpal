import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Megaphone,
  RotateCcw,
  Shield,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { TRADE_FEE_LABEL } from '../data/chainConfig';
import { MARKETING_SPEND_FLOW, formatSpendCost } from '../data/marketingSpendFlow';

const included = [
  'Automated marketing wallet created at launch',
  'Trade tax fills the wallet — no manual top-ups required',
  'Ads unlock automatically when spend thresholds hit',
  'Community-owned Solana CTO — no rugs',
];

const walletSteps = [
  {
    icon: Zap,
    title: 'Launch the CTO',
    body: 'Submit the abandoned Solana project and community. Your takeover goes live with wallets spun up automatically.',
  },
  {
    icon: Wallet,
    title: 'Trades fill the wallet',
    body: `${TRADE_FEE_LABEL} on each swap. The marketing share lands in a dedicated wallet the community can see.`,
  },
  {
    icon: Megaphone,
    title: 'Ads buy themselves',
    body: 'When the balance hits a threshold, Rex spends toward the next placement — Telegram, DexScreener, and more.',
  },
];

export function LaunchCtoPage() {
  return (
    <div className="page-shell theme-light min-h-screen text-[#f5f7fb]">
      <div className="relative z-[1]">
        <header className="border-b border-white/[0.07] bg-[#090b14]">
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:px-5">
            <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="CTO home">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#c8ff3d] text-[#090b14]">
                <RotateCcw className="h-4 w-4 stroke-[2.6]" />
              </span>
              <span className="font-serif text-base font-bold tracking-tight">CTO</span>
            </Link>
            <Link
              to="/"
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-white/45 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-3 py-8 sm:px-5 sm:py-12">
          <section className="gloss-panel-soft relative overflow-hidden rounded-2xl border border-white/[0.1] px-5 py-8 sm:px-10 sm:py-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(200,255,61,0.14),transparent_42%),radial-gradient(circle_at_90%_10%,rgba(42,171,238,0.12),transparent_40%)]" />
            <div className="relative z-10 max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c8ff3d]">
                Launch a CTO
              </p>
              <h1 className="mt-3 font-serif text-3xl font-bold leading-[1.1] tracking-[-0.03em] sm:text-5xl">
                Take over a Solana project with marketing that funds itself
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
                Every CTO launch includes an automated marketing wallet. Community trading fills it.
                When thresholds hit, ads buy themselves — so the takeover keeps momentum without a
                paid media budget up front.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="#start"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#c8ff3d] px-5 py-3 text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69]"
                >
                  Start launch
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#marketing-wallet"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:text-white"
                >
                  <Wallet className="h-4 w-4 text-[#c8ff3d]" />
                  See marketing wallet
                </a>
              </div>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-3 py-1.5 text-[11px] font-semibold text-[#d5ff69]">
                <Check className="h-3.5 w-3.5" />
                Marketing wallet included with every launch
              </p>
            </div>
          </section>

          <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {included.map((item) => (
              <div
                key={item}
                className="gloss-panel rounded-xl border border-white/[0.08] px-4 py-3.5"
              >
                <span className="mb-2 grid h-6 w-6 place-items-center rounded-full bg-[#c8ff3d] text-[10px] font-black text-black">
                  ✓
                </span>
                <p className="text-sm font-medium leading-snug text-white/80">{item}</p>
              </div>
            ))}
          </section>

          <section id="marketing-wallet" className="mt-14 scroll-mt-6">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#c8ff3d]">
                Marketing wallet
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
                What it is — and what it does
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/50 sm:text-base">
                A ring-fenced Solana wallet created when your CTO launches. It is not founder cash —
                it is community-funded marketing that only spends on growth placements as thresholds
                are reached.
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3">
                {walletSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.title}
                      className="gloss-panel flex gap-4 rounded-xl border border-white/[0.08] p-4"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#c8ff3d]/15 text-[#c8ff3d]">
                          <Icon className="h-5 w-5" />
                        </span>
                        {index < walletSteps.length - 1 ? (
                          <span className="w-px flex-1 bg-white/10" aria-hidden />
                        ) : null}
                      </div>
                      <div className="pb-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                          Step {index + 1}
                        </p>
                        <h3 className="mt-0.5 text-base font-bold">{step.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-white/45">{step.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <aside className="gloss-panel rounded-xl border border-white/[0.08] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">
                      Live example
                    </p>
                    <h3 className="mt-1 font-serif text-lg font-bold">Wallet → next ad</h3>
                  </div>
                  <img
                    src="/images/partners/dexscreener.ico"
                    alt=""
                    className="h-8 w-8 rounded-full border border-white/10 bg-[#12141f] p-1.5"
                  />
                </div>

                <div className="mt-5 rounded-lg border border-white/[0.06] bg-black/30 px-3 py-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold text-white/55">
                      Marketing wallet
                      <span className="font-normal text-white/30"> · 7 SOL to DexScreener</span>
                    </p>
                    <p className="tabular-nums text-[11px] font-semibold text-white/50">
                      33<span className="font-normal text-white/25">/40</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className="absolute inset-y-0 left-0 w-[82%] rounded-full bg-gradient-to-r from-[#3b82f6] via-[#7dd3fc] to-[#c8ff3d]"
                      />
                    </div>
                    <span className="grid h-6 w-6 place-items-center rounded-full border border-white/12 bg-[#12141f]">
                      <img src="/images/partners/dexscreener.ico" alt="" className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

                <ul className="mt-5 space-y-3">
                  {MARKETING_SPEND_FLOW.map((node) => (
                    <li
                      key={node.id}
                      className="flex items-center justify-between gap-3 border-b border-white/[0.05] pb-3 last:border-0 last:pb-0"
                    >
                      <span className="text-sm text-white/70">{node.label}</span>
                      <span className="text-xs font-semibold tabular-nums text-[#c8ff3d]">
                        {formatSpendCost(node.cost)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[11px] leading-relaxed text-white/35">
                  Spend unlocks in order as the wallet fills from trading. Communities see balance,
                  target, and the next placement on every advertised CTO card.
                </p>
              </aside>
            </div>
          </section>

          <section className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: 'Transparent by design',
                body: 'Wallet address and progress sit on the CTO page. Holders can see how close the next ad buy is.',
              },
              {
                icon: Users,
                title: 'Community owned',
                body: 'Marketing funds come from trading activity — not a founder dumping into paid traffic alone.',
              },
              {
                icon: Megaphone,
                title: 'Hands-off growth',
                body: 'Thresholds trigger placements automatically. No spreadsheet of invoices to chase after launch.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="gloss-panel rounded-xl border border-white/[0.08] p-5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/[0.05] text-[#c8ff3d]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-3 text-base font-bold">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/45">{item.body}</p>
                </div>
              );
            })}
          </section>

          <section
            id="start"
            className="mt-14 overflow-hidden rounded-2xl border border-[#c8ff3d]/25 bg-gradient-to-br from-[#c8ff3d]/15 via-[#0d101b] to-[#0d101b] px-5 py-8 sm:px-10 sm:py-10"
          >
            <div className="max-w-xl">
              <h2 className="font-serif text-2xl font-bold sm:text-3xl">
                Ready to launch your CTO?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                Bring the Solana contract and community. We create the marketing wallet at launch and
                wire it to automated ad spend as trading begins.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/get-started"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#c8ff3d] px-5 py-3 text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69]"
                >
                  Continue to launch
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://t.me/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2aabee] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3bb5f5]"
                >
                  Ask the Telegram bot
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
