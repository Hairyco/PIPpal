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
import { RecommendedRoadmapList } from '../components/get-started/LaunchFlowParts';
import { VendorChatModal } from '../components/get-started/VendorChatModal';
import { KYC_FEE } from '../data/claimPricing';
import { devStudios, projectDeliverables } from '../data/devStudios';
import { industries } from '../data/industries';
import { talentPool } from '../data/talentPool';
import { getCoinUtilityLabel } from '../data/coinUtilities';
import { loadFounderProject, projectSymbol } from '../utils/founderProject';
import { buildRecommendedRoadmap } from '../utils/recommendedRoadmap';
import type { VendorChatTarget } from '../utils/vendorChat';

type DashboardTab = 'overview' | 'roadmap' | 'vendors' | 'promote';

const TABS: { id: DashboardTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'promote', label: 'Promote' },
];

export function FounderDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<DashboardTab>('overview');
  const [chatTarget, setChatTarget] = useState<VendorChatTarget | null>(null);

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
          })
        : [],
    [project],
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
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
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
                    <h2 className="font-semibold text-white">Unlock full founder controls</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Complete KYC (${KYC_FEE}) to edit milestones, reassign vendors, and approve
                      marketing spend yourself.
                    </p>
                    <button
                      type="button"
                      className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-200"
                    >
                      Complete KYC — ${KYC_FEE}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'roadmap' && (
          <div className="mt-6 space-y-4">
            <div className="dex-card">
              <div className="relative z-[1]">
                <h2 className="font-semibold text-white">Recommended roadmap</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Rex manages payouts until you complete KYC. Milestones unlock as your marketing
                  wallet fills.
                </p>
                <div className="mt-4">
                  <RecommendedRoadmapList milestones={milestones} />
                </div>
              </div>
            </div>
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
          <div className="mt-6 space-y-4">
            <div className="dex-card">
              <div className="relative z-[1]">
                <h2 className="font-semibold text-white">Grow your launch</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Boost your category ranking or set up the affiliate programme demo.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link to={promoteUrl} className="dex-btn-green">
                    Open promote tools
                  </Link>
                  <Link to={`/category/${project.categoryId}`} className="dex-btn">
                    View category listing
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
