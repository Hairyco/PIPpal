import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Flame,
  Globe,
  Loader2,
  Lock,
  MessageCircle,
  Pencil,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Split,
  Upload,
  Users,
  Wallet,
} from 'lucide-react';
import { CtoGoLogo } from '../components/CtoGoLogo';
import { PolessiaLogo } from '../components/PolessiaLogo';
import { useConnectedWallet } from '../components/ConnectWalletButton';
import { WebsitePreview, WebsitePreviewOverlay } from '../components/WebsitePreview';
import { CLAIM_FEE, MARKETING_WALLET_ATTACH_FEE_USD } from '../data/claimPricing';
import {
  CREATOR_FEE_MODES,
  FEE_TIERS,
  formatBpsPercent,
  type CreatorFeeMode,
} from '../data/chainConfig';
import {
  COLLATERAL_EXTRA_USD,
  collateralBillSummary,
  formatCollateralUsd,
} from '../data/collateralPricing';
import {
  DEFAULT_ONE_PAGER_INCLUDES,
  DEFAULT_ONE_PAGER_THEME_ID,
  ONE_PAGER_BESPOKE_THEMES,
  ONE_PAGER_INCLUDE_OPTIONS,
  ONE_PAGER_PRIMARY_THEMES,
  defaultGeneratedSiteCopy,
  isBespokeOnePagerTheme,
  layoutIdFromCycle,
  resolveOnePagerLayout,
  type OnePagerIncludeId,
  type OnePagerIncludes,
  type OnePagerLayoutId,
  type OnePagerLayoutPreference,
  type OnePagerTheme,
  type OnePagerThemeId,
} from '../data/onePagerTheme';
import {
  DEFAULT_TOKEN_SUPPLY,
  TOKEN_SUPPLY_OPTIONS,
  type TokenSupplyValue,
} from '../data/tokenSupplyOptions';
import {
  generateCtoBannerWithLogo,
  generateCtoLogoDataUrl,
  readImageFile,
} from '../utils/ctoCollateralGenerate';
import { formatMintPreview, LAUNCH_DEMO_MINT, resolveLaunchCoin } from '../utils/resolveLaunchCoin';

type LaunchMode = 'launch' | 'add';
type FlowStep = 'coin' | 'fees' | 'burn' | 'website' | 'done';
type WebsiteKind = 'onepager' | 'clone';

const fieldClass =
  'mt-1.5 h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[#c8ff3d]/40';

const primaryBtnClass =
  'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c8ff3d] text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69] disabled:cursor-not-allowed disabled:opacity-40';

const secondaryBurnBtnClass =
  'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-400 text-sm font-bold text-[#090b14] transition hover:bg-orange-300';

const backBtnClass =
  'inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-xl border border-white/[0.1] text-xs font-semibold text-white/55 transition hover:bg-white/[0.04] hover:text-white sm:w-auto sm:px-5';

const VESTING_SCHEDULE = [
  { label: 'At launch', amount: '10%' },
  { label: 'Day 7', amount: '20%' },
  { label: 'Day 30', amount: '35%' },
  { label: 'Day 90', amount: '35%' },
];

/** Demo mint — resolves to Pepe Coin in the launch wizard. */
const DEMO_CONTRACT = LAUNCH_DEMO_MINT;

