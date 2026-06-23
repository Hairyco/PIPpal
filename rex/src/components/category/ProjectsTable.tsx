import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Map, Wallet } from 'lucide-react';
import type { ActiveProject } from '../../data/categoryContent';
import { TokenIcon } from '../TokenIcon';
import { getProjectDetails, getMilestoneProgress } from '../../data/projectDetails';
import { RoadmapModal } from './RoadmapModal';

type View = 'trending' | 'gainers' | 'mcap' | 'marketing';

function projectPath(categoryId: string, project: ActiveProject) {
  return `/project/${categoryId}/${project.id}`;
}

function ChangeCell({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={positive ? 'text-emerald-400' : 'text-rose-400'}>
      {positive ? '+' : ''}
      {value.toFixed(1)}%
    </span>
  );
}

function UtilityPills({ utilities }: { utilities: string[] }) {
  return (
    <div className="flex max-w-[200px] flex-wrap gap-1">
      {utilities.map((utility) => (
        <span
          key={utility}
          className="rounded-full border border-sky-500/25 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-300"
        >
          {utility}
        </span>
      ))}
    </div>
  );
}

function MilestoneBar({ project }: { project: ActiveProject }) {
  const { done, total } = getMilestoneProgress(getProjectDetails(project).milestones);
  const pct = (done / total) * 100;
  return (
    <div className="min-w-[80px]">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{done}/{total}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-sky-500/70 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ProjectsTable({
  projects,
  categoryId,
}: {
  projects: ActiveProject[];
  categoryId: string;
}) {
  const [view, setView] = useState<View>('trending');
  const [modalProject, setModalProject] = useState<ActiveProject | null>(null);

  const sorted = [...projects].sort((a, b) => {
    if (view === 'mcap') {
      return parseFloat(b.marketCap.replace(/[$KM]/g, '')) - parseFloat(a.marketCap.replace(/[$KM]/g, ''));
    }
    if (view === 'gainers') return b.change24h - a.change24h;
    if (view === 'marketing') {
      const balA = parseFloat(getProjectDetails(a).marketingWallet.balance.replace(/[$,]/g, ''));
      const balB = parseFloat(getProjectDetails(b).marketingWallet.balance.replace(/[$,]/g, ''));
      return balB - balA;
    }
    return a.rank - b.rank;
  });

  const modalDetails = modalProject ? getProjectDetails(modalProject) : null;

  const viewButtons: { key: View; label: string }[] = [
    { key: 'trending', label: 'Trending' },
    { key: 'gainers', label: 'Gainers' },
    { key: 'mcap', label: 'Top MCAP' },
    { key: 'marketing', label: 'Marketing Wallet' },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {viewButtons.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              view === key
                ? 'bg-sky-500/20 text-sky-400'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            }`}
          >
            {key === 'marketing' && <Wallet className="mr-1 inline h-3 w-3" />}
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {projects.length} active projects
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0a0e17]/80">
        {view === 'marketing' ? (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Wallet balance</th>
                <th className="px-4 py-3 font-medium">Ad threshold</th>
                <th className="px-4 py-3 font-medium">Next spend</th>
                <th className="px-4 py-3 font-medium">Tax rate</th>
                <th className="px-4 py-3 font-medium">Milestones</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((project, i) => {
                const d = getProjectDetails(project);
                const balance = parseFloat(d.marketingWallet.balance.replace(/[$,]/g, ''));
                const threshold = parseFloat(d.marketingWallet.threshold.replace(/[$,]/g, ''));
                const ready = balance >= threshold;
                return (
                  <tr
                    key={project.id}
                    className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <TokenIcon symbol={project.symbol} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={projectPath(categoryId, project)}
                              className="font-medium text-foreground hover:text-sky-400"
                            >
                              {project.name}
                            </Link>
                            {project.verified && (
                              <BadgeCheck className="h-3.5 w-3.5 text-sky-400" aria-label="KYC verified" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{project.symbol}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-emerald-400">{d.marketingWallet.balance}</span>
                      <p className="text-[10px] text-muted-foreground">
                        {d.marketingWallet.lifetimeSpent} spent
                      </p>
                    </td>
                    <td className="px-4 py-3 text-foreground">{d.marketingWallet.threshold}</td>
                    <td className="px-4 py-3">
                      <span className={ready ? 'text-sky-400' : 'text-muted-foreground'}>
                        {d.marketingWallet.nextAdSpend}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{d.marketingWallet.taxRate}</td>
                    <td className="px-4 py-3">
                      <MilestoneBar project={project} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setModalProject(project)}
                        className="dex-btn text-xs"
                      >
                        <Map className="mr-1 inline h-3 w-3" />
                        Roadmap
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Utility</th>
                <th className="px-4 py-3 font-medium">MCAP</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">24H</th>
                <th className="px-4 py-3 font-medium">Age</th>
                <th className="px-4 py-3 font-medium">Milestones</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((project, i) => (
                <tr
                  key={project.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <TokenIcon symbol={project.symbol} />
                      <div>
                        <div className="flex items-center gap-1.5">
                            <Link
                              to={projectPath(categoryId, project)}
                              className="font-medium text-foreground hover:text-sky-400"
                            >
                              {project.name}
                            </Link>
                          {project.verified && (
                            <BadgeCheck className="h-3.5 w-3.5 text-sky-400" aria-label="KYC verified" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{project.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <UtilityPills utilities={project.utilities} />
                  </td>
                  <td className="px-4 py-3 font-medium text-sky-400">{project.marketCap}</td>
                  <td className="px-4 py-3 text-foreground">{project.price}</td>
                  <td className="px-4 py-3">
                    <ChangeCell value={project.change24h} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{project.age}</td>
                  <td className="px-4 py-3">
                    <MilestoneBar project={project} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setModalProject(project)}
                        className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-white/5"
                      >
                        <Map className="mr-1 inline h-3 w-3" />
                        Roadmap
                      </button>
                      <Link to={projectPath(categoryId, project)} className="dex-btn text-xs">
                        Trade
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalProject && modalDetails && (
        <RoadmapModal
          project={modalProject}
          details={modalDetails}
          onClose={() => setModalProject(null)}
        />
      )}
    </div>
  );
}
