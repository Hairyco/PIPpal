import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '../components/AppSidebar';
import { CtoTradeView, type TradeViewProject } from '../components/CtoTradeView';
import { AffiliatePromoSheet } from '../components/affiliate/AffiliatePromoSheet';
import { ScoutDashboard } from '../components/scout/ScoutDashboard';
import { ctoProjects, type CtoProject } from '../data/ctoProjects';
import { LIST_FEE_ENGINE, formatBpsPercent } from '../data/chainConfig';
import { captureScoutRefFromSearch, coinPath, normalizeTicker } from '../utils/scoutReferral';

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

export function CoinPage() {
  const { ticker: tickerParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
    <AppShell showTrigger={false}>
      <div className="mx-auto min-h-screen max-w-7xl px-0 pb-16">
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
      <AffiliatePromoSheet />
    </AppShell>
  );
}
