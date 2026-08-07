import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Share2,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { PolessiaLogo } from './PolessiaLogo';
import {
  PostLaunchSocialsTab,
  type DashWebsiteKind,
} from './PostLaunchSocialsTab';
import { PostLaunchAffiliateTab } from './PostLaunchAffiliateTab';
import {
  POLESSIA_DEFAULT_SELECTED,
  POST_LAUNCH_SPEND_THRESHOLDS,
  formatActivityPrice,
  formatThresholdUsd,
  selectedSpendAllIn,
  spendItemAllIn,
  spendRequiresDexAdPack,
  tierTotalUsd,
  type SpendItemId,
} from '../data/postLaunchRoadmap';
import {
  EMPTY_DEX_AD_PACK,
  dexAdPackMissing,
  dexAdPackSoftWarnings,
  dexPackReadyForSpends,
  type DexAdPackAssets,
} from '../data/dexscreenerAdPack';
import { loadFounderProject, saveFounderProject } from '../utils/founderProject';
import {
  LAUNCH_FEE_ENGINE,
  MARKETING_SERVICE_FEE_LABEL,
  formatBpsPercent,
} from '../data/chainConfig';
import { shortMint, solscanAccountUrl } from '../data/ctoProjects';
import { MarketingWalletActivity } from './MarketingWalletActivity';
import { LaunchReadyCarousel } from './LaunchReadyCarousel';
import { SolWalletPanel } from './SolWalletPanel';
import { fetchMwProjectStatus, type MwProjectStatus } from '../lib/marketingWalletApi';
import { useConnectedWallet } from './ConnectWalletButton';

type DashTab = 'overview' | 'wallet' | 'roadmap' | 'socials' | 'affiliate';

type ShareLinks = {
  token: string;
  telegram: string;
  burn: string;
};

type PostLaunchDashboardProps = {
  symbol: string;
  mode: 'launch' | 'add';
  listingConfirmed: boolean;
  onConfirmListing: () => void;
  shareLinks: ShareLinks;
  copiedLink: string | null;
  onCopyLink: (key: keyof ShareLinks) => void;
  marketingAttached: boolean;
  marketingAddress?: string | null;
  /** Demo wallet balance until live PDA. */
  vaultBalanceUsd?: number;
  artExtrasLine?: string | null;
  signedIn: boolean;
  onClaimAccount: () => void;
  onReset: () => void;
  primaryBtnClass: string;
  backBtnClass: string;
  tradedContract: string;
  twitter?: string;
  telegramCommunity?: string;
  discord?: string;
  websiteUrl?: string;
  websiteKind?: DashWebsiteKind;
  logoUrl?: string | null;
  initialTab?: DashTab;
  showReadyCarousel?: boolean;
  onAttachMarketingWallet?: () => void;
};

const LAUNCH_TABS: { id: DashTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'socials', label: 'Socials' },
  { id: 'affiliate', label: 'Affiliate' },
];

const LIST_TABS: { id: DashTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'socials', label: 'Socials' },
  { id: 'affiliate', label: 'Affiliate' },
];

