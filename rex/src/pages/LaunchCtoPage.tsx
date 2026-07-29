import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Globe,
  Info,
  Loader2,
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
  X,
} from 'lucide-react';
import { CtoGoLogo } from '../components/CtoGoLogo';
import { AuthButton } from '../components/AuthButton';
import { AppSidebar, AppSidebarMenuButton, AppSidebarProvider } from '../components/AppSidebar';
import { PolessiaLogo } from '../components/PolessiaLogo';
import { useAuth } from '../components/AuthProvider';
import { useConnectedWallet, ConnectWalletButton } from '../components/ConnectWalletButton';
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
type WebsiteKind = 'onepager' | 'clone' | 'none';

const fieldClass =
  'mt-1.5 h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[#c8ff3d]/40';

const primaryBtnClass =
  'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c8ff3d] text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69] disabled:cursor-not-allowed disabled:opacity-40';

const backBtnClass =
  'inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-xl border border-white/[0.1] text-xs font-semibold text-white/55 transition hover:bg-white/[0.04] hover:text-white sm:w-auto sm:px-5';

/** Vesting: 10% unlock each day (Day 1-6) and remainder on Day 7. */
const VESTING_SCHEDULE = [
  { label: 'Day 1', amount: '10%' },
  { label: 'Day 2', amount: '10%' },
  { label: 'Day 3', amount: '10%' },
  { label: 'Day 4', amount: '10%' },
  { label: 'Day 5', amount: '10%' },
  { label: 'Day 6', amount: '10%' },
  { label: 'Day 7', amount: '40%' },
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
  const { signedIn, requireAuth } = useAuth();
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
  const [telegramPopupOpen, setTelegramPopupOpen] = useState(false);
  const [listingConfirmed, setListingConfirmed] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
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
  /** Demo V1 balance after wallet scan — real RPC later. */
  const [v1Balance, setV1Balance] = useState<string | null>(null);
  const [balanceScanning, setBalanceScanning] = useState(false);
  const [burnConfirmBusy, setBurnConfirmBusy] = useState(false);
  const [burnConfirmError, setBurnConfirmError] = useState<string | null>(null);
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

  /** Demo: scan connected wallet for V1 balance of the launch mint. */
  useEffect(() => {
    if (step !== 'burn') return;
    if (!connected || !address) {
      setV1Balance(null);
      setBalanceScanning(false);
      return;
    }
    let cancelled = false;
    setBalanceScanning(true);
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      let salt = 0;
      for (let i = 0; i < address.length; i += 1) {
        salt = (salt * 31 + address.charCodeAt(i)) % 10000;
      }
      const mintSalt = contract.trim().slice(-4).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      setV1Balance(String(250_000 + salt * 13 + mintSalt * 40));
      setBalanceScanning(false);
    }, 700);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [step, connected, address, contract]);

  const displayTicker = ticker.trim() ? `$${ticker.trim().toUpperCase()}` : 'your coin';

  const demoScanV1BalanceForWallet = (walletAddress: string): number => {
    // Demo-only: stable pseudo-balance from wallet + V1 mint.
    let salt = 0;
    for (let i = 0; i < walletAddress.length; i += 1) {
      salt = (salt * 31 + walletAddress.charCodeAt(i)) % 10000;
    }
    const mintSalt = contract.trim().slice(-4).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return 250_000 + salt * 13 + mintSalt * 40;
  };

  const scanV1BalanceNow = async (walletAddress: string): Promise<number> => {
    setBalanceScanning(true);
    await new Promise((r) => window.setTimeout(r, 700));
    const amount = demoScanV1BalanceForWallet(walletAddress);
    setV1Balance(String(amount));
    setBalanceScanning(false);
    return amount;
  };

  const onBurnConfirm = async () => {
    if (burnConfirmBusy) return;
    setBurnConfirmError(null);
    const amt = Number(burnAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setBurnConfirmError('Enter an amount to burn.');
      return;
    }
    if (!vestingAccepted) {
      setBurnConfirmError('Confirm the unlock terms to continue.');
      return;
    }

    setBurnConfirmBusy(true);
    try {
      let walletAddress = address;
      if (!walletAddress) {
        // Burn fee is paid at confirmation, so connect at this stage if needed.
        const next = await connect();
        if (!next) {
          setBurnConfirmError('Connect a wallet to pay the burn fee.');
          return;
        }
        walletAddress = next;
      }

      const available = await scanV1BalanceNow(walletAddress);
      if (amt > available) {
        setBurnConfirmError(
          `Not enough V1. Available: ${available.toLocaleString()} ${displayTicker}.`,
        );
        return;
      }

      // Demo-only: simulate burn + fee payment.
      await new Promise((r) => window.setTimeout(r, 600));
      setBurned(true);
    } finally {
      setBurnConfirmBusy(false);
    }
  };
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
    setV1Balance(null);
    setBalanceScanning(false);
    setBurnConfirmBusy(false);
    setBurnConfirmError(null);
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
    setTelegramPopupOpen(false);
    setListingConfirmed(false);
    setCopiedLink(null);
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

  /** Sign-up comes after List / Launch — claim the page once the flow is done. */
  const claimAccountAfterPublish = async () => {
    if (signedIn) return;
    await requireAuth(
      mode === 'add'
        ? 'Create a free account to claim this listing.'
        : 'Create a free account to claim this launch.',
    );
  };

  const coinSlug =
    (ticker.trim() || 'cto').toLowerCase().replace(/[^a-z0-9]/g, '') || 'cto';
  const displaySymbol = ticker.trim() ? `$${ticker.trim().toUpperCase()}` : '$CTO';

  const shareLinks = (() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ctogo.vercel.app';
    const tg = telegramInvite ?? `https://t.me/ctogo_${coinSlug}`;
    return {
      token: `${origin}/?coin=${coinSlug}`,
      telegram: tg,
      burn: `${origin}/launch?burn=1&ticker=${encodeURIComponent(ticker.trim() || 'CTO')}&ca=${encodeURIComponent(contract.trim())}`,
    };
  })();

  const copyShareLink = async (key: keyof typeof shareLinks) => {
    try {
      await navigator.clipboard.writeText(shareLinks[key]);
      setCopiedLink(key);
      window.setTimeout(() => setCopiedLink((cur) => (cur === key ? null : cur)), 1600);
    } catch {
      // ignore
    }
  };

  const openPublishedDashboard = async (withMarketing?: boolean) => {
    if (withMarketing !== undefined) setMarketingAttached(withMarketing);
    setTelegramInvite(`https://t.me/ctogo_${coinSlug}`);
    setListingConfirmed(false);
    setTelegramPopupOpen(true);
    setStep('done');
    await claimAccountAfterPublish();
  };

  const finishList = async (withMarketing: boolean) => {
    await openPublishedDashboard(withMarketing);
  };

  const finishLaunch = async () => {
    setListNotice(null);
    await openPublishedDashboard();
  };

  const onCoinContinue = async (event: FormEvent) => {
    event.preventDefault();
    if (!canContinueCoin) return;

    if (mode === 'add') {
      setListNotice(null);
      if (listMarketingOptIn) {
        if (!connected) {
          setListNotice('Connect your wallet to pay the $1 marketing vault fee');
          const next = await connect();
          if (!next) return;
        }
        setMarketingAttachBusy(true);
        try {
          // Demo: $1 covers rent + tx; remainder → treasury.
          await new Promise((r) => window.setTimeout(r, 600));
          await finishList(true);
        } finally {
          setMarketingAttachBusy(false);
        }
        return;
      }
      await finishList(false);
      return;
    }
    setStep('fees');
  };

  const onFeesContinue = (event: FormEvent) => {
    event.preventDefault();
    setStep('burn');
  };

  const goToWebsite = () => setStep('website');

  const onWebsiteFinish = async (event: FormEvent) => {
    event.preventDefault();
    if (websiteKind !== 'none' && !siteGenerated) return;
    if (!connected) {
      setListNotice('Connect your wallet to pay the launch fee');
      const next = await connect();
      if (!next) return;
    }
    await finishLaunch();
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
    if (websiteKind === 'none') return;
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
  const canPublishSite = websiteKind === 'none' || siteGenerated;

  return (
    <AppSidebarProvider>
    <div className="page-shell theme-dark min-h-screen text-[#f5f7fb]">
      <AppSidebar />
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
            <AuthButton />
            <ConnectWalletButton />
            <AppSidebarMenuButton />
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
              ? 'Paste the contract to list. Connect a wallet only if you add a marketing vault ($1).'
              : 'Burn your old tokens for the same amount of V2. Connect the wallet that holds them. We match the V1 mint from this launch.'}
          </p>

          {step !== 'done' && mode === 'launch' ? (
            <div className="mt-4 flex flex-nowrap items-center gap-1 overflow-x-auto">
              {steps.map((s, i) => (
                <div key={s.id} className="flex min-w-0 flex-1 items-center gap-1">
                  <span
                    className={`inline-flex h-5 items-center gap-1 rounded-md px-1.5 text-[10px] font-semibold whitespace-nowrap ${
                      i === stepIndex
                        ? 'bg-[#c8ff3d]/15 text-[#d5ff69]'
                        : i < stepIndex
                          ? 'text-white/55'
                          : 'text-white/30'
                    }`}
                  >
                    {i < stepIndex ? <Check className="h-3 w-3" /> : null}
                    {s.label}
                  </span>
                  {i < steps.length - 1 ? (
                    <span className="h-px min-w-[8px] flex-1 bg-white/10" aria-hidden />
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {step === 'coin' ? (
            <form onSubmit={onCoinContinue} className="mt-6 space-y-4">
              <div className="inline-flex w-full gap-0.5 rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
                <button
                  type="button"
                  onClick={() => switchMode('add')}
                  className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition ${
                    mode === 'add'
                      ? 'bg-[#c8ff3d] text-[#090b14]'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  List
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('launch')}
                  className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition ${
                    mode === 'launch'
                      ? 'bg-[#c8ff3d] text-[#090b14]'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  Launch
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
                        { icon: Globe, label: 'Website (optional)' },
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
                      CTOgo trades fill it to pay for ads and growth.
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

              {mode === 'add' && address ? (
                <p className="text-center text-[11px] text-white/40">
                  Listing as {address.slice(0, 4)}…{address.slice(-4)} · CTOgo admins the Telegram
                  group
                </p>
              ) : mode === 'add' && listMarketingOptIn ? (
                <p className="text-center text-[11px] text-white/40">
                  Wallet required only to pay the ${MARKETING_WALLET_ATTACH_FEE_USD} vault fee
                </p>
              ) : null}

              <button
                type="submit"
                disabled={
                  !canContinueCoin ||
                  (mode === 'add' && listMarketingOptIn && (walletBusy || marketingAttachBusy))
                }
                className={primaryBtnClass}
              >
                {mode === 'add' ? (
                  marketingAttachBusy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Listing…
                    </>
                  ) : listMarketingOptIn && !connected ? (
                    <>
                      Connect wallet &amp; list · ${MARKETING_WALLET_ATTACH_FEE_USD} vault
                      <Wallet className="h-4 w-4" />
                    </>
                  ) : listMarketingOptIn ? (
                    <>
                      List · ${MARKETING_WALLET_ATTACH_FEE_USD} vault
                      <Check className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      List on CTOgo
                      <Check className="h-4 w-4" />
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
            <div className="mt-6 space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-serif text-xl font-bold tracking-tight text-white">Burn</p>
                  <span className="group relative inline-flex">
                    <button
                      type="button"
                      className="grid h-5 w-5 place-items-center rounded-full text-white/35 transition hover:text-[#d5ff69] focus-visible:text-[#d5ff69] focus-visible:outline-none"
                      aria-label="Why burn matters"
                      title="Burning stops the old developer from collecting fees on trades."
                    >
                      <Info className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-52 -translate-x-1/2 rounded-lg border border-white/10 bg-[#0a0e17] px-2.5 py-2 text-[11px] leading-relaxed text-white/70 opacity-0 shadow-xl transition group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      Burning stops the old developer from collecting fees on trades.
                    </span>
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] text-white/35">
                  10% unlock per day (Day 1–6), remainder on Day 7.
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium text-white/45">V1 mint</p>
                <p className="mt-1 font-mono text-[13px] text-white/80">
                  {contract.trim() ? formatMintPreview(contract) : '—'}
                </p>
                <p className="mt-0.5 text-[11px] text-white/35">
                  {displayTicker} · from earlier step
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium text-white/45">Wallet</p>
                {connected && address ? (
                  <div className="mt-1.5 flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[13px] text-white">
                        {address.slice(0, 4)}…{address.slice(-4)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/40">
                        {balanceScanning
                          ? 'Scanning for V1…'
                          : v1Balance
                            ? `Available to burn: ${Number(v1Balance).toLocaleString()} ${displayTicker}`
                            : 'No V1 found'}
                      </p>
                    </div>
                    <Wallet className="h-4 w-4 shrink-0 text-[#d5ff69]" />
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={walletBusy}
                    onClick={() => void connect()}
                    className={`${primaryBtnClass} mt-1.5`}
                  >
                    <Wallet className="h-4 w-4" />
                    {walletBusy ? 'Connecting…' : 'Connect wallet to scan'}
                  </button>
                )}
              </div>

              <div className="flex items-end gap-3">
                <label className="block min-w-0 flex-1">
                  <span className="text-[11px] font-medium text-white/45">Amount to burn</span>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      value={burnAmount}
                      onChange={(event) => setBurnAmount(event.target.value.replace(/[^\d.]/g, ''))}
                      placeholder="0"
                      inputMode="decimal"
                      className={`${fieldClass} mt-0`}
                    />
                    <button
                      type="button"
                      disabled={!v1Balance}
                      onClick={() => setBurnAmount(v1Balance ?? '')}
                      className="h-11 shrink-0 rounded-xl border border-white/[0.1] px-4 text-xs font-semibold text-white/55 transition hover:border-white/20 hover:text-white disabled:opacity-40"
                    >
                      Max
                    </button>
                  </div>
                </label>
                <div className="shrink-0 pb-2 text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                    You receive
                  </p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-[#d5ff69]">
                    {burnAmount ? Number(burnAmount).toLocaleString() : '0'} V2
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-medium text-white/45">Unlock schedule</p>
                <ul className="mt-2 divide-y divide-white/[0.06] border-y border-white/[0.06]">
                  {VESTING_SCHEDULE.map((row) => (
                    <li
                      key={row.label}
                      className="flex items-center justify-between py-2.5 text-[13px]"
                    >
                      <span className="text-white/55">{row.label}</span>
                      <span className="font-semibold tabular-nums text-white">{row.amount}</span>
                    </li>
                  ))}
                </ul>
                <label className="mt-3 flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={vestingAccepted}
                    onChange={(event) => setVestingAccepted(event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-[#c8ff3d]"
                  />
                  <span className="text-[12px] leading-relaxed text-white/45">
                    I understand V2 unlocks on this schedule
                  </span>
                </label>
              </div>

              {!burned ? (
                <>
                  <p className="text-[11px] text-white/35">
                    {connected
                      ? 'Burn fee will be paid from your connected wallet.'
                      : 'Confirming will connect your wallet and pay the burn fee.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => void onBurnConfirm()}
                    disabled={
                      burnConfirmBusy ||
                      !vestingAccepted ||
                      !burnAmount ||
                      !Number.isFinite(Number(burnAmount)) ||
                      Number(burnAmount) <= 0
                    }
                    className={`${primaryBtnClass} disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    {burnConfirmBusy ? 'Confirming…' : 'Confirm burn & receive V2'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <p className="flex items-center justify-center gap-2 text-sm font-semibold text-[#d5ff69]">
                  <Check className="h-4 w-4" />
                  Burn complete — V2 queued
                </p>
              )}

              {burnConfirmError ? (
                <p className="text-[12px] font-medium text-rose-300">{burnConfirmError}</p>
              ) : null}

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
                  {burned ? 'Continue' : 'Skip burn'}
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
                  Optional — build a 1-pager, clone an old site, or skip and launch without one.
                </p>
              </div>

              <p className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[11px] text-white/45">
                Platform page always live at{' '}
                <span className="font-mono text-white/70">
                  ctogo.app/coin/{ticker.trim().toLowerCase() || 'ticker'}
                </span>
              </p>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => selectWebsiteKind('onepager')}
                  className={`rounded-xl border px-2.5 py-2.5 text-left transition ${
                    websiteKind === 'onepager'
                      ? 'border-[#c8ff3d]/45 bg-[#c8ff3d]/10'
                      : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                  }`}
                >
                  <p className="text-[11px] font-bold text-white">1-pager</p>
                  <p className="mt-0.5 text-[9px] text-white/40">Auto design</p>
                </button>
                <button
                  type="button"
                  onClick={() => selectWebsiteKind('clone')}
                  className={`rounded-xl border px-2.5 py-2.5 text-left transition ${
                    websiteKind === 'clone'
                      ? 'border-[#c8ff3d]/45 bg-[#c8ff3d]/10'
                      : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                  }`}
                >
                  <p className="text-[11px] font-bold text-white">Clone</p>
                  <p className="mt-0.5 text-[9px] text-white/40">Old site URL</p>
                </button>
                <button
                  type="button"
                  onClick={() => selectWebsiteKind('none')}
                  className={`rounded-xl border px-2.5 py-2.5 text-left transition ${
                    websiteKind === 'none'
                      ? 'border-[#c8ff3d]/45 bg-[#c8ff3d]/10'
                      : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                  }`}
                >
                  <p className="text-[11px] font-bold text-white">Skip</p>
                  <p className="mt-0.5 text-[9px] text-white/40">No website</p>
                </button>
              </div>

              {websiteKind === 'none' ? (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-[12px] text-white/50">
                  You’ll launch with the CTOgo coin page only — add a site later anytime.
                </div>
              ) : websiteKind === 'clone' ? (
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

              {!siteGenerated && websiteKind !== 'none' ? (
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
              ) : siteGenerated && websiteKind !== 'none' ? (
                <>
                  <div
                    ref={sitePreviewRef}
                    className={editSite ? 'sticky top-0 z-20 -mx-1 mb-2 space-y-2 bg-[#090b14]/95 pb-2 pt-1 backdrop-blur-md' : 'space-y-2'}
                  >
                    <WebsitePreview
                      kind={websiteKind === 'clone' ? 'clone' : 'onepager'}
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
              ) : null}

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
                  {websiteKind === 'none'
                    ? connected
                      ? 'Publish without website'
                      : 'Connect wallet & publish'
                    : connected
                      ? 'Publish CTO'
                      : 'Connect wallet & publish'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : null}

          {step === 'done' ? (
            <div className="mt-6 space-y-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
                  Dashboard
                </p>
                <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-white">
                  {displaySymbol}
                </h2>
                <p className="mt-1.5 text-sm text-white/45">
                  {mode === 'add' ? 'Listed on CTOgo.' : 'Live on CTOgo.'} Manage listing, links, and
                  community from here.
                </p>
              </div>

              <section className="space-y-3">
                <p className="text-[11px] font-medium text-white/45">Confirm listing</p>
                {listingConfirmed ? (
                  <p className="flex items-center gap-2 text-sm font-semibold text-[#d5ff69]">
                    <Check className="h-4 w-4" />
                    Listing confirmed
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setListingConfirmed(true)}
                    className={primaryBtnClass}
                  >
                    Confirm listing
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </section>

              <section className="space-y-3">
                <p className="text-[11px] font-medium text-white/45">Shareable links</p>
                <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
                  {(
                    [
                      { key: 'token' as const, label: 'Token page', href: shareLinks.token },
                      { key: 'telegram' as const, label: 'Telegram page', href: shareLinks.telegram },
                      { key: 'burn' as const, label: 'Burn tokens share', href: shareLinks.burn },
                    ] as const
                  ).map((row) => (
                    <li key={row.key} className="flex items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">{row.label}</p>
                        <p className="mt-0.5 truncate text-[11px] text-white/35">{row.href}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void copyShareLink(row.key)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.1] px-2.5 text-[11px] font-semibold text-white/55 transition hover:border-white/20 hover:text-white"
                      >
                        {copiedLink === row.key ? (
                          <Check className="h-3.5 w-3.5 text-[#d5ff69]" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copiedLink === row.key ? 'Copied' : 'Copy'}
                      </button>
                      <a
                        href={row.href}
                        target="_blank"
                        rel="noreferrer"
                        className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.1] text-white/45 transition hover:border-white/20 hover:text-white"
                        aria-label={`Open ${row.label}`}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              <button
                type="button"
                onClick={() => setTelegramPopupOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
              >
                <MessageCircle className="h-4 w-4 text-[#d5ff69]" />
                Open Telegram community
              </button>

              {mode === 'launch' && artBill.hasExtras ? (
                <p className="text-[11px] text-white/35">
                  Creative extras · est. {formatCollateralUsd(artBill.totalUsd)} with launch
                </p>
              ) : null}

              {mode === 'add' && !marketingAttached ? (
                <p className="text-[11px] leading-relaxed text-white/40">
                  Add a marketing wallet later from the coin page for $
                  {MARKETING_WALLET_ATTACH_FEE_USD}.
                </p>
              ) : marketingAttached ? (
                <p className="inline-flex items-center gap-2 text-[11px] text-white/40">
                  Marketing wallet live
                  <PolessiaLogo variant="powered" size="xs" />
                </p>
              ) : null}

              {!signedIn ? (
                <button
                  type="button"
                  onClick={() => void claimAccountAfterPublish()}
                  className={primaryBtnClass}
                >
                  Create free account to claim
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <Link to="/" className={`${primaryBtnClass} sm:flex-1`}>
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

      {telegramPopupOpen && step === 'done' ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close Telegram"
            onClick={() => setTelegramPopupOpen(false)}
          />
          <div className="relative z-[1] flex h-[min(34rem,92vh)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#0e1621] shadow-2xl sm:rounded-2xl">
            <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#17212b] px-3 py-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#c8ff3d]/20 text-[#d5ff69]">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {displaySymbol} Community
                </p>
                <p className="text-[10px] text-white/40">CTOgo Bot · group created</p>
              </div>
              <button
                type="button"
                onClick={() => setTelegramPopupOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-white/45 hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
              <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-[#182533] px-3 py-2.5 text-[13px] leading-relaxed text-white/85">
                Welcome. Your community group is live. CTOgo is admin — the bot stays in chat for
                tools.
              </div>
              <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-[#182533] px-3 py-2.5 text-[13px] leading-relaxed text-white/85">
                <p className="font-semibold text-white">Confirm listing</p>
                <p className="mt-1 text-white/55">
                  Confirm so {displaySymbol} stays visible on the board.
                </p>
                {!listingConfirmed ? (
                  <button
                    type="button"
                    onClick={() => setListingConfirmed(true)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#c8ff3d] px-3 py-1.5 text-[12px] font-bold text-[#090b14]"
                  >
                    Confirm listing
                    <Check className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#d5ff69]">
                    <Check className="h-3.5 w-3.5" />
                    Confirmed
                  </p>
                )}
              </div>
              <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-[#182533] px-3 py-2.5 text-[13px] leading-relaxed text-white/85">
                <p className="font-semibold text-white">Shareable links</p>
                <ul className="mt-2 space-y-2 text-[12px]">
                  <li>
                    <span className="text-white/40">Token page</span>
                    <a
                      href={shareLinks.token}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 block truncate text-[#6ab3f3] underline-offset-2 hover:underline"
                    >
                      {shareLinks.token}
                    </a>
                  </li>
                  <li>
                    <span className="text-white/40">Telegram page</span>
                    <a
                      href={shareLinks.telegram}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 block truncate text-[#6ab3f3] underline-offset-2 hover:underline"
                    >
                      {shareLinks.telegram}
                    </a>
                  </li>
                  <li>
                    <span className="text-white/40">Burn tokens share</span>
                    <a
                      href={shareLinks.burn}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 block truncate text-[#6ab3f3] underline-offset-2 hover:underline"
                    >
                      {shareLinks.burn}
                    </a>
                  </li>
                </ul>
              </div>
              <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-[#182533] px-3 py-2.5 text-[12px] text-white/50">
                Close anytime — your dashboard stays behind. Reopen Telegram from there.
              </div>
            </div>

            <div className="border-t border-white/[0.06] bg-[#17212b] px-3 py-2.5">
              <a
                href={shareLinks.telegram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2AABEE] px-4 py-2.5 text-sm font-bold text-white"
              >
                Open in Telegram
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <WebsitePreviewOverlay
        open={previewOpen && step === 'website' && websiteKind !== 'none'}
        onClose={openSiteEditor}
        onContinue={() => setPreviewOpen(false)}
        onRegenerate={websiteKind === 'onepager' ? regenerateDesign : undefined}
        kind={websiteKind === 'clone' ? 'clone' : 'onepager'}
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
    </AppSidebarProvider>
  );
}
