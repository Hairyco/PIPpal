import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, Map, Wallet } from 'lucide-react';
import { Layout, BackLink } from '../components/Layout';
import { TokenIcon } from '../components/TokenIcon';
import { MarketingWalletChart, PriceChart } from '../components/project/ProjectCharts';
import { TradePanel } from '../components/project/TradePanel';
import { RoadmapModal } from '../components/category/RoadmapModal';
import { getProject } from '../data/categoryContent';
import { industries } from '../data/industries';
import { getProjectDetails } from '../data/projectDetails';
import {
  generatePriceHistory,
  generateWalletHistory,
  getWalletMilestones,
  parseDollar,
} from '../data/walletChart';

type ChartTab = 'wallet' | 'price';

export function ProjectPage() {
  const { categoryId, projectId } = useParams<{ categoryId: string; projectId: string }>();
  const [chartTab, setChartTab] = useState<ChartTab>('wallet');
  const [showRoadmap, setShowRoadmap] = useState(false);

  const project = categoryId && projectId ? getProject(categoryId, projectId) : null;
  const industry = industries.find((i) => i.id === categoryId);

  if (!project || !industry || !categoryId) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Project not found.</p>
          <div className="mt-4">
            <BackLink />
          </div>
        </div>
      </Layout>
    );
  }

  const details = getProjectDetails(project);
  const walletBalance = parseDollar(details.marketingWallet.balance);
  const walletHistory = generateWalletHistory(project, walletBalance);
  const priceHistory = generatePriceHistory(project);
  const walletMilestones = getWalletMilestones(walletBalance);
  const positive = project.change24h >= 0;

  return (
    <Layout>
      <div className="container py-8 pb-16">
        <BackLink to={`/category/${categoryId}`} label={`Back to ${industry.name}`} />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <TokenIcon symbol={project.symbol} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-white md:text-3xl">
                  {project.name}
                </h1>
                {project.verified && (
                  <BadgeCheck className="h-5 w-5 text-sky-400" aria-label="Verified" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {project.symbol} · {industry.name} · {project.age} old
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-muted-foreground">Price</p>
              <p className="text-lg font-semibold text-white">{project.price}</p>
            </div>
            <div>
              <p className="text-muted-foreground">24H</p>
              <p className={`text-lg font-semibold ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {positive ? '+' : ''}
                {project.change24h.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">MCAP</p>
              <p className="text-lg font-semibold text-sky-400">{project.marketCap}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Wallet</p>
              <p className="text-lg font-semibold text-emerald-400">{details.marketingWallet.balance}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {project.utilities.map((utility) => (
            <span
              key={utility}
              className="rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-300"
            >
              {utility}
            </span>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-white/10 bg-[#0a0e17]/80 p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-1 rounded-lg border border-white/10 p-1">
                  <button
                    type="button"
                    onClick={() => setChartTab('wallet')}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      chartTab === 'wallet'
                        ? 'bg-sky-500/20 text-sky-400'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Wallet className="mr-1 inline h-3 w-3" />
                    Marketing wallet
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartTab('price')}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      chartTab === 'price'
                        ? 'bg-sky-500/20 text-sky-400'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Price · 24H
                  </button>
                </div>
                {chartTab === 'wallet' && (
                  <p className="text-xs text-muted-foreground">
                    Next: {details.marketingWallet.nextAdSpend}
                  </p>
                )}
              </div>

              {chartTab === 'wallet' ? (
                <MarketingWalletChart
                  history={walletHistory}
                  milestones={walletMilestones}
                  currentBalance={walletBalance}
                />
              ) : (
                <PriceChart history={priceHistory} change24h={project.change24h} />
              )}
            </div>

            {chartTab === 'wallet' && (
              <div className="mt-4 space-y-2">
                <h2 className="text-sm font-semibold text-white">Ad spend milestones</h2>
                {walletMilestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={`flex items-start justify-between gap-4 rounded-lg border px-4 py-3 ${
                      milestone.status === 'completed'
                        ? 'border-emerald-500/25 bg-emerald-500/5'
                        : milestone.status === 'active'
                          ? 'border-sky-500/30 bg-sky-500/5'
                          : 'border-white/10 bg-white/[0.02]'
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-white">{milestone.title}</p>
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {milestone.vendor}
                        </span>
                        {milestone.status === 'completed' && (
                          <span className="text-[10px] font-medium text-emerald-400">Unlocked</span>
                        )}
                        {milestone.status === 'active' && (
                          <span className="text-[10px] font-medium text-sky-400">Next up</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{milestone.description}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-foreground">
                      ${milestone.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <TradePanel
              symbol={project.symbol}
              price={project.price}
              taxRate={details.marketingWallet.taxRate}
            />

            <button
              type="button"
              onClick={() => setShowRoadmap(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/10"
            >
              <Map className="h-4 w-4 text-sky-400" />
              View full roadmap
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link to={`/category/${categoryId}`} className="hover:text-foreground">
            ← More {industry.name} projects
          </Link>
        </p>
      </div>

      {showRoadmap && (
        <RoadmapModal
          project={project}
          details={details}
          onClose={() => setShowRoadmap(false)}
        />
      )}
    </Layout>
  );
}
