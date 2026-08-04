import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { CtoGoLogo } from './CtoGoLogo';

const SEEN_KEY = 'ctogo-welcome-carousel-v3';
const SWIPE_THRESHOLD_PX = 48;

const SLIDES = [
  {
    id: 'wallet',
    title: 'Marketing wallet',
    body: 'Autonomous wallets that pay for growth — ads, raids, and roadmap spend — funded by CTOgo-routed trade fees.',
  },
  {
    id: 'raid',
    title: 'Raiders earn 0.50%',
    body: 'Share your raid link and earn 0.50% instant SOL on every trade it brings in. CTOgo is the only platform that pays raiders.',
  },
  {
    id: 'telegram',
    title: 'Telegram bot',
    body: 'Trade instantly from Telegram. Buy and sell CTOgo coins in chat — no app switch.',
  },
] as const;

function XMarkIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="#5865F2">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

/** DexScreener + Dextools trending placements (no Telegram). */
function MarketingWalletWelcomeVisual() {
  return (
    <div className="mx-auto w-full max-w-[20rem] select-none space-y-2.5" aria-hidden>
      <div className="flex items-center justify-between gap-2 rounded-full border border-white/[0.08] bg-[#1c1c1e] px-3 py-2">
        <p className="text-[11px] font-semibold text-white/70">Update socials</p>
        <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-300">
          Live
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1c1c1e]">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
          <img
            src="/images/partners/dexscreener.ico"
            alt=""
            className="h-4 w-4 rounded-sm object-contain"
          />
          <p className="flex-1 truncate text-[11px] font-semibold text-white/70">DexScreener</p>
          <span className="rounded-full bg-[#c8ff3d]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#d5ff69]">
            Trending
          </span>
        </div>
        <div className="px-3 py-2.5">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold text-white/40">$CWH · Solana</p>
              <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-white">$0.000421</p>
            </div>
            <p className="rounded-full bg-emerald-400/15 px-2 py-1 text-[11px] font-bold text-emerald-300">
              +34.8%
            </p>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[72%] rounded-full bg-[#c8ff3d]" />
          </div>
          <p className="mt-1.5 text-[9px] font-medium text-white/30">Trending bar · paid placement</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1c1c1e]">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
          <img
            src="/images/partners/dextools.svg"
            alt=""
            className="h-4 w-4 object-contain"
          />
          <p className="flex-1 truncate text-[11px] font-semibold text-white/70">DexTools</p>
          <span className="rounded-full bg-[#c8ff3d]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#d5ff69]">
            Trending
          </span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-white/40">Hot pairs · Solana</p>
            <p className="mt-0.5 truncate text-[12px] font-bold text-white">Cat Wif Hat · #4</p>
          </div>
          <div className="h-8 w-16 shrink-0">
            <svg viewBox="0 0 64 32" className="h-full w-full" preserveAspectRatio="none">
              <path
                d="M0 24 L8 20 L16 22 L24 14 L32 16 L40 8 L48 11 L56 5 L64 7"
                fill="none"
                stroke="#05a3c7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Social collage for the raiders slide. */
function RaidersSocialCollage() {
  return (
    <div className="relative mx-auto h-[9.5rem] w-full max-w-[17rem] select-none" aria-hidden>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,255,61,0.14),transparent_65%)]" />

      {/* Telegram */}
      <div className="absolute left-[8%] top-[18%] grid h-14 w-14 -rotate-6 place-items-center rounded-2xl border border-white/15 bg-[#0e1621] shadow-[0_12px_28px_rgba(0,0,0,0.45)] ring-1 ring-[#2aabee]/35">
        <img src="/images/partners/telegram.svg" alt="" className="h-7 w-7" />
      </div>

      {/* X */}
      <div className="absolute left-1/2 top-[6%] grid h-16 w-16 -translate-x-1/2 rotate-3 place-items-center rounded-2xl border border-white/15 bg-black shadow-[0_14px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/20">
        <XMarkIcon className="h-7 w-7 text-white" />
      </div>

      {/* Discord */}
      <div className="absolute right-[6%] top-[22%] grid h-14 w-14 rotate-6 place-items-center rounded-2xl border border-white/15 bg-[#0e1621] shadow-[0_12px_28px_rgba(0,0,0,0.45)] ring-1 ring-[#5865F2]/40">
        <DiscordGlyph className="h-7 w-7" />
      </div>

      {/* 0.50% earn chip */}
      <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#c8ff3d]/35 bg-[#0a0c12]/95 px-3.5 py-2 shadow-[0_10px_30px_rgba(200,255,61,0.15)]">
        <span className="text-[11px] font-semibold text-white/55">Raid share</span>
        <span className="rounded-md bg-[#c8ff3d] px-2 py-0.5 text-[12px] font-black tabular-nums text-[#090b14]">
          0.50%
        </span>
      </div>
    </div>
  );
}

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
            Bought · 0.25 SOL
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

      <div className="welcome-modal relative z-[1] w-full max-w-md overflow-hidden rounded-[22px] border border-white/[0.1] bg-[#121214] shadow-[0_32px_80px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#1c1c1e] ring-1 ring-white/10">
              <CtoGoLogo size={28} className="rounded-full" />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-bold leading-tight text-white">CTOgo</p>
              <p className="mt-0.5 text-[11px] font-medium leading-snug text-white/40">
                The Home of Community Takeovers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/45 transition hover:bg-[#1c1c1e] hover:text-white"
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
            <div className="flex w-full shrink-0 items-center justify-center px-4 pb-2 pt-4">
              <MarketingWalletWelcomeVisual />
            </div>
            <div className="flex w-full shrink-0 items-center justify-center px-4 pb-2 pt-5">
              <RaidersSocialCollage />
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
              className="rounded-full border border-white/[0.12] bg-[#1c1c1e] px-4 py-3 text-[13px] font-bold text-white/80 transition enabled:hover:bg-[#2a2a2c] enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => (isLast ? dismiss() : go(index + 1))}
              className="rounded-full bg-[#c8ff3d] px-4 py-3 text-[13px] font-bold text-[#090b14] transition hover:bg-[#d5ff69]"
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
