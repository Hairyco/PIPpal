import { useState } from 'react';
import {
  ArrowDown,
  ChevronDown,
  Filter,
  LayoutGrid,
  Pause,
  Zap,
} from 'lucide-react';

const toolBtn =
  'inline-flex h-8 shrink-0 items-center justify-center rounded-full bg-[#1c1c1e] text-white/55 ring-1 ring-white/10';
const toolPill =
  'inline-flex h-8 shrink-0 items-center rounded-full bg-[#1c1c1e] text-white/55 ring-1 ring-white/10';

function HexNutIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3.2 19.2 7.4v9.2L12 20.8 4.8 16.6V7.4L12 3.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function TrenchesToolbar() {
  const [quickBuySol, setQuickBuySol] = useState('0.5');

  return (
    <div className="flex shrink-0 items-center gap-1.5 px-3 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button type="button" className={`${toolBtn} w-8`} aria-label="Layout">
          <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2} />
        </button>

        <div
          className={`${toolPill} divide-x divide-white/10 overflow-hidden`}
          title="Quick buy amount in SOL"
        >
          <button
            type="button"
            className="grid h-8 w-8 shrink-0 place-items-center text-[#c8ff3d]"
            aria-label="Quick buy"
          >
            <Zap className="h-3.5 w-3.5" strokeWidth={2} fill="currentColor" />
          </button>
          <label className="relative flex h-8 min-w-[4.75rem] items-center gap-1 px-2">
            <img
              src="/images/partners/solana.svg"
              alt=""
              className="h-3.5 w-3.5 shrink-0 rounded-full object-cover"
            />
            <input
              type="text"
              inputMode="decimal"
              value={quickBuySol}
              onChange={(e) => {
                const next = e.target.value.replace(/[^0-9.]/g, '');
                setQuickBuySol(next);
              }}
              placeholder="0.5"
              aria-label="Quick buy SOL amount"
              className="w-[2.75rem] bg-transparent text-[12px] font-semibold tabular-nums text-white outline-none placeholder:text-white/30"
            />
          </label>
        </div>

        <div className={`${toolPill} divide-x divide-white/10`}>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-0.5 px-2.5 text-[12px] font-semibold text-white/70"
            aria-label="Preset P1"
          >
            P1
            <ChevronDown className="h-3 w-3 opacity-70" strokeWidth={2.5} />
          </button>
          <button type="button" className="grid h-8 w-8 place-items-center" aria-label="Settings">
            <HexNutIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <button type="button" className={`${toolBtn} w-8`} aria-label="Pause live feed">
          <Pause className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
        </button>

        <button
          type="button"
          className={`${toolPill} gap-0.5 px-2.5 text-[12px] font-semibold text-white/70`}
          aria-label="Sort by percent"
        >
          <ArrowDown className="h-3 w-3" strokeWidth={2.5} />
          %
          <ChevronDown className="h-3 w-3 opacity-70" strokeWidth={2.5} />
        </button>

        <button type="button" className={`${toolBtn} w-8`} aria-label="Filters">
          <Filter className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
