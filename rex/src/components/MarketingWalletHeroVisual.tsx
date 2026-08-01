import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MarketingWalletProgressTracker } from './MarketingWalletExplainer';
import { PolessiaLogo } from './PolessiaLogo';

const SLIDES = [
  { id: 'ads', label: 'Ads live' },
  { id: 'tracking', label: 'Live tracking' },
] as const;

function AdsUnlockVisual() {
  const candles = [
    { o: 62, c: 55, h: 68, l: 52 },
    { o: 55, c: 58, h: 64, l: 50 },
    { o: 58, c: 52, h: 60, l: 48 },
    { o: 52, c: 61, h: 66, l: 50 },
    { o: 61, c: 57, h: 65, l: 54 },
    { o: 57, c: 68, h: 72, l: 56 },
    { o: 68, c: 64, h: 74, l: 60 },
    { o: 64, c: 73, h: 78, l: 62 },
    { o: 73, c: 70, h: 80, l: 66 },
    { o: 70, c: 82, h: 88, l: 68 },
    { o: 82, c: 79, h: 90, l: 76 },
    { o: 79, c: 91, h: 96, l: 77 },
    { o: 91, c: 88, h: 98, l: 84 },
    { o: 88, c: 97, h: 102, l: 86 },
  ];

  const chartH = 120;
  const chartW = 280;
  const padX = 8;
  const padY = 10;
  const slot = (chartW - padX * 2) / candles.length;
  const y = (v: number) => padY + ((110 - v) / 70) * (chartH - padY * 2);

  const linePts = candles.map((c, i) => {
    const x = padX + slot * i + slot / 2;
    return `${x},${y(c.c)}`;
  });
  const firstX = padX + slot / 2;
  const lastX = padX + slot * (candles.length - 0.5);
  const areaPath = `M ${firstX},${chartH - padY} L ${linePts.join(' L ')} L ${lastX},${chartH - padY} Z`;
  const linePath = `M ${linePts.join(' L ')}`;

  return (
    <div className="mkt-hero-visual relative w-full select-none" aria-hidden>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_60%_40%,rgba(42,171,238,0.22),transparent_60%)]" />

      <div className="mkt-hero-chart relative z-[1] mr-6 sm:mr-10">
        <div className="overflow-hidden rounded-2xl border border-white/[0.12] bg-[#070a10] shadow-[0_24px_60px_rgba(0,0,0,0.55)] ring-1 ring-[#2aabee]/20">
          <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.03] px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <p className="ml-2 flex-1 truncate text-[10px] font-semibold text-white/45">
              dexscreener.com/solana · $MPEG
            </p>
            <span className="rounded bg-emerald-400/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
              LIVE
            </span>
          </div>

          <div className="px-3 pb-3 pt-2.5">
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
                  Moon Pigeon
                </p>
                <p className="mt-0.5 font-mono text-lg font-bold tabular-nums text-white">
                  $0.000421
                </p>
              </div>
              <p className="rounded-md bg-emerald-400/15 px-2 py-1 text-[11px] font-bold text-emerald-300">
                +34.8%
              </p>
            </div>

            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="mt-2 h-[7.5rem] w-full overflow-visible"
            >
              <defs>
                <linearGradient id="mktChartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((t) => (
                <line
                  key={t}
                  x1={padX}
                  x2={chartW - padX}
                  y1={padY + t * (chartH - padY * 2)}
                  y2={padY + t * (chartH - padY * 2)}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
              ))}
              <path d={areaPath} fill="url(#mktChartFill)" />
              <path
                d={linePath}
                fill="none"
                stroke="#34d399"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity="0.85"
              />
              {candles.map((c, i) => {
                const x = padX + slot * i + slot / 2;
                const up = c.c >= c.o;
                const color = up ? '#34d399' : '#fb7185';
                return (
                  <g key={i}>
                    <line
                      x1={x}
                      x2={x}
                      y1={y(c.h)}
                      y2={y(c.l)}
                      stroke={color}
                      strokeWidth="1.25"
                    />
                    <rect
                      x={x - 3.5}
                      y={y(Math.max(c.o, c.c))}
                      width="7"
                      height={Math.max(2, Math.abs(y(c.o) - y(c.c)))}
                      rx="1"
                      fill={color}
                    />
                  </g>
                );
              })}
            </svg>

            <div className="mt-1 flex items-center justify-between text-[9px] text-white/30">
              <span>Trending · paid placement</span>
              <span className="font-semibold text-[#2aabee]">DexScreener</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mkt-hero-tg relative z-[2] -mt-16 ml-auto w-[min(100%,17.5rem)] sm:-mt-20 sm:w-[18.5rem]">
        <div className="overflow-hidden rounded-[1.35rem] border border-white/[0.14] bg-[#0e1621] shadow-[0_28px_70px_rgba(0,0,0,0.65)] ring-1 ring-[#2aabee]/25">
          <div className="flex items-center justify-between bg-[#17212b] px-4 pb-1.5 pt-2.5">
            <span className="text-[10px] font-semibold tabular-nums text-white/70">9:41</span>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-3.5 rounded-[1px] bg-white/45" />
              <span className="h-2.5 w-2 rounded-sm border border-white/45" />
              <span className="relative h-2.5 w-4 rounded-sm border border-white/45">
                <span className="absolute inset-[2px] rounded-[1px] bg-emerald-400/85" />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 border-b border-white/[0.06] bg-[#17212b] px-3 py-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#c8ff3d] text-[11px] font-black text-[#090b14]">
              GO
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">CTOgo Ads</p>
              <p className="text-[10px] text-[#2aabee]">bot · online</p>
            </div>
            <img src="/images/partners/telegram.svg" alt="" className="h-4 w-4 opacity-80" />
          </div>

          <div className="space-y-2.5 bg-[radial-gradient(ellipse_at_top,rgba(42,171,238,0.08),transparent_55%),#0e1621] px-3 py-3">
            <p className="text-center text-[9px] font-medium uppercase tracking-wider text-white/25">
              Today
            </p>

            <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#2b5278] px-3 py-2 text-[11px] leading-snug text-white/90">
              Settings on · wallet hit $500 — unlock DexScreener trending?
              <p className="mt-1 text-right text-[9px] text-white/40">9:38</p>
            </div>

            <div className="mkt-hero-bubble max-w-[92%] rounded-2xl rounded-bl-md border border-white/[0.06] bg-[#182533] px-3 py-2.5 shadow-sm">
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#c8ff3d]/20 text-[8px] font-black text-[#d5ff69]">
                  GO
                </span>
                <span className="text-[10px] font-bold text-[#d5ff69]">CTOgo Ads</span>
              </div>
              <p className="text-[12px] font-semibold leading-snug text-white">
                Your DexScreener trending ad is now running.
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/55">
                $MPEG · 24h boost live. Paid from marketing wallet — no founder invoice.
              </p>
              <div className="mt-2.5 overflow-hidden rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                  Placement active
                </p>
                <p className="mt-0.5 text-[11px] text-white/70">DexScreener · Trending · Solana</p>
              </div>
              <p className="mt-1.5 text-right text-[9px] text-white/35">9:41 ✓✓</p>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-white/[0.06] bg-[#17212b] px-3 py-2.5">
            <div className="h-8 flex-1 rounded-full bg-white/[0.06] px-3 text-[11px] leading-8 text-white/30">
              Message
            </div>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#2aabee] text-[12px] font-bold text-white">
              ↑
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveTrackingVisual() {
  return (
    <div className="mkt-hero-track relative w-full select-none" aria-hidden>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_40%_30%,rgba(200,255,61,0.12),transparent_55%)]" />

      <div className="overflow-hidden rounded-2xl border border-white/[0.12] bg-[#070a10] shadow-[0_24px_60px_rgba(0,0,0,0.55)] ring-1 ring-[#c8ff3d]/20">
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-white/[0.03] px-3.5 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#d5ff69]/90">
              Live tracking
            </p>
            <p className="mt-0.5 text-[12px] text-white/50">
              Milestones unlock as the wallet fills
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-right">
            <p className="text-[9px] font-medium uppercase tracking-wide text-white/35">Wallet</p>
            <p className="font-mono text-sm font-bold tabular-nums text-white">$420</p>
          </div>
        </div>

        <div className="p-3.5">
          <MarketingWalletProgressTracker balanceUsd={420} compact />
          <div className="mt-3 flex justify-end border-t border-white/[0.06] pt-3">
            <PolessiaLogo variant="powered" size="xs" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hero carousel: DexScreener ad unlock → live spend tracker.
 */
export function MarketingWalletHeroVisual() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [paused]);

  const go = (next: number) => {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
  };

  return (
    <div
      className="relative mx-auto mt-6 w-full max-w-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          <div className="w-full shrink-0 px-0.5 pb-1">
            <AdsUnlockVisual />
          </div>
          <div className="w-full shrink-0 px-0.5 pb-1">
            <LiveTrackingVisual />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => go(index - 1)}
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-white/55 hover:text-white"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2" role="tablist" aria-label="Marketing wallet visuals">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={slide.label}
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
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-white/55 hover:text-white"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-2 text-center text-[11px] font-medium text-white/40">{SLIDES[index].label}</p>

      <style>{`
        .mkt-hero-chart {
          animation: mktChartIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .mkt-hero-tg {
          animation: mktTgIn 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
        }
        .mkt-hero-bubble {
          animation: mktBubbleIn 0.55s ease-out 0.55s both;
        }
        .mkt-hero-track {
          animation: mktChartIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes mktChartIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mktTgIn {
          from { opacity: 0; transform: translateY(18px) translateX(8px); }
          to { opacity: 1; transform: translateY(0) translateX(0); }
        }
        @keyframes mktBubbleIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mkt-hero-chart, .mkt-hero-tg, .mkt-hero-bubble, .mkt-hero-track { animation: none; }
        }
      `}</style>
    </div>
  );
}
