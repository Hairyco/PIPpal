import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BadgeCheck,
  Check,
  Copy,
  ExternalLink,
  Megaphone,
  MessageCircle,
  Rocket,
  Share2,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { TokenIcon } from '../components/TokenIcon';
import { MarketingRoadmapPanel } from '../components/founder/MarketingRoadmapPanel';
import { ServicesOrdersPanel } from '../components/founder/ServicesOrdersPanel';
import { PostLaunchBundlesPanel } from '../components/founder/MarketingBundlesPanel';
import { ExitMarketplaceDemo } from '../components/founder/ExitMarketplaceDemo';
import {
  FounderTokenomicsPanel,
  FounderVestingStatus,
} from '../components/founder/FounderTokenomicsPanel';
import { VendorChatModal } from '../components/get-started/VendorChatModal';
import { ProjectImagePicker, type ProjectImageSource } from '../components/get-started/ProjectImagePicker';
import { DemoPreviewBadge } from '../components/promote/DemoPreviewBadge';
import { MarketingWalletActivity } from '../components/MarketingWalletActivity';
import { categoryBoostTiers } from '../data/promotePricing';
import { KYC_FEE } from '../data/claimPricing';
import { demoMarketingWalletAddress, shortMint, solscanAccountUrl } from '../data/ctoProjects';
import { devStudios, projectDeliverables } from '../data/devStudios';
import { industries } from '../data/industries';
import { talentPool } from '../data/talentPool';
import type { ShareGrant } from '../data/founderTokenomics';
import { getCoinUtilityLabel } from '../data/coinUtilities';
import { formatLaunchDate } from '../data/launchingSoon';
import { getLaunchModeLabel } from '../data/launchModes';
import { getRoadmapHorizon, type RoadmapHorizonId } from '../data/roadmapHorizons';
import { REX_TOKEN_SYMBOL } from '../data/rexToken';
import { loadFounderProject, projectSymbol, saveFounderProject } from '../utils/founderProject';
import { buildRecommendedRoadmap } from '../utils/recommendedRoadmap';
import type { VendorChatTarget } from '../utils/vendorChat';
import { hasAnyServiceOrders } from '../utils/serviceOrders';

type DashboardTab = 'overview' | 'services' | 'roadmap' | 'ownership' | 'vendors' | 'promote';

const TABS: { id: DashboardTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'services', label: 'Advertise' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'ownership', label: 'Ownership' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'promote', label: 'Promote' },
];

