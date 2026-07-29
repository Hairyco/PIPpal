import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { PolessiaLogo } from './PolessiaLogo';
import {
  PostLaunchSocialsTab,
  type DashWebsiteKind,
} from './PostLaunchSocialsTab';
import {
  POLESSIA_DEFAULT_SELECTED,
  POST_LAUNCH_SPEND_THRESHOLDS,
  formatActivityPrice,
  formatThresholdUsd,
  tierTotalUsd,
  type SpendItemId,
  type SpendThreshold,
} from '../data/postLaunchRoadmap';

type DashTab = 'overview' | 'wallet' | 'roadmap' | 'socials';

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
};

const TABS: { id: DashTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'socials', label: 'Socials' },
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
}: PostLaunchDashboardProps) {
  const [tab, setTab] = useState<DashTab>('overview');
  const [roadmapMode, setRoadmapMode] = useState<'polessia' | 'manual'>('polessia');
  const [selected, setSelected] = useState<Set<SpendItemId>>(
    () => new Set(POLESSIA_DEFAULT_SELECTED),
  );
  const [copiedMint, setCopiedMint] = useState(false);

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

  const shortAddr = marketingAddress
    ? `${marketingAddress.slice(0, 4)}…${marketingAddress.slice(-4)}`
    : 'Pending deploy';

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

  const copyMint = async () => {
    try {
      await navigator.clipboard.writeText(tradedContract.trim());
      setCopiedMint(true);
      window.setTimeout(() => setCopiedMint(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mt-2 space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c8ff3d]/80">
          Dashboard
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-white">
          {symbol}
        </h1>
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
                  <p className="font-mono text-[13px] text-white">{shortAddr}</p>
                  <p className="mt-0.5 text-[11px] text-white/40">
                    {marketingAttached || mode === 'launch'
                      ? `$${vaultBalanceUsd.toLocaleString()} · ${fillPct}% to ${formatThresholdUsd(nextThreshold.thresholdUsd)}`
                      : 'Not attached yet'}
                  </p>
                </div>
                <PolessiaLogo variant="powered" size="xs" className="shrink-0" />
              </div>
              {(marketingAttached || mode === 'launch') && (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-[#c8ff3d]"
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
              )}
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
                  ${(marketingAttached || mode === 'launch' ? vaultBalanceUsd : 0).toLocaleString()}
                </p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#c8ff3d]/15 text-[#d5ff69]">
                <Wallet className="h-5 w-5" />
              </span>
            </div>
            <p className="font-mono text-[12px] text-white/50">{shortAddr}</p>
            <PolessiaLogo variant="powered" size="xs" />
          </div>

          {(marketingAttached || mode === 'launch') && nextThreshold ? (
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
            <p className="mt-1.5 text-sm text-white/45">
              Default is Polessia wizard. Switch to manual to pick placements yourself.
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

      {!signedIn ? (
        <button type="button" onClick={onClaimAccount} className={primaryBtnClass}>
          Create free account to claim
          <Check className="h-4 w-4" />
        </button>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <Link to="/" className={`${primaryBtnClass} sm:flex-1`}>
          Back to home
        </Link>
        <button type="button" onClick={onReset} className={backBtnClass}>
          {mode === 'add' ? 'List another' : 'Launch another'}
        </button>
      </div>
    </div>
  );
}
