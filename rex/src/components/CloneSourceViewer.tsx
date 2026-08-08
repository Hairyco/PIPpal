import { ExternalLink, Loader2, Sparkles, X } from 'lucide-react';

type CloneSourceViewerProps = {
  open: boolean;
  name: string;
  ticker: string;
  logo: string;
  url: string;
  cloning?: boolean;
  onClose: () => void;
  onClone: () => void;
};

/**
 * In-page window to preview a coin website before cloning.
 * Renders a live-site style page (iframe when allowed) with a sticky Clone CTA.
 */
export function CloneSourceViewer({
  open,
  name,
  ticker,
  logo,
  url,
  cloning = false,
  onClose,
  onClone,
}: CloneSourceViewerProps) {
  if (!open) return null;

  const host = url.replace(/^https?:\/\//, '').split('/')[0] || url;
  const displayTicker = `$${ticker}`;

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-black/80 backdrop-blur-[2px]">
      <div className="mx-auto flex h-full w-full max-w-lg flex-col bg-[#0a0a0c] shadow-2xl sm:my-3 sm:h-[calc(100%-1.5rem)] sm:overflow-hidden sm:rounded-2xl sm:ring-1 sm:ring-white/10">
        <header className="flex shrink-0 items-center gap-2 border-b border-white/[0.08] px-3 py-2.5">
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-[#1c1c1e] text-white/70 ring-1 ring-white/10"
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">
              {name} <span className="font-medium text-white/40">{displayTicker}</span>
            </p>
            <p className="truncate font-mono text-[10px] text-white/35">{host}</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="grid h-9 w-9 place-items-center rounded-full bg-[#1c1c1e] text-white/55 ring-1 ring-white/10"
            aria-label="Open in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </header>

        <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#121214] px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="min-w-0 flex-1 truncate rounded-lg border border-white/[0.08] bg-black/50 px-3 py-1.5 font-mono text-[11px] text-white/55">
            {url}
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
          {/* Live attempt — sits under mock; opaque mock is primary so blank XFO pages never flash white */}
          <iframe
            title={`${name} website`}
            src={url}
            className="pointer-events-none absolute inset-0 h-full w-full border-0 opacity-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
            referrerPolicy="no-referrer"
            tabIndex={-1}
            aria-hidden
          />

          <div className="absolute inset-0 overflow-y-auto overscroll-contain bg-[#0b0d12] text-white">
            <div
              className="relative min-h-[42%] overflow-hidden px-5 pb-10 pt-12"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 0%, rgba(200,255,61,0.18), transparent 55%), linear-gradient(180deg, #14161c 0%, #0b0d12 100%)',
              }}
            >
              <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                <span className="h-24 w-24 overflow-hidden rounded-[1.75rem] bg-[#1c1c1e] shadow-[0_20px_50px_rgba(0,0,0,0.45)] ring-2 ring-white/15">
                  <img src={logo} alt="" className="h-full w-full object-cover" />
                </span>
                <h1 className="mt-5 text-[28px] font-black tracking-tight">{name}</h1>
                <p className="mt-1 text-[14px] font-semibold text-[#d5ff69]">{displayTicker}</p>
                <p className="mt-3 max-w-[16rem] text-[13px] leading-relaxed text-white/50">
                  Community coin site · preview of what you&apos;ll clone onto your launch.
                </p>
                <button
                  type="button"
                  className="mt-6 inline-flex h-11 items-center rounded-full bg-[#c8ff3d] px-6 text-[13px] font-bold text-[#090b14]"
                >
                  Buy {displayTicker}
                </button>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/[0.06] px-5 py-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
                  About
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/65">
                  {name} ({displayTicker}) is live on Solana. This page is the source site CTOgo will
                  clone for your token — layout, hero, and branding.
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">
                  Website
                </p>
                <p className="mt-1 truncate font-mono text-[12px] text-[#d5ff69]">{url}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['Chart', 'Community', 'Roadmap'].map((label) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 py-3 text-center text-[11px] font-semibold text-white/55"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 shrink-0 border-t border-white/[0.08] bg-[#0a0a0c]/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
          <button
            type="button"
            disabled={cloning}
            onClick={onClone}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#c8ff3d] text-[14px] font-bold text-[#090b14] transition hover:bg-[#d5ff69] disabled:opacity-40"
          >
            {cloning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cloning…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Clone
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
