import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { AppShell } from '../components/AppSidebar';
import { CtoTradeView, type TradeViewProject } from '../components/CtoTradeView';
import { AffiliatePromoSheet } from '../components/affiliate/AffiliatePromoSheet';
import { ScoutDashboard } from '../components/scout/ScoutDashboard';
import { SolWalletPanel } from '../components/SolWalletPanel';
import { PolessiaLogo } from '../components/PolessiaLogo';
import { ctoProjects, type CtoProject } from '../data/ctoProjects';
import {
  POST_LAUNCH_SPEND_THRESHOLDS,
  formatActivityPrice,
  formatThresholdUsd,
  tierTotalUsd,
} from '../data/postLaunchRoadmap';
import {
  LIST_FEE_ENGINE,
  LAUNCH_FEE_ENGINE,
  formatBpsPercent,
} from '../data/chainConfig';
import { captureScoutRefFromSearch, coinPath, normalizeTicker } from '../utils/scoutReferral';

type CoinTab = 'overview' | 'roadmap' | 'wallet' | 'socials' | 'affiliate';

const TABS: { id: CoinTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'socials', label: 'Socials' },
  { id: 'affiliate', label: 'Affiliate' },
];

function stubProject(ticker: string): TradeViewProject {
  const t = normalizeTicker(ticker) || 'COIN';
  return {
    name: t,
    ticker: t,
    price: '$0.0000',
    marketCap: '—',
    txs: '—',
    holders: '—',
    launchInHours: null,
    change5m: null,
    change24h: 0,
    volume24h: '—',
    fdv: '—',
    mph: 0,
    raidsActive: 0,
    raidsJoined: '0',
    community: 'Community',
    colors: 'from-emerald-500/40 to-lime-400/20',
    logo: '',
    origin: 'external_cto',
    sourceVenue: 'CTOgo',
  };
}

function toTradeView(p: CtoProject): TradeViewProject {
  return {
    name: p.name,
    ticker: p.ticker,
    price: p.price,
    marketCap: p.marketCap,
    txs: p.txs,
    holders: p.holders,
    launchInHours: p.launchInHours,
    change5m: p.change5m,
    change24h: p.change24h,
    volume24h: p.volume24h,
    fdv: p.fdv,
    mph: p.mph,
    raidsActive: p.raidsActive,
    raidsJoined: p.raidsJoined,
    marketingWallet: p.marketingWallet,
    marketingWalletAddress: p.marketingWalletAddress,
    marketingBalance: p.marketingBalance,
    nextAdTargetUsd: p.nextAdTargetUsd,
    nextAdSpend: p.nextAdSpend,
    v1Mint: p.v1Mint,
    v1Liquidity: p.v1Liquidity,
    community: p.community,
    colors: p.colors,
    logo: p.logo,
    headerBanner: p.headerBanner,
    verified: p.verified,
    boost: p.boost,
    origin: p.origin,
    sourceVenue: p.sourceVenue,
    devDumpedPct: p.devDumpedPct,
    feeMode: p.feeMode,
  };
}

function socialLinksFor(ticker: string) {
  const slug = ticker.toLowerCase();
  return [
    { id: 'x', label: 'X / Twitter', href: `https://x.com/search?q=%24${encodeURIComponent(ticker)}` },
    { id: 'telegram', label: 'Telegram', href: `https://t.me/${slug}` },
    { id: 'website', label: 'Website', href: `https://${slug}.fun` },
  ] as const;
}

