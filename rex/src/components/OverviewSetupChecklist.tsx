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
  const remaining = items.filter((i) => !i.done);
  const allDone = remaining.length === 0;

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-white/45">Complete before go-live</p>
        <p className="text-[11px] font-semibold text-white/35">
          {doneCount}/{items.length}
        </p>
      </div>

      {allDone ? (
        <p className="flex items-center gap-2 rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-3 py-2.5 text-[13px] font-semibold text-[#d5ff69]">
          <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          You&apos;re ready to grow
        </p>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
          {remaining.map((item, index) => (
            <li
              key={item.id}
              className={`flex items-center gap-3 px-3 py-3 ${
                index > 0 ? 'border-t border-white/[0.06]' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-white">{item.label}</p>
              </div>
              <button
                type="button"
                onClick={() => onAction(item.id)}
                className="shrink-0 rounded-lg bg-[#c8ff3d] px-3 py-1.5 text-[11px] font-bold text-[#090b14] hover:bg-[#d5ff69]"
              >
                {item.actionLabel}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
