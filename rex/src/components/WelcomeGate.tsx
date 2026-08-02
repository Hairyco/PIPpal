import { useEffect, useState } from 'react';
import { CtoGoLogo } from './CtoGoLogo';
import { useAuth } from './AuthProvider';
import { SolanaLogo } from './SolanaLogo';

const SEEN_KEY = 'ctogo-welcome-gate-v3';

/** Recognisable community takeovers for the opening preview — not fake demo tickers. */
const PREVIEW = [
  {
    ticker: 'CWH',
    name: 'Cat Wif Hat',
    marketCap: '$12.4M',
    change24h: 18.2,
    colors: 'from-amber-300 to-orange-700',
  },
  {
    ticker: 'SHIB',
    name: 'Shiba Inu',
    marketCap: '$8.1B',
    change24h: 4.6,
    colors: 'from-orange-400 to-red-700',
  },
  {
    ticker: 'BONK',
    name: 'Bonk',
    marketCap: '$1.9B',
    change24h: 9.1,
    colors: 'from-yellow-300 to-orange-600',
  },
  {
    ticker: 'PEPE',
    name: 'Pepe',
    marketCap: '$3.2B',
    change24h: -2.4,
    colors: 'from-lime-300 to-emerald-700',
  },
] as const;

function formatChange(n: number) {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

function ProductPreview() {
  return (
    <div
      className="pointer-events-none mx-auto w-[min(100%,22rem)] origin-top select-none"
      style={{
        transform: 'perspective(900px) rotateX(12deg) rotateY(-6deg) rotateZ(2deg)',
      }}
      aria-hidden
    >
      <div className="overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0a0c12] shadow-[0_40px_80px_rgba(0,0,0,0.65)] ring-1 ring-[#c8ff3d]/15">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <CtoGoLogo size={22} className="rounded-md" />
            <span className="font-serif text-sm font-bold text-white">CTOgo</span>
          </div>
          <span className="rounded-full bg-[#c8ff3d] px-2.5 py-1 text-[10px] font-bold text-[#090b14]">
            Enter
          </span>
        </div>
        <div className="space-y-1.5 p-2.5">
          <p className="px-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Community takeovers
          </p>
          {PREVIEW.map((p) => (
            <div
              key={p.ticker}
              className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-2.5 py-2"
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br text-[9px] font-bold text-white/90 ring-1 ring-white/10 ${p.colors}`}
              >
                {p.ticker.slice(0, 2)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">${p.ticker}</p>
                <p className="truncate text-[10px] text-white/40">{p.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold tabular-nums text-white/80">{p.marketCap}</p>
                <p
                  className={`text-[10px] font-semibold tabular-nums ${
                    p.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatChange(p.change24h)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WelcomeGate() {
  const { signedIn, requireAuth } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY) === '1') return;
    } catch {
      // show anyway
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open || !signedIn) return;
    setOpen(false);
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      // ignore
    }
  }, [signedIn, open]);

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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#03040a]"
      role="dialog"
      aria-modal
      aria-labelledby="welcome-gate-title"
    >
      {/* Atmosphere — layered lime planes (Axiom-style depth, CTOgo palette) */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_18%,rgba(200,255,61,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_20%_80%,rgba(200,255,61,0.05),transparent_50%)]" />
        <div
          className="absolute left-1/2 top-[8%] h-[42%] w-[78%] -translate-x-1/2 rounded-3xl border border-white/[0.06] bg-[#0c101c]/80 blur-[1px] animate-[welcomeFloat_8s_ease-in-out_infinite]"
          style={{ transform: 'translateX(-50%) rotate(-8deg) scale(1.05)' }}
        />
        <div
          className="absolute left-1/2 top-[14%] h-[36%] w-[68%] -translate-x-1/2 rounded-3xl border border-[#c8ff3d]/10 bg-[#10141f]/70 animate-[welcomeFloat_10s_ease-in-out_infinite_reverse]"
          style={{ transform: 'translateX(-42%) rotate(6deg)' }}
        />
        <div
          className="absolute left-1/2 top-[20%] h-[30%] w-[58%] -translate-x-1/2 rounded-3xl border border-white/[0.05] bg-[#080a12]/90"
          style={{ transform: 'translateX(-55%) rotate(-3deg)' }}
        />
      </div>

      <header className="relative z-[1] flex items-center justify-between px-4 pb-2 pt-[max(0.85rem,env(safe-area-inset-top))] sm:px-6">
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex items-center gap-2"
          aria-label="CTOgo home"
        >
          <CtoGoLogo size={36} className="rounded-xl" />
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => void requireAuth('Sign in to CTOgo.')}
            className="px-2 py-2 text-sm font-semibold text-white/70 transition hover:text-white"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => void requireAuth('Create your free CTOgo account.')}
            className="rounded-full bg-[#c8ff3d] px-4 py-2 text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69]"
          >
            Sign up
          </button>
        </div>
      </header>

      <div className="relative z-[1] flex flex-1 flex-col items-center px-5 pb-2 pt-6 text-center sm:pt-10">
        <div className="animate-[welcomeIn_0.55s_ease-out]">
          <CtoGoLogo size={64} className="mx-auto rounded-2xl shadow-[0_0_48px_rgba(200,255,61,0.25)]" />
          <p className="mt-4 font-serif text-xl font-bold tracking-tight text-white sm:text-2xl">
            CTOgo
          </p>
          <h1
            id="welcome-gate-title"
            className="mt-3 max-w-md font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            The Home of Community Takeovers
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/55 sm:text-base">
            CTOgo is the only platform where raiders get paid instant SOL yield on every single swap.
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="mt-7 min-w-[12.5rem] rounded-full bg-[#c8ff3d] px-8 py-3.5 text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69] hover:shadow-[0_0_32px_rgba(200,255,61,0.35)]"
          >
            Enter CTOgo
          </button>
          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">
              Built on
            </p>
            <div className="inline-flex items-center gap-2 text-white/80">
              <SolanaLogo className="h-5 w-5" />
              <span className="text-sm font-semibold tracking-tight">Solana</span>
            </div>
          </div>
        </div>

        <div className="mt-auto w-full pt-8 animate-[welcomePreview_0.7s_0.15s_ease-out_both]">
          <ProductPreview />
        </div>
      </div>

      <style>{`
        @keyframes welcomeIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes welcomePreview {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes welcomeFloat {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
