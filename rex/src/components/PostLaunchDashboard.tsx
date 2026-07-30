import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
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
  tierTotalUsd,
  type SpendItemId,
  type SpendThreshold,
} from '../data/postLaunchRoadmap';
import { FEE_TIERS, formatBpsPercent } from '../data/chainConfig';
import { shortMint, solscanAccountUrl } from '../data/ctoProjects';
import { MarketingWalletActivity } from './MarketingWalletActivity';

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
  /** Demo vault balance until live PDA. */
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
};

const TABS: { id: DashTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'socials', label: 'Socials' },
  { id: 'affiliate', label: 'Affiliate' },
];

export function PostLaunchDashboard({
  symbol,
  mode,
  listingConfirmed,
  onConfirmListing,
  shareLinks,
  copiedLink,
  onCopyLink,
  marketingAttached,
  marketingAddress,
  vaultBalanceUsd = 42,
  artExtrasLine,
  signedIn,
  onClaimAccount,
  onReset,
  primaryBtnClass,
  backBtnClass,
  tradedContract,
  twitter = '',
  telegramCommunity = '',
  discord = '',
  websiteUrl = '',
  websiteKind = 'own',
  logoUrl = null,
}: PostLaunchDashboardProps) {
  const [tab, setTab] = useState<DashTab>('overview');
  const [roadmapMode, setRoadmapMode] = useState<'polessia' | 'manual'>('polessia');
  const [selected, setSelected] = useState<Set<SpendItemId>>(
    () => new Set(POLESSIA_DEFAULT_SELECTED),
  );
  const [copiedMint, setCopiedMint] = useState(false);
  const [copiedMkt, setCopiedMkt] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [roadmapApproved, setRoadmapApproved] = useState(false);

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
  const marketingFillPct = formatBpsPercent(FEE_TIERS[0].marketingBps);
  /** Demo volume until live indexer — scaled so vault ≈ marketing cut of volume. */
  const tradingVolumeUsd = vaultLive
    ? Math.max(
        Math.round((vaultBalanceUsd / (FEE_TIERS[0].marketingBps / 10_000)) * 0.92),
        vaultBalanceUsd * 20,
      )
    : 0;
  /** Demo share of vault inflows from buys vs sells. */
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

  const tierSelected = (tier: SpendThreshold) =>
    tier.items.every((item) => selected.has(item.id));

  const toggleTier = (tier: SpendThreshold) => {
    if (roadmapMode !== 'manual') return;
    setSelected((prev) => {
      const next = new Set(prev);
      const allOn = tier.items.every((item) => next.has(item.id));
      for (const item of tier.items) {
        if (allOn) next.delete(item.id);
        else next.add(item.id);
      }
      return next;
    });
  };

  const setPolessia = () => {
    setRoadmapMode('polessia');
    setSelected(new Set(POLESSIA_DEFAULT_SELECTED));
  };

  const setManual = () => setRoadmapMode('manual');

  const approveRoadmap = () => {
    setRoadmapApproved(true);
    window.setTimeout(() => setRoadmapApproved(false), 2000);
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

  return (
    <div className="mt-2 space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
          Dashboard
        </p>
        <div className="mt-1.5 flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="h-11 w-11 shrink-0 rounded-xl border border-white/[0.1] object-cover"
            />
          ) : (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[0.1] bg-white/[0.04] font-serif text-sm font-bold text-[#d5ff69]">
              {symbol.replace(/^\$/, '').slice(0, 2)}
            </span>
          )}
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">{symbol}</h1>
        </div>
      </div>

      <div className="inline-flex w-full gap-0.5 rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-2 py-2 text-[11px] font-semibold transition ${
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
        <div className="space-y-6">
          <section className="space-y-2 border-b border-white/[0.08] pb-4">
            <p className="text-[11px] font-medium text-white/45">Contract</p>
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 break-all font-mono text-[13px] text-white">
                {tradedContract.trim() || '—'}
              </p>
              <button
                type="button"
                onClick={() => void copyMint()}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.1] px-2.5 text-[11px] font-semibold text-white/55 transition hover:border-white/20 hover:text-white"
              >
                {copiedMint ? (
                  <Check className="h-3.5 w-3.5 text-[#d5ff69]" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copiedMint ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[11px] text-white/35">
              Mint is locked after publish. Socials and websites must match this CA.
            </p>
          </section>

          <section className="space-y-3">
            <p className="text-[11px] font-medium text-white/45">Confirm listing</p>
            {listingConfirmed ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-[#d5ff69]">
                <Check className="h-4 w-4" />
                Listing confirmed · Telegram opened
              </p>
            ) : (
              <button type="button" onClick={onConfirmListing} className={primaryBtnClass}>
                Confirm listing
                <ExternalLink className="h-4 w-4" />
              </button>
            )}
            <p className="text-[11px] text-white/35">Opens your community chat in Telegram.</p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium text-white/45">Marketing wallet</p>
              <button
                type="button"
                onClick={() => setTab('wallet')}
                className="text-[11px] font-semibold text-[#d5ff69] hover:underline"
              >
                Details
              </button>
            </div>
            <div className="border-b border-white/[0.08] pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  {mktSolscan && mktAddress ? (
                    <a
                      href={mktSolscan}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-[13px] text-[#c8ff3d] underline-offset-2 hover:text-[#d5ff69] hover:underline"
                      title={`View ${mktAddress} on Solscan`}
                    >
                      {shortAddr}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <p className="font-mono text-[13px] text-white">{shortAddr}</p>
                  )}
                  <p className="mt-0.5 text-[11px] text-white/40">
                    {vaultLive
                      ? `$${vaultBalanceUsd.toLocaleString()} · ${fillPct}% to ${formatThresholdUsd(nextThreshold.thresholdUsd)}`
                      : 'Not attached yet'}
                  </p>
                </div>
                <PolessiaLogo variant="powered" size="xs" className="shrink-0" />
              </div>
              {vaultLive && mktAddress ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void copyMarketingWallet()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.1] px-2.5 text-[11px] font-semibold text-white/55 transition hover:border-white/20 hover:text-white"
                  >
                    {copiedMkt ? (
                      <Check className="h-3.5 w-3.5 text-[#d5ff69]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedMkt ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void shareMarketingWallet()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.1] px-2.5 text-[11px] font-semibold text-white/55 transition hover:border-white/20 hover:text-white"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    {shareNotice ?? 'Share'}
                  </button>
                  <a
                    href={mktSolscan!}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.1] px-2.5 text-[11px] font-semibold text-white/55 transition hover:border-white/20 hover:text-white"
                  >
                    Solscan
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ) : null}
              {vaultLive ? (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-[#c8ff3d]"
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
              ) : null}
              {vaultLive ? (
                <button
                  type="button"
                  onClick={() => setTab('wallet')}
                  className="mt-3 text-[11px] font-semibold text-white/45 hover:text-[#d5ff69]"
                >
                  View transaction history →
                </button>
              ) : null}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium text-white/45">Shareable links</p>
              <button
                type="button"
                onClick={() => setTab('roadmap')}
                className="text-[11px] font-semibold text-[#d5ff69] hover:underline"
              >
                Roadmap
              </button>
            </div>
            <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {(
                [
                  { key: 'token' as const, label: 'Token page' },
                  { key: 'telegram' as const, label: 'Telegram' },
                  { key: 'burn' as const, label: 'Burn share' },
                ] as const
              ).map((row) => (
                <li key={row.key} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{row.label}</p>
                    <p className="mt-0.5 truncate text-[11px] text-white/35">
                      {shareLinks[row.key]}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCopyLink(row.key)}
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
                    href={shareLinks[row.key]}
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

          {artExtrasLine ? (
            <p className="text-[11px] text-white/35">{artExtrasLine}</p>
          ) : null}
        </div>
      ) : null}

      {tab === 'wallet' ? (
        <div className="space-y-6">
          <div>
            <p className="font-serif text-xl font-bold tracking-tight text-white">
              Marketing wallet
            </p>
            <p className="mt-1.5 text-sm text-white/45">
              Trade fees fill this vault. Spend unlocks at each threshold — powered by Polessia.
            </p>
          </div>

          <div className="space-y-3 border-y border-white/[0.06] py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                  Balance
                </p>
                <p className="mt-1 font-serif text-3xl font-bold text-[#d5ff69]">
                  ${(vaultLive ? vaultBalanceUsd : 0).toLocaleString()}
                </p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#c8ff3d]/15 text-[#d5ff69]">
                <Wallet className="h-5 w-5" />
              </span>
            </div>
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
                <span className="font-sans text-[10px] font-semibold">Solscan</span>
              </a>
            ) : (
              <p className="font-mono text-[12px] text-white/50">{shortAddr}</p>
            )}
            <PolessiaLogo variant="powered" size="xs" />
          </div>

          {vaultLive && mktAddress ? (
            <section className="space-y-3 rounded-xl border border-[#c8ff3d]/20 bg-[#c8ff3d]/[0.06] p-4">
              <div>
                <p className="text-sm font-bold text-white">Share &amp; fund manually</p>
                <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                  Investors can send SOL straight to this vault. Trade fees also fill it
                  automatically on CTOgo.
                </p>
              </div>
              <p className="break-all font-mono text-[12px] text-white/80">{mktAddress}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void copyMarketingWallet()}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 text-[12px] font-semibold text-white transition hover:border-white/25 sm:flex-none"
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
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 text-[12px] font-semibold text-white transition hover:border-white/25 sm:flex-none"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {shareNotice ?? 'Share'}
                </button>
                <a
                  href={mktSolscan!}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#c8ff3d] px-3 text-[12px] font-bold text-[#090b14] transition hover:bg-[#d5ff69] sm:flex-none"
                >
                  Open Solscan
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <p className="text-[11px] text-white/40">
                Paste the address in any Solana wallet to pay in. On Solscan, use Transfer to send
                SOL to this account.
              </p>
            </section>
          ) : null}

          {vaultLive ? (
            <MarketingWalletActivity ticker={symbol} />
          ) : null}

          {vaultLive ? (
            <section className="space-y-4">
              <div className="flex items-baseline justify-between gap-3 border-b border-white/[0.08] pb-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                    Trading volume
                  </p>
                  <p className="mt-1 font-serif text-2xl font-bold text-white">
                    ${tradingVolumeUsd.toLocaleString()}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/35">CTOgo-routed · all time (demo)</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-medium text-white/45">Vault fill from trades</p>
                <p className="mt-1.5 text-sm font-semibold text-white">
                  {marketingFillPct} of every buy · {marketingFillPct} of every sell
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/35">
                  Launch tier marketing cut ({FEE_TIERS[0].marketCap}). Same rate on buys and sells
                  until mcap steps the schedule down.
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
                    Buys <span className="font-semibold text-white">{buyFillSharePct}%</span> of fill
                  </span>
                  <span>
                    Sells <span className="font-semibold text-white">{sellFillSharePct}%</span> of fill
                  </span>
                </div>
              </div>
            </section>
          ) : null}

          {vaultLive && nextThreshold ? (
            <div>
              <p className="text-[11px] font-medium text-white/45">
                Next unlock · {formatThresholdUsd(nextThreshold.thresholdUsd)}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-[#c8ff3d] transition-[width]"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
              <p className="mt-2 text-[12px] text-white/40">
                {fillPct}% filled · {nextThreshold.items.map((i) => i.label).join(' · ')}
              </p>
              <button
                type="button"
                onClick={() => setTab('roadmap')}
                className="mt-3 text-[12px] font-semibold text-[#d5ff69] hover:underline"
              >
                View spend roadmap →
              </button>
            </div>
          ) : (
            <p className="text-[12px] text-white/40">
              Attach a marketing wallet from the coin page ($1) to start filling the vault.
            </p>
          )}

          <Link
            to="/marketing-wallet"
            className="inline-flex text-[12px] font-semibold text-white/45 underline decoration-white/20 underline-offset-2 hover:text-white"
          >
            How the marketing wallet works
          </Link>
        </div>
      ) : null}

      {tab === 'roadmap' ? (
        <div className="space-y-6">
          <div>
            <p className="font-serif text-xl font-bold tracking-tight text-white">
              Spend roadmap
            </p>
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
              Polessia wizard
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

          {roadmapMode === 'polessia' ? (
            <p className="text-[12px] leading-relaxed text-white/40">
              Polessia runs one package per tier as the vault fills. Activity prices are on the
              right.
            </p>
          ) : (
            <p className="text-[12px] leading-relaxed text-white/40">
              Toggle a whole tier, or individual activities. Spend still waits for vault balance.
            </p>
          )}

          <div className="space-y-5">
            {POST_LAUNCH_SPEND_THRESHOLDS.map((tier) => {
              const reached = vaultBalanceUsd >= tier.thresholdUsd;
              const on = tierSelected(tier);
              const interactive = roadmapMode === 'manual';
              return (
                <section key={tier.id}>
                  <button
                    type="button"
                    disabled={!interactive}
                    onClick={() => toggleTier(tier)}
                    className={`flex w-full items-center gap-3 border-b border-white/[0.08] pb-2 text-left transition ${
                      interactive ? 'hover:bg-white/[0.02]' : 'cursor-default'
                    }`}
                  >
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${
                        on
                          ? 'border-[#c8ff3d]/50 bg-[#c8ff3d]/15 text-[#d5ff69]'
                          : 'border-white/15 text-transparent'
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </span>
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
                  </button>
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
                            ) : (
                              <span className="w-5 shrink-0" aria-hidden />
                            )}
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
                              className={`shrink-0 text-[13px] font-semibold tabular-nums ${
                                itemOn ? 'text-[#d5ff69]' : 'text-white/30'
                              }`}
                            >
                              {formatActivityPrice(item.priceUsd)}
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
          initialWebsiteUrl={websiteUrl}
          initialWebsiteKind={websiteKind}
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

      {!signedIn ? (
        <button type="button" onClick={onClaimAccount} className={primaryBtnClass}>
          Create free account to claim
          <Check className="h-4 w-4" />
        </button>
      ) : null}

      {tab === 'roadmap' ? (
        <button type="button" onClick={approveRoadmap} className={primaryBtnClass}>
          {roadmapApproved ? (
            <>
              Approved
              <Check className="h-4 w-4" />
            </>
          ) : (
            'Approve'
          )}
        </button>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <Link to="/" className={`${primaryBtnClass} sm:flex-1`}>
            Back to home
          </Link>
          <button type="button" onClick={onReset} className={backBtnClass}>
            {mode === 'add' ? 'List another' : 'Launch another'}
          </button>
        </div>
      )}
    </div>
  );
}
