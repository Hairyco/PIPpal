import { useState, type ReactNode } from 'react';
import {
  Check,
  Copy,
  Link2,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { DemoPreviewBadge } from './DemoPreviewBadge';
import { affiliateProgramDefaults } from '../../data/promotePricing';

const DEMO_AFFILIATES = [
  { name: 'CryptoAlpha', joined: true, clicks: 1240, conversions: 89, epc: '$4.12' },
  { name: 'MemeLord.eth', joined: true, clicks: 890, conversions: 52, epc: '$3.08' },
  { name: '—', joined: false, clicks: 0, conversions: 0, epc: '—' },
];

const DEMO_CATALOGUE_ROW = {
  name: 'SwiftieCoin',
  conversion: '3.2%',
  epc: '$3.19',
  commission: '12%',
  action: 'Joined' as const,
};

function CataloguePreviewRow({
  name,
  symbol,
  subtitle,
  conversion,
  epc,
  commission,
  action,
  highlighted,
}: {
  name: string;
  symbol?: string;
  subtitle?: string;
  conversion: string;
  epc: string;
  commission: string;
  action: ReactNode;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        highlighted ? 'border-sky-500/30 bg-sky-500/5' : 'border-white/5 bg-white/[0.02]'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="break-words font-medium text-white">{name}</p>
          {subtitle && <p className="break-words text-xs text-muted-foreground">{subtitle}</p>}
          {symbol && !subtitle && <p className="text-xs text-muted-foreground">{symbol}</p>}
        </div>
        <div className="shrink-0">{action}</div>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <dt className="text-muted-foreground">Conv.</dt>
          <dd className="mt-0.5 font-medium text-white">{conversion}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">EPC</dt>
          <dd className="mt-0.5 font-medium text-white">{epc}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Commission</dt>
          <dd className="mt-0.5 font-medium text-sky-300">{commission}</dd>
        </div>
      </dl>
    </div>
  );
}

export function AffiliateProgramDemo({
  projectName,
  symbol,
}: {
  projectName: string;
  symbol: string;
}) {
  const [enabled, setEnabled] = useState(false);
  const [commission, setCommission] = useState(affiliateProgramDefaults.defaultCommission);
  const [copied, setCopied] = useState(false);

  const sampleLink = `https://rex.app/project/${symbol.toLowerCase()}?ref=demo_promoter`;

  const copyLink = () => {
    void navigator.clipboard.writeText(sampleLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="dex-card relative min-w-0 overflow-hidden">
      <div className="relative z-[1] min-w-0 p-4 sm:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-sky-400" />
            <span className="text-xs font-medium uppercase tracking-wider text-sky-400">
              Affiliate programme
            </span>
            <DemoPreviewBadge />
          </div>
          <h2 className="mt-2 break-words text-lg font-semibold text-white">
            Let promoters earn — always from your marketing wallet
          </h2>
          <p className="mt-1 break-words text-sm text-muted-foreground">
            Publishers browse the Rex catalogue, join your programme, and share tracked links. Every
            commission is paid automatically from your marketing wallet on each referred buy — never
            from your personal funds or a separate budget.
          </p>
        </div>

        <div className="mt-5 flex min-w-0 items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3">
          <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
          <p className="min-w-0 break-words text-xs text-muted-foreground">
            <span className="font-medium text-white">Marketing wallet only.</span> Affiliate payouts
            always draw from the same wallet funded by your buy/sell tax. If the wallet is empty,
            commissions pause until trading refills it.
          </p>
        </div>

        <div className="mt-4 break-words rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-200/90">
          TBC — affiliate tracking and payouts are not live yet. This preview shows the planned
          founder controls, marketing-wallet funding, and promoter catalogue experience.
        </div>

        <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-2">
          <div className="min-w-0 space-y-5">
            <label className="flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="mt-1 shrink-0 accent-sky-500"
              />
              <div className="min-w-0">
                <p className="font-medium text-white">Enable affiliate programme</p>
                <p className="mt-1 break-words text-xs text-muted-foreground">
                  List {projectName} in the promoter catalogue. Payouts always come from your
                  marketing wallet when promoters drive buys.
                </p>
              </div>
            </label>

            <div className={`min-w-0 ${enabled ? '' : 'pointer-events-none opacity-40'}`}>
              <label className="mb-2 block break-words text-xs font-medium text-muted-foreground">
                Commission share of marketing tax ({commission}%) — paid from wallet
              </label>
              <input
                type="range"
                min={affiliateProgramDefaults.commissionMin}
                max={affiliateProgramDefaults.commissionMax}
                value={commission}
                onChange={(e) => setCommission(Number(e.target.value))}
                className="w-full max-w-full accent-sky-500"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>{affiliateProgramDefaults.commissionMin}%</span>
                <span>{affiliateProgramDefaults.commissionMax}%</span>
              </div>
              <p className="mt-2 break-words text-xs text-muted-foreground">
                {affiliateProgramDefaults.attributionDays}-day attribution · min payout $
                {affiliateProgramDefaults.minPayout} from marketing wallet
              </p>
            </div>

            <div className={`min-w-0 ${enabled ? '' : 'pointer-events-none opacity-40'}`}>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Sample tracking link</p>
              <div className="flex min-w-0 gap-2">
                <code className="min-w-0 flex-1 break-all rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-sky-300">
                  {sampleLink}
                </code>
                <button
                  type="button"
                  onClick={copyLink}
                  className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-muted-foreground hover:text-foreground"
                  aria-label="Copy link"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="flex w-full max-w-full items-center justify-center rounded-md bg-rex-gradient px-4 py-2 text-sm text-white opacity-50"
              title="Coming soon"
            >
              Save programme settings
            </button>
          </div>

          <div className="min-w-0 rounded-xl border border-white/10 bg-[#0a0e17]/60 p-4">
            <p className="break-words text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Catalogue preview — how promoters see you
            </p>

            <div className="mt-3 space-y-2 md:hidden">
              <CataloguePreviewRow
                name={projectName}
                subtitle={`${symbol} · Your project`}
                conversion="—"
                epc="—"
                commission={enabled ? `${commission}%` : 'Off'}
                highlighted
                action={
                  <span className="inline-flex rounded-md bg-[#c8f542] px-2 py-1 text-[10px] font-semibold text-black">
                    + Join
                  </span>
                }
              />
              <CataloguePreviewRow
                name={DEMO_CATALOGUE_ROW.name}
                conversion={DEMO_CATALOGUE_ROW.conversion}
                epc={DEMO_CATALOGUE_ROW.epc}
                commission={DEMO_CATALOGUE_ROW.commission}
                action={
                  <span className="text-[10px] font-medium text-muted-foreground">Joined</span>
                }
              />
            </div>

            <div className="mt-3 hidden md:block">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-muted-foreground">
                    <th className="pb-2 pr-3 font-medium">Project</th>
                    <th className="pb-2 pr-3 font-medium">Conv.</th>
                    <th className="pb-2 pr-3 font-medium">EPC</th>
                    <th className="pb-2 pr-3 font-medium">Commission</th>
                    <th className="pb-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5 bg-sky-500/5">
                    <td className="py-3 pr-3">
                      <p className="font-medium text-white">{projectName}</p>
                      <p className="text-muted-foreground">{symbol} · Your project</p>
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">—</td>
                    <td className="py-3 pr-3 text-muted-foreground">—</td>
                    <td className="py-3 pr-3 text-sky-300">{enabled ? `${commission}%` : 'Off'}</td>
                    <td className="py-3">
                      <span className="inline-flex rounded-md bg-[#c8f542] px-2 py-1 text-[10px] font-semibold text-black">
                        + Join
                      </span>
                    </td>
                  </tr>
                  <tr className="text-muted-foreground">
                    <td className="py-3 pr-3">{DEMO_CATALOGUE_ROW.name}</td>
                    <td className="py-3 pr-3">{DEMO_CATALOGUE_ROW.conversion}</td>
                    <td className="py-3 pr-3">{DEMO_CATALOGUE_ROW.epc}</td>
                    <td className="py-3 pr-3">{DEMO_CATALOGUE_ROW.commission}</td>
                    <td className="py-3">{DEMO_CATALOGUE_ROW.action}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {enabled && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-xs font-medium text-muted-foreground">Active promoters (demo)</p>
                <ul className="mt-2 space-y-2">
                  {DEMO_AFFILIATES.map((row) => (
                    <li
                      key={row.name}
                      className="flex flex-col gap-1 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="break-words text-sm text-foreground">{row.name}</span>
                      {row.joined ? (
                        <span className="text-xs text-muted-foreground">
                          {row.clicks} clicks · EPC {row.epc}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Awaiting first join</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-3">
          {[
            { icon: Wallet, label: 'Marketing wallet', text: 'All affiliate payouts always funded here' },
            { icon: Link2, label: 'Tracked links', text: 'Unique ref per promoter' },
            { icon: TrendingUp, label: 'Live EPC', text: 'Earnings per 100 clicks' },
          ].map(({ icon: Icon, label, text }) => (
            <div
              key={label}
              className="min-w-0 rounded-xl border border-white/5 bg-white/[0.02] p-3 opacity-75"
            >
              <Icon className="h-4 w-4 text-sky-400" />
              <p className="mt-2 break-words text-sm font-medium text-white">{label}</p>
              <p className="mt-0.5 break-words text-xs text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
