import { BadgeCheck, Wallet } from 'lucide-react';
import { TokenIcon } from '../TokenIcon';
import { devStudios, projectDeliverables, type DeliverableId } from '../../data/devStudios';
import { industries } from '../../data/industries';
import { talentPool } from '../../data/talentPool';

export interface LaunchPreviewData {
  projectName: string;
  categoryId: string;
  description: string;
  deliverables: DeliverableId[];
  shortlistedStudios: string[];
  showOwnSupplier: boolean;
  ownSupplierName: string;
  studioSkipped: boolean;
  talentAssignments: Record<string, string>;
}

function makeSymbol(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'REX';
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return words
      .slice(0, 3)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .padEnd(3, words[0].slice(1, 2).toUpperCase())
      .slice(0, 4);
  }
  return trimmed.slice(0, 4).toUpperCase();
}

function walletProgress(data: LaunchPreviewData): number {
  let pct = 8;
  if (data.projectName.trim()) pct += 12;
  if (data.categoryId) pct += 10;
  if (data.description.trim()) pct += 15;
  pct += Math.min(data.deliverables.length * 8, 24);
  pct += Math.min(data.shortlistedStudios.length * 10, 20);
  if (data.showOwnSupplier && data.ownSupplierName.trim()) pct += 15;
  if (data.studioSkipped) pct += 8;
  const talentCount = Object.values(data.talentAssignments).filter(Boolean).length;
  pct += Math.min(talentCount * 6, 18);
  return Math.min(pct, 92);
}

export function LaunchPreview({ data }: { data: LaunchPreviewData }) {
  const symbol = makeSymbol(data.projectName);
  const industry = industries.find((i) => i.id === data.categoryId);
  const walletPct = walletProgress(data);

  const talentLines = Object.entries(data.talentAssignments)
    .filter(([, id]) => id)
    .map(([deliverableId, talentId]) => {
      const d = projectDeliverables.find((x) => x.id === deliverableId);
      const t = talentPool.find((x) => x.id === talentId);
      return { label: d?.label ?? deliverableId, name: t?.name ?? '' };
    });

  return (
    <div className="lg:sticky lg:top-24">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-sky-400">Live preview</p>
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
          Updates as you type
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e17] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 bg-[#111820] px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          </div>
          <p className="mx-auto truncate text-[10px] text-muted-foreground">
            rex.app/project/{data.categoryId || 'your-category'}/preview
          </p>
        </div>

        <div className="p-5">
          <div className="flex items-start gap-3">
            <TokenIcon symbol={symbol} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-lg font-bold text-white">
                  {data.projectName.trim() || 'Your project name'}
                </h3>
                <BadgeCheck className="h-4 w-4 shrink-0 text-sky-400/50" />
              </div>
              <p className="text-xs text-muted-foreground">
                {symbol} · {industry?.name ?? 'Select category'} · Just launched
              </p>
            </div>
          </div>

          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {data.description.trim() ||
              'Your project description will appear here as investors browse your page.'}
          </p>

          {data.deliverables.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {data.deliverables.map((id) => {
                const d = projectDeliverables.find((x) => x.id === id);
                return (
                  <span
                    key={id}
                    className="rounded-full border border-sky-500/25 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-300"
                  >
                    {d?.label}
                  </span>
                );
              })}
            </div>
          )}

          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" />
                Marketing wallet
              </span>
              <span className="font-medium text-emerald-400">${Math.round(walletPct * 30)}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${walletPct}%` }}
              />
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Next milestone: DexScreener promotion at $300
            </p>
            <div className="mt-3 flex h-12 items-end gap-0.5">
              {Array.from({ length: 14 }, (_, i) => {
                const h = 20 + ((i * 17 + symbol.length * 5) % 70) * (walletPct / 100);
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-sky-500/40 transition-all duration-500"
                    style={{ height: `${Math.max(8, h)}%` }}
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Build team
            </p>
            {data.shortlistedStudios.length > 0 ? (
              <ul className="space-y-1">
                {data.shortlistedStudios.map((id) => {
                  const studio = devStudios.find((s) => s.id === id);
                  return (
                    <li key={id} className="text-xs text-white">
                      {studio?.name}{' '}
                      <span className="text-muted-foreground">· studio</span>
                    </li>
                  );
                })}
              </ul>
            ) : data.showOwnSupplier && data.ownSupplierName.trim() ? (
              <p className="text-xs text-white">
                {data.ownSupplierName}{' '}
                <span className="text-muted-foreground">· your supplier (vetting)</span>
              </p>
            ) : data.studioSkipped ? (
              <p className="text-xs text-muted-foreground">Studio — decide later</p>
            ) : (
              <p className="text-xs text-muted-foreground">No studio selected yet</p>
            )}

            {talentLines.length > 0 && (
              <ul className="mt-2 space-y-1">
                {talentLines.map((line) => (
                  <li key={line.label} className="text-xs">
                    <span className="text-muted-foreground">{line.label}:</span>{' '}
                    <span className="text-sky-400">{line.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-white/5 py-2">
              <p className="text-[10px] text-muted-foreground">Price</p>
              <p className="text-xs font-semibold text-white">$0.001</p>
            </div>
            <div className="rounded-lg bg-white/5 py-2">
              <p className="text-[10px] text-muted-foreground">24H</p>
              <p className="text-xs font-semibold text-emerald-400">+0.0%</p>
            </div>
            <div className="rounded-lg bg-white/5 py-2">
              <p className="text-[10px] text-muted-foreground">MCAP</p>
              <p className="text-xs font-semibold text-sky-400">$—</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
