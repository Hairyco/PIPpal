import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Infinity, Users, X } from 'lucide-react';
import { AffiliateEarnArt } from './AffiliateEarnArt';

const SEEN_KEY = 'ctogo-affiliate-sheet-seen';

export function AffiliatePromoSheet() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY) === '1') return;
    } catch {
      // show anyway
    }
    const timer = window.setTimeout(() => setOpen(true), 1100);
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
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      role="dialog"
      aria-modal
      aria-labelledby="affiliate-sheet-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        aria-label="Dismiss"
        onClick={dismiss}
      />
      <div className="relative z-[1] w-full max-w-lg animate-[slideUpAffiliate_0.38s_ease-out] rounded-t-2xl border border-white/10 border-b-0 bg-[#050505] px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-20px_60px_rgba(0,0,0,0.65)]">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" aria-hidden />
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#c8ff3d]/15 text-[#c8ff3d]">
              <Users className="h-4 w-4" />
            </span>
            <div>
              <p id="affiliate-sheet-title" className="font-serif text-lg font-bold text-white">
                Affiliate
              </p>
              <p className="text-[11px] text-white/40">Share links · earn on every trade</p>
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

        <AffiliateEarnArt className="mx-auto mt-2 h-28 w-full max-w-sm" />

        <div className="mt-2 rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/[0.07] p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white">Earn on referrals</p>
            <span className="inline-flex items-center gap-1 rounded-md bg-[#c8ff3d] px-2 py-0.5 text-xs font-bold text-[#090b14]">
              0.2%
              <Infinity className="h-3.5 w-3.5" aria-hidden />
            </span>
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-white/60">
            Get <span className="font-semibold text-[#d5ff69]">0.2%</span> of referral trading fees —
            forever. When someone trades through your link, you keep earning for as long as they
            trade.
          </p>
          <ul className="mt-2.5 space-y-1">
            <li className="flex gap-1.5 text-[11px] text-white/70">
              <span className="text-[#c8ff3d]">∞</span>
              Lifetime cut on referred volume
            </li>
            <li className="flex gap-1.5 text-[11px] text-white/70">
              <span className="text-[#c8ff3d]">∞</span>
              Paid from trading fees — not your pocket
            </li>
            <li className="flex gap-1.5 text-[11px] text-white/70">
              <span className="text-[#c8ff3d]">∞</span>
              Share from your dashboard when you list or launch
            </li>
          </ul>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/affiliates"
            onClick={dismiss}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#c8ff3d] px-4 py-3 text-sm font-semibold text-[#090b14] transition hover:bg-[#d5ff69]"
          >
            See affiliate programmes
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
        @keyframes slideUpAffiliate {
          from { transform: translateY(110%); opacity: 0.6; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
