import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BackLink, Layout } from '../components/Layout';
import { CategoryBanner } from '../components/category/CategoryBanner';
import { ProjectsTable } from '../components/category/ProjectsTable';
import { IdeasPanel } from '../components/category/IdeasPanel';
import { TrendingCelebrities } from '../components/category/TrendingCelebrities';
import { getCategoryContent } from '../data/categoryContent';
import { industries } from '../data/industries';

type Tab = 'projects' | 'ideas';

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [tab, setTab] = useState<Tab>('projects');

  const industry = industries.find((i) => i.id === categoryId);
  const content = getCategoryContent(categoryId ?? '');

  if (!industry) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Category not found.</p>
          <div className="mt-4">
            <BackLink />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 pb-16">
        <BackLink />

        <div className="mt-6">
          <CategoryBanner
            industry={industry}
            activeCount={content.projects.length}
            ideasCount={content.ideas.length}
          />
        </div>

        {categoryId === 'celebrity-coins' && (
          <div className="mt-8">
            <TrendingCelebrities />
          </div>
        )}

        <div className="mt-8 border-b border-white/10">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setTab('projects')}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === 'projects'
                  ? 'border-sky-400 text-white'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Active Projects
              <span className="ml-2 rounded-full bg-sky-500/20 px-2 py-0.5 text-xs text-sky-400">
                {content.projects.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab('ideas')}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === 'ideas'
                  ? 'border-sky-400 text-white'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Project Ideas
              <span className="ml-2 rounded-full bg-sky-500/20 px-2 py-0.5 text-xs text-sky-400">
                {content.ideas.length}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6">
          {tab === 'projects' ? (
            <ProjectsTable projects={content.projects} categoryId={categoryId ?? ''} />
          ) : (
            <IdeasPanel ideas={content.ideas} />
          )}
        </div>

        <div className="mt-10 text-center">
          <Link to="/categories" className="text-sm text-muted-foreground hover:text-foreground">
            ← Browse all categories
          </Link>
        </div>
      </div>
    </Layout>
  );
}
