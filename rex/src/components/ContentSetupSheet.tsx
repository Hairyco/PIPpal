import { useEffect, useState } from 'react';
import { Check, Download, ExternalLink, X } from 'lucide-react';

export type SetupChannel = 'x' | 'telegram' | 'website' | 'logo' | 'banner';

type Props = {
  open: boolean;
  channel: SetupChannel | null;
  symbol: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  onClose: () => void;
  onGenerateLogo?: () => void;
  onGenerateBanner?: () => void;
  onGoContent?: () => void;
};

const CHANNEL_META: Record<
  SetupChannel,
  { title: string; body: string; externalLabel: string; externalHref: string }
> = {
  x: {
    title: 'Set up X / Twitter',
    body: 'Save your logo and header, then upload them on X. Use the same CA in your bio.',
    externalLabel: 'Open X profile settings',
    externalHref: 'https://x.com/settings/profile',
  },
  telegram: {
    title: 'Set up Telegram',
    body: 'Save your logo for the group avatar, then paste your CA in the pinned message.',
    externalLabel: 'Open Telegram',
    externalHref: 'https://web.telegram.org/',
  },
  website: {
    title: 'Set up website',
    body: 'Use your CTOgo coin page, or publish a 1-pager from Content / Socials.',
    externalLabel: 'Open CTOgo home',
    externalHref: '/',
  },
  logo: {
    title: 'Logo',
    body: 'Generate or download your 1:1 mark, then use it on Dex, X, and Telegram.',
    externalLabel: 'Back to Content',
    externalHref: '',
  },
  banner: {
    title: 'Dex / X banner',
    body: '3:1 header for DexScreener and a close match for X profile headers.',
    externalLabel: 'Back to Content',
    externalHref: '',
  },
};

