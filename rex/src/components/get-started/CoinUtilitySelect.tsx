import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { coinUtilityOptions, type CoinUtilityId } from '../../data/coinUtilities';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30';

interface CoinUtilitySelectProps {
  selected: CoinUtilityId[];
  onChange: (ids: CoinUtilityId[]) => void;
}

export function CoinUtilitySelect({ selected, onChange }: CoinUtilitySelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (id: CoinUtilityId) => {
    onChange(
      selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id],
    );
  };

  const summary =
    selected.length === 0
      ? 'Select coin utilities…'
      : `${selected.length} utilit${selected.length === 1 ? 'y' : 'ies'} selected`;

  return (
    <div ref={rootRef} className="relative">
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        Coin utilities
      </label>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`${inputClass} flex items-center justify-between text-left`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={selected.length === 0 ? 'text-muted-foreground' : 'text-foreground'}>
          {summary}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#0a0e17] p-2 shadow-xl">
          {coinUtilityOptions.map((utility) => {
            const isSelected = selected.includes(utility.id);
            return (
              <button
                key={utility.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => toggle(utility.id)}
                className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  isSelected ? 'bg-sky-500/10' : 'hover:bg-white/5'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    isSelected
                      ? 'border-sky-500 bg-sky-500 text-white'
                      : 'border-white/20 bg-transparent'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-white">{utility.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {utility.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.map((id) => {
            const utility = coinUtilityOptions.find((item) => item.id === id);
            if (!utility) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-300"
              >
                {utility.label}
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="rounded-full p-0.5 hover:bg-sky-500/20"
                  aria-label={`Remove ${utility.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <p className="mt-1.5 text-xs text-muted-foreground">
        Choose what your coin offers holders — shown on your project page.
      </p>
    </div>
  );
}
