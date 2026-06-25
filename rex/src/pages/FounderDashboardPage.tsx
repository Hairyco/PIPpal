import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BadgeCheck,
  Megaphone,
  MessageCircle,
  Rocket,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { TokenIcon } from '../components/TokenIcon';
import {
  RecommendedRoadmapList,
  RoadmapHorizonSelect,
} from '../components/get-started/LaunchFlowParts';
import { ExitMarketplaceDemo } from '../components/founder/ExitMarketplaceDemo';
import {
  FounderTokenomicsPanel,
  FounderVestingStatus,
} from '../components/founder/FounderTokenomicsPanel';
import { VendorChatModal } from '../components/get-started/VendorChatModal';
import { DemoPreviewBadge } from '../components/promote/DemoPreviewBadge';
import { categoryBoostTiers } from '../data/promotePricing';
import { devStudios, projectDeliverables } from '../data/devStudios';
import { industries } from '../data/industries';
import { talentPool } from '../data/talentPool';
import type { ShareGrant } from '../data/founderTokenomics';
import { getCoinUtilityLabel } from '../data/coinUtilities';
import { getRoadmapHorizon, type RoadmapHorizonId } from '../data/roadmapHorizons';
import { loadFounderProject, projectSymbol, saveFounderProject } from '../utils/founderProject';
import { buildRecommendedRoadmap } from '../utils/recommendedRoadmap';
import type { VendorChatTarget } from '../utils/vendorChat';

type DashboardTab = 'overview' | 'roadmap' | 'ownership' | 'vendors' | 'promote';

const TABS: { id: DashboardTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'ownership', label: 'Ownership' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'promote', label: 'Promote' },
];