export function CoinPage() {
  const { ticker: tickerParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<CoinTab>('overview');

  const ticker = normalizeTicker(tickerParam ?? '') || 'COIN';

  useEffect(() => {
    captureScoutRefFromSearch(searchParams);
  }, [searchParams]);

  const matched = useMemo(
    () => ctoProjects.find((p) => p.ticker.toUpperCase() === ticker),
    [ticker],
  );
  const project = useMemo(
    () => (matched ? toTradeView(matched) : stubProject(ticker)),
    [matched, ticker],
  );
  const siblings = useMemo(() => ctoProjects.map(toTradeView), []);

  return (
    <AppShell>
      <div className="mx-auto min-h-screen max-w-7xl px-0 pb-16">
        <div className="sticky top-0 z-30 border-b border-white/[0.07] bg-black/90 backdrop-blur-md">
          <div className="flex items-center gap-2 px-3 py-2.5 sm:px-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-white/55 transition hover:bg-white/[0.04] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </button>
            <p className="min-w-0 flex-1 truncate font-serif text-base font-bold">
              ${project.ticker}
              <span className="ml-2 font-sans text-[12px] font-normal text-white/40">
                {project.name}
              </span>
            </p>
            <Link
              to="/fees#raid-fee-engine"
              className="shrink-0 rounded-md border border-[#c8ff3d]/25 bg-[#c8ff3d]/[0.08] px-2 py-1 text-[10px] font-semibold text-[#d5ff69]"
            >
              Fees
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-0.5 px-2 pb-2 sm:px-3">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-1 py-2 text-[11px] font-semibold transition sm:text-xs ${
                  tab === t.id
                    ? 'bg-[#c8ff3d] text-[#090b14]'
                    : 'text-white/45 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className={tab === 'overview' ? 'pt-0' : 'px-3 pt-3 sm:px-4'}>
          {tab === 'overview' ? (
            <div className="space-y-0">
              <div className="space-y-4 px-3 pt-3 sm:px-4">
                <div className="rounded-xl border border-[#c8ff3d]/20 bg-[#c8ff3d]/[0.06] px-3.5 py-3">
                  <p className="text-[11px] font-medium text-white/45">Raid & marketing</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/70">
                    <span className="font-semibold text-[#d5ff69]">
                      {formatBpsPercent(LIST_FEE_ENGINE.raidBps)} raid
                    </span>
                    {' · '}
                    marketing fills the wallet · unclaimed raid → CTOgo
                  </p>
                  <p className="mt-1.5 text-[11px] text-white/40">
                    Full List / Launch swap splits are on the{' '}
                    <Link to="/fees#raid-fee-engine" className="text-[#d5ff69] hover:underline">
                      Fees
                    </Link>{' '}
                    page.
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
                  <ScoutDashboard symbol={project.ticker} compact />
                </div>
              </div>
              <CtoTradeView
                project={project}
                projects={siblings.length ? siblings : [project]}
                change={project.change24h}
                onSelect={(next) => navigate(coinPath(next))}
                onBack={() => navigate('/discover')}
              />
            </div>
          ) : null}

          {tab === 'roadmap' ? (
            <div className="mx-auto max-w-lg space-y-5 py-2">
              <div>
                <p className="font-serif text-xl font-bold text-white">Spend roadmap</p>
                <p className="mt-1.5 text-sm text-white/45">
                  Funded only by the marketing cut ({formatBpsPercent(LIST_FEE_ENGINE.marketingBps)}{' '}
                  List / {formatBpsPercent(LAUNCH_FEE_ENGINE.marketingBps)} Launch). Raid commissions
                  are separate — see Affiliate.
                </p>
                <div className="mt-2">
                  <PolessiaLogo variant="powered" size="xs" />
                </div>
              </div>
              {POST_LAUNCH_SPEND_THRESHOLDS.map((tier) => (
                <section key={tier.id} className="space-y-2">
                  <div className="flex items-end justify-between border-b border-white/[0.08] pb-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
                        {tier.label}
                      </p>
                      <p className="text-sm font-semibold text-white">
                        At {formatThresholdUsd(tier.thresholdUsd)}
                      </p>
                    </div>
                    <p className="text-[11px] text-white/40">
                      Pack {formatActivityPrice(tierTotalUsd(tier))}
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {tier.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                      >
                        <img src={item.logo} alt="" className="h-7 w-7 rounded-md object-contain" />
                        <p className="min-w-0 flex-1 text-[13px] text-white/80">{item.label}</p>
                        <p className="font-mono text-[12px] text-white/45">
                          {formatActivityPrice(item.priceUsd)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : null}

          {tab === 'wallet' ? (
            <div className="mx-auto max-w-lg space-y-5 py-2">
              <div>
                <p className="font-serif text-xl font-bold text-white">Wallet</p>
                <p className="mt-1.5 text-sm text-white/45">
                  Your SOL balance holds raid commissions ({formatBpsPercent(LIST_FEE_ENGINE.raidBps)}
                  ). The project marketing wallet fills separately (
                  {formatBpsPercent(LIST_FEE_ENGINE.marketingBps)} List /{' '}
                  {formatBpsPercent(LAUNCH_FEE_ENGINE.marketingBps)} Launch) for roadmap spend.
                </p>
              </div>
              <SolWalletPanel />
              {project.marketingWalletAddress || project.marketingWallet ? (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3">
                  <p className="text-[11px] text-white/40">Marketing wallet (project)</p>
                  <p className="mt-1 break-all font-mono text-[12px] text-white/65">
                    {project.marketingWalletAddress ?? project.marketingWallet}
                  </p>
                  {project.marketingBalance ? (
                    <p className="mt-2 text-sm font-semibold text-[#d5ff69]">
                      {project.marketingBalance}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {tab === 'socials' ? (
            <div className="mx-auto max-w-lg space-y-4 py-2">
              <div>
                <p className="font-serif text-xl font-bold text-white">Socials</p>
                <p className="mt-1.5 text-sm text-white/45">Project links for ${project.ticker}</p>
              </div>
              <ul className="space-y-2">
                {socialLinksFor(project.ticker).map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 text-sm text-white/80 transition hover:border-white/20 hover:text-white"
                    >
                      {link.label}
                      <ExternalLink className="h-4 w-4 text-white/35" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {tab === 'affiliate' ? (
            <div className="mx-auto max-w-lg py-2">
              <ScoutDashboard symbol={project.ticker} />
            </div>
          ) : null}
        </div>
      </div>
      <AffiliatePromoSheet />
    </AppShell>
  );
}
