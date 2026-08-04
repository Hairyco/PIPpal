import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { AffiliateEarnArt } from './affiliate/AffiliateEarnArt';
import { CtoGoLogo } from './CtoGoLogo';
import { LiveTrackingVisual } from './MarketingWalletHeroVisual';

const SEEN_KEY = 'ctogo-welcome-carousel-v2';
const SWIPE_THRESHOLD_PX = 48;

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
  {
    id: 'telegram',
    title: 'Telegram bot',
    body: 'Trade instantly from Telegram. Buy and sell CTOgo coins in chat — no app switch, same fee routing and raid attribution.',
  },
] as const;

function TelegramBotVisual() {
  return (
    <div className="mx-auto w-full max-w-[17.5rem] select-none" aria-hidden>
      <div className="overflow-hidden rounded-[1.35rem] border border-white/[0.14] bg-[#0e1621] shadow-[0_20px_50px_rgba(0,0,0,0.55)] ring-1 ring-[#2aabee]/25">
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] bg-[#17212b] px-3 py-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#c8ff3d] text-[11px] font-black text-[#090b14]">
            GO
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">CTOgo Trade Bot</p>
            <p className="text-[10px] text-[#2aabee]">bot · online</p>
          </div>
          <img src="/images/partners/telegram.svg" alt="" className="h-4 w-4 opacity-80" />
        </div>

        <div className="space-y-2.5 bg-[radial-gradient(ellipse_at_top,rgba(42,171,238,0.08),transparent_55%),#0e1621] px-3 py-3">
          <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-white/[0.06] bg-[#182533] px-3 py-2.5">
            <p className="text-[12px] font-semibold leading-snug text-white">
              Instant trade ready
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/55">
              $CWH · Buy 0.25 SOL
            </p>
            <div className="mt-2.5 flex gap-2">
              <span className="flex-1 rounded-lg bg-[#c8ff3d] py-1.5 text-center text-[11px] font-bold text-[#090b14]">
                Buy
              </span>
              <span className="flex-1 rounded-lg bg-white/10 py-1.5 text-center text-[11px] font-bold text-white/80">
                Sell
              </span>
            </div>
          </div>
          <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-[#2b5278] px-3 py-2 text-[11px] leading-snug text-white/90">
            Bought · 0.25 SOL · fees routed
            <p className="mt-1 text-right text-[9px] text-white/40">just now ✓✓</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WelcomeGate() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lockAxis = useRef<'x' | 'y' | null>(null);
  const dragXRef = useRef(0);
  const indexRef = useRef(index);
  indexRef.current = index;

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
    const clamped = Math.max(0, Math.min(SLIDES.length - 1, next));
    setIndex(clamped);
    dragXRef.current = 0;
    setDragX(0);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    lockAxis.current = null;
    dragXRef.current = 0;
    setDragX(0);
    setDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const t = e.touches[0];
    if (!t) return;
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;

    if (lockAxis.current == null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      lockAxis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (lockAxis.current !== 'x') return;

    e.preventDefault();
    const atStart = indexRef.current === 0 && dx > 0;
    const atEnd = indexRef.current === SLIDES.length - 1 && dx < 0;
    const next = atStart || atEnd ? dx * 0.35 : dx;
    dragXRef.current = next;
    setDragX(next);
  };

  const onTouchEnd = () => {
    const dx = dragXRef.current;
    touchStartX.current = null;
    touchStartY.current = null;
    lockAxis.current = null;
    setDragging(false);

    if (dx <= -SWIPE_THRESHOLD_PX && indexRef.current < SLIDES.length - 1) {
      go(indexRef.current + 1);
      return;
    }
    if (dx >= SWIPE_THRESHOLD_PX && indexRef.current > 0) {
      go(indexRef.current - 1);
      return;
    }
    dragXRef.current = 0;
    setDragX(0);
  };

  if (!open) return null;

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;
  const isFirst = index === 0;

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

        <div
          className="overflow-hidden"
          style={{ touchAction: 'pan-y' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        >
          <div
            className={`flex ${dragging ? '' : 'transition-transform duration-300 ease-out'}`}
            style={{
              transform: `translateX(calc(-${index * 100}% + ${dragX}px))`,
            }}
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
            <div className="flex w-full shrink-0 items-center justify-center px-4 pb-2 pt-4">
              <TelegramBotVisual />
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-1 text-center">
          <div className="flex items-center justify-center gap-1.5" role="tablist" aria-label="Welcome slides">
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

          <h2
            id="welcome-carousel-title"
            className="mt-3 text-xl font-bold tracking-tight text-white"
          >
            {slide.title}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-white/55">
            {slide.body}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => go(index - 1)}
              disabled={isFirst}
              className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white/80 transition enabled:hover:bg-white/[0.08] enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => (isLast ? dismiss() : go(index + 1))}
              className="rounded-full bg-[#c8ff3d] px-4 py-3 text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69]"
            >
              {isLast ? 'Enter CTOgo' : 'Next'}
            </button>
          </div>
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