function ColourPalettePicker({
  value,
  onChange,
  compact = false,
}: {
  value: OnePagerThemeId;
  onChange: (id: OnePagerThemeId) => void;
  compact?: boolean;
}) {
  const [showMore, setShowMore] = useState(() => isBespokeOnePagerTheme(value));
  const expanded = showMore || isBespokeOnePagerTheme(value);

  const renderSwatch = (theme: OnePagerTheme, labeled: boolean) => {
    const active = value === theme.id;
    if (!labeled) {
      return (
        <button
          key={theme.id}
          type="button"
          title={theme.label}
          onClick={() => onChange(theme.id)}
          className={`h-8 w-8 rounded-full border-2 transition ${
            active ? 'scale-110 border-white' : 'border-white/20 hover:border-white/50'
          }`}
          style={{ backgroundColor: theme.swatch }}
          aria-label={theme.label}
        />
      );
    }
    return (
      <button
        key={theme.id}
        type="button"
        title={theme.label}
        onClick={() => onChange(theme.id)}
        className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 transition ${
          active ? 'border-white/50 bg-white/[0.06]' : 'border-white/[0.08] hover:border-white/25'
        }`}
      >
        <span
          className={`h-6 w-6 rounded-full border-2 ${active ? 'border-white' : 'border-white/20'}`}
          style={{ backgroundColor: theme.swatch }}
          aria-hidden
        />
        <span className={`text-[11px] font-semibold ${active ? 'text-white' : 'text-white/45'}`}>
          {theme.label}
        </span>
      </button>
    );
  };

  return (
    <div>
      <p className="text-[11px] font-semibold text-white/55">Colour palette</p>
      <p className="mt-0.5 text-[10px] text-white/35">
        Primary colours first — open more if you want something bespoke.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {ONE_PAGER_PRIMARY_THEMES.map((theme) => renderSwatch(theme, !compact))}
      </div>
      {expanded ? (
        <div className="mt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/30">
            More colours
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {ONE_PAGER_BESPOKE_THEMES.map((theme) => renderSwatch(theme, false))}
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        className="mt-2 text-[11px] font-semibold text-[#c8ff3d]/80 hover:text-[#d5ff69]"
      >
        {expanded ? 'Hide extra colours' : 'More colours…'}
      </button>
    </div>
  );
}

export function LaunchCtoPage() {
  const [searchParams] = useSearchParams();
  const { connected, address, connect, busy: walletBusy } = useConnectedWallet();
  const [mode, setMode] = useState<LaunchMode>('launch');
  const [step, setStep] = useState<FlowStep>('coin');
  const [listNotice, setListNotice] = useState<string | null>(null);
  const [marketingAttached, setMarketingAttached] = useState(false);
  const [marketingAttachBusy, setMarketingAttachBusy] = useState(false);
  /** Checkbox on the single-page List flow — opt in to $1 vault attach. */
  const [listMarketingOptIn, setListMarketingOptIn] = useState(false);
  /** Stub invite — real Telegram Bot API create comes later; CTOgo remains chat admin. */
  const [telegramInvite, setTelegramInvite] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [contract, setContract] = useState(DEMO_CONTRACT);
  const [telegram, setTelegram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');
  const [note, setNote] = useState('');
  const [tokenSupply, setTokenSupply] = useState<TokenSupplyValue>(DEFAULT_TOKEN_SUPPLY);
  const [feeMode, setFeeMode] = useState<CreatorFeeMode>('creator');
  const [burnAmount, setBurnAmount] = useState('');
  const [vestingAccepted, setVestingAccepted] = useState(false);
  const [burned, setBurned] = useState(false);
  const [pageBlurb, setPageBlurb] = useState('');
  const [siteHeadline, setSiteHeadline] = useState('');
  const [siteExtraTitle, setSiteExtraTitle] = useState('');
  const [siteExtraBody, setSiteExtraBody] = useState('');
  const [showExtraCopy, setShowExtraCopy] = useState(false);
  const [layoutPreference, setLayoutPreference] = useState<OnePagerLayoutPreference>('auto');
  const [layoutSeed, setLayoutSeed] = useState(0);
  const [forcedLayoutId, setForcedLayoutId] = useState<OnePagerLayoutId | null>(null);
  const [designNonce, setDesignNonce] = useState(0);
  const designCycleRef = useRef(0);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoSalt, setLogoSalt] = useState(0);
  const [bannerSalt, setBannerSalt] = useState(0);
  const [generatingLogo, setGeneratingLogo] = useState(false);
  const [generatingBanner, setGeneratingBanner] = useState(false);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [coinReady, setCoinReady] = useState(false);
  const [venueLabel, setVenueLabel] = useState('Solana');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editArt, setEditArt] = useState(false);
  const [websiteKind, setWebsiteKind] = useState<WebsiteKind>('onepager');
  const [cloneUrl, setCloneUrl] = useState('');
  /** Extra gens after the free first logo/banner — billed at publish. */
  const [extraLogoGens, setExtraLogoGens] = useState(0);
  const [extraBannerGens, setExtraBannerGens] = useState(0);
  const [siteGenerated, setSiteGenerated] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generatingSite, setGeneratingSite] = useState(false);
  const [onePagerThemeId, setOnePagerThemeId] = useState<OnePagerThemeId>(
    DEFAULT_ONE_PAGER_THEME_ID,
  );
  const [siteIncludes, setSiteIncludes] = useState<OnePagerIncludes>({
    ...DEFAULT_ONE_PAGER_INCLUDES,
  });
  const [editSite, setEditSite] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const sitePreviewRef = useRef<HTMLDivElement>(null);
  const [fromCoinPage, setFromCoinPage] = useState(false);
  const prefillApplied = useRef(false);
  const lookupSeq = useRef(0);

  useEffect(() => {
    const qMode = searchParams.get('mode')?.trim().toLowerCase();
    if (qMode === 'add' || qMode === 'list') {
      setMode('add');
    }
  }, [searchParams]);

  /** Prefill demo / pasted mint should resolve without forcing a Find click. */
  useEffect(() => {
    if (mode !== 'add' || step !== 'coin') return;
    const mint = contract.trim();
    if (mint.length < 32 || coinReady || lookupBusy) return;
    void runLookup(mint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, step]);

  useEffect(() => {
    if (prefillApplied.current) return;
    const qName = searchParams.get('name')?.trim() ?? '';
    const qTicker = searchParams.get('ticker')?.trim() ?? '';
    const qCa = searchParams.get('ca')?.trim() ?? '';
    if (!qName && !qTicker && !qCa) return;
    prefillApplied.current = true;
    if (qName) setName(qName);
    if (qTicker) setTicker(qTicker.replace(/^\$/, ''));
    if (qCa) setContract(qCa);
    setMode('launch');
    setStep('coin');
    setFromCoinPage(true);
    if (qCa) {
      void runLookup(qCa, qName, qTicker.replace(/^\$/, ''));
    } else if (qName || qTicker) {
      setCoinReady(true);
      setVenueLabel('CTOgo');
      const logo = generateCtoLogoDataUrl({
        projectName: qName || 'CTOgo Coin',
        ticker: qTicker.replace(/^\$/, '') || 'CTO',
      });
      setLogoPreview(logo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const displayTicker = ticker.trim() ? `$${ticker.trim().toUpperCase()}` : 'your coin';
  const steps =
    mode === 'launch'
      ? [
          { id: 'coin' as const, label: 'Coin' },
          { id: 'fees' as const, label: 'Fees' },
          { id: 'burn' as const, label: 'Burn' },
          { id: 'website' as const, label: 'Website' },
        ]
      : [];
  const stepIndex = steps.findIndex((s) => s.id === step);
  const selectedFeeMode = CREATOR_FEE_MODES.find((m) => m.id === feeMode)!;
  const launchTier = FEE_TIERS[0];
  const canContinueCoin = coinReady && Boolean(name.trim() && ticker.trim());
  const artBill = collateralBillSummary({
    extraLogos: extraLogoGens,
    extraBanners: extraBannerGens,
  });
  const activeLayoutId =
    forcedLayoutId ?? resolveOnePagerLayout(layoutPreference, layoutSeed);

  /** Guaranteed unique look: cycle layout + colour, bump nonce for remount. */
  const advanceUniqueDesign = () => {
    const cycle = designCycleRef.current;
    designCycleRef.current += 1;
    // Mix time so back-to-back generates never feel stuck on the same skin.
    const mixed = cycle + (Date.now() % 17);
    const nextLayout = layoutIdFromCycle(mixed);
    const nextTheme =
      ONE_PAGER_PRIMARY_THEMES[mixed % ONE_PAGER_PRIMARY_THEMES.length] ??
      ONE_PAGER_PRIMARY_THEMES[0];
    setForcedLayoutId(nextLayout);
    setLayoutPreference(nextLayout);
    setLayoutSeed(mixed);
    setOnePagerThemeId(nextTheme.id);
    setDesignNonce(mixed + 1);
    return { layout: nextLayout, cycle: mixed + 1, themeId: nextTheme.id };
  };

  const refreshCollateralForLook = (cycle: number) => {
    const projectName = name || 'Pepe Coin';
    const projectTicker = ticker || 'PEPE';
    setLogoSalt(cycle);
    setBannerSalt(cycle);
    const logo = generateCtoLogoDataUrl({
      projectName,
      ticker: projectTicker,
      salt: cycle * 17 + 3,
    });
    setLogoPreview(logo);
    void generateCtoBannerWithLogo({
      projectName,
      ticker: projectTicker,
      logoDataUrl: logo,
      tagline: (siteHeadline || pageBlurb || note || `${projectTicker} on CTOgo`).trim(),
      salt: cycle * 13 + 7,
    }).then((banner) => setBannerPreview(banner));
    return logo;
  };

  const resetFlow = () => {
    setStep('coin');
    setName('');
    setTicker('');
    setContract(DEMO_CONTRACT);
    setTelegram('');
    setTwitter('');
    setWebsite('');
    setNote('');
    setTokenSupply(DEFAULT_TOKEN_SUPPLY);
    setFeeMode('creator');
    setBurnAmount('');
    setVestingAccepted(false);
    setBurned(false);
    setPageBlurb('');
    setSiteHeadline('');
    setSiteExtraTitle('');
    setSiteExtraBody('');
    setShowExtraCopy(false);
    setLayoutPreference('auto');
    setLayoutSeed(0);
    setForcedLayoutId(null);
    setDesignNonce(0);
    designCycleRef.current = 0;
    setLogoPreview(null);
    setBannerPreview(null);
    setLogoSalt(0);
    setBannerSalt(0);
    setLookupBusy(false);
    setLookupError(null);
    setCoinReady(false);
    setVenueLabel('Solana');
    setShowAdvanced(false);
    setEditArt(false);
    setWebsiteKind('onepager');
    setCloneUrl('');
    setExtraLogoGens(0);
    setExtraBannerGens(0);
    setSiteGenerated(false);
    setPreviewOpen(false);
    setGeneratingSite(false);
    setOnePagerThemeId(DEFAULT_ONE_PAGER_THEME_ID);
    setSiteIncludes({ ...DEFAULT_ONE_PAGER_INCLUDES });
    setEditSite(false);
    setFromCoinPage(false);
    setListNotice(null);
    setMarketingAttached(false);
    setMarketingAttachBusy(false);
    setListMarketingOptIn(false);
    setTelegramInvite(null);
  };

  const switchMode = (next: LaunchMode) => {
    setMode(next);
    resetFlow();
  };

  async function runLookup(mint: string, keepName?: string, keepTicker?: string) {
    const seq = ++lookupSeq.current;
    setLookupBusy(true);
    setLookupError(null);
    setCoinReady(false);
    try {
      const meta = await resolveLaunchCoin(mint);
      if (seq !== lookupSeq.current) return;
      if (!meta) {
        setLookupError('Paste a full Solana mint (32+ characters).');
        return;
      }
      setContract(meta.mint);
      setName(keepName?.trim() || meta.name);
      setTicker((keepTicker?.trim() || meta.ticker).toUpperCase());
      setLogoPreview(meta.logoUrl);
      setPageBlurb(meta.blurb);
      setVenueLabel(meta.venueLabel);
      setCoinReady(true);
    } catch {
      if (seq !== lookupSeq.current) return;
      setLookupError('Could not resolve coin. Try again.');
    } finally {
      if (seq === lookupSeq.current) setLookupBusy(false);
    }
  }

  const finishList = (withMarketing: boolean) => {
    setMarketingAttached(withMarketing);
    const slug = (ticker.trim() || 'cto').toLowerCase().replace(/[^a-z0-9]/g, '') || 'cto';
    setTelegramInvite(`https://t.me/ctogo_${slug}`);
    setStep('done');
  };

  const onCoinContinue = async (event: FormEvent) => {
    event.preventDefault();
    if (!canContinueCoin) return;
    if (mode === 'add') {
      setListNotice(null);
      if (!connected) {
        setListNotice('Connect your wallet to claim this listing');
        const next = await connect();
        if (!next) return;
      }
      if (listMarketingOptIn) {
        setMarketingAttachBusy(true);
        try {
          // Demo: $1 covers rent + tx; remainder → treasury.
          await new Promise((r) => window.setTimeout(r, 600));
          finishList(true);
        } finally {
          setMarketingAttachBusy(false);
        }
        return;
      }
      finishList(false);
      return;
    }
    setStep('fees');
  };

  const onFeesContinue = (event: FormEvent) => {
    event.preventDefault();
    setStep('burn');
  };

  const goToWebsite = () => setStep('website');

  const onWebsiteFinish = (event: FormEvent) => {
    event.preventDefault();
    if (!siteGenerated) return;
    setStep('done');
  };

  const makeLogo = (salt = logoSalt) => {
    setGeneratingLogo(true);
    try {
      const url = generateCtoLogoDataUrl({
        projectName: name || 'CTOgo Coin',
        ticker: ticker || 'CTO',
        salt,
      });
      setLogoPreview(url);
      return url;
    } finally {
      setGeneratingLogo(false);
    }
  };

  const makeBanner = async (salt = bannerSalt, logoUrl?: string | null) => {
    setGeneratingBanner(true);
    try {
      const url = await generateCtoBannerWithLogo({
        projectName: name || 'Pepe Coin',
        ticker: ticker || 'PEPE',
        logoDataUrl: logoUrl ?? logoPreview,
        tagline: siteHeadline || pageBlurb || note || `${ticker || 'PEPE'} on CTOgo`,
        salt,
      });
      setBannerPreview(url);
    } finally {
      setGeneratingBanner(false);
    }
  };

  const regenerateLogo = () => {
    const next = logoSalt + 1;
    setLogoSalt(next);
    setExtraLogoGens((n) => n + 1);
    const url = makeLogo(next);
    // Refresh banner composite with the new logo only — not an extra banner charge.
    void makeBanner(bannerSalt, url);
  };

  const regenerateBanner = () => {
    const next = bannerSalt + 1;
    setBannerSalt(next);
    setExtraBannerGens((n) => n + 1);
    void makeBanner(next);
  };

  const selectWebsiteKind = (kind: WebsiteKind) => {
    setWebsiteKind(kind);
    setSiteGenerated(false);
    setPreviewOpen(false);
    setEditSite(false);
  };

  const toggleSiteInclude = (id: OnePagerIncludeId) => {
    setSiteIncludes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openSiteEditor = () => {
    setPreviewOpen(false);
    setEditSite(true);
  };

  /** Builds a finished site and opens the real full-page viewer. */
  const generateWebsite = async () => {
    if (websiteKind === 'clone' && !cloneUrl.trim() && !website.trim()) {
      return;
    }
    setGeneratingSite(true);
    try {
      if (!cloneUrl.trim() && website.trim()) setCloneUrl(website.trim());

      const projectName = name || 'Pepe Coin';
      const projectTicker = ticker || 'PEPE';
      const defaults = defaultGeneratedSiteCopy(projectName, projectTicker);

      if (!siteHeadline.trim()) setSiteHeadline(defaults.headline);
      if (!pageBlurb.trim()) setPageBlurb(note.trim() || defaults.body);
      if (!siteExtraTitle.trim() && !siteExtraBody.trim()) {
        setSiteExtraTitle(defaults.extraTitle);
        setSiteExtraBody(defaults.extraBody);
        setShowExtraCopy(true);
      }
      setSiteIncludes((prev) => ({
        ...prev,
        chart: true,
        tokenomics: true,
        socials: true,
        howto: true,
        community: true,
      }));

      // Always advance to a concrete unique layout + fresh art.
      const look = advanceUniqueDesign();
      refreshCollateralForLook(look.cycle);

      await new Promise((r) => window.setTimeout(r, 450));
      setSiteGenerated(true);
      setPreviewOpen(true);
    } finally {
      setGeneratingSite(false);
    }
  };

  const regenerateDesign = () => {
    const look = advanceUniqueDesign();
    refreshCollateralForLook(look.cycle);
    setPreviewOpen(true);
  };

  useEffect(() => {
    if (step !== 'website') return;
    if (!pageBlurb.trim() && note.trim()) setPageBlurb(note.trim());
    if (!cloneUrl.trim() && website.trim()) setCloneUrl(website.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const onUploadLogo = async (file: File | undefined) => {
    if (!file) return;
    try {
      const url = await readImageFile(file);
      setLogoPreview(url);
      void makeBanner(bannerSalt, url);
    } catch {
      // ignore
    }
  };

  const onUploadBanner = async (file: File | undefined) => {
    if (!file) return;
    try {
      setBannerPreview(await readImageFile(file));
    } catch {
      // ignore
    }
  };

  const canGenerateSite =
    websiteKind === 'onepager' || Boolean(cloneUrl.trim() || website.trim());
  const canPublishSite = siteGenerated;

  return (
    <div className="page-shell theme-dark min-h-screen text-[#f5f7fb]">
      <div className="relative z-[1]">
        <header className="border-b border-white/[0.07] bg-[#090b14]">
          <div className="mx-auto flex h-14 max-w-xl items-center gap-3 px-3 sm:px-5">
            <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="CTOgo home">
              <CtoGoLogo size={32} className="rounded-xl" />
              <span className="flex items-center gap-1.5 font-serif text-base font-bold tracking-tight">
                CTOgo
                <span className="rounded bg-white/[0.08] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/45">
                  beta
                </span>
              </span>
            </Link>
            <Link
              to="/"
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-white/45 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-xl px-3 py-8 sm:px-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
            {mode === 'add' ? 'List for exposure' : 'CTO Launch Wizard'}
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight">
            {mode === 'launch' ? 'Launch a CTO' : 'List a CTO'}
          </h1>
          <p className="mt-1.5 text-sm text-white/45">
            {mode === 'add'
              ? 'Paste the contract, claim with your wallet. Marketing wallet is optional ($1).'
              : 'Paste any Solana mint. We pull what we can.'}
          </p>

          {step !== 'done' && mode === 'launch' ? (
            <div className="mt-5 flex gap-1.5">
              {steps.map((s, i) => (
                <div key={s.id} className="flex flex-1 flex-col gap-1.5">
                  <div
                    className={`h-1 rounded-full transition-colors ${
                      i < stepIndex
                        ? 'bg-[#c8ff3d]'
                        : i === stepIndex
                          ? 'bg-[#c8ff3d]'
                          : 'bg-white/10'
                    }`}
                  />
                  <span
                    className={`flex items-center gap-1 text-[10px] font-semibold ${
                      i === stepIndex
                        ? 'text-[#d5ff69]'
                        : i < stepIndex
                          ? 'text-white/55'
                          : 'text-white/30'
                    }`}
                  >
                    {i < stepIndex ? <Check className="h-3 w-3" /> : null}
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {step === 'coin' ? (
            <form onSubmit={onCoinContinue} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
                <button
                  type="button"
                  onClick={() => switchMode('add')}
                  className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                    mode === 'add'
                      ? 'bg-[#c8ff3d] text-[#090b14]'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  List a CTO
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('launch')}
                  className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                    mode === 'launch'
                      ? 'bg-[#c8ff3d] text-[#090b14]'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  Launch on CTOgo
                </button>
              </div>

              {mode === 'launch' ? (
                <div className="rounded-xl border border-[#c8ff3d]/30 bg-gradient-to-br from-[#c8ff3d]/12 to-transparent p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
                        Included with launch
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">Everything you need to go live</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-serif text-3xl font-bold leading-none text-[#d5ff69]">
                        ${CLAIM_FEE}
                      </p>
                      <p className="mt-1 text-[10px] font-medium text-white/40">one-time</p>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-2">
                    <li className="flex items-center gap-2 text-[12px] font-medium text-white/75">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#c8ff3d]/15 text-[#d5ff69]">
                        <Wallet className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">Marketing wallet</span>
                      <Link
                        to="/marketing-wallet"
                        className="shrink-0 text-[11px] font-semibold text-[#d5ff69] underline decoration-[#c8ff3d]/40 underline-offset-2 transition hover:text-white"
                      >
                        How it works
                      </Link>
                    </li>
                    <li className="grid gap-2 sm:grid-cols-2">
                      {[
                        { icon: Globe, label: 'New website' },
                        { icon: MessageCircle, label: 'New socials' },
                        { icon: Sparkles, label: 'Logo & banner' },
                        { icon: ShieldAlert, label: 'Stop dev fees' },
                        { icon: Users, label: 'Board listing' },
                      ].map(({ icon: Icon, label }) => (
                        <div
                          key={label}
                          className="inline-flex items-center gap-2 text-[12px] font-medium text-white/75"
                        >
                          <span className="grid h-6 w-6 place-items-center rounded-md bg-[#c8ff3d]/15 text-[#d5ff69]">
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          {label}
                        </div>
                      ))}
                    </li>
                  </ul>
                </div>
              ) : null}

              {fromCoinPage ? (
                <p className="rounded-lg border border-sky-400/25 bg-sky-500/10 px-3 py-2 text-[11px] text-sky-200">
                  Prefilling from the coin page…
                </p>
              ) : null}

              <label className="block">
                <span className="text-[11px] font-semibold text-white/45">Contract address</span>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    value={contract}
                    onChange={(event) => {
                      setContract(event.target.value);
                      setCoinReady(false);
                      setLookupError(null);
                    }}
                    placeholder="Contract address"
                    className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 font-mono text-[12px] text-white outline-none transition placeholder:text-white/25 focus:border-[#c8ff3d]/40"
                  />
                  <button
                    type="button"
                    onClick={() => void runLookup(contract)}
                    disabled={lookupBusy || contract.trim().length < 8}
                    className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-[#c8ff3d]/30 bg-[#c8ff3d]/10 px-3 text-xs font-bold text-[#d5ff69] disabled:opacity-40"
                  >
                    {lookupBusy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Search className="h-3.5 w-3.5" />
                    )}
                    Find
                  </button>
                </div>
              </label>

              {lookupError ? (
                <p className="text-[12px] text-rose-300">{lookupError}</p>
              ) : null}

              {lookupBusy ? (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-6 text-center text-[12px] text-white/45">
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-[#c8ff3d]" />
                  Looking up coin…
                </div>
              ) : null}

              {coinReady && !lookupBusy ? (
                <div className="rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/[0.07] p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/10">
                      {logoPreview ? (
                        <img src={logoPreview} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="grid h-full w-full place-items-center text-[10px] text-white/30">
                          Logo
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-serif text-lg font-bold text-white">
                          {name || 'Unknown'}
                        </p>
                        <span className="rounded bg-[#c8ff3d]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#d5ff69]">
                          {venueLabel}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#c8ff3d]">
                        {ticker ? `$${ticker}` : '—'}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-white/35">
                        {formatMintPreview(contract)}
                      </p>
                    </div>
                    <Check className="h-5 w-5 shrink-0 text-[#c8ff3d]" />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="text-[10px] font-semibold text-white/40">Name</span>
                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className={`${fieldClass} mt-1 h-9 text-sm`}
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-semibold text-white/40">Ticker</span>
                      <input
                        value={ticker}
                        onChange={(event) => setTicker(event.target.value.toUpperCase())}
                        maxLength={12}
                        className={`${fieldClass} mt-1 h-9 text-sm`}
                      />
                    </label>
                  </div>
                  {mode === 'launch' ? (
                    <label className="mt-3 block">
                      <span className="text-[10px] font-semibold text-white/40">
                        Total token supply
                      </span>
                      <select
                        value={tokenSupply}
                        onChange={(event) =>
                          setTokenSupply(event.target.value as TokenSupplyValue)
                        }
                        className={`${fieldClass} mt-1 h-10 cursor-pointer text-sm`}
                      >
                        {TOKEN_SUPPLY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value} className="bg-[#090b14]">
                            {option.label} ({option.shortLabel})
                          </option>
                        ))}
                      </select>
                      <span className="mt-1 block text-[10px] leading-relaxed text-white/30">
                        Fixed at launch. It changes the number of tokens, not the project’s value.
                      </span>
                    </label>
                  ) : null}
                </div>
              ) : null}

              {mode === 'launch' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] px-3 py-2.5 text-left text-[11px] font-semibold text-white/45 hover:text-white/70"
                  >
                    Advanced (old socials)
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {showAdvanced ? (
                    <div className="space-y-3 rounded-xl border border-white/[0.06] bg-black/20 p-3">
                      <label className="block">
                        <span className="text-[11px] font-semibold text-white/40">Old Telegram</span>
                        <input
                          value={telegram}
                          onChange={(event) => setTelegram(event.target.value)}
                          placeholder="https://t.me/…"
                          className={fieldClass}
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold text-white/40">Old X / Twitter</span>
                        <input
                          value={twitter}
                          onChange={(event) => setTwitter(event.target.value)}
                          placeholder="https://x.com/…"
                          className={fieldClass}
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold text-white/40">Old website</span>
                        <input
                          value={website}
                          onChange={(event) => setWebsite(event.target.value)}
                          placeholder="https://…"
                          className={fieldClass}
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold text-white/40">Notes</span>
                        <textarea
                          value={note}
                          onChange={(event) => setNote(event.target.value)}
                          rows={2}
                          placeholder="Optional"
                          className="mt-1.5 w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#c8ff3d]/40"
                        />
                      </label>
                    </div>
                  ) : null}
                </>
              ) : (
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl px-3 py-3 transition ${
                    listMarketingOptIn
                      ? 'border border-[#c8ff3d]/40 bg-[#c8ff3d]/[0.1]'
                      : 'border border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={listMarketingOptIn}
                    onChange={(event) => setListMarketingOptIn(event.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#c8ff3d]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-semibold text-white/90">
                        Add marketing wallet
                      </span>
                      <span className="shrink-0 font-mono text-[12px] font-bold text-[#d5ff69]">
                        ${MARKETING_WALLET_ATTACH_FEE_USD}
                      </span>
                    </span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-white/45">
                      Optional. CTOgo trades fill it to pay for ads and growth.
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-3">
                      <Link
                        to="/marketing-wallet"
                        onClick={(event) => event.stopPropagation()}
                        className="inline-block text-[11px] font-semibold text-[#d5ff69] underline decoration-[#c8ff3d]/40 underline-offset-2"
                      >
                        How it works
                      </Link>
                      <PolessiaLogo variant="powered" size="xs" />
                    </span>
                  </span>
                </label>
              )}

              {listNotice && mode === 'add' ? (
                <p className="text-[12px] font-medium text-amber-300">{listNotice}</p>
              ) : null}

              {mode === 'add' && connected && address ? (
                <p className="text-center text-[11px] text-white/40">
                  Listing as {address.slice(0, 4)}…{address.slice(-4)} · CTOgo admins the Telegram
                  group
                </p>
              ) : null}

              <button
                type="submit"
                disabled={
                  !canContinueCoin || (mode === 'add' && (walletBusy || marketingAttachBusy))
                }
                className={primaryBtnClass}
              >
                {mode === 'add' ? (
                  marketingAttachBusy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Listing…
                    </>
                  ) : connected ? (
                    <>
                      {listMarketingOptIn
                        ? `List · $${MARKETING_WALLET_ATTACH_FEE_USD} vault`
                        : 'List on CTOgo'}
                      <Check className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Connect wallet &amp; list
                      <Wallet className="h-4 w-4" />
                    </>
                  )
                ) : (
                  <>
                    Looks good
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : null}

          {step === 'fees' ? (
            <form onSubmit={onFeesContinue} className="mt-6 space-y-4">
              <div className="rounded-xl border border-[#c8ff3d]/20 bg-[#c8ff3d]/[0.07] p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#c8ff3d]/15 text-[#c8ff3d]">
                    <Split className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#d5ff69]">Creator fee destination</p>
                    <p className="mt-1 text-[12px] text-white/55">
                      {formatBpsPercent(launchTier.creatorPoolBps)} pool cut. Locked at deploy.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold">
                      <Link to="/fees#dynamic-tiers" className="text-[#c8ff3d] hover:underline">
                        Fees
                      </Link>
                      <span className="text-white/20">·</span>
                      <Link to="/faq#marketing-wallet" className="text-[#c8ff3d] hover:underline">
                        Abandonment
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {CREATOR_FEE_MODES.map((option) => {
                  const selected = feeMode === option.id;
                  const Icon = option.id === 'creator' ? Wallet : Users;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFeeMode(option.id)}
                      className={`w-full rounded-xl border px-4 py-3.5 text-left transition ${
                        selected
                          ? 'border-[#c8ff3d]/45 bg-[#c8ff3d]/10'
                          : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                            selected
                              ? 'bg-[#c8ff3d]/20 text-[#c8ff3d]'
                              : 'bg-white/5 text-white/45'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-white">{option.title}</p>
                            {selected ? (
                              <span className="text-[10px] font-semibold text-[#d5ff69]">
                                Selected
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-[11px] text-white/50">{option.destination}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <button type="button" onClick={() => setStep('coin')} className={backBtnClass}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button type="submit" className={`${primaryBtnClass} sm:flex-1`}>
                  Looks good
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : null}

          {step === 'burn' ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-orange-400/25 bg-orange-400/[0.08] p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-orange-400/15 text-orange-300">
                    <Flame className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-orange-200">Burn V1 → get V2</p>
                    <p className="mt-1 text-[12px] text-white/55">
                      Optional now. Burn {displayTicker} 1:1 into vested V2.
                    </p>
                  </div>
                </div>
              </div>

              {mode === 'launch' ? (
                <p className="text-[11px] text-white/40">
                  Fee mode: <span className="text-white/70">{selectedFeeMode.title}</span>
                </p>
              ) : null}

              <label className="block">
                <span className="text-[11px] font-semibold text-white/45">Amount</span>
                <div className="mt-1.5 flex gap-2">
                  <input
                    value={burnAmount}
                    onChange={(event) => setBurnAmount(event.target.value.replace(/[^\d.]/g, ''))}
                    placeholder="0.00"
                    inputMode="decimal"
                    className={`${fieldClass} mt-0`}
                  />
                  <button
                    type="button"
                    onClick={() => setBurnAmount('1000000')}
                    className="h-11 shrink-0 rounded-xl border border-white/[0.08] px-3 text-xs font-semibold text-white/60"
                  >
                    Max
                  </button>
                </div>
              </label>

              <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-3">
                <div className="flex items-center gap-2 text-amber-100">
                  <ShieldAlert className="h-4 w-4" />
                  <p className="text-xs font-bold">V2 unlocks over 90 days</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {VESTING_SCHEDULE.map((row) => (
                    <span
                      key={row.label}
                      className="inline-flex items-center gap-1 rounded-md bg-black/25 px-2 py-1 text-[10px] text-white/55"
                    >
                      <Lock className="h-3 w-3 text-amber-300/80" />
                      {row.label} · {row.amount}
                    </span>
                  ))}
                </div>
                <label className="mt-3 flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={vestingAccepted}
                    onChange={(event) => setVestingAccepted(event.target.checked)}
                    className="h-4 w-4 rounded accent-[#c8ff3d]"
                  />
                  <span className="text-[12px] text-white/55">I understand V2 is vested</span>
                </label>
              </div>

              {!burned ? (
                <button type="button" onClick={() => setBurned(true)} className={secondaryBurnBtnClass}>
                  <Flame className="h-4 w-4" />
                  Burn V1 &amp; mint V2
                </button>
              ) : (
                <div className="rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-4 py-3 text-center text-sm font-bold text-[#d5ff69]">
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4" />
                    Burn recorded
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <button
                  type="button"
                  onClick={() => setStep(mode === 'launch' ? 'fees' : 'coin')}
                  className={backBtnClass}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button type="button" onClick={goToWebsite} className={`${primaryBtnClass} sm:flex-1`}>
                  {burned ? 'Looks good' : 'Skip for now'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}

          {step === 'website' ? (
            <form onSubmit={onWebsiteFinish} className="mt-6 space-y-4">
              <div>
                <p className="text-sm font-bold text-white">Your website</p>
                <p className="mt-1 text-[12px] text-white/45">
                  Write your copy, generate a simple 1-pager — regenerate until it
                  feels right.
                </p>
              </div>

              <p className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[11px] text-white/45">
                Platform page always live at{' '}
                <span className="font-mono text-white/70">
                  ctogo.app/coin/{ticker.trim().toLowerCase() || 'ticker'}
                </span>
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => selectWebsiteKind('onepager')}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    websiteKind === 'onepager'
                      ? 'border-[#c8ff3d]/45 bg-[#c8ff3d]/10'
                      : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                  }`}
                >
                  <p className="flex items-center gap-1.5 text-xs font-bold text-white">
                    Simple 1-pager
                    <span className="rounded bg-white/[0.1] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/50">
                      beta
                    </span>
                  </p>
                  <p className="mt-1 text-[10px] text-white/40">Auto design, your copy</p>
                </button>
                <button
                  type="button"
                  onClick={() => selectWebsiteKind('clone')}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    websiteKind === 'clone'
                      ? 'border-[#c8ff3d]/45 bg-[#c8ff3d]/10'
                      : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                  }`}
                >
                  <p className="text-xs font-bold text-white">Clone old site</p>
                  <p className="mt-1 text-[10px] text-white/40">Rebuild with new CA &amp; branding</p>
                </button>
              </div>

              {websiteKind === 'clone' ? (
                <label className="block">
                  <span className="text-[11px] font-semibold text-white/45">Old website URL</span>
                  <input
                    value={cloneUrl}
                    onChange={(event) => {
                      setCloneUrl(event.target.value);
                      setSiteGenerated(false);
                    }}
                    placeholder="https://…"
                    className={fieldClass}
                  />
                </label>
              ) : !siteGenerated ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold text-white/55">Your copy</p>
                    <p className="mt-0.5 text-[10px] text-white/35">
                      Headline, story, manifesto — use as much text as you want. Line breaks become
                      paragraphs.
                    </p>
                  </div>
                  <label className="block">
                    <span className="text-[11px] font-semibold text-white/45">Headline</span>
                    <input
                      value={siteHeadline}
                      onChange={(event) => setSiteHeadline(event.target.value)}
                      placeholder="Short hook (optional)"
                      className={fieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-semibold text-white/45">Page copy</span>
                    <textarea
                      value={pageBlurb}
                      onChange={(event) => setPageBlurb(event.target.value)}
                      rows={5}
                      placeholder="Tell the story. Add as many paragraphs as you need…"
                      className="mt-1.5 w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#c8ff3d]/40"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowExtraCopy((v) => !v)}
                    className="text-[11px] font-semibold text-[#c8ff3d]/80 hover:text-[#d5ff69]"
                  >
                    {showExtraCopy || siteExtraTitle || siteExtraBody
                      ? 'Custom section'
                      : '+ Add a custom section'}
                  </button>
                  {showExtraCopy || siteExtraTitle || siteExtraBody ? (
                    <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <label className="block">
                        <span className="text-[11px] font-semibold text-white/45">Section title</span>
                        <input
                          value={siteExtraTitle}
                          onChange={(event) => setSiteExtraTitle(event.target.value)}
                          placeholder="e.g. Roadmap, Lore, Rules…"
                          className={fieldClass}
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold text-white/45">Section text</span>
                        <textarea
                          value={siteExtraBody}
                          onChange={(event) => setSiteExtraBody(event.target.value)}
                          rows={3}
                          placeholder="Anything else you want on the page…"
                          className="mt-1.5 w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#c8ff3d]/40"
                        />
                      </label>
                    </div>
                  ) : null}

                  <div>
                    <p className="text-[11px] font-semibold text-white/55">Include on the page</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ONE_PAGER_INCLUDE_OPTIONS.map((opt) => {
                        const on = siteIncludes[opt.id];
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            title={opt.hint}
                            onClick={() => toggleSiteInclude(opt.id)}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                              on
                                ? 'border-[#c8ff3d]/45 bg-[#c8ff3d]/10 text-[#d5ff69]'
                                : 'border-white/[0.08] text-white/45 hover:border-white/20 hover:text-white'
                            }`}
                          >
                            {on ? <Check className="h-3 w-3" /> : null}
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {!siteGenerated ? (
                <button
                  type="button"
                  onClick={() => void generateWebsite()}
                  disabled={!canGenerateSite || generatingSite}
                  className={primaryBtnClass}
                >
                  {generatingSite ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Designing…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate {websiteKind === 'clone' ? 'clone preview' : '1-pager'}
                    </>
                  )}
                </button>
              ) : (
                <>
                  <div
                    ref={sitePreviewRef}
                    className={editSite ? 'sticky top-0 z-20 -mx-1 mb-2 space-y-2 bg-[#090b14]/95 pb-2 pt-1 backdrop-blur-md' : 'space-y-2'}
                  >
                    <WebsitePreview
                      kind={websiteKind}
                      name={name}
                      ticker={ticker}
                      headline={siteHeadline}
                      body={pageBlurb || note}
                      extraTitle={siteExtraTitle}
                      extraBody={siteExtraBody}
                      logoUrl={logoPreview}
                      bannerUrl={bannerPreview}
                      contract={contract}
                      cloneUrl={cloneUrl || website}
                      themeId={onePagerThemeId}
                      layoutPreference={layoutPreference}
                      layoutSeed={layoutSeed}
                      layoutId={activeLayoutId}
                      designNonce={designNonce}
                      includes={siteIncludes}
                      tokenSupply={tokenSupply}
                    />
                    <p className="text-center text-[10px] capitalize text-white/30">
                      Layout · {activeLayoutId} · {onePagerThemeId}
                      {editSite ? ' · live preview' : ` · look ${designNonce || 1}`}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={openSiteEditor}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.1] text-[12px] font-bold text-white/70 hover:border-white/25 hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#c8ff3d]/30 bg-[#c8ff3d]/10 text-[12px] font-bold text-[#d5ff69]"
                    >
                      View full page
                    </button>
                  </div>

                  {editSite ? (
                    <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-white/45">
                          Editing
                        </p>
                        <button
                          type="button"
                          onClick={() => setEditSite(false)}
                          className="text-[10px] font-semibold text-white/40 hover:text-white"
                        >
                          Done
                        </button>
                      </div>

                      {websiteKind === 'onepager' ? (
                        <div className="space-y-3">
                          <label className="block">
                            <span className="text-[11px] font-semibold text-white/45">Headline</span>
                            <input
                              value={siteHeadline}
                              onChange={(event) => setSiteHeadline(event.target.value)}
                              className={fieldClass}
                            />
                          </label>
                          <label className="block">
                            <span className="text-[11px] font-semibold text-white/45">Page copy</span>
                            <textarea
                              value={pageBlurb}
                              onChange={(event) => setPageBlurb(event.target.value)}
                              rows={4}
                              className="mt-1.5 w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c8ff3d]/40"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[11px] font-semibold text-white/45">
                              Custom section title
                            </span>
                            <input
                              value={siteExtraTitle}
                              onChange={(event) => setSiteExtraTitle(event.target.value)}
                              className={fieldClass}
                            />
                          </label>
                          <label className="block">
                            <span className="text-[11px] font-semibold text-white/45">
                              Custom section text
                            </span>
                            <textarea
                              value={siteExtraBody}
                              onChange={(event) => setSiteExtraBody(event.target.value)}
                              rows={3}
                              className="mt-1.5 w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c8ff3d]/40"
                            />
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {ONE_PAGER_INCLUDE_OPTIONS.map((opt) => {
                              const on = siteIncludes[opt.id];
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => toggleSiteInclude(opt.id)}
                                  className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
                                    on
                                      ? 'border-[#c8ff3d]/45 bg-[#c8ff3d]/10 text-[#d5ff69]'
                                      : 'border-white/[0.08] text-white/45'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                          <ColourPalettePicker
                            value={onePagerThemeId}
                            onChange={(id) => {
                              setOnePagerThemeId(id);
                              window.requestAnimationFrame(() => {
                                sitePreviewRef.current?.scrollIntoView({
                                  behavior: 'smooth',
                                  block: 'start',
                                });
                              });
                            }}
                            compact
                          />
                        </div>
                      ) : (
                        <label className="block">
                          <span className="text-[11px] font-semibold text-white/55">
                            Old website URL
                          </span>
                          <input
                            value={cloneUrl}
                            onChange={(event) => setCloneUrl(event.target.value)}
                            className={fieldClass}
                          />
                        </label>
                      )}

                      <button
                        type="button"
                        onClick={() => setEditArt((v) => !v)}
                        className="flex w-full items-center justify-between rounded-xl border border-white/[0.08] px-3 py-2.5 text-[11px] font-semibold text-white/55 hover:text-white"
                      >
                        {editArt ? 'Hide logo / banner' : 'Edit logo / banner'}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${editArt ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {editArt ? (
                        <div className="space-y-2">
                          <p className="text-[11px] leading-relaxed text-white/40">
                            First logo &amp; banner are free. Extra generates are added to your bill
                            at publish ({formatCollateralUsd(COLLATERAL_EXTRA_USD.logo)} / logo ·{' '}
                            {formatCollateralUsd(COLLATERAL_EXTRA_USD.banner)} / banner). Uploads
                            stay free.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={regenerateLogo}
                              disabled={generatingLogo}
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-3 text-[11px] font-bold text-[#d5ff69]"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              New logo
                              <span className="font-mono text-[9px] font-semibold text-[#c8ff3d]/70">
                                +{formatCollateralUsd(COLLATERAL_EXTRA_USD.logo)}
                              </span>
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
                              onClick={regenerateBanner}
                              disabled={generatingBanner}
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-3 text-[11px] font-bold text-[#d5ff69]"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              New banner
                              <span className="font-mono text-[9px] font-semibold text-[#c8ff3d]/70">
                                +{formatCollateralUsd(COLLATERAL_EXTRA_USD.banner)}
                              </span>
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
                              onChange={(event) => {
                                void onUploadLogo(event.target.files?.[0]);
                                event.target.value = '';
                              }}
                            />
                            <input
                              ref={bannerRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => {
                                void onUploadBanner(event.target.files?.[0]);
                                event.target.value = '';
                              }}
                            />
                          </div>
                          {artBill.hasExtras ? (
                            <div className="rounded-lg border border-[#c8ff3d]/20 bg-[#c8ff3d]/[0.06] px-3 py-2">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-[#c8ff3d]/80">
                                Added at publish
                              </p>
                              <ul className="mt-1 space-y-0.5 text-[11px] text-white/55">
                                {artBill.lines.map((line) => (
                                  <li key={line}>{line}</li>
                                ))}
                              </ul>
                              <p className="mt-1.5 text-[12px] font-bold text-[#d5ff69]">
                                Est. {formatCollateralUsd(artBill.totalUsd)}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {artBill.hasExtras && !editSite ? (
                    <p className="text-center text-[11px] text-white/40">
                      Extra art on bill · est. {formatCollateralUsd(artBill.totalUsd)} at publish
                    </p>
                  ) : null}
                </>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <button type="button" onClick={() => setStep('burn')} className={backBtnClass}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!canPublishSite}
                  className={`${primaryBtnClass} sm:flex-1`}
                >
                  Publish CTO
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : null}

          {step === 'done' ? (
            <div className="mt-6 rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-4 py-6 text-center">
              <p className="text-sm font-bold text-[#d5ff69]">
                {mode === 'add' ? 'CTO listed' : 'CTO published'}
              </p>
              <p className="mt-1.5 text-xs text-white/50">
                {mode === 'add' ? (
                  <>
                    {ticker.trim() ? `$${ticker.trim().toUpperCase()}` : 'Your coin'} is on the
                    board
                    {address
                      ? ` · managed by ${address.slice(0, 4)}…${address.slice(-4)}`
                      : ''}
                    {marketingAttached
                      ? ' · marketing wallet live'
                      : ' · no marketing wallet yet'}
                    .
                  </>
                ) : (
                  <>
                    {ticker.trim() ? `$${ticker.trim().toUpperCase()}` : 'Your project'} is live on
                    CTOgo
                    {websiteKind === 'clone' ? ' with a cloned site' : ' with a 1-pager'}.
                  </>
                )}
              </p>
              {mode === 'add' && telegramInvite ? (
                <div className="mx-auto mt-4 max-w-sm rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">
                    Telegram group
                  </p>
                  <a
                    href={telegramInvite}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block truncate text-[12px] font-semibold text-[#d5ff69] underline decoration-[#c8ff3d]/40 underline-offset-2"
                  >
                    {telegramInvite}
                  </a>
                  <p className="mt-1 text-[10px] text-white/35">
                    CTOgo is chat admin · bot tools later
                  </p>
                </div>
              ) : null}
              {mode === 'launch' && artBill.hasExtras ? (
                <div className="mx-auto mt-4 max-w-sm rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">
                    Creative extras
                  </p>
                  <ul className="mt-1 space-y-0.5 text-[11px] text-white/55">
                    {artBill.lines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <p className="mt-1.5 text-[12px] font-bold text-[#d5ff69]">
                    Est. {formatCollateralUsd(artBill.totalUsd)} · charged with launch
                  </p>
                </div>
              ) : null}
              {mode === 'add' && !marketingAttached ? (
                <p className="mx-auto mt-4 max-w-sm text-[11px] leading-relaxed text-white/40">
                  You can still add a marketing wallet later from the coin page for $
                  {MARKETING_WALLET_ATTACH_FEE_USD}. Want a new mint with vault included?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('launch')}
                    className="font-semibold text-[#d5ff69] underline decoration-[#c8ff3d]/40 underline-offset-2"
                  >
                    Launch on CTOgo
                  </button>
                </p>
              ) : null}
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link to="/" className={`${primaryBtnClass} sm:w-auto sm:px-6`}>
                  Back to home
                </Link>
                <button type="button" onClick={resetFlow} className={backBtnClass}>
                  {mode === 'add' ? 'List another' : 'Launch another'}
                </button>
              </div>
            </div>
          ) : null}
        </main>
      </div>

      <WebsitePreviewOverlay
        open={previewOpen && step === 'website'}
        onClose={openSiteEditor}
        onContinue={() => setPreviewOpen(false)}
        onRegenerate={websiteKind === 'onepager' ? regenerateDesign : undefined}
        kind={websiteKind}
        name={name}
        ticker={ticker}
        headline={siteHeadline}
        body={pageBlurb || note}
        extraTitle={siteExtraTitle}
        extraBody={siteExtraBody}
        logoUrl={logoPreview}
        bannerUrl={bannerPreview}
        contract={contract}
        cloneUrl={cloneUrl || website}
        themeId={onePagerThemeId}
        layoutPreference={layoutPreference}
        layoutSeed={layoutSeed}
        layoutId={activeLayoutId}
        designNonce={designNonce}
        includes={siteIncludes}
        tokenSupply={tokenSupply}
      />
    </div>
  );
}
