import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppSidebar';
import {
  ABANDONMENT_RULE,
  CREATOR_FEE_MODES,
  FEE_GUIDELINES,
  FEE_TIERS,
  MARKETING_VAULT_SWEEP_RULE,
  POST_MIGRATION_FEES,
  SECURITY_CONTROLS,
  TRADE_FEE_LABEL,
  formatBpsPercent,
  totalFeeBps,
} from '../data/chainConfig';

export function FeesPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">Fees</p>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">Fee guidelines</h1>
        <p className="mt-2 text-sm text-white/50">{TRADE_FEE_LABEL}</p>

        <section className="mt-8 space-y-2">
          <h2 className="text-sm font-semibold text-white/80">Dynamic tiers</h2>
          {FEE_TIERS.map((tier) => (
            <div
              key={tier.id}
              className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold">{tier.label}</p>
                <p className="text-[11px] text-white/40">{tier.marketCap}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#d5ff69]">{formatBpsPercent(totalFeeBps(tier))}</p>
                <p className="text-[10px] text-white/35">
                  {formatBpsPercent(tier.marketingBps)} mkt ·{' '}
                  {formatBpsPercent(tier.creatorPoolBps)} pool ·{' '}
                  {formatBpsPercent(tier.platformBps)} Rex
                </p>
              </div>
            </div>
          ))}
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

        <section className="mt-8 rounded-xl border border-rose-400/30 bg-rose-500/[0.07] p-4">
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

        <section className="mt-8">
          <h2 className="text-sm font-semibold text-white/80">Summary</h2>
          <ul className="mt-2 space-y-2 text-[13px] text-white/50">
            {FEE_GUIDELINES.map((line) => (
              <li key={line} className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2">
                {line}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8 flex flex-wrap gap-2">
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
        </div>
      </main>
    </AppShell>
  );
}
