import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Wallet } from 'lucide-react';

type Props = {
  open: boolean;
  symbol: string;
  telegramUrl: string;
  onConfigure: () => void;
};

const SLIDES = [
  {
    id: 'telegram',
    title: 'Telegram group ready',
    body: 'Your official Telegram room is live. Join now to direct raids, coordinate holders, and post updates.',
  },
  {
    id: 'wallet',
    title: 'Marketing wallet is off',
    body: 'Auto spend stays off until you approve the spend roadmap. Fees can still fill the wallet — nothing spends until you turn it on.',
  },
] as const;

const SWIPE_MIN_PX = 48;

export function LaunchReadyCarousel({ open, symbol, telegramUrl, onConfigure }: Props) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const scrollingRef = useRef(false);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || !open) return;
    const width = el.clientWidth;
    if (width <= 0) return;
    scrollingRef.current = true;
    el.scrollTo({ left: index * width, behavior: 'smooth' });
    const t = window.setTimeout(() => {
      scrollingRef.current = false;
    }, 320);
    return () => window.clearTimeout(t);
  }, [index, open]);

  if (!open) return null;

  const last = index === SLIDES.length - 1;

  const goTo = (next: number) => {
    setIndex(Math.max(0, Math.min(SLIDES.length - 1, next)));
  };

  const onTouchStart = (event: TouchEvent) => {
    const t = event.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const t = event.changedTouches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goTo(index + 1);
    else goTo(index - 1);
  };

  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el || scrollingRef.current) return;
    const width = el.clientWidth;
    if (width <= 0) return;
    const next = Math.round(el.scrollLeft / width);
    if (next !== index) setIndex(Math.max(0, Math.min(SLIDES.length - 1, next)));
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/75 p-4 sm:items-center"
      role="dialog"
      aria-modal
      aria-labelledby="launch-ready-title"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0c0e16] shadow-2xl shadow-black/50"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative overflow-hidden border-b border-white/[0.06] bg-gradient-to-br from-[#c8ff3d]/12 via-transparent to-[#2AABEE]/10 px-5 pb-4 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
            ${symbol.replace(/^\$/, '')} · just launched
          </p>
        </div>

        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className="flex touch-pan-x snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="w-full shrink-0 snap-center snap-always px-5 py-5"
            >
              <div className="mb-4 flex h-14 items-center justify-center">
                {slide.id === 'telegram' ? (
                  <img
                    src="/images/partners/telegram.svg"
                    alt=""
                    className="h-14 w-14 drop-shadow-[0_8px_24px_rgba(42,171,238,0.35)]"
                    draggable={false}
                  />
                ) : (
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#c8ff3d]/15 text-[#d5ff69]">
                    <Wallet className="h-7 w-7" />
                  </span>
                )}
              </div>
              <h2
                id={slide.id === SLIDES[index].id ? 'launch-ready-title' : undefined}
                className="font-serif text-2xl font-bold tracking-tight text-white"
              >
                {slide.title}
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-white/55">{slide.body}</p>

              {slide.id === 'telegram' && telegramUrl.trim() ? (
                <a
                  href={telegramUrl.trim()}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-[12px] font-semibold text-[#2AABEE] underline decoration-[#2AABEE]/40 underline-offset-2"
                >
                  Open Telegram group
                </a>
              ) : null}
            </div>
          ))}
        </div>

        <div className="px-5 pb-5">
          <div className="flex items-center justify-center gap-1.5">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-5 bg-[#c8ff3d]' : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2">
            {index > 0 ? (
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] text-white/70 transition hover:border-white/25 hover:text-white"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : null}

            {last ? (
              <button
                type="button"
                onClick={onConfigure}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#c8ff3d] px-4 text-[13px] font-bold text-[#090b14] transition hover:bg-[#d5ff69]"
              >
                Turn on
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#c8ff3d] px-4 text-[13px] font-bold text-[#090b14] transition hover:bg-[#d5ff69]"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