export function FounderDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [tab, setTab] = useState<DashboardTab>(() =>
    tabParam === 'services' ||
    tabParam === 'roadmap' ||
    tabParam === 'ownership' ||
    tabParam === 'vendors' ||
    tabParam === 'promote'
      ? tabParam
      : 'overview',
  );
  const [chatTarget, setChatTarget] = useState<VendorChatTarget | null>(null);
  const [roadmapHorizon, setRoadmapHorizon] = useState<RoadmapHorizonId>(
    () => loadFounderProject()?.roadmapHorizon ?? '12-months',
  );
  const [shareGrants, setShareGrants] = useState<ShareGrant[]>(
    () => loadFounderProject()?.shareGrants ?? [],
  );
  const [kycCompleted, setKycCompleted] = useState(
    () => loadFounderProject()?.kycCompleted ?? false,
  );
  const [projectImageUrl, setProjectImageUrl] = useState<string | null>(
    () => loadFounderProject()?.projectImageUrl ?? null,
  );
  const [projectImageSource, setProjectImageSource] = useState<ProjectImageSource>(
    () => loadFounderProject()?.projectImageSource ?? null,
  );
  const [copiedMkt, setCopiedMkt] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  const project = loadFounderProject();
  const welcome = searchParams.get('welcome') === '1';
  const isStaging = project?.launchMode === 'staging';
  if (!project) {
    if (hasAnyServiceOrders()) {
      return (
        <Layout>
          <div className="mx-auto max-w-7xl px-3 py-6 pb-16 sm:px-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <DemoPreviewBadge />
                <h1 className="mt-3 text-3xl font-bold text-white">Advertise dashboard</h1>
                <p className="mt-2 text-sm text-white/45">
                  Track direct SOL orders. Launch a CTO anytime to unlock the full founder toolkit.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Link
                  to="/dex-ads"
                  className="inline-flex items-center rounded-lg border border-[#c8ff3d]/35 bg-[#c8ff3d]/10 px-3 py-2 text-sm font-semibold text-[#d5ff69] transition hover:bg-[#c8ff3d]/15"
                >
                  Dex Ads
                </Link>
                <Link to="/get-started" className="dex-btn-green shrink-0">
                  Launch a CTO
                </Link>
              </div>
            </div>
            <div className="mt-8">
              <ServicesOrdersPanel />
            </div>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        <div className="mx-auto max-w-7xl px-3 py-16 text-center sm:px-5">
          <Rocket className="mx-auto h-12 w-12 text-[#d5ff69]" />
          <h1 className="mt-6 text-2xl font-bold text-white">Founder dashboard</h1>
          <p className="mx-auto mt-3 max-w-md text-white/45">
            Launch a CTO or buy an Advertise pack to unlock your dashboard.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/get-started" className="dex-btn inline-flex">
              Launch for $1
            </Link>
            <Link
              to="/dex-ads"
              className="inline-flex rounded-full border border-[#c8ff3d]/35 bg-[#c8ff3d]/10 px-4 py-2.5 text-[13px] font-semibold text-[#d5ff69]"
            >
              Dex Ads
            </Link>
            <Link
              to="/advertise"
              className="inline-flex rounded-full border border-white/[0.12] bg-[#1c1c1e] px-4 py-2.5 text-[13px] font-semibold text-white/85"
            >
              Advertise
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const dismissWelcome = () => {
    searchParams.delete('welcome');
    setSearchParams(searchParams, { replace: true });
  };

  const selectTab = (id: DashboardTab) => {
    setTab(id);
    const next = new URLSearchParams(searchParams);
    if (id === 'overview') next.delete('tab');
    else next.set('tab', id);
    setSearchParams(next, { replace: true });
  };

  const symbol = projectSymbol(project.projectName);
  const industry = industries.find((i) => i.id === project.categoryId);
  const marketingAddress = demoMarketingWalletAddress(symbol);
  const marketingSolscan = solscanAccountUrl(marketingAddress);
  const marketingShort = shortMint(marketingAddress);

  const copyMarketingWallet = async () => {
    try {
      await navigator.clipboard.writeText(marketingAddress);
      setCopiedMkt(true);
      window.setTimeout(() => setCopiedMkt(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const shareMarketingWallet = async () => {
    const text = `Fund the $${symbol} marketing wallet — send SOL to:\n${marketingAddress}\n\nSolscan: ${marketingSolscan}`;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: `$${symbol} marketing wallet`, text });
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

  const milestones = useMemo(
    () =>
      buildRecommendedRoadmap({
        categoryId: project.categoryId,
        projectName: project.projectName,
        deliverables: project.deliverables,
        horizon: roadmapHorizon,
      }),
    [project, roadmapHorizon],
  );

  const handleProjectImageChange = (url: string | null, source: ProjectImageSource) => {
    if (!project) return;
    setProjectImageUrl(url);
    setProjectImageSource(source);
    saveFounderProject({
      ...project,
      projectImageUrl: url,
      projectImageSource: source ?? undefined,
    });
  };

  const handleHorizonChange = (horizon: RoadmapHorizonId) => {
    setRoadmapHorizon(horizon);
    if (project) {
      saveFounderProject({ ...project, roadmapHorizon: horizon });
    }
  };

  const handleShareGrantsChange = (grants: ShareGrant[]) => {
    setShareGrants(grants);
    if (project) {
      saveFounderProject({ ...project, shareGrants: grants });
    }
  };

  const handleCompleteKyc = () => {
    setKycCompleted(true);
    if (project) {
      saveFounderProject({ ...project, kycCompleted: true });
    }
  };

  const promoteUrl = `/project/${project.categoryId}/new/promote?name=${encodeURIComponent(project.projectName)}`;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-3 py-6 pb-16 sm:px-5">
        {welcome && (
          <div
            className={`mb-6 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
              isStaging
                ? 'border-amber-500/30 bg-amber-500/10'
                : 'border-emerald-500/30 bg-emerald-500/10'
            }`}
          >
            <div>
              <p className={`font-medium ${isStaging ? 'text-amber-200' : 'text-emerald-200'}`}>
                {isStaging
                  ? `${project.projectName} is in Launching Soon`
                  : `${project.projectName} is live!`}
              </p>
              <p className={`mt-1 text-sm ${isStaging ? 'text-amber-200/80' : 'text-emerald-200/80'}`}>
                {isStaging
                  ? `You're listed in Launching Soon${
                      project.stagingLaunchDate
                        ? ` until ${formatLaunchDate(project.stagingLaunchDate)}`
                        : ''
                    }. Build community interest, then flip to live when ready.`
                  : 'Your coin is on CTOgo. Track the roadmap, vendors, and Advertise packs here.'}
              </p>
            </div>
            <button
              type="button"
              onClick={dismissWelcome}
              className={`shrink-0 text-sm ${isStaging ? 'text-amber-300' : 'text-emerald-300'}`}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <TokenIcon symbol={symbol} size="lg" imageUrl={projectImageUrl} />
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-[#d5ff69]">
                Founder dashboard
              </p>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                {project.projectName}
              </h1>
              <p className="text-sm text-white/45">
                {symbol} · {industry?.name ?? project.categoryId}
                {isStaging ? (
                  <>
                    {' '}
                    ·{' '}
                    <span className="text-amber-300">
                      {getLaunchModeLabel('staging')}
                      {project.stagingLaunchDate
                        ? ` · ${formatLaunchDate(project.stagingLaunchDate)}`
                        : ''}
                    </span>
                  </>
                ) : (
                  <>
                    {' '}
                    · Launched{' '}
                    {new Date(project.launchedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              to="/dex-ads"
              className="inline-flex items-center rounded-lg border border-[#c8ff3d]/35 bg-[#c8ff3d]/10 px-3 py-2 text-sm font-semibold text-[#d5ff69] transition hover:bg-[#c8ff3d]/15"
            >
              Dex Ads
            </Link>
            <Link to={promoteUrl} className="dex-btn-green shrink-0">
              <Megaphone className="mr-2 h-4 w-4" />
              Promote
            </Link>
          </div>
        </div>

        <div className="mt-8 border-b border-white/[0.08]">
          <div className="flex gap-5 overflow-x-auto px-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                className={`relative shrink-0 pb-3 pt-1 text-[13px] font-semibold transition-colors ${
                  tab === item.id ? 'text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {item.label}
                {tab === item.id ? (
                  <span className="absolute inset-x-0 -bottom-px mx-auto h-[2.5px] w-8 rounded-full bg-white" />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {tab === 'overview' && (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Marketing wallet', value: '$1,240', icon: Wallet, accent: 'text-emerald-400' },
                { label: 'Milestones', value: `${milestones.length} planned`, icon: TrendingUp, accent: 'text-[#d5ff69]' },
                {
                  label: 'Vendor chats',
                  value: String(project.vendorChats.length),
                  icon: MessageCircle,
                  accent: 'text-[#d5ff69]',
                },
                {
                  label: 'Deliverables',
                  value: String(project.deliverables.length),
                  icon: Users,
                  accent: 'text-foreground',
                },
              ].map((stat) => (
                <div key={stat.label} className="dex-card">
                  <div className="relative z-[1]">
                    <stat.icon className={`h-4 w-4 ${stat.accent}`} />
                    <p className="mt-2 text-xs text-white/45">{stat.label}</p>
                    <p className="mt-1 text-xl font-semibold text-white">{stat.value}</p>
                    {stat.label === 'Marketing wallet' ? (
                      <a
                        href={marketingSolscan}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 font-mono text-[11px] text-[#d5ff69] underline-offset-2 hover:text-[#d5ff69] hover:underline"
                        title={`View ${marketingAddress} on Solscan`}
                      >
                        {marketingShort}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="dex-card">
              <div className="relative z-[1] space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-white">Share marketing wallet</h2>
                    <p className="mt-1 text-sm text-white/45">
                      Investors can fund growth by sending SOL to this wallet. Trade fees fill it
                      automatically too.
                    </p>
                  </div>
                  <Wallet className="h-5 w-5 shrink-0 text-emerald-400" />
                </div>
                <p className="break-all font-mono text-xs text-white/80">{marketingAddress}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void copyMarketingWallet()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-white/80 transition hover:border-white/25 hover:text-white"
                  >
                    {copiedMkt ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedMkt ? 'Copied' : 'Copy address'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void shareMarketingWallet()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-white/80 transition hover:border-white/25 hover:text-white"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    {shareNotice ?? 'Share'}
                  </button>
                  <a
                    href={marketingSolscan}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#c8ff3d]/30 bg-[#c8ff3d]/10 px-3 text-xs font-semibold text-[#d5ff69] transition hover:bg-[#c8ff3d]/20"
                  >
                    Solscan
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <MarketingWalletActivity ticker={symbol} className="pt-2" />
              </div>
            </div>

            <PostLaunchBundlesPanel starterFunding={project.starterBundleFunding} />

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="dex-card">
                <div className="relative z-[1]">
                  <h2 className="font-semibold text-white">Project image</h2>
                  <p className="mt-1 text-xs text-white/45">
                    Upload free, or generate with AI using {REX_TOKEN_SYMBOL} token.
                  </p>
                  <div className="mt-4">
                    <ProjectImagePicker
                      imageUrl={projectImageUrl}
                      imageSource={projectImageSource}
                      onChange={handleProjectImageChange}
                      projectName={project.projectName}
                      description={project.description}
                      categoryLabel={industry?.name}
                    />
                  </div>
                </div>
              </div>

              <div className="dex-card">
                <div className="relative z-[1]">
                  <h2 className="font-semibold text-white">Coin utilities</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.coinUtilities.map((id) => (
                      <span
                        key={id}
                        className="rounded-full border border-[#c8ff3d]/25 bg-[#c8ff3d]/10 px-2.5 py-0.5 text-xs text-[#d5ff69]"
                      >
                        {getCoinUtilityLabel(id)}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-white/45 line-clamp-3">{project.description}</p>
                </div>
              </div>

              <div className="dex-card border-amber-500/20">
                <div className="relative z-[1] flex gap-3">
                  <BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-amber-400" />
                  <div>
                    <h2 className="font-semibold text-white">
                      {kycCompleted ? 'Founder verified' : 'Unlock founder allocation & controls'}
                    </h2>
                    <p className="mt-1 text-sm text-white/45">
                      {kycCompleted
                        ? 'Your vesting clock is running. Manage allocation and exit from the Ownership tab.'
                        : `Complete KYC ($${KYC_FEE}) to unlock your 15% founder token allocation, edit milestones, and approve marketing spend.`}
                    </p>
                    {!kycCompleted && (
                      <button
                        type="button"
                        onClick={handleCompleteKyc}
                        className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-200"
                      >
                        Complete KYC — ${KYC_FEE}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'services' && (
          <div className="mt-6">
            <ServicesOrdersPanel />
          </div>
        )}

        {tab === 'roadmap' && (
          <div className="mt-6 min-w-0 space-y-4 overflow-x-hidden">
            <div className="dex-card min-w-0 overflow-hidden">
              <div className="relative z-[1] min-w-0">
                <div className="mb-5">
                  <h2 className="font-semibold text-white">Project roadmap</h2>
                  <p className="mt-1 text-sm text-white/45">
                    {getRoadmapHorizon(roadmapHorizon).label} horizon · Marketing campaign and build
                    milestones
                  </p>
                </div>
                <MarketingRoadmapPanel
                  project={project}
                  roadmapHorizon={roadmapHorizon}
                  kycCompleted={kycCompleted}
                  onHorizonChange={handleHorizonChange}
                />
              </div>
            </div>
          </div>
        )}

        {tab === 'ownership' && (
          <div className="mt-6 space-y-6">
            <div className="dex-card">
              <div className="relative z-[1] space-y-4">
                <div>
                  <h2 className="font-semibold text-white">Founder ownership</h2>
                  <p className="mt-1 text-sm text-white/45">
                    {getRoadmapHorizon(roadmapHorizon).label} vesting · KYC-gated unlock · optional
                    exit marketplace
                  </p>
                </div>
                <FounderVestingStatus
                  horizon={roadmapHorizon}
                  launchedAt={project.launchedAt}
                  kycCompleted={kycCompleted}
                />
                <FounderTokenomicsPanel
                  horizon={roadmapHorizon}
                  shareGrants={shareGrants}
                  onShareGrantsChange={handleShareGrantsChange}
                  editable
                />
              </div>
            </div>
            <ExitMarketplaceDemo
              projectName={project.projectName}
              symbol={symbol}
              horizon={roadmapHorizon}
              launchedAt={project.launchedAt}
              kycCompleted={kycCompleted}
            />
          </div>
        )}

        {tab === 'vendors' && (
          <div className="mt-6 space-y-6">
            <div className="dex-card">
              <div className="relative z-[1]">
                <h2 className="font-semibold text-white">Studios</h2>
                {project.studioSkipped ? (
                  <p className="mt-2 text-sm text-white/45">No studio shortlisted yet.</p>
                ) : project.ownSupplierName ? (
                  <p className="mt-2 text-sm text-white">
                    {project.ownSupplierName}{' '}
                    <span className="text-white/45">(own supplier · pending vetting)</span>
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {project.shortlistedStudios.map((id) => {
                      const studio = devStudios.find((s) => s.id === id);
                      if (!studio) return null;
                      return (
                        <li
                          key={id}
                          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                        >
                          <span className="text-sm text-white">{studio.name}</span>
                          <span className="text-xs text-white/45">Invited at unlock</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            <div className="dex-card">
              <div className="relative z-[1]">
                <h2 className="font-semibold text-white">Talent</h2>
                {Object.entries(project.talentAssignments).filter(([, id]) => id).length === 0 ? (
                  <p className="mt-2 text-sm text-white/45">
                    No freelancers assigned — finalise hires in chat when ready.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {Object.entries(project.talentAssignments)
                      .filter(([, id]) => id)
                      .map(([deliverableId, talentId]) => {
                        const d = projectDeliverables.find((x) => x.id === deliverableId);
                        const t = talentPool.find((x) => x.id === talentId);
                        return (
                          <li
                            key={deliverableId}
                            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
                          >
                            <span className="text-white">{d?.label}</span>
                            <span className="text-white/45"> · </span>
                            <span className="text-[#d5ff69]">{t?.name}</span>
                          </li>
                        );
                      })}
                  </ul>
                )}
              </div>
            </div>

            <div className="dex-card">
              <div className="relative z-[1]">
                <h2 className="font-semibold text-white">Vendor conversations</h2>
                <p className="mt-1 text-sm text-white/45">
                  Finalise scope and pricing here — no need to block your launch.
                </p>
                {project.vendorChats.length === 0 ? (
                  <p className="mt-3 text-sm text-white/45">
                    No chats yet. Message studios or talent from the launch flow.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {project.vendorChats.map((chat) => (
                      <li
                        key={chat.key}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{chat.name}</p>
                          <p className="text-xs text-white/45">{chat.subtitle}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setChatTarget(chat)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#d5ff69] hover:text-[#d5ff69]"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          Open chat
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'promote' && (
          <div className="mt-6 min-w-0 space-y-6 overflow-x-hidden">
            <div className="flex min-w-0 items-start gap-3 rounded-xl border border-[#c8ff3d]/20 bg-[#c8ff3d]/10 px-4 py-3">
              <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-[#d5ff69]" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">Marketing wallet</p>
                <p className="mt-0.5 break-words text-xs text-white/45">
                  Category boosts and affiliate payouts always come from here — $2,430 available.
                  Investors can also pay in manually.
                </p>
                <a
                  href={marketingSolscan}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] text-[#d5ff69] underline-offset-2 hover:text-[#d5ff69] hover:underline"
                  title={`View ${marketingAddress} on Solscan`}
                >
                  {marketingShort}
                  <ExternalLink className="h-3 w-3" />
                  Solscan
                </a>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void copyMarketingWallet()}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2.5 text-[11px] font-semibold text-white/70 transition hover:text-white"
                  >
                    {copiedMkt ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copiedMkt ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void shareMarketingWallet()}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2.5 text-[11px] font-semibold text-white/70 transition hover:text-white"
                  >
                    <Share2 className="h-3 w-3" />
                    {shareNotice ?? 'Share'}
                  </button>
                </div>
              </div>
            </div>

            <div className="dex-card min-w-0 overflow-hidden">
              <div className="relative z-[1] min-w-0">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-[#d5ff69]" />
                  <span className="text-xs font-medium uppercase tracking-wider text-[#d5ff69]">
                    Category boosts
                  </span>
                </div>
                <h2 className="mt-2 font-semibold text-white">Rank higher in {industry?.name}</h2>
                <p className="mt-1 break-words text-sm text-white/45">
                  Pin or boost your listing on the category page. Activate a tier and the cost is
                  deducted from your marketing wallet.
                </p>
                <ul className="mt-4 space-y-2">
                  {categoryBoostTiers.map((tier) => (
                    <li
                      key={tier.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">{tier.name}</p>
                        <p className="text-xs text-white/45">{tier.position}</p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-[#d5ff69]">
                        ${tier.price}
                        <span className="text-xs font-normal text-white/45">
                          /{tier.period}
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link to={`${promoteUrl}#boosts`} className="dex-btn-green">
                    Manage boosts
                  </Link>
                  <Link to={`/category/${project.categoryId}`} className="dex-btn">
                    View category
                  </Link>
                </div>
              </div>
            </div>

            <div className="dex-card min-w-0 overflow-hidden">
              <div className="relative z-[1] min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Users className="h-4 w-4 text-[#d5ff69]" />
                  <span className="text-xs font-medium uppercase tracking-wider text-[#d5ff69]">
                    Affiliate programme
                  </span>
                  <DemoPreviewBadge />
                </div>
                <h2 className="mt-2 font-semibold text-white">Raid share & earn</h2>
                <p className="mt-1 break-words text-sm text-white/45">
                  Community and raiders share {project.projectName} with wallet ref links. They earn
                  0.50% instant SOL on attributed CTOgo swaps — paid to their wallets, not from your
                  marketing wallet roadmap.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-white/45">
                  <li className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                    Protocol-fixed 0.50% raid cut · 24h last-click · unclaimed → CTOgo treasury
                  </li>
                  <li className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                    Marketing wallet still gets 0.40% (List) / 0.30% (Launch) for roadmap spend
                  </li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link to={`${promoteUrl}#affiliate`} className="dex-btn-green">
                    View raid programme
                  </Link>
                  <Link to="/affiliates" className="dex-btn">
                    Raid catalogue
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {chatTarget && (
        <VendorChatModal target={chatTarget} onClose={() => setChatTarget(null)} />
      )}
    </Layout>
  );
}