async function downloadDataUrl(dataUrl: string, filename: string) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ContentSetupSheet({
  open,
  channel,
  symbol,
  logoUrl,
  bannerUrl,
  onClose,
  onGenerateLogo,
  onGenerateBanner,
  onGoContent,
}: Props) {
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setNotice(null);
  }, [open, channel]);

  if (!open || !channel) return null;
  const meta = CHANNEL_META[channel];

  const saveLogo = async () => {
    if (!logoUrl) {
      onGenerateLogo?.();
      setNotice('Generate a logo first, then save again.');
      return;
    }
    try {
      await downloadDataUrl(logoUrl, `${symbol || 'CTO'}-logo.png`);
      setNotice('Logo saved — check Downloads / gallery, then upload on the platform.');
    } catch {
      setNotice('Could not save. Long-press the image or use Content tab.');
    }
  };

  const saveBanner = async () => {
    if (!bannerUrl) {
      onGenerateBanner?.();
      setNotice('Generate a banner first, then save again.');
      return;
    }
    try {
      await downloadDataUrl(bannerUrl, `${symbol || 'CTO'}-banner-3x1.png`);
      setNotice('Banner saved — upload as X header or DexScreener token header.');
    } catch {
      setNotice('Could not save. Long-press the image or use Content tab.');
    }
  };

  const sharePack = async () => {
    if (!navigator.share) {
      setNotice('Share isn’t supported here — use Save to gallery instead.');
      return;
    }
    try {
      const files: File[] = [];
      if (logoUrl) {
        const blob = await (await fetch(logoUrl)).blob();
        files.push(new File([blob], `${symbol}-logo.png`, { type: blob.type || 'image/png' }));
      }
      if (bannerUrl && (channel === 'x' || channel === 'banner')) {
        const blob = await (await fetch(bannerUrl)).blob();
        files.push(
          new File([blob], `${symbol}-banner.png`, { type: blob.type || 'image/png' }),
        );
      }
      if (files.length && navigator.canShare?.({ files })) {
        await navigator.share({
          files,
          title: `$${symbol} content pack`,
          text: `Logo & banner for $${symbol}`,
        });
        setNotice('Shared — save to Photos / Files from the share sheet.');
        return;
      }
      await navigator.share({
        title: `$${symbol} content pack`,
        text: `Set up $${symbol} on ${meta.title}`,
      });
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-[1] flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#0a0c12] shadow-[0_-20px_60px_rgba(0,0,0,0.65)] sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">{meta.title}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-white/50">{meta.body}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/45 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {/* In-page “mini webpage” preview for X / TG */}
          {(channel === 'x' || channel === 'telegram') && (
            <div className="mb-4 overflow-hidden rounded-xl border border-white/[0.1] bg-[#05070d]">
              <p className="border-b border-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white/35">
                Preview · {channel === 'x' ? 'X profile' : 'Telegram group'}
              </p>
              <div className="aspect-[3/1] w-full bg-[#0a0c12]">
                {bannerUrl ? (
                  <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-[11px] text-white/30">
                    No banner yet
                  </div>
                )}
              </div>
              <div className="relative px-3 pb-3 pt-0">
                <div className="-mt-7 mb-2 flex items-end gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-[#0a0c12] bg-white/10 ring-1 ring-white/15">
                    {logoUrl ? (
                      <img src={logoUrl} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 pb-1">
                    <p className="truncate text-sm font-bold text-white">${symbol}</p>
                    <p className="truncate text-[11px] text-white/40">
                      {channel === 'x' ? `@${symbol.toLowerCase()}` : `${symbol} Community`}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-white/45">
                  Community takeover · Official CA on CTOgo
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <p className="border-b border-white/[0.06] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/35">
                Logo · 1:1
              </p>
              <div className="grid aspect-square place-items-center p-4">
                {logoUrl ? (
                  <img src={logoUrl} alt="" className="h-28 w-28 rounded-2xl object-cover" />
                ) : (
                  <button
                    type="button"
                    onClick={onGenerateLogo}
                    className="text-[11px] font-semibold text-[#d5ff69]"
                  >
                    Generate logo
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => void saveLogo()}
                className="flex w-full items-center justify-center gap-1.5 border-t border-white/[0.06] py-2.5 text-[11px] font-bold text-[#d5ff69]"
              >
                <Download className="h-3.5 w-3.5" />
                Save to gallery
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <p className="border-b border-white/[0.06] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/35">
                Banner · 3:1
              </p>
              <div className="aspect-[3/1] bg-[#05070d]">
                {bannerUrl ? (
                  <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <button
                    type="button"
                    onClick={onGenerateBanner}
                    className="grid h-full w-full place-items-center text-[11px] font-semibold text-[#d5ff69]"
                  >
                    Generate banner
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => void saveBanner()}
                className="flex w-full items-center justify-center gap-1.5 border-t border-white/[0.06] py-2.5 text-[11px] font-bold text-[#d5ff69]"
              >
                <Download className="h-3.5 w-3.5" />
                Save to gallery
              </button>
            </div>
          </div>

          {notice ? (
            <p className="mt-3 flex items-start gap-2 rounded-lg border border-[#c8ff3d]/20 bg-[#c8ff3d]/10 px-3 py-2 text-[11px] text-[#d5ff69]">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {notice}
            </p>
          ) : (
            <p className="mt-3 text-[11px] text-white/40">
              On phones, Save downloads the file — open Photos / Files and upload to the app. Or use
              Share pack when available.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-white/[0.08] px-4 py-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void sharePack()}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/[0.12] text-[12px] font-semibold text-white/75"
          >
            Share pack
          </button>
          {meta.externalHref ? (
            <a
              href={meta.externalHref}
              target={meta.externalHref.startsWith('/') ? undefined : '_blank'}
              rel="noreferrer"
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#c8ff3d] text-[12px] font-bold text-[#090b14]"
            >
              {meta.externalLabel}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                onGoContent?.();
                onClose();
              }}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-[#c8ff3d] text-[12px] font-bold text-[#090b14]"
            >
              {meta.externalLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