export function PostLaunchDashboard({
  symbol,
  mode,
  listingConfirmed: _listingConfirmed,
  onConfirmListing: _onConfirmListing,
  shareLinks,
  copiedLink,
  onCopyLink,
  marketingAttached,
  marketingAddress,
  vaultBalanceUsd = 42,
  artExtrasLine,
  signedIn,
  onClaimAccount,
  onReset: _onReset,
  primaryBtnClass,
  backBtnClass,
  tradedContract,
  twitter = '',
  telegramCommunity = '',
  discord = '',
  websiteUrl: _websiteUrl = '',
  websiteKind: _websiteKind = 'own',
  logoUrl = null,
  initialTab = 'overview',
  showReadyCarousel = true,
  onAttachMarketingWallet,
}: PostLaunchDashboardProps) {
  const tabs = mode === 'add' ? LIST_TABS : LAUNCH_TABS;
  const [tab, setTab] = useState<DashTab>(initialTab);
  const [roadmapMode, setRoadmapMode] = useState<'polessia' | 'manual'>('polessia');
  const [selected, setSelected] = useState<Set<SpendItemId>>(
    () => new Set(POLESSIA_DEFAULT_SELECTED),
  );
  const [copiedMint, setCopiedMint] = useState(false);
  const [copiedMkt, setCopiedMkt] = useState(false);
  const [copiedTelegram, setCopiedTelegram] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [roadmapShareNotice, setRoadmapShareNotice] = useState<string | null>(null);
  const [modeNotice, setModeNotice] = useState<string | null>(null);
  /** First Approve unlocks spend; can pause/unpause after that. */
  const [spendUnlocked, setSpendUnlocked] = useState(false);
  const [marketingSpendOn, setMarketingSpendOn] = useState(false);
  const [mwStatus, setMwStatus] = useState<MwProjectStatus | null>(null);
  const { address: walletAddress, connected: walletConnected, connect: connectWallet, signMessage } =
    useConnectedWallet();
  const [approveBusy, setApproveBusy] = useState(false);
  const [approveNotice, setApproveNotice] = useState<string | null>(null);
  const [dexPack, setDexPack] = useState<DexAdPackAssets>(() => {
    const stored = loadFounderProject()?.dexAdPack;
    return stored ? { ...EMPTY_DEX_AD_PACK, ...stored } : { ...EMPTY_DEX_AD_PACK };
  });

  const selectedNeedsDex = useMemo(
    () => [...selected].some((id) => spendRequiresDexAdPack(id)),
    [selected],
  );
  const dexReady = useMemo(
    () => dexPackReadyForSpends(dexPack, selected),
    [dexPack, selected],
  );
  const dexMissing = useMemo(() => dexAdPackMissing(dexPack), [dexPack]);
  const dexWarnings = useMemo(() => dexAdPackSoftWarnings(dexPack), [dexPack]);

  const patchDexPack = (partial: Partial<DexAdPackAssets>) => {
    setDexPack((prev) => {
      const next = { ...prev, ...partial };
      const project = loadFounderProject();
      if (project) {
        saveFounderProject({ ...project, dexAdPack: next });
      }
      return next;
    });
  };
  /** Launch path: carousel after pay — once per coin after acknowledged. */
  const [showLaunchCarousel, setShowLaunchCarousel] = useState(() => {
    if (mode !== 'launch') return false;
    try {
      return localStorage.getItem(`ctogo-launch-carousel-seen-${symbol.trim().toUpperCase()}`) !== '1';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    let cancelled = false;
    const mint = tradedContract || marketingAddress;
    void fetchMwProjectStatus(mint).then((status) => {
      if (!cancelled) {
        setMwStatus(status);
        if (status.project?.spend_unlocked) setSpendUnlocked(true);
        if (status.project && !status.project.spend_paused) setMarketingSpendOn(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [tradedContract, marketingAddress]);

  const selectedAllIn = useMemo(() => selectedSpendAllIn(selected), [selected]);
  const isDemoLedger = !mwStatus || mwStatus.demo !== false;

  useEffect(() => {
    if (mode !== 'launch') {
      setShowLaunchCarousel(false);
      return;
    }
    try {
      setShowLaunchCarousel(
        localStorage.getItem(`ctogo-launch-carousel-seen-${symbol.trim().toUpperCase()}`) !== '1',
      );
    } catch {
      setShowLaunchCarousel(true);
    }
  }, [mode, symbol]);

  const nextThreshold = useMemo(() => {
    return (
      POST_LAUNCH_SPEND_THRESHOLDS.find((t) => vaultBalanceUsd < t.thresholdUsd) ??
      POST_LAUNCH_SPEND_THRESHOLDS[POST_LAUNCH_SPEND_THRESHOLDS.length - 1]
    );
  }, [vaultBalanceUsd]);

  const fillPct = Math.min(
    100,
    Math.round((vaultBalanceUsd / (nextThreshold?.thresholdUsd || 500)) * 100),
  );

  const mktAddress =
    marketingAddress && marketingAddress.length >= 32 && !marketingAddress.includes('…')
      ? marketingAddress
      : null;
  const shortAddr = mktAddress ? shortMint(mktAddress) : 'Pending deploy';
  const mktSolscan = mktAddress ? solscanAccountUrl(mktAddress) : null;

  const vaultLive = marketingAttached || mode === 'launch';
  const marketingFillPct = formatBpsPercent(LAUNCH_FEE_ENGINE.marketingBps);
  /** Demo volume until live indexer — scaled so wallet ≈ marketing cut of volume. */
  const tradingVolumeUsd = vaultLive
    ? Math.max(
        Math.round((vaultBalanceUsd / (LAUNCH_FEE_ENGINE.marketingBps / 10_000)) * 0.92),
        vaultBalanceUsd * 20,
      )
    : 0;
  /** Demo share of wallet inflows from buys vs sells. */
  const buyFillSharePct = 58;
  const sellFillSharePct = 42;

  const toggleItem = (id: SpendItemId) => {
    if (roadmapMode === 'polessia') return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setPolessia = () => {
    setRoadmapMode('polessia');
    setSelected(new Set(POLESSIA_DEFAULT_SELECTED));
    if (spendUnlocked) {
      setModeNotice('Wizard mode on');
      window.setTimeout(() => setModeNotice(null), 1800);
    }
  };

  const setManual = () => {
    setRoadmapMode('manual');
    if (spendUnlocked) {
      setModeNotice('Manual mode on');
      window.setTimeout(() => setModeNotice(null), 1800);
    }
  };

  const approveRoadmap = async () => {
    setApproveNotice(null);
    if (selectedNeedsDex && !dexReady) {
      setApproveNotice(
        `Complete Dex creatives before Approve: ${dexMissing.join(', ') || 'required fields'}`,
      );
      return;
    }
    setApproveBusy(true);
    try {
      if (!walletConnected || !walletAddress) {
        await connectWallet();
      }
      const wallet = walletAddress || (await connectWallet());
      if (!wallet || /Wallet111111111$/i.test(wallet)) {
        // Preview / demo wallet — unlock UI only; never treat as money authority.
        setSpendUnlocked(true);
        setMarketingSpendOn(true);
        setApproveNotice('Demo unlock only — connect Phantom + Supabase for live signed approval.');
        return;
      }

      const planId = crypto.randomUUID();
      const challengeRes = await fetch('/api/mw-approve-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'challenge',
          wallet,
          planId,
          purpose: 'approve_spend_plan',
        }),
      });
      if (!challengeRes.ok) {
        // Backend not configured — local unlock with explicit notice.
        setSpendUnlocked(true);
        setMarketingSpendOn(true);
        setApproveNotice('Backend offline — local unlock only (no money moves).');
        return;
      }
      const challenge = await challengeRes.json();
      const signature = await signMessage(challenge.message);
      if (!signature) {
        setApproveNotice('Wallet could not sign. Approval cancelled.');
        return;
      }

      const approveRes = await fetch('/api/mw-approve-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          wallet,
          planId,
          nonce: challenge.nonce,
          signature,
          message: challenge.message,
          mint: tradedContract || marketingAddress || symbol,
          ticker: symbol,
          engine: mode === 'launch' ? 'launch' : 'list',
          marketingVault: marketingAddress,
          selectedOfferIds: [...selected],
          mode: roadmapMode,
          creatives: selectedNeedsDex
            ? {
                source: 'dexscreener-ad-pack',
                adTitle: dexPack.adTitle.trim(),
                adPitch: dexPack.adPitch.trim(),
                squareImageUrl: dexPack.squareImageUrl,
                websiteUrl: dexPack.websiteUrl.trim(),
                xUrl: dexPack.xUrl.trim(),
                telegramUrl: dexPack.telegramUrl.trim(),
                discordUrl: dexPack.discordUrl.trim(),
                socialsOptional: true,
              }
            : null,
        }),
      });
      if (!approveRes.ok) {
        const err = await approveRes.json().catch(() => ({}));
        setApproveNotice(err.error || 'Approval failed');
        return;
      }
      const approved = await approveRes.json().catch(() => ({}));
      setSpendUnlocked(true);
      setMarketingSpendOn(true);
      const queuedN = Number(approved.queued || 0);
      const missing = Array.isArray(approved.missingOffers) ? approved.missingOffers : [];
      setApproveNotice(
        queuedN === 0
          ? `Signed, but 0 orders queued${missing.length ? `: ${missing.slice(0, 3).join(', ')}` : ' — catalog/offers missing'}.`
          : dexWarnings.length
            ? `${queuedN} order(s) queued. Note: ${dexWarnings[0]}`
            : `${queuedN} order(s) queued — open /ops/dex-feed and Load pending.`,
      );
      void fetchMwProjectStatus(tradedContract || marketingAddress).then(setMwStatus);
    } finally {
      setApproveBusy(false);
      window.setTimeout(() => setApproveNotice(null), 6000);
    }
  };

  const toggleMarketingSpend = async () => {
    if (!spendUnlocked) return;
    const nextPaused = marketingSpendOn; // currently on → pause
    setMarketingSpendOn((v) => !v);

    const wallet = walletAddress;
    if (!wallet || /Wallet111111111$/i.test(wallet) || isDemoLedger) return;

    try {
      const planId = `pause:${tradedContract || symbol}`;
      const challengeRes = await fetch('/api/mw-approve-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'challenge', wallet, planId, purpose: 'pause_spend' }),
      });
      if (!challengeRes.ok) return;
      const challenge = await challengeRes.json();
      const signature = await signMessage(challenge.message);
      if (!signature) return;
      await fetch('/api/mw-approve-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pause',
          wallet,
          mint: tradedContract || marketingAddress,
          spendPaused: nextPaused,
          signature,
          message: challenge.message,
          nonce: challenge.nonce,
        }),
      });
    } catch {
      /* local toggle already applied */
    }
  };

  const copyMint = async () => {
    try {
      await navigator.clipboard.writeText(tradedContract.trim());
      setCopiedMint(true);
      window.setTimeout(() => setCopiedMint(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const copyMarketingWallet = async () => {
    if (!mktAddress) return;
    try {
      await navigator.clipboard.writeText(mktAddress);
      setCopiedMkt(true);
      window.setTimeout(() => setCopiedMkt(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const copyTelegram = async () => {
    if (!telegramHref) return;
    try {
      await navigator.clipboard.writeText(telegramHref);
      setCopiedTelegram(true);
      window.setTimeout(() => setCopiedTelegram(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const shareMarketingWallet = async () => {
    if (!mktAddress) return;
    const text = `Fund the ${symbol} marketing wallet — send SOL to:\n${mktAddress}\n\nSolscan: ${solscanAccountUrl(mktAddress)}`;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: `${symbol} marketing wallet`,
          text,
        });
        setShareNotice('Shared');
      } else {
        await navigator.clipboard.writeText(text);
        setShareNotice('Share text copied');
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(text);
        setShareNotice('Share text copied');
      } catch {
        /* ignore */
      }
    }
    window.setTimeout(() => setShareNotice(null), 2000);
  };

  const shareRoadmap = async () => {
    if (!spendUnlocked) return;
    const lines = POST_LAUNCH_SPEND_THRESHOLDS.map((tier) => {
      const items = tier.items
        .filter((item) => selected.has(item.id))
        .map((item) => item.label);
      if (items.length === 0) return null;
      return `• At ${formatThresholdUsd(tier.thresholdUsd)}: ${items.join(', ')}`;
    }).filter((line): line is string => line != null);

    const text = [
      `${symbol} spend roadmap — CTOgo`,
      'Trade fees fill the marketing wallet. Spend unlocks at each threshold.',
      '',
      ...(lines.length > 0 ? lines : ['• Roadmap package selected on CTOgo']),
      '',
      shareLinks.token,
    ].join('\n');

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: `${symbol} spend roadmap`,
          text,
          url: shareLinks.token,
        });
        setRoadmapShareNotice('Shared');
      } else {
        await navigator.clipboard.writeText(text);
        setRoadmapShareNotice('Copied');
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(text);
        setRoadmapShareNotice('Copied');
      } catch {
        /* ignore */
      }
    }
    window.setTimeout(() => setRoadmapShareNotice(null), 2000);
  };

  const needsSetup = mode === 'launch';
  const telegramHref = (telegramCommunity || shareLinks.telegram || '').trim();
  const coinPagePath = useMemo(() => {
    try {
      const url = new URL(shareLinks.token, typeof window !== 'undefined' ? window.location.origin : 'https://ctogo.app');
      return `${url.pathname}${url.search}` || '/';
    } catch {
      return shareLinks.token.startsWith('/') ? shareLinks.token : '/';
    }
  }, [shareLinks.token]);

  const configureFromCarousel = () => {
    try {
      localStorage.setItem(`ctogo-launch-carousel-seen-${symbol.trim().toUpperCase()}`, '1');
    } catch {
      /* ignore */
    }
    setShowLaunchCarousel(false);
    setTab('overview');
  };

  return (
    <div className="space-y-5">
      <LaunchReadyCarousel
        open={showReadyCarousel && showLaunchCarousel && mode === 'launch'}
        symbol={symbol}
        telegramUrl={telegramHref}
        onConfigure={configureFromCarousel}
      />

      <div className="flex items-center gap-3">
        <Link
          to={coinPagePath}
          aria-label={`Open ${symbol} coin page`}
          className="shrink-0 rounded-xl transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c8ff3d]"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="h-10 w-10 rounded-xl border border-white/[0.1] object-cover"
            />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-[#1c1c1e] text-sm font-bold text-[#d5ff69]">
              {symbol.replace(/^\$/, '').slice(0, 2)}
            </span>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {symbol}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-2 py-0.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#c8ff3d]" aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#d5ff69]">
                Live
              </span>
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-white/40">
            {needsSetup ? 'Live on CTOgo' : 'On the CTOgo board'}
          </p>
        </div>
        {tradedContract.trim() ? (
          <button
            type="button"
            onClick={() => void copyMint()}
            title={tradedContract.trim()}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.03] px-2.5 text-[11px] font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
          >
            {copiedMint ? (
              <Check className="h-3.5 w-3.5 text-[#d5ff69]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copiedMint ? 'Copied' : 'CA'}
          </button>
        ) : null}
      </div>

      <div className="flex w-full gap-0.5 rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`min-w-0 flex-1 rounded-md px-1 py-2 text-center text-[11px] font-semibold transition sm:px-2 ${
              tab === t.id
                ? 'bg-[#c8ff3d] text-[#090b14]'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <div className="space-y-5">
          {!signedIn ? (
            <button
              type="button"
              onClick={onClaimAccount}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-3.5 py-3 text-left transition hover:bg-[#c8ff3d]/15"
            >
              <span className="text-[13px] font-semibold text-[#d5ff69]">
                Create a free account to claim this CTO
              </span>
              <span className="shrink-0 text-[11px] font-bold text-[#c8ff3d]">Sign up →</span>
            </button>
          ) : null}

          <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
            {telegramHref ? (
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-white/40">
                    <img
                      src="/images/partners/telegram.svg"
                      alt=""
                      className="h-3.5 w-3.5 shrink-0"
                    />
                    Telegram
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold text-white">Group ready</p>
                </div>
                <button
                  type="button"
                  onClick={() => void copyTelegram()}
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.1] px-2.5 text-[11px] font-semibold text-white/55 transition hover:border-white/20 hover:text-white"
                >
                  {copiedTelegram ? (
                    <Check className="h-3.5 w-3.5 text-[#d5ff69]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedTelegram ? 'Copied' : 'Copy'}
                </button>
                <a
                  href={telegramHref}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-[11px] font-semibold text-[#d5ff69] transition hover:text-[#e8ff9a]"
                >
                  Open →
                </a>
              </div>
            ) : null}
            <div className="flex items-center gap-2 px-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-white/40">Marketing wallet</p>
                <p className="mt-0.5 text-[13px] font-semibold text-white">
                  {!vaultLive
                    ? 'Not attached yet'
                    : !spendUnlocked
                      ? 'Pending'
                      : !marketingSpendOn
                        ? 'Paused'
                        : `$${vaultBalanceUsd.toLocaleString()}`}
                  {vaultLive && spendUnlocked && marketingSpendOn ? (
                    <span className="ml-1.5 font-normal text-white/35">
                      · {fillPct}% to next unlock
                    </span>
                  ) : null}
                  {vaultLive && spendUnlocked && !marketingSpendOn ? (
                    <span className="ml-1.5 font-normal text-white/35">
                      · fees still collect
                    </span>
                  ) : null}
                </p>
              </div>
              {mktAddress ? (
                <button
                  type="button"
                  onClick={() => void copyMarketingWallet()}
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.1] px-2.5 text-[11px] font-semibold text-white/55 transition hover:border-white/20 hover:text-white"
                >
                  {copiedMkt ? (
                    <Check className="h-3.5 w-3.5 text-[#d5ff69]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedMkt ? 'Copied' : 'Copy'}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  if (!spendUnlocked) {
                    setTab('roadmap');
                    return;
                  }
                  if (!marketingSpendOn) {
                    setMarketingSpendOn(true);
                    return;
                  }
                  setTab('wallet');
                }}
                className="shrink-0 text-[11px] font-semibold text-[#d5ff69] transition hover:text-[#e8ff9a]"
              >
                {!vaultLive || !spendUnlocked
                  ? 'Turn on'
                  : !marketingSpendOn
                    ? 'Unpause'
                    : 'Open →'}
              </button>
            </div>
          </section>

          <button
            type="button"
            onClick={() => onCopyLink('token')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-[13px] font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.05]"
          >
            {copiedLink === 'token' ? (
              <Check className="h-4 w-4 text-[#d5ff69]" />
            ) : (
              <Share2 className="h-4 w-4 text-white/50" />
            )}
            {copiedLink === 'token' ? 'Link copied' : 'Share coin page'}
          </button>

          {spendUnlocked ? (
            <div className="flex items-center gap-3 rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/[0.08] px-3.5 py-3">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#d5ff69]">
                  <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                  Roadmap confirmed
                </p>
                <p className="mt-0.5 text-[12px] text-white/45">Share it with your community</p>
              </div>
              <button
                type="button"
                onClick={() => void shareRoadmap()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#c8ff3d] px-3 py-2 text-[11px] font-bold text-[#090b14] transition hover:bg-[#d5ff69]"
              >
                {roadmapShareNotice ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Share2 className="h-3.5 w-3.5" />
                )}
                {roadmapShareNotice ?? 'Share'}
              </button>
            </div>
          ) : null}

          {!vaultLive && onAttachMarketingWallet ? (
            <div className="rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/[0.07] p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#c8ff3d]/15 text-[#d5ff69]">
                  <Wallet className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#d5ff69]">Add marketing wallet</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/50">
                    Thinks, builds and markets your coin autonomously. Connect wallet and pay $1 once
                    to unlock Auto Marketing Wallet + Raid programme.
                  </p>
                </div>
              </div>
              <button type="button" onClick={onAttachMarketingWallet} className={primaryBtnClass}>
                Connect wallet &amp; attach · $1
              </button>
            </div>
          ) : null}

          {artExtrasLine ? (
            <p className="text-[11px] text-white/35">{artExtrasLine}</p>
          ) : null}
        </div>
      ) : null}

      {tab === 'wallet' ? (
        <div className="space-y-5">
          <p className="text-sm text-white/45">
            Trade fees fill the marketing wallet. Raid commissions fill your connected SOL wallet.
          </p>

          <SolWalletPanel />

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-medium text-white/40">Marketing wallet balance</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-[#d5ff69]">
                  ${(vaultLive ? vaultBalanceUsd : 0).toLocaleString()}
                </p>
                {isDemoLedger ? (
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-amber-300/80">
                    Demo balance · connect Supabase for live vault
                  </p>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium text-white/40">Trading volume</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-white">
                  ${tradingVolumeUsd.toLocaleString()}
                </p>
              </div>
            </div>
            {nextThreshold ? (
              <>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-[#c8ff3d] transition-[width]"
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
                <p className="mt-2 text-[12px] text-white/40">
                  {fillPct}% to next unlock · {formatThresholdUsd(nextThreshold.thresholdUsd)}
                </p>
              </>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
              {mktSolscan && mktAddress ? (
                <a
                  href={mktSolscan}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-[12px] text-[#c8ff3d] underline-offset-2 hover:text-[#d5ff69] hover:underline"
                  title={`View ${mktAddress} on Solscan`}
                >
                  {shortAddr}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              ) : (
                <p className="font-mono text-[12px] text-white/50">{shortAddr}</p>
              )}
              <button
                type="button"
                onClick={() => setTab('roadmap')}
                className="text-[12px] font-semibold text-[#d5ff69] hover:underline"
              >
                Spend roadmap →
              </button>
            </div>
          </div>

          <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
            {vaultLive && spendUnlocked ? (
              <div
                className={`space-y-3 border-b border-white/[0.06] px-3 py-3 ${
                  marketingSpendOn
                    ? 'bg-[#c8ff3d]/[0.05]'
                    : 'bg-amber-400/[0.06]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-white/40">Marketing spend</p>
                    <p className="mt-0.5 text-[13px] font-semibold text-white">
                      {marketingSpendOn ? 'On' : 'Paused'}
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-white/50">
                      {marketingSpendOn
                        ? 'Auto marketing transactions are running at unlock thresholds.'
                        : 'All marketing transactions stopped. Fees still collect, the wallet still fills, and manual pay-ins still work.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={marketingSpendOn}
                    onClick={() => void toggleMarketingSpend()}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                      marketingSpendOn ? 'bg-[#c8ff3d]' : 'bg-white/15'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                        marketingSpendOn ? 'left-[1.35rem]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void toggleMarketingSpend()}
                  className="text-[12px] font-semibold text-[#d5ff69] hover:underline"
                >
                  {marketingSpendOn ? 'Pause wallet spend' : 'Unpause wallet spend'}
                </button>
              </div>
            ) : null}

            {!vaultLive && onAttachMarketingWallet ? (
              <div className="space-y-3 border-b border-white/[0.06] px-3 py-3">
                <div>
                  <p className="text-[11px] font-medium text-white/40">Status</p>
                  <p className="mt-0.5 text-[13px] font-semibold text-white">Not attached yet</p>
                </div>
                <p className="text-[12px] leading-relaxed text-white/50">
                  Connect wallet and pay $1 once to unlock the marketing wallet.
                </p>
                <button type="button" onClick={onAttachMarketingWallet} className={primaryBtnClass}>
                  Connect wallet &amp; attach · $1
                </button>
              </div>
            ) : null}

            {vaultLive && mktAddress ? (
              <details className="group border-b border-white/[0.06]">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-3 transition hover:bg-white/[0.03] [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-white/40">Fund wallet</p>
                    <p className="mt-0.5 text-[13px] font-semibold text-white">
                      Share or top up
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-white/40 transition group-open:rotate-180" />
                </summary>
                <div className="space-y-3 px-3 pb-3.5">
                  <p className="text-[12px] leading-relaxed text-white/50">
                    Investors can send SOL straight to this wallet. Trade fees also fill it on
                    CTOgo.
                  </p>
                  <p className="break-all font-mono text-[12px] text-white/80">{mktAddress}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void copyMarketingWallet()}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-white/[0.12] bg-[#1c1c1e] px-3 text-[12px] font-semibold text-white transition hover:border-white/25 sm:flex-none"
                    >
                      {copiedMkt ? (
                        <Check className="h-3.5 w-3.5 text-[#d5ff69]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copiedMkt ? 'Copied' : 'Copy address'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void shareMarketingWallet()}
                      className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-white/[0.12] bg-[#1c1c1e] px-3 text-[12px] font-semibold text-white transition hover:border-white/25 sm:flex-none"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      {shareNotice ?? 'Share'}
                    </button>
                    {mktSolscan ? (
                      <a
                        href={mktSolscan}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#c8ff3d] px-3 text-[12px] font-bold text-[#090b14] transition hover:bg-[#d5ff69] sm:flex-none"
                      >
                        Open Solscan
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </details>
            ) : null}

            {vaultLive ? (
              <details className="group border-b border-white/[0.06]">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-3 transition hover:bg-white/[0.03] [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-white/40">Activity</p>
                    <p className="mt-0.5 text-[13px] font-semibold text-white">
                      Fees, pay-ins, payouts
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-white/40 transition group-open:rotate-180" />
                </summary>
                <div className="px-3 pb-3.5">
                  <MarketingWalletActivity ticker={symbol} compact />
                </div>
              </details>
            ) : null}

            {vaultLive ? (
              <details className="group border-b border-white/[0.06]">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-3 transition hover:bg-white/[0.03] [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-white/40">Trading volume</p>
                    <p className="mt-0.5 text-[13px] font-semibold text-white">
                      ${tradingVolumeUsd.toLocaleString()}
                      <span className="ml-1.5 font-normal text-white/35">
                        · {marketingFillPct} fill
                      </span>
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-white/40 transition group-open:rotate-180" />
                </summary>
                <div className="space-y-3 px-3 pb-3.5">
                  <p className="text-[12px] text-white/45">CTOgo-routed · all time (demo)</p>
                  <div>
                    <p className="text-[11px] font-medium text-white/45">Wallet fill from trades</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {marketingFillPct} of every buy · {marketingFillPct} of every sell
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-white/35">
                      Fixed marketing cut ({formatBpsPercent(LAUNCH_FEE_ENGINE.marketingBps)} of volume). Same rate on buys and
                      sells until mcap steps the schedule down.
                    </p>
                    <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full bg-[#c8ff3d]"
                        style={{ width: `${buyFillSharePct}%` }}
                        title={`Buys ${buyFillSharePct}%`}
                      />
                      <div
                        className="h-full bg-[#c8ff3d]/40"
                        style={{ width: `${sellFillSharePct}%` }}
                        title={`Sells ${sellFillSharePct}%`}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] text-white/45">
                      <span>
                        Buys <span className="font-semibold text-white">{buyFillSharePct}%</span> of
                        fill
                      </span>
                      <span>
                        Sells <span className="font-semibold text-white">{sellFillSharePct}%</span> of
                        fill
                      </span>
                    </div>
                  </div>
                </div>
              </details>
            ) : null}

            {vaultLive && nextThreshold ? (
              <details className="group border-b border-white/[0.06] last:border-b-0">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-3 transition hover:bg-white/[0.03] [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-white/40">Next unlock</p>
                    <p className="mt-0.5 text-[13px] font-semibold text-white">
                      {formatThresholdUsd(nextThreshold.thresholdUsd)}
                      <span className="ml-1.5 font-normal text-white/35">· {fillPct}% filled</span>
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-white/40 transition group-open:rotate-180" />
                </summary>
                <div className="space-y-3 px-3 pb-3.5">
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-[#c8ff3d] transition-[width]"
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                  <p className="text-[12px] text-white/40">
                    {nextThreshold.items.map((i) => i.label).join(' · ')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setTab('roadmap')}
                    className="text-[12px] font-semibold text-[#d5ff69] hover:underline"
                  >
                    View spend roadmap →
                  </button>
                </div>
              </details>
            ) : !vaultLive ? (
              <div className="px-3 py-3">
                <p className="text-[12px] text-white/40">
                  Attach a marketing wallet to start filling from trades.
                </p>
              </div>
            ) : null}

            <Link
              to="/marketing-wallet"
              className="flex items-center gap-3 px-3 py-3 transition hover:bg-white/[0.03]"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-white/40">Learn more</p>
                <p className="mt-0.5 text-[13px] font-semibold text-white">
                  How the marketing wallet works
                </p>
              </div>
              <span className="shrink-0 text-[11px] font-semibold text-[#d5ff69]">Open →</span>
            </Link>
          </section>
        </div>
      ) : null}

      {tab === 'roadmap' ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="text-xl font-bold tracking-tight text-white">
              Spend roadmap
            </p>
            <PolessiaLogo variant="powered" size="xs" />
          </div>

          {spendUnlocked ? (
            <div className="flex items-center gap-3 rounded-xl border border-[#c8ff3d]/25 bg-[#c8ff3d]/[0.08] px-3.5 py-3">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#d5ff69]">
                  <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                  Roadmap confirmed
                </p>
                <p className="mt-0.5 text-[12px] text-white/45">Share it with your community</p>
              </div>
              <button
                type="button"
                onClick={() => void shareRoadmap()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#c8ff3d] px-3 py-2 text-[11px] font-bold text-[#090b14] transition hover:bg-[#d5ff69]"
              >
                {roadmapShareNotice ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Share2 className="h-3.5 w-3.5" />
                )}
                {roadmapShareNotice ?? 'Share'}
              </button>
            </div>
          ) : null}

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium text-white/40">
                {spendUnlocked ? 'Spend mode' : 'Plan mode'}
              </p>
              {modeNotice ? (
                <p className="text-[11px] font-semibold text-[#d5ff69]">{modeNotice}</p>
              ) : spendUnlocked ? (
                <p className="text-[11px] text-white/35">Switch anytime</p>
              ) : null}
            </div>
            <div className="inline-flex w-full gap-0.5 rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
              <button
                type="button"
                onClick={setPolessia}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-[11px] font-semibold transition ${
                  roadmapMode === 'polessia'
                    ? 'bg-[#c8ff3d] text-[#090b14]'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Wizard
              </button>
              <button
                type="button"
                onClick={setManual}
                className={`flex-1 rounded-md px-2 py-2 text-[11px] font-semibold transition ${
                  roadmapMode === 'manual'
                    ? 'bg-[#c8ff3d] text-[#090b14]'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Manual
              </button>
            </div>
            {spendUnlocked ? (
              <p className="mt-2 text-[12px] leading-relaxed text-white/40">
                {roadmapMode === 'polessia'
                  ? 'Wizard runs the Polessia package at each unlock. Pause on Wallet stops all spend.'
                  : 'Manual lets you toggle activities. Pause on Wallet stops all spend.'}
              </p>
            ) : roadmapMode === 'manual' ? (
              <p className="mt-2 text-[12px] leading-relaxed text-white/40">
                Toggle individual activities. Spend still waits for Approve and wallet balance.
              </p>
            ) : null}
          </div>

          <div className="space-y-5">
            {POST_LAUNCH_SPEND_THRESHOLDS.map((tier) => {
              const reached = vaultBalanceUsd >= tier.thresholdUsd;
              return (
                <section key={tier.id}>
                  <div className="flex w-full items-center gap-3 border-b border-white/[0.08] pb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
                        {tier.label}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-white">
                        At {formatThresholdUsd(tier.thresholdUsd)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[13px] font-semibold tabular-nums text-white">
                        {formatActivityPrice(tierTotalUsd(tier))}
                      </p>
                      <p
                        className={`text-[10px] font-semibold uppercase tracking-wide ${
                          reached ? 'text-[#d5ff69]' : 'text-white/30'
                        }`}
                      >
                        {reached ? 'Unlocked' : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-1 divide-y divide-white/[0.05]">
                    {tier.items.map((item) => {
                      const itemOn = selected.has(item.id);
                      const itemInteractive = roadmapMode === 'manual';
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            disabled={!itemInteractive}
                            onClick={() => toggleItem(item.id)}
                            className={`flex w-full items-center gap-3 py-3 text-left transition ${
                              itemInteractive ? 'hover:bg-white/[0.02]' : 'cursor-default'
                            }`}
                          >
                            {roadmapMode === 'manual' ? (
                              <span
                                className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${
                                  itemOn
                                    ? 'border-[#c8ff3d]/50 bg-[#c8ff3d]/15 text-[#d5ff69]'
                                    : 'border-white/15 text-transparent'
                                }`}
                              >
                                <Check className="h-3 w-3" />
                              </span>
                            ) : null}
                            <img
                              src={item.logo}
                              alt=""
                              className="h-5 w-5 shrink-0 rounded object-contain"
                            />
                            <span
                              className={`min-w-0 flex-1 text-[13px] font-medium ${
                                itemOn ? 'text-white' : 'text-white/35'
                              }`}
                            >
                              {item.label}
                            </span>
                            <span
                              className={`shrink-0 text-right text-[12px] font-semibold tabular-nums ${
                                itemOn ? 'text-[#d5ff69]' : 'text-white/30'
                              }`}
                            >
                              <span className="block">{formatActivityPrice(item.priceUsd)}</span>
                              <span className="block text-[10px] font-medium text-white/35">
                                {formatActivityPrice(spendItemAllIn(item).totalDebitUsd)} all-in
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      ) : null}

      {tab === 'socials' ? (
        <PostLaunchSocialsTab
          symbol={symbol}
          tradedContract={tradedContract}
          initialTwitter={twitter}
          initialTelegram={telegramCommunity || shareLinks.telegram}
          initialDiscord={discord}
          primaryBtnClass={primaryBtnClass}
          backBtnClass={backBtnClass}
        />
      ) : null}

      {tab === 'affiliate' ? (
        <PostLaunchAffiliateTab
          symbol={symbol}
          tokenPageUrl={shareLinks.token}
          telegramInvite={telegramCommunity || shareLinks.telegram}
          primaryBtnClass={primaryBtnClass}
          backBtnClass={backBtnClass}
        />
      ) : null}

      {!signedIn && tab !== 'overview' ? (
        <button type="button" onClick={onClaimAccount} className={primaryBtnClass}>
          Create free account to claim
          <Check className="h-4 w-4" />
        </button>
      ) : null}

      {tab === 'roadmap' ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 text-[12px] text-white/55">
              <p className="font-semibold text-white/80">
                {spendUnlocked ? 'Selected spends — vault debit' : 'Before Approve — vault debit'}
              </p>
              <p className="mt-1.5 flex justify-between gap-2">
                <span>Supplier invoices</span>
                <span className="tabular-nums text-white">
                  {formatActivityPrice(selectedAllIn.invoiceUsd)}
                </span>
              </p>
              <p className="mt-1 flex justify-between gap-2">
                <span>{MARKETING_SERVICE_FEE_LABEL}</span>
                <span className="tabular-nums text-white">
                  {formatActivityPrice(selectedAllIn.serviceFeeUsd)}
                </span>
              </p>
              <p className="mt-2 flex justify-between gap-2 border-t border-white/[0.08] pt-2 font-semibold text-[#d5ff69]">
                <span>Total debit</span>
                <span className="tabular-nums">
                  {formatActivityPrice(selectedAllIn.totalDebitUsd)}
                </span>
              </p>
              <p className="mt-2 text-[11px] text-white/40">
                Suppliers receive 100% of their invoice. CTOgo&apos;s 20% is charged on top from the
                marketing vault.
              </p>
            </div>

            {selectedNeedsDex ? (
              <div className="space-y-2.5 rounded-xl border border-[#c8ff3d]/20 bg-[#c8ff3d]/[0.04] px-3.5 py-3">
                <div className="flex items-center gap-2">
                  <img
                    src="/images/partners/dexscreener.ico"
                    alt=""
                    className="h-4 w-4 rounded object-contain"
                  />
                  <p className="text-[12px] font-semibold text-white/85">DexScreener creatives</p>
                  <span
                    className={`ml-auto rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                      dexReady
                        ? 'bg-emerald-400/15 text-emerald-300'
                        : 'bg-amber-400/15 text-amber-200'
                    }`}
                  >
                    {dexReady ? 'Ready' : 'Needed'}
                  </span>
                </div>
                <p className="text-[11px] text-white/45">
                  Title, pitch, and 1:1 image are required. Socials are optional on Dex.
                </p>
                <label className="block text-[11px] text-white/50">
                  Ad title *{' '}
                  <span className="text-white/30">{dexPack.adTitle.length}/50</span>
                  <input
                    type="text"
                    maxLength={50}
                    value={dexPack.adTitle}
                    onChange={(e) => patchDexPack({ adTitle: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 text-[13px] text-white placeholder:text-white/25 focus:border-[#c8ff3d]/40 focus:outline-none"
                    placeholder="Short title for the Dex ad"
                  />
                </label>
                <label className="block text-[11px] text-white/50">
                  Ad pitch *{' '}
                  <span className="text-white/30">{dexPack.adPitch.length}/120</span>
                  <textarea
                    maxLength={120}
                    rows={2}
                    value={dexPack.adPitch}
                    onChange={(e) => patchDexPack({ adPitch: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 text-[13px] text-white placeholder:text-white/25 focus:border-[#c8ff3d]/40 focus:outline-none"
                    placeholder="Short description to get people interested"
                  />
                </label>
                <label className="block text-[11px] text-white/50">
                  Square image URL * (1:1)
                  <input
                    type="url"
                    value={dexPack.squareImageUrl || ''}
                    onChange={(e) =>
                      patchDexPack({ squareImageUrl: e.target.value.trim() || null })
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 text-[13px] text-white placeholder:text-white/25 focus:border-[#c8ff3d]/40 focus:outline-none"
                    placeholder="https://… or paste from Get Started pack"
                  />
                </label>
                {logoUrl && !dexPack.squareImageUrl ? (
                  <button
                    type="button"
                    onClick={() => patchDexPack({ squareImageUrl: logoUrl })}
                    className="text-[11px] font-medium text-sky-300 hover:text-sky-200"
                  >
                    Use project logo as square image
                  </button>
                ) : null}
                <div className="grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      ['websiteUrl', 'Website (optional)'],
                      ['xUrl', 'X (optional)'],
                      ['telegramUrl', 'Telegram (optional)'],
                      ['discordUrl', 'Discord (optional)'],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="block text-[11px] text-white/45">
                      {label}
                      <input
                        type="url"
                        value={dexPack[key]}
                        onChange={(e) => patchDexPack({ [key]: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-[12px] text-white placeholder:text-white/25 focus:border-white/20 focus:outline-none"
                      />
                    </label>
                  ))}
                </div>
                {!dexReady && dexMissing.length ? (
                  <p className="text-[11px] text-amber-200/90">Missing: {dexMissing.join(', ')}</p>
                ) : null}
                {dexReady && dexWarnings.length ? (
                  <p className="text-[11px] text-white/40">{dexWarnings[0]}</p>
                ) : null}
              </div>
            ) : null}

            <button
              id="roadmap-approve"
              type="button"
              onClick={() => void approveRoadmap()}
              disabled={approveBusy || (selectedNeedsDex && !dexReady)}
              className={`${primaryBtnClass} scroll-mt-4`}
            >
              {approveBusy
                ? spendUnlocked
                  ? 'Queuing…'
                  : 'Approving…'
                : spendUnlocked
                  ? 'Queue selected spends again'
                  : 'Approve'}
            </button>
            {spendUnlocked ? (
              <button
                type="button"
                onClick={() => void toggleMarketingSpend()}
                className={`${backBtnClass} w-full justify-center`}
              >
                {marketingSpendOn ? 'Pause wallet spend' : 'Unpause wallet spend'}
              </button>
            ) : null}
            {approveNotice ? (
              <p className="text-center text-[12px] text-amber-200/90">{approveNotice}</p>
            ) : null}
          </div>
      ) : null}
    </div>
  );
}