export function FounderDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<DashboardTab>('overview');
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

  const project = loadFounderProject();
  const welcome = searchParams.get('welcome') === '1';

  const symbol = project ? projectSymbol(project.projectName) : 'COIN';
  const industry = industries.find((i) => i.id === project?.categoryId);

  const milestones = useMemo(
    () =>
      project
        ? buildRecommendedRoadmap({
            categoryId: project.categoryId,
            projectName: project.projectName,
            deliverables: project.deliverables,
            horizon: roadmapHorizon,
          })
        : [],
    [project, roadmapHorizon],
  );

  if (!project) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Rocket className="mx-auto h-12 w-12 text-sky-400" />
          <h1 className="mt-6 font-serif text-2xl font-bold text-white">Founder dashboard</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Launch a project on Rex to unlock your dashboard — roadmap, vendors, chats, and
            promotion tools live here.
          </p>
          <Link to="/get-started" className="dex-btn mt-8 inline-flex">
            Launch for $1
          </Link>
        </div>
      </Layout>
    );
  }

  const dismissWelcome = () => {
    searchParams.delete('welcome');
    setSearchParams(searchParams, { replace: true });
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
      <div className="container py-8 pb-16">
        {welcome && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-emerald-200">{project.projectName} is live!</p>
              <p className="mt-1 text-sm text-emerald-200/80">
                Your coin is on Rex. Use this dashboard to track the roadmap, chat with vendors, and
                promote your launch.
              </p>
            </div>
            <button
              type="button"
              onClick={dismissWelcome}
              className="shrink-0 text-sm text-emerald-300 hover:text-emerald-200"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <TokenIcon symbol={symbol} size="lg" />
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-sky-400">
                Founder dashboard
              </p>
              <h1 className="font-serif text-2xl font-bold text-white md:text-3xl">
                {project.projectName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {symbol} · {industry?.name ?? project.categoryId} · Launched{' '}
                {new Date(project.launchedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <Link to={promoteUrl} className="dex-btn-green shrink-0">
            <Megaphone className="mr-2 h-4 w-4" />
            Promote
          </Link>
        </div>

        <div className="mt-8 border-b border-white/10">
          <div className="mt-8 flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-visible">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${
                  tab === item.id
                    ? 'border-sky-400 text-white'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'overview' && (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Marketing wallet', value: '$1,240', icon: Wallet, accent: 'text-emerald-400' },
                { label: 'Milestones', value: `${milestones.length} planned`, icon: TrendingUp, accent: 'text-sky-400' },
                {
                  label: 'Vendor chats',
                  value: String(project.vendorChats.length),
                  icon: MessageCircle,
                  accent: 'text-sky-400',
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
                    <p className="mt-2 text-xs text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-xl font-semibold text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="dex-card">
                <div className="relative z-[1]">
                  <h2 className="font-semibold text-white">Coin utilities</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.coinUtilities.map((id) => (
                      <span
                        key={id}
                        className="rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-0.5 text-xs text-sky-300"
                      >
                        {getCoinUtilityLabel(id)}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                </div>
              </div>

              <div className="dex-card border-amber-500/20">
                <div className="relative z-[1] flex gap-3">
                  <BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-amber-400" />
                  <div>
                    <h2 className="font-semibold text-white">
                      {kycCompleted ? 'Founder verified' : 'Unlock founder allocation & controls'}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
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
                        Complete KYC — ${KYC_FEE} (demo)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'roadmap' && (
          <div className="mt-6 min-w-0 space-y-4 overflow-x-hidden">
            <div className="dex-card min-w-0 overflow-hidden">
              <div className="relative z-[1] min-w-0 space-y-4">
                <div>
                  <h2 className="font-semibold text-white">Recommended roadmap</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getRoadmapHorizon(roadmapHorizon).label} horizon · Rex manages payouts until
                    you complete KYC.
                  </p>
                </div>
                <RoadmapHorizonSelect value={roadmapHorizon} onChange={handleHorizonChange} />
                <RecommendedRoadmapList milestones={milestones} />
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
                  <p className="mt-1 text-sm text-muted-foreground">
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
                  <p className="mt-2 text-sm text-muted-foreground">No studio shortlisted yet.</p>
                ) : project.ownSupplierName ? (
                  <p className="mt-2 text-sm text-white">
                    {project.ownSupplierName}{' '}
                    <span className="text-muted-foreground">(own supplier · pending vetting)</span>
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
                          <span className="text-xs text-muted-foreground">Invited at unlock</span>
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
                  <p className="mt-2 text-sm text-muted-foreground">
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
                            <span className="text-muted-foreground"> · </span>
                            <span className="text-sky-400">{t?.name}</span>
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
                <p className="mt-1 text-sm text-muted-foreground">
                  Finalise scope and pricing here — no need to block your launch.
                </p>
                {project.vendorChats.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
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
                          <p className="text-xs text-muted-foreground">{chat.subtitle}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setChatTarget(chat)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 hover:text-sky-300"
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
            <div className="flex min-w-0 items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3">
              <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">Marketing wallet</p>
                <p className="mt-0.5 break-words text-xs text-muted-foreground">
                  Category boosts and affiliate payouts always come from here — $2,430 available
                  (demo).
                </p>
              </div>
            </div>

            <div className="dex-card min-w-0 overflow-hidden">
              <div className="relative z-[1] min-w-0">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-sky-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-sky-400">
                    Category boosts
                  </span>
                </div>
                <h2 className="mt-2 font-semibold text-white">Rank higher in {industry?.name}</h2>
                <p className="mt-1 break-words text-sm text-muted-foreground">
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
                        <p className="text-xs text-muted-foreground">{tier.position}</p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-sky-400">
                        ${tier.price}
                        <span className="text-xs font-normal text-muted-foreground">
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
                  <Users className="h-4 w-4 text-sky-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-sky-400">
                    Affiliate programme
                  </span>
                  <DemoPreviewBadge />
                </div>
                <h2 className="mt-2 font-semibold text-white">Pay promoters from your wallet</h2>
                <p className="mt-1 break-words text-sm text-muted-foreground">
                  List {project.projectName} in the promoter catalogue. Commissions on referred
                  bonding-curve buys are paid automatically from your marketing wallet — never from
                  your personal funds.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <li className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                    Set commission % of marketing tax · tracked ref links per promoter
                  </li>
                  <li className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                    Payouts pause if the marketing wallet is empty
                  </li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link to={`${promoteUrl}#affiliate`} className="dex-btn-green">
                    Set up affiliate programme
                  </Link>
                  <Link to="/affiliates" className="dex-btn">
                    Preview catalogue
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
