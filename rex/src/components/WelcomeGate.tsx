import { useEffect, useState } from 'react';
import { CtoGoLogo } from './CtoGoLogo';

const SEEN_KEY = 'ctogo-welcome-gate-seen';

export function WelcomeGate() {
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
      className="fixed inset-0 z-[100] flex flex-col"
      role="dialog"
      aria-modal
      aria-labelledby="welcome-gate-title"
    >
      <img
        src="/welcome-hodl.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        decoding="async"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/35"
        aria-hidden
      />

      <div className="relative z-[1] mt-auto flex flex-col items-center px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-10 text-center animate-[welcomeIn_0.45s_ease-out]">
        <CtoGoLogo size={56} className="rounded-2xl" />
        <h1
          id="welcome-gate-title"
          className="mt-4 font-serif text-5xl font-bold tracking-tight text-white sm:text-6xl"
        >
          CTOgo
        </h1>
        <p className="mt-3 max-w-sm text-base leading-relaxed text-white/75 sm:text-lg">
          No devs. No rugs. Community owned.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-8 min-w-[11rem] rounded-xl bg-[#c8ff3d] px-8 py-3.5 text-sm font-semibold text-[#090b14] transition hover:bg-[#d5ff69]"
        >
          Enter
        </button>
      </div>

      <style>{`
        @keyframes welcomeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
