import { useRef, useState } from 'react';
import { Download, RefreshCw, Sparkles, Upload } from 'lucide-react';
import { PlatformCollateralChecklist } from './PlatformCollateralChecklist';
import { DEXSCREENER_HEADER } from '../data/platformCollateralChecklist';
import {
  generateCtoLogoDataUrl,
  generateDexScreenerHeaderWithLogo,
  readImageFile,
} from '../utils/ctoCollateralGenerate';

type Props = {
  symbol: string;
  projectName?: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  onLogoChange: (url: string | null) => void;
  onBannerChange: (url: string | null) => void;
  collateralChecked: string[];
  onToggleCollateral: (id: string) => void;
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

export function PostLaunchContentTab({
  symbol,
  projectName,
  logoUrl,
  bannerUrl,
  onLogoChange,
  onBannerChange,
  collateralChecked,
  onToggleCollateral,
}: Props) {
  const [busyLogo, setBusyLogo] = useState(false);
  const [busyBanner, setBusyBanner] = useState(false);
  const [salt, setSalt] = useState(0);
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const name = projectName || symbol;

  const generateLogo = () => {
    setBusyLogo(true);
    try {
      const next = salt + 1;
      setSalt(next);
      const url = generateCtoLogoDataUrl({
        projectName: name,
        ticker: symbol,
        salt: next,
      });
      onLogoChange(url);
      try {
        sessionStorage.setItem(`ctogo-logo-${symbol}`, url);
      } catch {
        /* ignore */
      }
    } finally {
      setBusyLogo(false);
    }
  };

  const generateBanner = async () => {
    setBusyBanner(true);
    try {
      const next = salt + 1;
      setSalt(next);
      const url = await generateDexScreenerHeaderWithLogo({
        projectName: name,
        ticker: symbol,
        logoDataUrl: logoUrl,
        tagline: 'Community owned · No rugs',
        salt: next,
      });
      onBannerChange(url);
      try {
        sessionStorage.setItem(`ctogo-dex-header-${symbol}`, url);
      } catch {
        /* ignore */
      }
    } finally {
      setBusyBanner(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-bold text-white">Logo & banner</p>
        <p className="mt-1 text-[12px] text-white/45">
          Generate or upload, then save to your gallery.
        </p>
      </div>

      <section className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] font-semibold text-white/50">Media</p>
          <p className="text-[10px] text-white/35">
            Logo 1:1 · Banner {DEXSCREENER_HEADER.ratioLabel}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={generateLogo}
            disabled={busyLogo}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-3 text-[11px] font-bold text-[#d5ff69]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {logoUrl ? 'New logo' : 'Generate logo'}
          </button>
          <button
            type="button"
            onClick={() => logoRef.current?.click()}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 text-[11px] font-semibold text-white/60"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload logo
          </button>
          <button
            type="button"
            onClick={() => void generateBanner()}
            disabled={busyBanner}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-3 text-[11px] font-bold text-[#d5ff69]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {bannerUrl ? 'New banner' : 'Generate banner'}
          </button>
          <button
            type="button"
            onClick={() => bannerRef.current?.click()}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 text-[11px] font-semibold text-white/60"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload banner
          </button>
          <input
            ref={logoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              void readImageFile(file).then((url) => {
                onLogoChange(url);
                try {
                  sessionStorage.setItem(`ctogo-logo-${symbol}`, url);
                } catch {
                  /* ignore */
                }
              });
            }}
          />
          <input
            ref={bannerRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              void readImageFile(file).then((url) => {
                onBannerChange(url);
                try {
                  sessionStorage.setItem(`ctogo-dex-header-${symbol}`, url);
                } catch {
                  /* ignore */
                }
              });
            }}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-black/40">
            <p className="border-b border-white/[0.06] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/35">
              Logo
            </p>
            <div className="grid aspect-square place-items-center p-3">
              {logoUrl ? (
                <img src={logoUrl} alt="" className="h-28 w-28 rounded-xl object-cover" />
              ) : (
                <p className="text-[11px] text-white/30">No logo</p>
              )}
            </div>
            {logoUrl ? (
              <button
                type="button"
                onClick={() => void downloadDataUrl(logoUrl, `${symbol}-logo.png`)}
                className="flex w-full items-center justify-center gap-1.5 border-t border-white/[0.06] py-2 text-[11px] font-bold text-[#d5ff69]"
              >
                <Download className="h-3.5 w-3.5" />
                Save to gallery
              </button>
            ) : null}
          </div>
          <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-black/40">
            <p className="border-b border-white/[0.06] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/35">
              Banner · {DEXSCREENER_HEADER.ratioLabel}
            </p>
            <div className="aspect-[3/1]">
              {bannerUrl ? (
                <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-[11px] text-white/30">
                  No banner
                </div>
              )}
            </div>
            {bannerUrl ? (
              <button
                type="button"
                onClick={() => void downloadDataUrl(bannerUrl, `${symbol}-banner-3x1.png`)}
                className="flex w-full items-center justify-center gap-1.5 border-t border-white/[0.06] py-2 text-[11px] font-bold text-[#d5ff69]"
              >
                <Download className="h-3.5 w-3.5" />
                Save to gallery
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <PlatformCollateralChecklist
        checkedIds={collateralChecked}
        onToggle={onToggleCollateral}
      />
    </div>
  );
}
