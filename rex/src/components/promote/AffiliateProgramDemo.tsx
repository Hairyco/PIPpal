import { useState } from 'react';
import {
  Check,
  Copy,
  Link2,
  Megaphone,
  TrendingUp,
  Users,
} from 'lucide-react';
import { DemoPreviewBadge } from './DemoPreviewBadge';
import { affiliateProgramDefaults } from '../../data/promotePricing';

const DEMO_AFFILIATES = [
  { name: 'CryptoAlpha', joined: true, clicks: 1240, conversions: 89, epc: '$4.12' },
  { name: 'MemeLord.eth', joined: true, clicks: 890, conversions: 52, epc: '$3.08' },
  { name: '—', joined: false, clicks: 0, conversions: 0, epc: '—' },
];

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
    <section className="dex-card relative overflow-hidden">
      <div className="relative z-[1] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Users className="h-4 w-4 text-sky-400" />
              <span className="text-xs font-medium uppercase tracking-wider text-sky-400">
                Affiliate programme
              </span>
              <DemoPreviewBadge />
            </div>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Let promoters earn from your marketing tax
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Publishers browse the Rex catalogue, join your programme, and share tracked links.
              Commission is paid automatically from your marketing wallet on each referred buy.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-200/90">
          TBC — affiliate tracking and payouts are not live yet. This preview shows the planned
          founder controls and promoter catalogue experience.
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="mt-1 accent-sky-500"
              />
              <div>
                <p className="font-medium text-white">Enable affiliate programme</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  List {projectName} in the promoter catalogue with a Join button.
                </p>
              </div>
            </label>

            <div className={enabled ? '' : 'pointer-events-none opacity-40'}>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Commission share of marketing tax ({commission}%)
              </label>
              <input
                type="range"
                min={affiliateProgramDefaults.commissionMin}
                max={affiliateProgramDefaults.commissionMax}
                value={commission}
                onChange={(e) => setCommission(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>{affiliateProgramDefaults.commissionMin}%</span>
                <span>{affiliateProgramDefaults.commissionMax}%</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {affiliateProgramDefaults.attributionDays}-day attribution window · min payout $
                {affiliateProgramDefaults.minPayout}
              </p>
            </div>

            <div className={enabled ? '' : 'pointer-events-none opacity-40'}>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Sample tracking link</p>
              <div className="flex gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-sky-300">
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
              className="dex-btn w-full justify-center opacity-50"
              title="Coming soon"
            >
              Save programme settings
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0a0e17]/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Catalogue preview — how promoters see you
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
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
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#c8f542] px-2 py-1 text-[10px] font-semibold text-black">
                        + Join
                      </span>
                    </td>
                  </tr>
                  <tr className="text-muted-foreground">
                    <td className="py-3 pr-3">SwiftieCoin</td>
                    <td className="py-3 pr-3">3.2%</td>
                    <td className="py-3 pr-3">$3.19</td>
                    <td className="py-3 pr-3">12%</td>
                    <td className="py-3">Joined</td>
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
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                    >
                      <span className="text-sm text-foreground">{row.name}</span>
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

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Link2, label: 'Tracked links', text: 'Unique ref per promoter' },
            { icon: TrendingUp, label: 'Live EPC', text: 'Earnings per 100 clicks' },
            { icon: Megaphone, label: 'Asset pack', text: 'Logos, charts, copy blocks' },
          ].map(({ icon: Icon, label, text }) => (
            <div
              key={label}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-3 opacity-75"
            >
              <Icon className="h-4 w-4 text-sky-400" />
              <p className="mt-2 text-sm font-medium text-white">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
