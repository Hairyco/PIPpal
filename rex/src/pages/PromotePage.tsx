import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowUp, Megaphone, Sparkles, Wallet } from 'lucide-react';
import { Layout, BackLink } from '../components/Layout';
import { TokenIcon } from '../components/TokenIcon';
import { DemoPreviewBadge } from '../components/promote/DemoPreviewBadge';
import { AffiliateProgramDemo } from '../components/promote/AffiliateProgramDemo';
import { categoryBoostTiers } from '../data/promotePricing';
import { getProject } from '../data/categoryContent';
import { industries } from '../data/industries';

function slugSymbol(name: string): string {
  const slug = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
  return slug || 'COIN';
}

export function PromotePage() {
  const { categoryId, projectId } = useParams<{ categoryId: string; projectId: string }>();
  const [searchParams] = useSearchParams();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const industry = industries.find((i) => i.id === categoryId);
  const isNewLaunch = projectId === 'new';
  const launchName = searchParams.get('name')?.trim() || 'Your Project';

  const project =
    categoryId && projectId && !isNewLaunch ? getProject(categoryId, projectId) : null;

  const projectName = isNewLaunch ? launchName : project?.name ?? 'Project';
  const symbol = isNewLaunch ? slugSymbol(launchName) : project?.symbol ?? 'COIN';

  if (!categoryId || !industry) {
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

  if (!isNewLaunch && !project) {
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

  const projectPath = isNewLaunch
    ? `/get-started`
    : `/project/${categoryId}/${projectId}`;

  return (
    <Layout>
      <div className="container py-8 pb-16">
        <BackLink to={projectPath} label={isNewLaunch ? 'Back' : `Back to ${projectName}`} />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <TokenIcon symbol={symbol} size="lg" />
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-sky-400">Promote</p>
              <h1 className="font-serif text-2xl font-bold text-white md:text-3xl">{projectName}</h1>
              <p className="text-sm text-muted-foreground">
                {symbol} · {industry.name} · Fund boosts from your marketing wallet
              </p>
            </div>
          </div>
          {!isNewLaunch && (
            <Link to={projectPath} className="dex-btn shrink-0">
              View project page
            </Link>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
            <div>
              <p className="text-sm font-medium text-white">Marketing wallet</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Buy/sell tax on every trade fills this wallet. Category boosts and affiliate
                payouts always come from here — no separate checkout or founder top-up.
              </p>
            </div>
          </div>
          <p className="shrink-0 text-sm font-semibold text-sky-300 sm:text-right">
            $2,430 available
            <span className="ml-1 text-xs font-normal text-muted-foreground">(demo)</span>
          </p>
        </div>

        <section className="dex-card mt-6">
          <div className="relative z-[1] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-sky-400" />
              <span className="text-xs font-medium uppercase tracking-wider text-sky-400">
                Category listing
              </span>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Rank higher in {industry.name}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Boost where your project appears on the category page. Higher tiers get pinned slots
              and badges — costs are taken from your marketing wallet when you activate a boost.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {categoryBoostTiers.map((tier) => {
                const selected = selectedTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTier(tier.id)}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      selected
                        ? 'border-sky-500/50 bg-sky-500/10'
                        : tier.highlight
                          ? 'border-sky-500/25 bg-sky-500/5 hover:border-sky-500/40'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                    }`}
                  >
                    {tier.highlight && (
                      <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-sky-300">
                        <Sparkles className="h-3 w-3" />
                        Best value
                      </span>
                    )}
                    <p className="font-semibold text-white">{tier.name}</p>
                    <p className="mt-1 text-2xl font-bold text-sky-400">
                      ${tier.price}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{tier.period}
                      </span>
                    </p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-sky-400/80">
                      From marketing wallet
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">{tier.description}</p>
                    <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-300">
                      <ArrowUp className="h-3 w-3" />
                      {tier.position}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-[#0a0e17]/60 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Category preview — {industry.name}
              </p>
              <ol className="mt-3 space-y-2">
                {selectedTier === 'spotlight' && (
                  <li className="flex items-center gap-3 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2">
                    <span className="text-xs font-bold text-sky-400">1</span>
                    <TokenIcon symbol={symbol} size="sm" />
                    <span className="text-sm font-medium text-white">{projectName}</span>
                    <span className="ml-auto rounded-full bg-sky-500/30 px-2 py-0.5 text-[10px] font-semibold text-sky-200">
                      Spotlight
                    </span>
                  </li>
                )}
                <li className="flex items-center gap-3 rounded-lg border border-white/5 px-3 py-2 opacity-60">
                  <span className="text-xs text-muted-foreground">1</span>
                  <span className="text-sm text-muted-foreground">SwiftieCoin</span>
                </li>
                <li className="flex items-center gap-3 rounded-lg border border-white/5 px-3 py-2 opacity-60">
                  <span className="text-xs text-muted-foreground">2</span>
                  <span className="text-sm text-muted-foreground">KardashKoin</span>
                </li>
                {(selectedTier === 'featured' || selectedTier === 'boosted') && (
                  <li className="flex items-center gap-3 rounded-lg border border-sky-500/30 bg-sky-500/5 px-3 py-2">
                    <span className="text-xs font-bold text-sky-400">
                      {selectedTier === 'featured' ? '2' : '4'}
                    </span>
                    <TokenIcon symbol={symbol} size="sm" />
                    <span className="text-sm font-medium text-white">{projectName}</span>
                    {selectedTier === 'featured' && (
                      <span className="ml-auto text-[10px] font-medium text-sky-300">Featured</span>
                    )}
                  </li>
                )}
              </ol>
            </div>

            <button
              type="button"
              disabled={!selectedTier}
              className="dex-btn-green mt-6 w-full justify-center sm:w-auto disabled:cursor-not-allowed disabled:opacity-40"
            >
              {selectedTier
                ? `Activate boost — $${categoryBoostTiers.find((t) => t.id === selectedTier)?.price} from wallet`
                : 'Select a boost tier'}
            </button>
          </div>
        </section>

        <div className="mt-8">
          <AffiliateProgramDemo projectName={projectName} symbol={symbol} />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Category boosts and affiliate payouts always come from your marketing wallet. Demo mode —{' '}
          <DemoPreviewBadge className="align-middle" /> on affiliate programme; full build TBC.
        </p>
      </div>
    </Layout>
  );
}
