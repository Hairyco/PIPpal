import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AffiliateEarnArt } from './affiliate/AffiliateEarnArt';
import { CtoGoLogo } from './CtoGoLogo';
import { LiveTrackingVisual } from './MarketingWalletHeroVisual';

const SEEN_KEY = 'ctogo-welcome-carousel-v1';

const SLIDES = [
  {
    id: 'wallet',
    title: 'Marketing wallet',
    body: 'CTOgo-routed trade fees fill a dedicated marketing wallet that pays for growth — ads, raids, and roadmap spend — without founder invoices.',
  },
  {
    id: 'raid',
    title: 'Raiders earn 0.50%',
    body: 'Share your raid link and earn 0.50% instant SOL on every trade it brings in. CTOgo is the only platform that pays raiders.',
  },
] as const;

export function WelcomeGate() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY) === '1') return;
    } catch {
      // show anyway
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      // ignore
    }
  };

  const go = (next: number) => {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
  };

  const onPrimary = () => {
    if (index < SLIDES.length - 1) {
      go(index + 1);
      return;
    }
    dismiss();
  };

  if (!open) return null;

  const slide = SLIDES[index];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-3 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal
      aria-labelledby="welcome-carousel-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Dismiss welcome"
        onClick={dismiss}
      />

      <div className="welcome-modal relative z-[1] w-full max-w-md overflow-hidden rounded-[1.35rem] border border-white/[0.12] bg-[#0a0c12] shadow-[0_32px_80px_rgba(0,0,0,0.7)] ring-1 ring-[#c8ff3d]/15">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2">
            <CtoGoLogo size={28} className="rounded-lg" />
            <span className="text-sm font-bold text-white">CTOgo</span>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="grid h-8 w-8 place-items-center rounded-full text-white/45 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            <div className="w-full shrink-0 px-4 pb-2 pt-4">
              <div className="mx-auto max-h-[14.5rem] overflow-hidden sm:max-h-[16rem]">
                <div className="origin-top scale-[0.92] sm:scale-100">
                  <LiveTrackingVisual />
                </div>
              </div>
            </div>
            <div className="flex w-full shrink-0 items-center justify-center px-4 pb-2 pt-4">
              <AffiliateEarnArt className="h-auto w-full max-w-[18rem]" />
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-1 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c8ff3d]/80">
            {index + 1} / {SLIDES.length}
          </p>
          <h2
            id="welcome-carousel-title"
            className="mt-2 text-xl font-bold tracking-tight text-white"
          >
            {slide.title}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-white/55">
            {slide.body}
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => go(index - 1)}
              disabled={index === 0}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/55 transition enabled:hover:text-white disabled:opacity-30"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5" role="tablist" aria-label="Welcome slides">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={s.title}
                  onClick={() => go(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? 'w-6 bg-[#c8ff3d]' : 'w-1.5 bg-white/25 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(index + 1)}
              disabled={index === SLIDES.length - 1}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/55 transition enabled:hover:text-white disabled:opacity-30"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onPrimary}
            className="mt-4 w-full rounded-full bg-[#c8ff3d] px-6 py-3 text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69]"
          >
            {index < SLIDES.length - 1 ? 'Next' : 'Enter CTOgo'}
          </button>
        </div>
      </div>

      <style>{`
        .welcome-modal {
          animation: welcomeModalIn 0.4s ease-out;
        }
        @keyframes welcomeModalIn {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .welcome-modal { animation: none; }
        }
      `}</style>
    </div>
  );
}
