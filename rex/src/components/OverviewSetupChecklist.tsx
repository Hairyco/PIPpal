import { Check } from 'lucide-react';

export type OverviewChecklistItem = {
  id: 'content' | 'website' | 'telegram' | 'x';
  label: string;
  detail: string;
  done: boolean;
  actionLabel: string;
};

type Props = {
  items: OverviewChecklistItem[];
  onAction: (id: OverviewChecklistItem['id']) => void;
};

export function OverviewSetupChecklist({ items, onAction }: Props) {
  const doneCount = items.filter((i) => i.done).length;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-white/45">Setup checklist</p>
        <p className="text-[11px] font-semibold text-white/35">
          {doneCount}/{items.length}
        </p>
      </div>
      <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white">{item.label}</p>
              <p className="mt-0.5 text-[11px] text-white/40">{item.detail}</p>
            </div>
            {item.done ? (
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#c8ff3d]/35 bg-[#c8ff3d]/15 text-[#d5ff69]"
                title="Done"
                aria-label={`${item.label} done`}
              >
                <Check className="h-4 w-4" strokeWidth={2.5} />
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onAction(item.id)}
                className="shrink-0 rounded-lg border border-[#c8ff3d]/35 bg-[#c8ff3d]/10 px-2.5 py-1.5 text-[11px] font-bold text-[#d5ff69] hover:bg-[#c8ff3d]/20"
              >
                {item.actionLabel}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
