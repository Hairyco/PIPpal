import { useRef, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Coins,
  Globe,
  ImagePlus,
  Sparkles,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import {
  assessWebsiteCloneComplexity,
  getMarketingBundle,
  type BundleFunding,
} from '../../data/marketingBundles';
import { generateProjectImageDataUrl, readImageFile } from '../../utils/projectImageGenerate';

export type CreativeFunding = 'marketing-wallet' | 'pay-now';

export type CreativeSuiteState = {
  sourceWebsiteUrl: string;
  websiteMode: 'clone' | null;
  landingPageUrl: string | null;
  landingPageSource: 'upload' | 'generated' | 'cloned' | null;
  landingPageFunding: CreativeFunding | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  /** @deprecated kept for older saved projects */
  bannerAssets: string[];
  queuedBannerCount: number;
  starterBundleSelected: boolean;
  starterBundleFunding: BundleFunding | null;
};

const EMPTY_PREVIEW_HINT =
  'Paste the old site URL to preview a clone. Most meme sites clone fine — we only strip unsafe scripts and swap the CA/socials.';

interface CreativeSuiteStepProps {
  projectName: string;
  description: string;
  categoryLabel?: string;
  value: CreativeSuiteState;
  onChange: (value: CreativeSuiteState) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function CreativeSuiteStep({
  projectName,
  description,
  categoryLabel,
  value,
  onChange,
  onBack,
  onContinue,
}: CreativeSuiteStepProps) {
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [cloning, setCloning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const starter = getMarketingBundle('launch-starter')!;
  const patch = (partial: Partial<CreativeSuiteState>) => onChange({ ...value, ...partial });
  const complexity = assessWebsiteCloneComplexity(value.sourceWebsiteUrl);
  const hostSlug = projectName.trim()
    ? `${projectName.trim().toLowerCase().replace(/\s+/g, '-')}.rex.app`
    : 'your-ticker.rex.app';

  const runClonePreview = async () => {
    setError(null);
    const url = value.sourceWebsiteUrl.trim();
    if (!url) {
      setError('Add a website URL to clone.');
      return;
    }
    setCloning(true);
    await new Promise((r) => setTimeout(r, 700));
    const preview = generateProjectImageDataUrl({
      projectName: projectName || 'Cloned site',
      description: description || `Preview clone of ${url}`,
      categoryLabel,
    });
    setCloning(false);
    patch({
      websiteMode: 'clone',
      landingPageUrl: preview,
      landingPageSource: 'cloned',
    });
  };

  const handleLogo = async (file: File) => {
    setError(null);
    try {
      patch({ logoUrl: await readImageFile(file) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logo upload failed');
    }
  };

  const handleBanner = async (file: File) => {
    setError(null);
    try {
      const dataUrl = await readImageFile(file);
      patch({ bannerUrl: dataUrl, bannerAssets: [dataUrl] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Banner upload failed');
    }
  };

  const generateBanner = async () => {
    setError(null);
    setCloning(true);
    await new Promise((r) => setTimeout(r, 600));
    const dataUrl = generateProjectImageDataUrl({
      projectName: `${projectName || 'CTO'} banner`,
      description,
      categoryLabel,
    });
    setCloning(false);
    if (dataUrl) {
      patch({ bannerUrl: dataUrl, bannerAssets: [dataUrl] });
    }
  };

  const selectBundleFunding = (funding: BundleFunding) => {
    patch({
      starterBundleSelected: true,
      starterBundleFunding: funding,
      landingPageFunding: funding === 'pay-now' ? 'pay-now' : 'marketing-wallet',
    });
  };

  return (
    <div className="space-y-5">
      <div className="dex-card">
        <div className="relative z-[1] space-y-5">
          <div>
            <h2 className="font-semibold text-white">Media & content</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Preview your site, lock logo + banner, then choose how to fund the launch starter
              bundle. Keep it light — most meme sites clone cleanly.
            </p>
          </div>

          {/* 1. Website */}
          <section className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-start gap-2">
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
              <div>
                <p className="text-sm font-medium text-white">1. Landing page</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Hosted at <span className="text-sky-400/90">{hostSlug}</span>. We strip unsafe
                  scripts and swap CA / social links — we do not hard-block clones.
                </p>
              </div>
            </div>

            <label className="block text-xs font-medium text-muted-foreground">
              Old website URL (optional)
              <input
                type="url"
                value={value.sourceWebsiteUrl}
                onChange={(e) => patch({ sourceWebsiteUrl: e.target.value })}
                placeholder="https://old-meme-site.com"
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
              />
            </label>

            {complexity === 'maybe-complex' && value.sourceWebsiteUrl.trim() ? (
              <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] leading-relaxed text-amber-200/90">
                This URL looks like it might be a heavier app. We will still try a clone — if it
                fails, you can paste a simpler site or skip and use your coin page.
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">{EMPTY_PREVIEW_HINT}</p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={cloning}
                onClick={() => void runClonePreview()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-200 hover:bg-sky-500/15 disabled:opacity-40"
              >
                <Wand2 className="h-3.5 w-3.5" />
                {cloning ? 'Working…' : 'Preview clone'}
              </button>
            </div>

            {value.landingPageUrl ? (
              <div className="relative overflow-hidden rounded-lg border border-white/10">
                <img
                  src={value.landingPageUrl}
                  alt="Landing page preview"
                  className="aspect-[16/10] w-full object-cover"
                />
                <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">
                  Clone preview
                </span>
                <button
                  type="button"
                  onClick={() =>
                    patch({
                      landingPageUrl: null,
                      landingPageSource: null,
                      websiteMode: null,
                    })
                  }
                  className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white"
                  aria-label="Clear preview"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
          </section>

          {/* 2. Logo + banner */}
          <section className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-start gap-2">
              <ImagePlus className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
              <div>
                <p className="text-sm font-medium text-white">2. Logo & banner</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Copy from the old site when you can. No banner? Upload a reference or let Rex
                  generate one for socials / DexScreener.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <AssetSlot
                label="Logo"
                imageUrl={value.logoUrl}
                onClear={() => patch({ logoUrl: null })}
                onUploadClick={() => logoRef.current?.click()}
              />
              <AssetSlot
                label="Banner"
                imageUrl={value.bannerUrl}
                wide
                onClear={() => patch({ bannerUrl: null, bannerAssets: [] })}
                onUploadClick={() => bannerRef.current?.click()}
                extraAction={
                  <button
                    type="button"
                    disabled={cloning}
                    onClick={() => void generateBanner()}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-300 hover:text-sky-200"
                  >
                    <Sparkles className="h-3 w-3" />
                    Generate banner
                  </button>
                }
              />
            </div>

            <input
              ref={logoRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleLogo(file);
                e.target.value = '';
              }}
            />
            <input
              ref={bannerRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleBanner(file);
                e.target.value = '';
              }}
            />
          </section>

          {/* 3. Launch starter bundle */}
          <section className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div>
              <p className="text-sm font-medium text-white">3. {starter.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{starter.summary}</p>
              <p className="mt-2 text-[11px] text-sky-300/90">
                {starter.approxSol} from marketing wallet · {starter.priceHint}
              </p>
            </div>
            <ul className="space-y-1.5">
              {starter.includes.map((item) => (
                    <li key={item} className="flex gap-2 text-[11px] text-muted-foreground">
                      <span className="text-sky-400">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-white/40">
                  DexScreener is not in this pack — buy it separately from Services or after launch.
                </p>

                <div className="grid gap-2 sm:grid-cols-2">
              <FundingOption
                icon={Clock}
                title="Wait for marketing wallet"
                description="Queue the bundle — runs when trade tax funds the vault"
                selected={value.starterBundleFunding === 'wait-wallet'}
                onClick={() => selectBundleFunding('wait-wallet')}
              />
              <FundingOption
                icon={Coins}
                title="Pay now"
                description="Fund up-front — site + creatives + shoutout go live faster"
                selected={value.starterBundleFunding === 'pay-now'}
                accent
                onClick={() => selectBundleFunding('pay-now')}
              />
            </div>

            {value.starterBundleFunding ? (
              <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[11px] text-emerald-200/90">
                {value.starterBundleFunding === 'pay-now'
                  ? 'Pay-now selected. After payment you get a change-request form for site edits (fee TBD).'
                  : 'Queued on the marketing wallet. Same change-request form unlocks once the bundle is paid from the vault.'}
              </p>
            ) : null}
          </section>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Later bundles (CoinGecko CTO, DexScreener ads) appear on your dashboard after the coin
            is live — pick the supplier you want to pay next.
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </button>
        <button type="button" onClick={onContinue} className="dex-btn">
          Review & launch
          <ArrowRight className="ml-2 inline h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function AssetSlot({
  label,
  imageUrl,
  wide,
  onClear,
  onUploadClick,
  extraAction,
}: {
  label: string;
  imageUrl: string | null;
  wide?: boolean;
  onClear: () => void;
  onUploadClick: () => void;
  extraAction?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      {imageUrl ? (
        <div className={`relative overflow-hidden rounded-md border border-white/10 ${wide ? 'aspect-[3/1]' : 'aspect-square max-w-[8rem]'}`}>
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-white"
            aria-label={`Remove ${label}`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onUploadClick}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/15 bg-white/[0.03] px-3 py-2 text-xs text-white/70 hover:border-white/25"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload {label.toLowerCase()}
        </button>
      )}
      {extraAction ? <div className="mt-2">{extraAction}</div> : null}
    </div>
  );
}

function FundingOption({
  icon: Icon,
  title,
  description,
  selected,
  accent,
  onClick,
}: {
  icon: typeof Clock;
  title: string;
  description: string;
  selected?: boolean;
  accent?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-xl border p-3 text-left transition-colors ${
        selected
          ? 'border-white bg-white text-[#090b14]'
          : accent
            ? 'border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/15'
            : 'border-white/10 bg-white/[0.03] hover:border-white/20'
      }`}
    >
      <div className="flex items-start gap-2">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${selected ? 'text-[#090b14]' : accent ? 'text-sky-400' : 'text-muted-foreground'}`} />
        <span>
          <p className={`text-xs font-medium ${selected ? 'text-[#090b14]' : 'text-white'}`}>{title}</p>
          <p className={`mt-0.5 text-[10px] leading-relaxed ${selected ? 'text-[#090b14]/70' : 'text-muted-foreground'}`}>
            {description}
          </p>
        </span>
      </div>
    </button>
  );
}
