import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

const VALUATION_HELP =
  'Estimated full exit price on Rex — token stake, product & IP, marketing wallet, and listing assets combined. Used when a founder lists on the exit marketplace. Not the same as MCAP.';

const VIEWPORT_MARGIN = 16;
const TOOLTIP_MAX_WIDTH = 288;
const GAP = 8;

export function ValuationInfoTip() {
  const [open, setOpen] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const width = Math.min(TOOLTIP_MAX_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
      const half = width / 2;

      let left = rect.left + rect.width / 2;
      left = Math.max(VIEWPORT_MARGIN + half, Math.min(left, window.innerWidth - VIEWPORT_MARGIN - half));

      let top = rect.bottom + GAP;
      const estimatedHeight = 120;
      if (top + estimatedHeight > window.innerHeight - VIEWPORT_MARGIN) {
        top = Math.max(VIEWPORT_MARGIN, rect.top - GAP - estimatedHeight);
      }

      setTooltipStyle({
        position: 'fixed',
        top,
        left,
        width,
        transform: 'translateX(-50%)',
        zIndex: 60,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const tooltip =
    open &&
    createPortal(
      <>
        <button
          type="button"
          aria-label="Close valuation explanation"
          className="fixed inset-0 z-50 cursor-default bg-black/20"
          onClick={() => setOpen(false)}
        />
        <div
          id={tooltipId}
          role="tooltip"
          style={tooltipStyle}
          className="rounded-lg border border-white/10 bg-[#0a0e17] p-3 text-left text-xs leading-relaxed text-muted-foreground shadow-xl shadow-black/40"
        >
          {VALUATION_HELP}
        </div>
      </>,
      document.body,
    );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="What is valuation?"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex rounded-full p-0.5 text-muted-foreground transition-colors hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
      </button>
      {tooltip}
    </>
  );
}
