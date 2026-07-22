import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Zap } from 'lucide-react';
import { LAUNCH_PACK, formatSolPrice } from '../../data/directServices';
import { LightningBundleArt } from './LightningBundleArt';

const SEEN_KEY = 'rex-services-sheet-seen';

export function ServicesBottomSheet() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY) === '1') return;
    } catch {
      // show anyway
    }
    const timer = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

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
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal aria-labelledby="services-sheet-title">
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        aria-label="Dismiss"
        onClick={dismiss}
      />
      <div
        className="relative z-[1] w-full max-w-lg animate-[slideUpSheet_0.38s_ease-out] rounded-t-2xl border border-white/10 border-b-0 bg-[#050505] px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-20px_60px_rgba(0,0,0,0.65)]"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" aria-hidden />
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#c8ff3d]/15 text-[#c8ff3d]">
              <Zap className="h-4 w-4 fill-[#c8ff3d]" />
            </span>
            <div>
              <p id="services-sheet-title" className="font-serif text-lg font-bold text-white">
                Rex services
              </p>
              <p className="text-[11px] text-white/40">Direct SOL pay — separate from marketing wallet</p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="grid h-8 w-8 place-items-center rounded-lg text-white/45 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <LightningBundleArt className="mx-auto mt-2 h-28 w-full max-w-sm" />

        <div className="mt-2 rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/[0.07] p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white">{LAUNCH_PACK.title}</p>
            <span className="rounded-md bg-[#c8ff3d] px-2 py-0.5 text-xs font-bold text-[#090b14]">
              {formatSolPrice(LAUNCH_PACK.priceSol)}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-white/55">{LAUNCH_PACK.tagline}</p>
          <ul className="mt-2 space-y-1">
            {LAUNCH_PACK.includes.slice(0, 3).map((item) => (
              <li key={item} className="flex gap-1.5 text-[11px] text-white/70">
                <span className="text-[#c8ff3d]">⚡</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[10px] text-white/35">
            DexScreener not included — add later from your dashboard or marketing wallet.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/services"
            onClick={dismiss}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#c8ff3d] px-4 py-3 text-sm font-semibold text-[#090b14] transition hover:bg-[#d5ff69]"
          >
            Get the launch pack
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-white/55 hover:text-white"
          >
            Maybe later
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUpSheet {
          from { transform: translateY(110%); opacity: 0.6; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
