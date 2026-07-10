import { useRef, useState } from 'react';
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
  REX_GENERATE_BANNER_COST,
  REX_GENERATE_LANDING_COST,
  REX_TOKEN_SYMBOL,
} from '../../data/rexToken';
import { generateProjectImageDataUrl, readImageFile } from '../../utils/projectImageGenerate';
import { getRexTokenBalance, spendRexTokens } from '../../utils/rexTokenWallet';
import { BuyRexTokenModal, RexTokenBadge } from './BuyRexTokenModal';

export type CreativeFunding = 'marketing-wallet' | 'rex-coin';

export type CreativeSuiteState = {
  landingPageUrl: string | null;
  landingPageSource: 'upload' | 'generated' | null;
  landingPageFunding: CreativeFunding | null;
  bannerAssets: string[];
  queuedBannerCount: number;
};

const MAX_BANNERS = 6;

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
  const landingRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [rexBalance, setRexBalance] = useState(getRexTokenBalance);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buyRequired, setBuyRequired] = useState<number | undefined>();
  const [generatingLanding, setGeneratingLanding] = useState(false);
  const [generatingBanner, setGeneratingBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (partial: Partial<CreativeSuiteState>) => onChange({ ...value, ...partial });

  const handleLandingUpload = async (file: File) => {
    setError(null);
    try {
      const dataUrl = await readImageFile(file);
      patch({
        landingPageUrl: dataUrl,
        landingPageSource: 'upload',
        landingPageFunding: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const generateLanding = async (funding: CreativeFunding) => {
    setError(null);
    if (!projectName.trim()) {
      setError('Project name is required to generate a landing page');
      return;
    }

    if (funding === 'marketing-wallet') {
      patch({
        landingPageUrl: null,
        landingPageSource: 'generated',
        landingPageFunding: 'marketing-wallet',
      });
      return;
    }

    const spend = spendRexTokens(REX_GENERATE_LANDING_COST);
    if (!spend.ok) {
      setBuyRequired(REX_GENERATE_LANDING_COST);
      setBuyModalOpen(true);
      return;
    }
    setRexBalance(spend.balance);

    setGeneratingLanding(true);
    await new Promise((r) => setTimeout(r, 900));
    const dataUrl = generateProjectImageDataUrl({
      projectName,
      description,
      categoryLabel,
    });
    setGeneratingLanding(false);

    if (dataUrl) {
      patch({
        landingPageUrl: dataUrl,
        landingPageSource: 'generated',
        landingPageFunding: 'rex-coin',
      });
    } else {
      setError('Landing page generation failed — try again');
    }
  };

  const handleBannerUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const remaining = MAX_BANNERS - value.bannerAssets.length;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_BANNERS} banners`);
      return;
    }
    const toAdd: string[] = [];
    for (const file of Array.from(files).slice(0, remaining)) {
      try {
        toAdd.push(await readImageFile(file));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
        break;
      }
    }
    if (toAdd.length) {
      patch({ bannerAssets: [...value.bannerAssets, ...toAdd] });
    }
  };

  const generateBanner = async (funding: CreativeFunding) => {
    setError(null);
    const total = value.bannerAssets.length + value.queuedBannerCount;
    if (total >= MAX_BANNERS) {
      setError(`Maximum ${MAX_BANNERS} banners`);
      return;
    }

    if (funding === 'marketing-wallet') {
      patch({ queuedBannerCount: value.queuedBannerCount + 1 });
      return;
    }

    const spend = spendRexTokens(REX_GENERATE_BANNER_COST);
    if (!spend.ok) {
      setBuyRequired(REX_GENERATE_BANNER_COST);
      setBuyModalOpen(true);
      return;
    }
    setRexBalance(spend.balance);

    setGeneratingBanner(true);
    await new Promise((r) => setTimeout(r, 700));
    const dataUrl = generateProjectImageDataUrl({
      projectName: `${projectName} banner`,
      description,
      categoryLabel,
    });
    setGeneratingBanner(false);

    if (dataUrl) {
      patch({ bannerAssets: [...value.bannerAssets, dataUrl] });
    } else {
      setError('Banner generation failed — try again');
    }
  };

  const removeBanner = (index: number) => {
    patch({ bannerAssets: value.bannerAssets.filter((_, i) => i !== index) });
  };

  const landingQueued =
    value.landingPageSource === 'generated' && value.landingPageFunding === 'marketing-wallet';

  return (
    <div className="space-y-5">
      <div className="dex-card">
        <div className="relative z-[1] space-y-5">
          <div>
            <h2 className="font-semibold text-white">Creative suite</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Build your launch assets — landing page hosted on Rex via Vercel, plus banners for
              Telegram, DexScreener, and social. Upload your own or generate with Rex AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <RexTokenBadge balance={rexBalance} />
            <p className="text-[10px] text-muted-foreground">
              Pay with {REX_TOKEN_SYMBOL} for ready-on-launch, or wait for your marketing wallet
            </p>
          </div>

          {/* Landing page */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
            <div className="flex items-start gap-2">
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
              <div>
                <p className="text-sm font-medium text-white">Landing page</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Hosted at{' '}
                  <span className="text-sky-400/90">
                    {projectName.trim()
                      ? `${projectName.trim().toLowerCase().replace(/\s+/g, '-')}.rex.app`
                      : 'your-project.rex.app'}
                  </span>{' '}
                  via Vercel
                </p>
              </div>
            </div>

            {value.landingPageUrl && !landingQueued ? (
              <div className="relative overflow-hidden rounded-lg border border-white/10">
                <img
                  src={value.landingPageUrl}
                  alt="Landing page preview"
                  className="aspect-[16/10] w-full object-cover"
                />
                {value.landingPageSource === 'generated' && value.landingPageFunding === 'rex-coin' && (
                  <span className="absolute left-2 top-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                    Ready on launch
                  </span>
                )}
                <button
                  type="button"
                  onClick={() =>
                    patch({
                      landingPageUrl: null,
                      landingPageSource: null,
                      landingPageFunding: null,
                    })
                  }
                  className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white"
                  aria-label="Remove landing page"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : landingQueued ? (
              <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <Clock className="h-5 w-5 shrink-0 text-amber-400" />
                <div>
                  <p className="text-xs font-medium text-amber-200">Queued — marketing wallet</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Landing page generates automatically when your marketing wallet reaches $300.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <input
                ref={landingRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleLandingUpload(file);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => landingRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:border-white/20"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload design
              </button>
            </div>

            <div className="border-t border-white/10 pt-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Generate with Rex AI</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <FundingOption
                  icon={Clock}
                  title="Wait for marketing wallet"
                  description="Free — landing page ready when wallet fills (~$300)"
                  loading={generatingLanding}
                  onClick={() => void generateLanding('marketing-wallet')}
                />
                <FundingOption
                  icon={Coins}
                  title={`Pay ${REX_GENERATE_LANDING_COST} ${REX_TOKEN_SYMBOL}`}
                  description="Ready on launch — no waiting for trade tax"
                  loading={generatingLanding}
                  accent
                  onClick={() => void generateLanding('rex-coin')}
                />
              </div>
            </div>
          </div>

          {/* Banners */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-start gap-2">
                <ImagePlus className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                <div>
                  <p className="text-sm font-medium text-white">Launch banners</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Telegram headers, DexScreener promos, and social posts
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {value.bannerAssets.length + value.queuedBannerCount}/{MAX_BANNERS}
              </span>
            </div>

            {value.bannerAssets.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {value.bannerAssets.map((asset, index) => (
                  <div
                    key={`${index}-${asset.slice(0, 20)}`}
                    className="group relative aspect-[3/1] overflow-hidden rounded-lg border border-white/10"
                  >
                    <img src={asset} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeBanner(index)}
                      className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remove banner"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {value.queuedBannerCount > 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-[11px] text-muted-foreground">
                  {value.queuedBannerCount} banner{value.queuedBannerCount > 1 ? 's' : ''} queued
                  — generate when marketing wallet reaches $300
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <input
                ref={bannerRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => {
                  void handleBannerUpload(e.target.files);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                disabled={value.bannerAssets.length + value.queuedBannerCount >= MAX_BANNERS}
                onClick={() => bannerRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:border-white/20 disabled:opacity-40"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload banners
              </button>
            </div>

            <div className="border-t border-white/10 pt-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Generate a banner</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <FundingOption
                  icon={Wand2}
                  title="Wait for marketing wallet"
                  description="Free — added when wallet milestone hits"
                  loading={generatingBanner}
                  disabled={value.bannerAssets.length + value.queuedBannerCount >= MAX_BANNERS}
                  onClick={() => void generateBanner('marketing-wallet')}
                />
                <FundingOption
                  icon={Sparkles}
                  title={`Pay ${REX_GENERATE_BANNER_COST} ${REX_TOKEN_SYMBOL}`}
                  description="Generate and add now"
                  loading={generatingBanner}
                  disabled={value.bannerAssets.length + value.queuedBannerCount >= MAX_BANNERS}
                  accent
                  onClick={() => void generateBanner('rex-coin')}
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <p className="text-[10px] leading-relaxed text-muted-foreground">
            You can skip creative assets for now and add them from your dashboard after launch.
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

      <BuyRexTokenModal
        open={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        requiredAmount={buyRequired}
        onPurchased={(balance) => setRexBalance(balance)}
      />
    </div>
  );
}

function FundingOption({
  icon: Icon,
  title,
  description,
  loading,
  disabled,
  accent,
  onClick,
}: {
  icon: typeof Clock;
  title: string;
  description: string;
  loading?: boolean;
  disabled?: boolean;
  accent?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={`rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        accent
          ? 'border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/15'
          : 'border-white/10 bg-white/[0.03] hover:border-white/20'
      }`}
    >
      <div className="flex items-start gap-2">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${accent ? 'text-sky-400' : 'text-muted-foreground'}`} />
        <span>
          <p className="text-xs font-medium text-white">{loading ? 'Generating…' : title}</p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{description}</p>
        </span>
      </div>
    </button>
  );
}
