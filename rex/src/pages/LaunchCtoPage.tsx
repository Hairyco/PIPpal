import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Coins,
  Globe,
  Info,
  Loader2,
  MessageCircle,
  Pencil,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Upload,
  Users,
  Wallet,
} from 'lucide-react';
import { CtoGoLogo } from '../components/CtoGoLogo';
import { AuthButton } from '../components/AuthButton';
import { AppSidebar, AppSidebarMenuButton, AppSidebarProvider } from '../components/AppSidebar';
import { PolessiaLogo } from '../components/PolessiaLogo';
import { PostLaunchDashboard } from '../components/PostLaunchDashboard';
import { useAuth } from '../components/AuthProvider';
import { useConnectedWallet, ConnectWalletButton } from '../components/ConnectWalletButton';
import { WebsitePreview, WebsitePreviewOverlay } from '../components/WebsitePreview';
import { CLAIM_FEE, MARKETING_WALLET_ATTACH_FEE_USD, CLONE_HOSTING_FEE_USD } from '../data/claimPricing';
import { DEXSCREENER_HEADER } from '../data/platformCollateralChecklist';
import {
  CREATOR_FEE_BPS,
  CREATOR_FEE_MODES,
  formatBpsPercent,
  type CreatorFeeMode,
} from '../data/chainConfig';
import {
  COLLATERAL_EXTRA_USD,
  collateralBillSummary,
  formatCollateralUsd,
} from '../data/collateralPricing';
import {
  DEFAULT_TOKEN_SUPPLY,
  TOKEN_SUPPLY_OPTIONS,
  type TokenSupplyValue,
} from '../data/tokenSupplyOptions';
import {
  generateCtoBannerWithLogo,
  generateCtoLogoDataUrl,
  generateDexScreenerHeaderWithLogo,
  readImageFile,
} from '../utils/ctoCollateralGenerate';
import { formatMintPreview, LAUNCH_DEMO_MINT, resolveLaunchCoin } from '../utils/resolveLaunchCoin';
import { demoMarketingWalletAddress } from '../data/ctoProjects';

type LaunchMode = 'launch' | 'add';
type FlowStep = 'coin' | 'fees' | 'burn' | 'website' | 'done';
type WebsiteKind = 'none' | 'clone';

const fieldClass =
  'mt-1.5 h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[#c8ff3d]/40';

const primaryBtnClass =
  'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c8ff3d] text-sm font-bold text-[#090b14] transition hover:bg-[#d5ff69] disabled:cursor-not-allowed disabled:opacity-40';

/** Pump.fun-style creator buy presets (SOL) at deploy. */
const BUY_AT_LAUNCH_PRESETS = [0.1, 0.25, 0.5, 1, 2];

const backBtnClass =
  'inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-xl border border-white/[0.1] text-xs font-semibold text-white/55 transition hover:bg-white/[0.04] hover:text-white sm:w-auto sm:px-5';

/** Vesting: Day 1-5 = 10% each, then Day 6 = 25% and Day 7 = 25%. */
const VESTING_SCHEDULE = [
  { label: 'Day 1', amount: '10%' },
  { label: 'Day 2', amount: '10%' },
  { label: 'Day 3', amount: '10%' },
  { label: 'Day 4', amount: '10%' },
  { label: 'Day 5', amount: '10%' },
  { label: 'Day 6', amount: '25%' },
  { label: 'Day 7', amount: '25%' },
];

/** Demo mint — resolves to Pepe Coin in the launch wizard. */
const DEMO_CONTRACT = LAUNCH_DEMO_MINT;

