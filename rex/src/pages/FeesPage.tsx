import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppSidebar';
import { PolessiaLogo } from '../components/PolessiaLogo';
import {
  MARKETING_WALLET_ATTACH_FEE_USD,
  MARKETING_WALLET_ATTACH_POLICY,
} from '../data/claimPricing';
import {
  ABANDONMENT_RULE,
  CREATOR_FEE_MODES,
  FEE_GUIDELINES,
  GRADUATION_LIQUIDITY_POLICY,
  GRADUATION_POLICY,
  MARKETING_VAULT_SWEEP_RULE,
  MIGRATION_FEE_POLICY,
  POST_MIGRATION_FEES,
  SCOUT_FEE_ENGINE,
  SECURITY_CONTROLS,
  TRADE_FEE_LABEL,
  formatBpsPercent,
} from '../data/chainConfig';

export function FeesPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">Fees</p>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">Fee guidelines</h1>
        <p className="mt-2 text-sm text-white/50">{TRADE_FEE_LABEL}</p>

        <section className="mt-8 rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/[0.06] p-4">
          <h2 className="text-sm font-semibold text-[#d5ff69]">Trading on CTOgo</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-white/75">
            External coins (PumpSwap, Pump.fun, Raydium, etc.) are tradeable on CTOgo. Every trade
            through our UI takes a platform fee. A marketing wallet is optional on List a CTO —
            when attached, CTOgo-routed volume also fills that wallet.
          </p>
          <dl className="mt-3 space-y-1.5 text-[12px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-white/55">List a CTO (claim page)</dt>
              <dd className="font-mono font-bold text-[#d5ff69]">Free</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-white/55">Add marketing wallet (optional)</dt>
              <dd className="font-mono font-bold text-[#d5ff69]">
                ${MARKETING_WALLET_ATTACH_FEE_USD}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-[11px] leading-relaxed text-white/40">
            {MARKETING_WALLET_ATTACH_POLICY.summary}
          </p>
        </section>

        <section id="scout-fee-engine" className="mt-8 scroll-mt-20 space-y-2">
          <h2 className="text-sm font-semibold text-white/80">CTOgo swap fee · 1.25%</h2>
          <p className="text-[12px] leading-relaxed text-white/45">{SCOUT_FEE_ENGINE.washTradeNote}</p>
          {(
            [
              {
                label: 'Scout commission',
                bps: SCOUT_FEE_ENGINE.scoutBps,
                detail: SCOUT_FEE_ENGINE.scout,
              },
              {
                label: 'Marketing wallet',
                bps: SCOUT_FEE_ENGINE.marketingBps,
                detail: SCOUT_FEE_ENGINE.marketing,
              },
              {
                label: 'CTOgo revenue',
                bps: SCOUT_FEE_ENGINE.platformBps,
                detail: SCOUT_FEE_ENGINE.platform,
              },
            ] as const
          ).map((row) => (
            <div
              key={row.label}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{row.label}</p>
                <p className="text-sm font-bold text-[#d5ff69]">{formatBpsPercent(row.bps)}</p>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-white/40">{row.detail}</p>
            </div>
          ))}
          <p className="text-[11px] text-white/35">{SCOUT_FEE_ENGINE.tabSeparation}</p>
        </section>

        <section className="mt-8 space-y-2">
          <h2 className="text-sm font-semibold text-white/80">At deploy</h2>
          {CREATOR_FEE_MODES.map((mode) => (
            <div
              key={mode.id}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3"
            >
              <p className="text-sm font-semibold">{mode.title}</p>
              <p className="mt-0.5 text-[11px] text-white/40">{mode.subtitle}</p>
              <p className="mt-1 text-[12px] text-white/55">{mode.destination}</p>
              <p className="mt-1 text-[11px] text-[#c8ff3d]/70">{mode.migration}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/[0.06] p-4">
          <h2 className="text-sm font-semibold text-[#d5ff69]">{GRADUATION_POLICY.title}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-white/75">{GRADUATION_POLICY.summary}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-white/45">{GRADUATION_POLICY.why}</p>
          <p className="mt-3 text-[11px] font-semibold text-[#c8ff3d]/80">
            {GRADUATION_POLICY.engineeringPriority}
          </p>
        </section>

        <section className="mt-8 rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/[0.06] p-4">
          <h2 className="text-sm font-semibold text-[#d5ff69]">{GRADUATION_LIQUIDITY_POLICY.title}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-white/75">
            {GRADUATION_LIQUIDITY_POLICY.summary}
          </p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-[12px] text-white/55">
            {GRADUATION_LIQUIDITY_POLICY.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <ul className="mt-3 space-y-1.5 text-[12px] text-white/55">
            {GRADUATION_LIQUIDITY_POLICY.rules.map((rule) => (
              <li key={rule} className="flex gap-2">
                <span className="text-[#c8ff3d]">✓</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <h2 className="text-sm font-semibold text-white/85">{MIGRATION_FEE_POLICY.title}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-white/70">{MIGRATION_FEE_POLICY.summary}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-white/40">{MIGRATION_FEE_POLICY.contrast}</p>
          <dl className="mt-3 space-y-1.5 text-[12px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-white/55">CTOgo migration protocol fee</dt>
              <dd className="font-mono font-bold text-[#d5ff69]">
                {MIGRATION_FEE_POLICY.rexProtocolSol} SOL
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-white/55">
                Raydium pool creation ({MIGRATION_FEE_POLICY.raydiumCreatePoolSol} + rent{' '}
                {MIGRATION_FEE_POLICY.rentBufferSol})
              </dt>
              <dd className="font-mono text-white/70">~{MIGRATION_FEE_POLICY.defaultSol} SOL</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] pt-1.5">
              <dt className="font-semibold text-white/75">Total at graduation</dt>
              <dd className="font-mono font-bold text-[#d5ff69]">
                ~{MIGRATION_FEE_POLICY.totalSol} SOL
              </dd>
            </div>
          </dl>
          <p className="mt-1 text-[10px] text-white/35">{MIGRATION_FEE_POLICY.paidFrom}</p>
        </section>

        <section className="mt-8 rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/[0.06] p-4">
          <h2 className="text-sm font-semibold text-[#d5ff69]">{POST_MIGRATION_FEES.title}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-white/75">{POST_MIGRATION_FEES.summary}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-white/45">{POST_MIGRATION_FEES.mechanism}</p>
          <ul className="mt-3 space-y-1.5 text-[12px] text-white/55">
            {POST_MIGRATION_FEES.rules.map((rule) => (
              <li key={rule} className="flex gap-2">
                <span className="text-[#c8ff3d]">✓</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-xl border border-[#2aabee]/30 bg-[#2aabee]/[0.07] p-4">
          <h2 className="text-sm font-semibold text-sky-200">{MARKETING_VAULT_SWEEP_RULE.title}</h2>
          <div className="mt-3 space-y-3 text-[12px] leading-relaxed text-white/55">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-sky-300/90">
                {MARKETING_VAULT_SWEEP_RULE.optInLabel}
              </p>
              <p className="mt-1">{MARKETING_VAULT_SWEEP_RULE.optIn}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-sky-300/90">
                {MARKETING_VAULT_SWEEP_RULE.autoSpendLabel}
              </p>
              <p className="mt-1">{MARKETING_VAULT_SWEEP_RULE.autoSpend}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-sky-300/90">
                {MARKETING_VAULT_SWEEP_RULE.inactivityLabel}
              </p>
              <p className="mt-1">{MARKETING_VAULT_SWEEP_RULE.inactivity}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-sky-300/90">
                {MARKETING_VAULT_SWEEP_RULE.ctoRestorationLabel}
              </p>
              <p className="mt-1">{MARKETING_VAULT_SWEEP_RULE.ctoRestoration}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-sky-300/90">
                {MARKETING_VAULT_SWEEP_RULE.v1RestartLabel}
              </p>
              <p className="mt-1">{MARKETING_VAULT_SWEEP_RULE.v1Restart}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-sky-300/90">
                {MARKETING_VAULT_SWEEP_RULE.v2DeadlineLabel}
              </p>
              <p className="mt-1">{MARKETING_VAULT_SWEEP_RULE.v2Deadline}</p>
            </div>
          </div>
        </section>

        <section id="abandonment" className="mt-8 scroll-mt-20 rounded-xl border border-rose-400/30 bg-rose-500/[0.07] p-4">
          <h2 className="text-sm font-semibold text-rose-200">{ABANDONMENT_RULE.title}</h2>
          <p className="mt-1 text-sm font-medium text-white/85">{ABANDONMENT_RULE.thresholdLabel}</p>
          <p className="mt-2 text-[12px] leading-relaxed text-white/55">{ABANDONMENT_RULE.action}</p>
          <ul className="mt-3 space-y-1 text-[11px] text-white/45">
            <li>{ABANDONMENT_RULE.redirectMarketing}</li>
            <li>{ABANDONMENT_RULE.redirectTraders}</li>
          </ul>
        </section>

        <section className="mt-8 space-y-2">
          <h2 className="text-sm font-semibold text-white/80">Security controls</h2>
          <p className="text-[12px] text-white/40">
            Required so post-migration tax cannot be turned off or drained by a compromised key.
          </p>
          {SECURITY_CONTROLS.map((control) => (
            <div
              key={control.id}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3"
            >
              <p className="text-sm font-semibold text-white/85">{control.title}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/50">{control.detail}</p>
            </div>
          ))}
        </section>

        <section id="fee-guidelines" className="mt-8 scroll-mt-20">
          <h2 className="text-sm font-semibold text-white/80">Fee guidelines</h2>
          <ul className="mt-2 space-y-2 text-[13px] text-white/50">
            {FEE_GUIDELINES.map((line) => (
              <li key={line} className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2">
                {line}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/marketing-wallet"
            className="rounded-lg bg-[#2aabee] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#3bb5f5]"
          >
            Marketing wallet
          </Link>
          <Link
            to="/launch"
            className="rounded-lg bg-[#c8ff3d] px-4 py-2.5 text-xs font-bold text-[#090b14] hover:bg-[#d5ff69]"
          >
            Launch a CTO
          </Link>
          <PolessiaLogo variant="powered" size="xs" className="ml-auto" />
        </div>
      </main>
    </AppShell>
  );
}
