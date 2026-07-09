import { useId, useState } from 'react';
import { Info } from 'lucide-react';

const VALUATION_HELP =
  'Estimated full exit price on Rex — token stake, product & IP, marketing wallet, and listing assets combined. Used when a founder lists on the exit marketplace. Not the same as MCAP.';

export function ValuationInfoTip() {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="What is valuation?"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex rounded-full p-0.5 text-muted-foreground transition-colors hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close valuation explanation"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            id={tooltipId}
            role="tooltip"
            className="absolute left-1/2 top-full z-50 mt-2 w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-white/10 bg-[#0a0e17] p-3 text-left text-xs leading-relaxed text-muted-foreground shadow-xl shadow-black/40 sm:left-0 sm:translate-x-0"
          >
            {VALUATION_HELP}
          </div>
        </>
      )}
    </span>
  );
}