export function LaunchCtoPage() {
  const [searchParams] = useSearchParams();
  const { signedIn, requireAuth, busy: authBusy } = useAuth();
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
  const [listingConfirmed, setListingConfirmed] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [contract, setContract] = useState('');
  const [telegram, setTelegram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');
  const [note, setNote] = useState('');
  const [tokenSupply, setTokenSupply] = useState<TokenSupplyValue>(DEFAULT_TOKEN_SUPPLY);
  const [feeMode, setFeeMode] = useState<CreatorFeeMode>('creator');
  /** Optional SOL spent into the curve at deploy (creator buy). */
  const [buyAtLaunchSol, setBuyAtLaunchSol] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [vestingAccepted, setVestingAccepted] = useState(false);
  const [burned, setBurned] = useState(false);
  /** Demo V1 balance after wallet scan — real RPC later. */
  const [v1Balance, setV1Balance] = useState<string | null>(null);
  const [balanceScanning, setBalanceScanning] = useState(false);
  const [burnConfirmBusy, setBurnConfirmBusy] = useState(false);
  const [burnConfirmError, setBurnConfirmError] = useState<string | null>(null);
  /** Demo: burn UI ignores a pre-existing session wallet until user connects on this step. */
  const [burnWalletReady, setBurnWalletReady] = useState(false);
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
  const [websiteKind, setWebsiteKind] = useState<WebsiteKind>('none');
  const [cloneUrl, setCloneUrl] = useState('');
  /** Extra gens after the free first logo/banner — billed at publish. */
  const [extraLogoGens, setExtraLogoGens] = useState(0);
  const [extraBannerGens, setExtraBannerGens] = useState(0);
  const [dexHeaderPreview, setDexHeaderPreview] = useState<string | null>(null);
  const [dexHeaderSalt, setDexHeaderSalt] = useState(0);
  const [generatingDexHeader, setGeneratingDexHeader] = useState(false);
  const [siteGenerated, setSiteGenerated] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generatingSite, setGeneratingSite] = useState(false);
  const [editSite, setEditSite] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const dexHeaderRef = useRef<HTMLInputElement>(null);
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

  /** Open the post-launch CTOgo dashboard (person icon / sidebar). */
  useEffect(() => {
    if (searchParams.get('dashboard') !== '1') return;
    setMode('launch');
    setStep('done');
    setName((n) => n.trim() || 'Pepe');
    setTicker((t) => t.trim() || 'PEPE');
    setContract((c) => (c.trim().length >= 32 ? c : DEMO_CONTRACT));
    setCoinReady(true);
    setVenueLabel('CTOgo');
    setMarketingAttached(true);
    setTelegramInvite((tg) => tg ?? 'https://t.me/ctogo_pepe');
    // Demo PEPE uses catalog meme art — not the generated lettermark.
    setLogoPreview('/meme-logos/peponk.png');
  }, [searchParams]);

  /** Prefill from a pasted mint in the URL — not the empty demo filler. */
  useEffect(() => {
    if (mode !== 'add' || step !== 'coin') return;
    const mint = contract.trim();
    if (mint.length < 32 || coinReady || lookupBusy) return;
    void runLookup(mint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, step]);

  const findContract = () => {
    const mint = contract.trim();
    void runLookup(mint.length >= 32 ? mint : DEMO_CONTRACT);
  };

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

  /** Demo: burn step always starts without a linked wallet in the burn UI. */
  useEffect(() => {
    if (step !== 'burn') return;
    setBurnWalletReady(false);
    setBurnAmount('');
    setV1Balance(null);
    setBalanceScanning(false);
    setBurnConfirmError(null);
  }, [step]);

  /** Demo: scan connected wallet for V1 balance of the launch mint. */
  useEffect(() => {
    if (step !== 'burn') return;
    if (!burnWalletReady || !connected || !address) {
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
  }, [step, burnWalletReady, connected, address, contract]);

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
      let walletAddress = burnWalletReady ? address : null;
      if (!walletAddress) {
        // Burn fee is paid at confirmation, so connect at this stage if needed.
        const next = await connect();
        if (!next) {
          setBurnConfirmError('Connect a wallet to pay the burn fee.');
          return;
        }
        walletAddress = next;
        setBurnWalletReady(true);
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
          { id: 'fees' as const, label: 'Fees & buy' },
          { id: 'burn' as const, label: 'Burn' },
          { id: 'website' as const, label: 'Website' },
        ]
      : [];
  const stepIndex = steps.findIndex((s) => s.id === step);
  const buyAtLaunchSolNum = Number(buyAtLaunchSol);
  const hasBuyAtLaunch =
    Boolean(buyAtLaunchSol.trim()) &&
    Number.isFinite(buyAtLaunchSolNum) &&
    buyAtLaunchSolNum > 0;
  const canContinueCoin = coinReady && Boolean(name.trim() && ticker.trim());
  const artBill = collateralBillSummary({
    extraLogos: extraLogoGens,
    extraBanners: extraBannerGens,
  });

  const resetFlow = () => {
    setStep('coin');
    setName('');
    setTicker('');
    setContract('');
    setTelegram('');
    setTwitter('');
    setWebsite('');
    setNote('');
    setTokenSupply(DEFAULT_TOKEN_SUPPLY);
    setFeeMode('creator');
    setBuyAtLaunchSol('');
    setBurnAmount('');
    setVestingAccepted(false);
    setBurned(false);
    setV1Balance(null);
    setBalanceScanning(false);
    setBurnConfirmBusy(false);
    setBurnConfirmError(null);
    setBurnWalletReady(false);
    setLogoPreview(null);
    setBannerPreview(null);
    setDexHeaderPreview(null);
    setLogoSalt(0);
    setBannerSalt(0);
    setDexHeaderSalt(0);
    setLookupBusy(false);
    setLookupError(null);
    setCoinReady(false);
    setVenueLabel('Solana');
    setShowAdvanced(false);
    setEditArt(false);
    setWebsiteKind('none');
    setCloneUrl('');
    setExtraLogoGens(0);
    setExtraBannerGens(0);
    setSiteGenerated(false);
    setPreviewOpen(false);
    setGeneratingSite(false);
    setEditSite(false);
    setFromCoinPage(false);
    setListNotice(null);
    setMarketingAttached(false);
    setMarketingAttachBusy(false);
    setListMarketingOptIn(false);
    setTelegramInvite(null);
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
      if (meta.blurb?.trim()) setNote(meta.blurb);
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

  /** Prefer catalog / uploaded art over generated lettermarks for dashboard. */
  const dashboardLogoUrl = (() => {
    if (logoPreview && !logoPreview.startsWith('data:')) return logoPreview;
    if (
      contract.trim() === DEMO_CONTRACT ||
      ticker.trim().toUpperCase() === 'PEPE'
    ) {
      return '/meme-logos/peponk.png';
    }
    return logoPreview;
  })();

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
    setStep('done');
    await claimAccountAfterPublish();
  };

  const confirmListing = () => {
    setListingConfirmed(true);
    const href = shareLinks.telegram;
    window.open(href, '_blank', 'noopener,noreferrer');
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

      // List always requires an account first.
      if (!signedIn) {
        setListNotice(
          listMarketingOptIn
            ? 'Create an account to continue — then you’ll pay for the marketing wallet.'
            : 'Create an account to list your CTO.',
        );
        const ok = await requireAuth(
          listMarketingOptIn
            ? 'Create an account to list your CTO. You can add the marketing wallet next.'
            : 'Create an account to list your CTO.',
        );
        if (!ok) return;
      }

      // Marketing wallet: after auth, connect wallet and complete payment.
      if (listMarketingOptIn) {
        if (!connected) {
          setListNotice('Connect your wallet to add the marketing wallet.');
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
      setListNotice(
        hasBuyAtLaunch
          ? `Connect your wallet to pay the launch fee + ${buyAtLaunchSolNum} SOL buy`
          : 'Connect your wallet to pay the launch fee',
      );
      const next = await connect();
      if (!next) return;
    }
    const t = ticker.trim().toUpperCase() || 'CTO';
    try {
      if (dexHeaderPreview) {
        sessionStorage.setItem(`ctogo-dex-header-${t}`, dexHeaderPreview);
      }
      if (bannerPreview) {
        sessionStorage.setItem(`ctogo-banner-${t}`, bannerPreview);
      }
      if (logoPreview) {
        sessionStorage.setItem(`ctogo-logo-${t}`, logoPreview);
      }
    } catch {
      /* ignore quota */
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
        tagline: note.trim() || `${ticker || 'PEPE'} on CTOgo`,
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
    void makeDexHeader(dexHeaderSalt, url);
  };

  const regenerateBanner = () => {
    const next = bannerSalt + 1;
    setBannerSalt(next);
    setExtraBannerGens((n) => n + 1);
    void makeBanner(next);
  };

  const makeDexHeader = async (salt = dexHeaderSalt, logoUrl?: string | null) => {
    setGeneratingDexHeader(true);
    try {
      const url = await generateDexScreenerHeaderWithLogo({
        projectName: name || 'Pepe Coin',
        ticker: ticker || 'PEPE',
        logoDataUrl: logoUrl ?? logoPreview,
        tagline: note.trim() || 'Community owned · No rugs',
        salt,
      });
      setDexHeaderPreview(url);
      return url;
    } finally {
      setGeneratingDexHeader(false);
    }
  };

  const regenerateDexHeader = () => {
    const next = dexHeaderSalt + 1;
    setDexHeaderSalt(next);
    setExtraBannerGens((n) => n + 1);
    void makeDexHeader(next);
  };

  const onUploadDexHeader = async (file?: File | null) => {
    if (!file) return;
    try {
      const url = await readImageFile(file);
      setDexHeaderPreview(url);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const selectWebsiteKind = (kind: WebsiteKind) => {
    setWebsiteKind(kind);
    setSiteGenerated(false);
    setPreviewOpen(false);
    setEditSite(false);
  };

  const openSiteEditor = () => {
    setPreviewOpen(false);
    setEditSite(true);
  };

  /** Builds a clone preview and opens the full-page viewer. */
  const generateWebsite = async () => {
    if (websiteKind !== 'clone') return;
    if (!cloneUrl.trim() && !website.trim()) return;
    setGeneratingSite(true);
    try {
      if (!cloneUrl.trim() && website.trim()) setCloneUrl(website.trim());
      await new Promise((r) => window.setTimeout(r, 450));
      setSiteGenerated(true);
      setPreviewOpen(true);
    } finally {
      setGeneratingSite(false);
    }
  };

  useEffect(() => {
    if (step !== 'website') return;
    if (!cloneUrl.trim() && website.trim()) setCloneUrl(website.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const onUploadLogo = async (file: File | undefined) => {
    if (!file) return;
    try {
      const url = await readImageFile(file);
      setLogoPreview(url);
      void makeBanner(bannerSalt, url);
      void makeDexHeader(dexHeaderSalt, url);
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

  const canGenerateSite = Boolean(cloneUrl.trim() || website.trim());
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
          {step !== 'done' ? (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
                {mode === 'add' ? 'List for exposure' : 'CTO Launch Wizard'}
              </p>
              <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight">
                {mode === 'launch' ? 'Launch a CTO' : 'List a CTO'}
              </h1>
              <p className="mt-1.5 text-sm text-white/45">
                {mode === 'add'
                  ? 'Paste the contract address to get your CTO on the board.'
                  : step === 'coin'
                    ? 'Set the name, ticker, and mint for your CTO.'
                    : step === 'fees'
                      ? 'Choose how creator fees work, then optionally buy at launch.'
                      : step === 'burn'
                        ? 'Burn your old tokens for the same amount of V2. Connect the wallet that holds them. We match the V1 mint from this launch.'
                        : 'Optional website — then list the coin. Setup finishes after listing.'}
              </p>
            </>
          ) : null}

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
                        { icon: Globe, label: 'Website' },
                        { icon: MessageCircle, label: 'New socials' },
                        { icon: Sparkles, label: 'Logo & Dex banner' },
                        { icon: ShieldAlert, label: 'Stop dev fees' },
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
                    onClick={() => void findContract()}
                    disabled={lookupBusy}
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

              <button
                type="submit"
                disabled={
                  !canContinueCoin ||
                  (mode === 'add' && (walletBusy || marketingAttachBusy || authBusy))
                }
                className={primaryBtnClass}
              >
                {mode === 'add' ? (
                  marketingAttachBusy || walletBusy || authBusy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {authBusy
                        ? 'Signing in…'
                        : walletBusy
                          ? 'Connecting…'
                          : 'Listing…'}
                    </>
                  ) : (
                    <>
                      List
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
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
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
                          <p className="mt-0.5 text-[11px] text-white/45">
                            {formatBpsPercent(CREATOR_FEE_BPS)} pool cut
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#c8ff3d]/15 text-[#c8ff3d]">
                    <Coins className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-white">Buy at launch</p>
                      <span className="rounded-md border border-white/[0.1] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/40">
                        Optional
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-white/55">
                      Spend SOL into the curve the moment V2 deploys — same idea as Pump. You’re
                      first in, before the board sees it.
                    </p>
                  </div>
                </div>

                <label className="mt-4 block">
                  <span className="text-[11px] font-medium text-white/45">Amount (SOL)</span>
                  <div className="relative mt-1.5">
                    <input
                      value={buyAtLaunchSol}
                      onChange={(event) =>
                        setBuyAtLaunchSol(event.target.value.replace(/[^\d.]/g, ''))
                      }
                      placeholder="0"
                      inputMode="decimal"
                      className={`${fieldClass} mt-0 pr-14`}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[12px] font-semibold text-white/35">
                      SOL
                    </span>
                  </div>
                </label>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {BUY_AT_LAUNCH_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBuyAtLaunchSol(String(preset))}
                      className={`rounded-md border px-2.5 py-1.5 text-[11px] font-semibold ${
                        buyAtLaunchSol === String(preset)
                          ? 'border-[#c8ff3d]/40 bg-[#c8ff3d]/10 text-[#d5ff69]'
                          : 'border-white/[0.08] text-white/45 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setBuyAtLaunchSol('')}
                    className={`rounded-md border px-2.5 py-1.5 text-[11px] font-semibold ${
                      !buyAtLaunchSol.trim()
                        ? 'border-[#c8ff3d]/40 bg-[#c8ff3d]/10 text-[#d5ff69]'
                        : 'border-white/[0.08] text-white/45 hover:text-white'
                    }`}
                  >
                    Skip
                  </button>
                </div>

                {hasBuyAtLaunch ? (
                  <p className="mt-3 text-[12px] font-medium text-[#d5ff69]">
                    You’ll buy {buyAtLaunchSolNum} SOL of ${ticker.trim().toUpperCase() || 'TICKER'}{' '}
                    at deploy.
                  </p>
                ) : (
                  <p className="mt-3 text-[11px] text-white/40">
                    Leave at 0 to launch without a creator buy.
                  </p>
                )}
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
                  Day 1–5: 10% each · Day 6: 25% · Day 7: 25%.
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
                {burnWalletReady && connected && address ? (
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
                    onClick={() => {
                      void (async () => {
                        const next = await connect();
                        if (next) setBurnWalletReady(true);
                      })();
                    }}
                    className={`${primaryBtnClass} mt-1.5`}
                  >
                    <Wallet className="h-4 w-4" />
                    {walletBusy ? 'Connecting…' : 'Connect wallet to scan'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-[1fr_auto] items-end gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-white/45">Amount to burn</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      value={burnAmount}
                      onChange={(event) => setBurnAmount(event.target.value.replace(/[^\d.]/g, ''))}
                      placeholder="0"
                      inputMode="decimal"
                      className="h-11 min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[#c8ff3d]/40"
                    />
                    <button
                      type="button"
                      disabled={!v1Balance}
                      onClick={() => setBurnAmount(v1Balance ?? '')}
                      className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] px-4 text-xs font-semibold text-white/55 transition hover:border-white/20 hover:text-white disabled:opacity-40"
                    >
                      Max
                    </button>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] font-medium text-white/45">You receive</p>
                  <p className="mt-1.5 flex h-11 items-center justify-end text-sm font-semibold tabular-nums text-[#d5ff69]">
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
                    {burnWalletReady && connected
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
                <p className="text-sm font-bold text-white">Website</p>
                <p className="mt-1 text-[12px] text-white/45">
                  Optional. Skip to list now — logo, banner, and socials come next.
                </p>
              </div>

              <p className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[11px] text-white/45">
                Coin page will be at{' '}
                <span className="font-mono text-white/70">
                  ctogo.app/coin/{ticker.trim().toLowerCase() || 'ticker'}
                </span>
              </p>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => selectWebsiteKind('none')}
                  className={`rounded-xl border px-2.5 py-2.5 text-left transition ${
                    websiteKind === 'none'
                      ? 'border-[#c8ff3d]/45 bg-[#c8ff3d]/10'
                      : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                  }`}
                >
                  <p className="text-[11px] font-bold text-white">Skip website</p>
                  <p className="mt-0.5 text-[9px] text-white/40">Default · coin page only</p>
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
                  {websiteKind === 'clone' ? (
                    <p className="mt-1.5 text-[9px] leading-snug text-white/45">
                      ${CLONE_HOSTING_FEE_USD} from marketing wallet · clone + hosting
                    </p>
                  ) : null}
                </button>
              </div>

              <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <div>
                  <p className="text-[12px] font-bold text-white">Images</p>
                  <p className="mt-0.5 text-[11px] text-white/40">
                    Upload or generate. Dex header is {DEXSCREENER_HEADER.ratioLabel} (
                    {DEXSCREENER_HEADER.width}×{DEXSCREENER_HEADER.height}).
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!logoPreview) makeLogo(logoSalt);
                      else regenerateLogo();
                    }}
                    disabled={generatingLogo}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-3 text-[11px] font-bold text-[#d5ff69]"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {logoPreview ? 'New logo' : 'Generate logo'}
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
                    onClick={() => {
                      if (!dexHeaderPreview) void makeDexHeader(dexHeaderSalt);
                      else regenerateDexHeader();
                    }}
                    disabled={generatingDexHeader}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-3 text-[11px] font-bold text-[#d5ff69]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {dexHeaderPreview ? 'New Dex banner' : 'Generate Dex banner'}
                  </button>
                  <button
                    type="button"
                    onClick={() => dexHeaderRef.current?.click()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 text-[11px] font-semibold text-white/60"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload Dex banner
                  </button>
                  <input
                    ref={dexHeaderRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      void onUploadDexHeader(event.target.files?.[0]);
                      event.target.value = '';
                    }}
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-black/40">
                    <p className="border-b border-white/[0.06] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/35">
                      Logo · 1:1
                    </p>
                    <div className="grid aspect-square place-items-center p-3">
                      {logoPreview ? (
                        <img src={logoPreview} alt="" className="h-24 w-24 rounded-xl object-cover" />
                      ) : (
                        <p className="text-[11px] text-white/30">No logo yet</p>
                      )}
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-black/40">
                    <p className="border-b border-white/[0.06] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/35">
                      DexScreener header · 3:1
                    </p>
                    <div className="aspect-[3/1] bg-[#05070d]">
                      {dexHeaderPreview ? (
                        <img
                          src={dexHeaderPreview}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full place-items-center px-3 text-center text-[11px] text-white/30">
                          Generate or upload a 3:1 banner
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {websiteKind === 'none' ? (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-[12px] text-white/50">
                  You’ll list with the CTOgo coin page only. Add a cloned site anytime after listing.
                </div>
              ) : websiteKind === 'clone' ? (
                <div className="space-y-2">
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
                  <p className="text-[11px] leading-relaxed text-white/40">
                    ${CLONE_HOSTING_FEE_USD} will be deducted from the marketing wallet for clone +
                    hosting.
                  </p>
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
                      Cloning…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate clone preview
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
                      kind="clone"
                      name={name}
                      ticker={ticker}
                      logoUrl={logoPreview}
                      bannerUrl={bannerPreview}
                      contract={contract}
                      cloneUrl={cloneUrl || website}
                      tokenSupply={tokenSupply}
                    />
                    <p className="text-center text-[10px] text-white/30">
                      Clone preview{editSite ? ' · editing' : ''}
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
                      <p className="text-[11px] leading-relaxed text-white/40">
                        ${CLONE_HOSTING_FEE_USD} will be deducted from the marketing wallet for clone
                        + hosting.
                      </p>

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

              {hasBuyAtLaunch ? (
                <p className="text-center text-[11px] font-medium text-[#d5ff69]/90">
                  At publish: {buyAtLaunchSolNum} SOL buy into the curve
                </p>
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
                      ? hasBuyAtLaunch
                        ? `List coin · ${buyAtLaunchSolNum} SOL buy`
                        : 'List coin'
                      : 'Connect wallet & list'
                    : connected
                      ? hasBuyAtLaunch
                        ? `List coin · ${buyAtLaunchSolNum} SOL buy`
                        : 'List coin'
                      : 'Connect wallet & list'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : null}

          {step === 'done' ? (
            <PostLaunchDashboard
              symbol={displaySymbol}
              mode={mode}
              listingConfirmed={listingConfirmed}
              onConfirmListing={confirmListing}
              shareLinks={shareLinks}
              copiedLink={copiedLink}
              onCopyLink={(key) => void copyShareLink(key)}
              marketingAttached={marketingAttached || mode === 'launch'}
              marketingAddress={demoMarketingWalletAddress(ticker.trim() || coinSlug || 'CTO')}
              vaultBalanceUsd={mode === 'launch' || marketingAttached ? 42 : 0}
              artExtrasLine={
                mode === 'launch' && artBill.hasExtras
                  ? `Creative extras · est. ${formatCollateralUsd(artBill.totalUsd)} with launch`
                  : null
              }
              signedIn={signedIn}
              onClaimAccount={() => void claimAccountAfterPublish()}
              onReset={resetFlow}
              primaryBtnClass={primaryBtnClass}
              backBtnClass={backBtnClass}
              tradedContract={contract.trim()}
              logoUrl={dashboardLogoUrl}
              twitter={twitter}
              telegramCommunity={telegramInvite ?? shareLinks.telegram}
              websiteUrl={
                websiteKind === 'clone'
                  ? cloneUrl.trim() || website.trim()
                  : website.trim() || cloneUrl.trim()
              }
              websiteKind={websiteKind === 'none' ? 'none' : 'clone'}
            />
          ) : null}
        </main>
      </div>

      <WebsitePreviewOverlay
        open={previewOpen && step === 'website' && websiteKind !== 'none'}
        onClose={openSiteEditor}
        onContinue={() => setPreviewOpen(false)}
        kind="clone"
        name={name}
        ticker={ticker}
        logoUrl={logoPreview}
        bannerUrl={bannerPreview}
        contract={contract}
        cloneUrl={cloneUrl || website}
        tokenSupply={tokenSupply}
      />
    </div>
    </AppSidebarProvider>
  );
}
