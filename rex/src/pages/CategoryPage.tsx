import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BackLink, Layout } from '../components/Layout';
import { ProjectsTable } from '../components/category/ProjectsTable';
import { IdeasPanel } from '../components/category/IdeasPanel';
import { getCategoryContent } from '../data/categoryContent';
import { industries } from '../data/industries';

type Tab = 'projects' | 'ideas';

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [tab, setTab] = useState<Tab>('ideas');

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

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{industry.tag}</p>
            <h1 className="font-serif text-3xl font-bold text-white md:text-4xl">
              {industry.name}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {industry.description}
            </p>
          </div>

          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-muted-foreground">Active</p>
              <p className="text-lg font-semibold text-sky-400">
                {content.projects.length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Ideas</p>
              <p className="text-lg font-semibold text-foreground">
                {content.ideas.length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="text-lg font-semibold text-foreground">
                {industry.projectCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-b border-white/10">
          <div className="flex gap-1">
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
            </button>
          </div>
        </div>

        <div className="mt-6">
          {tab === 'projects' ? (
            <ProjectsTable projects={content.projects} />
          ) : (
            <IdeasPanel ideas={content.ideas} />
          )}
        </div>

        <div className="mt-10 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Browse all categories
          </Link>
        </div>
      </div>
    </Layout>
  );
}
