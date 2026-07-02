import { useMemo, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Layout } from '../components/Layout';
import { LaunchingSoonSection } from '../components/LaunchingSoonSection';
import { ProjectsTable } from '../components/category/ProjectsTable';
import { getAllTradeProjects } from '../data/allTradeProjects';
import { industries } from '../data/industries';
import { loadFounderProject, projectSymbol } from '../utils/founderProject';
import type { LaunchingSoonProject } from '../data/launchingSoon';

type TradeSection = 'launching-soon' | 'trending';

const SECTION_PILLS: { id: TradeSection; label: string }[] = [
  { id: 'trending', label: 'Trending' },
  { id: 'launching-soon', label: 'Launching soon' },
];

export function TradePage() {
  const [section, setSection] = useState<TradeSection>('trending');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const allProjects = useMemo(() => getAllTradeProjects(), []);

  const founderStagingProject = useMemo((): LaunchingSoonProject | null => {
    const founder = loadFounderProject();
    if (!founder || founder.launchMode !== 'staging') return null;
    const category = industries.find((i) => i.id === founder.categoryId);
    return {
      id: 'founder-project',
      name: founder.projectName,
      symbol: projectSymbol(founder.projectName),
      categoryId: founder.categoryId,
      categoryName: category?.name ?? founder.categoryId,
      tagline: founder.description,
      targetLaunchDate: founder.stagingLaunchDate ?? founder.launchedAt.slice(0, 10),
      followerCount: 1,
      likeCount: 0,
      commentCount: 0,
    };
  }, []);

  const filteredProjects = useMemo(() => {
    if (categoryFilter === 'all') return allProjects;
    return allProjects.filter((p) => p.categoryId === categoryFilter);
  }, [allProjects, categoryFilter]);

  const activeCategory = industries.find((i) => i.id === categoryFilter);

  return (
    <Layout>
      <div className="container py-8 pb-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-sky-400" />
              <p className="text-sm font-medium uppercase tracking-wider text-sky-400">Trade</p>
            </div>
            <h1 className="mt-2 font-serif text-3xl font-bold text-white md:text-4xl">
              All Rex coins
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Browse launching soon projects or trade live coins across every category.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {SECTION_PILLS.map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setSection(pill.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                section === pill.id
                  ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40'
                  : 'border border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-foreground'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {section === 'launching-soon' && (
          <div className="mt-8">
            <LaunchingSoonSection founderProject={founderStagingProject} showHeader={false} />
          </div>
        )}

        {section === 'trending' && (
          <>
            <div className="mt-8">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    categoryFilter === 'all'
                      ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40'
                      : 'border border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-foreground'
                  }`}
                >
                  All categories
                </button>
                {industries.map((industry) => (
                  <button
                    key={industry.id}
                    type="button"
                    onClick={() => setCategoryFilter(industry.id)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      categoryFilter === industry.id
                        ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40'
                        : 'border border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-foreground'
                    }`}
                  >
                    {industry.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Trending
                </p>
                <p className="text-sm text-muted-foreground">
                  {filteredProjects.length} coin{filteredProjects.length === 1 ? '' : 's'}
                  {activeCategory ? ` in ${activeCategory.name}` : ''}
                </p>
              </div>
              <ProjectsTable projects={filteredProjects} showCategory />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
