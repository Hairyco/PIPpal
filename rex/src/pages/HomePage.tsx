import { useMemo, useState } from 'react';
import {
  BarChart3,
  Bell,
  Bot,
  ChevronDown,
  ChevronRight,
  Clock3,
  Flame,
  Menu,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trophy,
  Users,
} from 'lucide-react';

type Project = {
  rank: number;
  name: string;
  ticker: string;
  chain: 'SOL' | 'ETH' | 'BASE';
  stage: 'Forming' | 'Voting' | 'Relaunching' | 'Live';
  community: string;
  votes: number;
  change: number;
  score: number;
  colors: string;
  promoted?: boolean;
};

const projects: Project[] = [
  { rank: 1, name: 'Moon Pigeon', ticker: 'MPEG', chain: 'SOL', stage: 'Voting', community: '4.8K', votes: 684, change: 34.8, score: 92, colors: 'from-fuchsia-400 to-violet-700', promoted: true },
  { rank: 2, name: 'Terminal Frog', ticker: 'TFROG', chain: 'SOL', stage: 'Forming', community: '2.1K', votes: 441, change: 22.4, score: 87, colors: 'from-lime-300 to-emerald-700', promoted: true },
  { rank: 3, name: 'Based Martian', ticker: 'BMARS', chain: 'BASE', stage: 'Relaunching', community: '8.4K', votes: 319, change: 18.1, score: 79, colors: 'from-sky-400 to-blue-700' },
  { rank: 4, name: 'Degen Hotline', ticker: 'CALL', chain: 'ETH', stage: 'Voting', community: '1.6K', votes: 208, change: 11.6, score: 73, colors: 'from-orange-300 to-red-700' },
  { rank: 5, name: 'Pixel Goblin', ticker: 'GOB', chain: 'SOL', stage: 'Forming', community: '6.2K', votes: 186, change: 8.3, score: 68, colors: 'from-cyan-300 to-teal-700' },
  { rank: 6, name: 'Exit Liquidity', ticker: 'EXIT', chain: 'BASE', stage: 'Live', community: '3.7K', votes: 144, change: -4.2, score: 61, colors: 'from-amber-300 to-orange-700' },
  { rank: 7, name: 'Night Shift', ticker: 'NITE', chain: 'SOL', stage: 'Voting', community: '980', votes: 121, change: 6.8, score: 58, colors: 'from-indigo-300 to-purple-800' },
  { rank: 8, name: 'Rug Survivor', ticker: 'SURV', chain: 'ETH', stage: 'Forming', community: '1.2K', votes: 97, change: 3.1, score: 54, colors: 'from-rose-300 to-pink-700' },
];

const tickerProjects = projects.slice(0, 6);
const shortcuts = [
  { label: 'Top Today', icon: Clock3 },
  { label: 'Top All Time', icon: Trophy },
  { label: 'New CTOs', icon: Sparkles },
  { label: 'Trending', icon: Flame },
];
const categories = ['All', 'Solana', 'Ethereum', 'Base', 'Meme', 'AI', 'DeFi'];

function ProjectMark({ project, size = 'h-10 w-10' }: { project: Project; size?: string }) {
  return (
    <div className={`${size} grid shrink-0 place-items-center rounded-full bg-gradient-to-br ${project.colors} text-[11px] font-bold text-white ring-2 ring-white/10`}>
      {project.ticker.slice(0, 2)}
    </div>
  );
}

function StageBadge({ stage }: { stage: Project['stage'] }) {
  const styles: Record<Project['stage'], string> = {
    Forming: 'bg-sky-400/10 text-sky-300',
    Voting: 'bg-violet-400/10 text-violet-300',
    Relaunching: 'bg-amber-300/10 text-amber-200',
    Live: 'bg-lime-300/10 text-lime-300',
  };

  return <span className={`rounded-md px-2 py-1 text-[10px] font-semibold ${styles[stage]}`}>{stage}</span>;
}

export function HomePage() {
  const [query, setQuery] = useState('');
  const [activeShortcut, setActiveShortcut] = useState('Top Today');
  const [activeCategory, setActiveCategory] = useState('All');

  const visibleProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesQuery =
        !normalized ||
        project.name.toLowerCase().includes(normalized) ||
        project.ticker.toLowerCase().includes(normalized);
      const matchesCategory =
        activeCategory === 'All' ||
        project.chain.toLowerCase() === activeCategory.toLowerCase();
      return matchesQuery && matchesCategory;
    });
  }, [query, activeCategory]);

  return (
    <div className="min-h-screen bg-[#070912] text-[#f5f7fb]">
      <div className="border-b border-white/[0.06] bg-[#0a0c16]">
        <div className="mx-auto flex h-9 max-w-7xl items-center overflow-hidden px-3 sm:px-5">
          <div className="mr-4 flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#c8ff3d]">
            <Flame className="h-3.5 w-3.5 fill-[#c8ff3d]" />
            <span className="hidden sm:inline">Trending</span>
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex min-w-max animate-scroll-left items-center gap-8 text-[11px] text-white/50">
              {[...tickerProjects, ...tickerProjects].map((project, index) => (
                <span key={`${project.ticker}-${index}`} className="flex items-center gap-2">
                  <span className="text-white/25">#{project.rank}</span>
                  <span className="font-semibold text-white/85">${project.ticker}</span>
                  <span className={project.change >= 0 ? 'text-lime-300' : 'text-rose-400'}>
                    {project.change >= 0 ? '+' : ''}{project.change}%
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <header className="border-b border-white/[0.07] bg-[#090b14]">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-5">
          <a href="/" className="flex shrink-0 items-center gap-2" aria-label="CTO home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#c8ff3d] text-[#090b14]">
              <RotateCcw className="h-5 w-5 stroke-[2.6]" />
            </span>
            <div className="hidden sm:block">
              <p className="font-serif text-lg font-bold leading-none tracking-tight">CTO</p>
              <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-white/30">Community takeover</p>
            </div>
          </a>

          <label className="relative ml-auto min-w-0 flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.045] pl-9 pr-9 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#c8ff3d]/40"
            />
            <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-white/10 px-1.5 py-0.5 text-[9px] text-white/25 sm:block">/</span>
          </label>

          <button type="button" className="hidden h-10 items-center gap-2 rounded-lg bg-[#c8ff3d] px-4 text-xs font-bold text-[#090b14] transition hover:bg-[#d7ff70] md:flex">
            <Plus className="h-4 w-4" /> Submit CTO
          </button>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-lg text-white/60 hover:bg-white/5" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </button>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-lg text-white/60 hover:bg-white/5" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <nav className="border-b border-white/[0.06] bg-[#090b14]">
        <div className="hide-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-3 py-3 sm:px-5">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            const active = activeShortcut === shortcut.label;
            return (
              <button
                key={shortcut.label}
                type="button"
                onClick={() => setActiveShortcut(shortcut.label)}
                className={`flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2.5 text-xs font-semibold transition ${
                  active
                    ? 'border-[#c8ff3d]/30 bg-[#c8ff3d]/10 text-[#d5ff69]'
                    : 'border-white/[0.07] bg-white/[0.025] text-white/55 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {shortcut.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-5">
        <section className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#111525]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_30%,rgba(200,255,61,0.13),transparent_35%),radial-gradient(circle_at_86%_50%,rgba(124,58,237,0.25),transparent_38%)]" />
          <div className="relative grid min-h-[190px] gap-5 p-5 sm:p-7 md:grid-cols-[1fr_auto] md:items-center">
            <div className="max-w-2xl">
              <h1 className="font-serif text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                Find the next community takeover.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/48">
                Track abandoned projects, discover active communities, and follow relaunches from proposal to takeover.
              </p>
              <div className="mt-5 overflow-hidden">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                  Trending now
                </p>
                <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1">
                  {tickerProjects.map((project) => (
                    <button
                      key={project.ticker}
                      type="button"
                      className="flex shrink-0 items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.04] py-1.5 pl-1.5 pr-3.5 transition hover:border-[#c8ff3d]/25 hover:bg-white/[0.07]"
                    >
                      <ProjectMark project={project} size="h-8 w-8" />
                      <span className="text-left">
                        <span className="block text-[11px] font-bold leading-none">${project.ticker}</span>
                        <span className={`mt-1 block text-[10px] font-semibold leading-none ${project.change >= 0 ? 'text-lime-300' : 'text-rose-400'}`}>
                          {project.change >= 0 ? '+' : ''}{project.change}%
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden h-32 w-52 md:block">
              <div className="relative h-full w-full">
                <div className="absolute left-7 top-3 grid h-20 w-20 place-items-center rounded-3xl bg-violet-500/20 text-violet-300 ring-1 ring-violet-400/20">
                  <Users className="h-9 w-9" />
                </div>
                <div className="absolute bottom-1 right-6 grid h-20 w-20 place-items-center rounded-3xl bg-[#c8ff3d]/15 text-[#c8ff3d] ring-1 ring-[#c8ff3d]/20">
                  <RotateCcw className="h-9 w-9" />
                </div>
                <div className="absolute right-14 top-10 h-px w-16 rotate-12 bg-gradient-to-r from-violet-400 to-[#c8ff3d]" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold">Promoted CTOs</h2>
            <button type="button" className="text-xs font-semibold text-[#c8ff3d]">Promote</button>
          </div>
          <div className="hide-scrollbar -mx-3 flex gap-3 overflow-x-auto px-3 pb-1 sm:-mx-5 sm:px-5">
            {projects.filter((project) => project.promoted).map((project) => (
              <article
                key={project.ticker}
                className="group w-[min(100%,300px)] shrink-0 rounded-xl border border-white/[0.08] bg-[#0d101b] p-4 transition hover:border-[#c8ff3d]/20"
              >
                <div className="flex items-center gap-3">
                  <ProjectMark project={project} size="h-12 w-12" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold">${project.ticker}</p>
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-[#c8ff3d] text-[9px] font-black text-black">✓</span>
                    </div>
                    <p className="truncate text-xs text-white/35">{project.name}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm font-semibold">{project.votes.toLocaleString()} votes</p>
                    <p className="text-xs font-semibold text-lime-300">+{project.change}%</p>
                  </div>
                  <Star className="ml-1 h-4 w-4 text-white/20 group-hover:text-[#c8ff3d]" />
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-white/[0.05] pt-3">
                  <StageBadge stage={project.stage} />
                  <span className="text-[10px] text-white/30">{project.chain}</span>
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-white/40"><Users className="h-3 w-3" /> {project.community}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_250px]">
          <section>
            <div className="mb-4">
              <h2 className="font-serif text-2xl font-bold">Top CTOs Today</h2>
              <p className="mt-1 text-xs text-white/35">Community takeovers ranked by activity over the last 24 hours.</p>
            </div>

            <div className="hide-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                    activeCategory === category
                      ? 'bg-white text-[#090b14]'
                      : 'border border-white/[0.07] bg-white/[0.025] text-white/45'
                  }`}
                >
                  {category}
                </button>
              ))}
              <button type="button" className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.07] px-3 py-2 text-[11px] text-white/45">
                <SlidersHorizontal className="h-3 w-3" /> Filters
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d101b]">
              <div className="hidden grid-cols-[42px_1.6fr_.7fr_.7fr_.7fr_30px] gap-3 border-b border-white/[0.06] px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-white/25 sm:grid">
                <span>#</span><span>Project</span><span>Stage</span><span>Community</span><span>24h</span><span />
              </div>
              {visibleProjects.map((project) => (
                <article
                  key={project.ticker}
                  className="group grid grid-cols-[34px_1fr_auto] items-center gap-3 border-b border-white/[0.055] px-3 py-3.5 last:border-0 hover:bg-white/[0.025] sm:grid-cols-[42px_1.6fr_.7fr_.7fr_.7fr_30px] sm:px-4"
                >
                  <span className={`text-center text-xs font-bold ${project.rank <= 3 ? 'text-[#c8ff3d]' : 'text-white/25'}`}>{project.rank}</span>
                  <div className="flex min-w-0 items-center gap-3">
                    <ProjectMark project={project} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">{project.name}</p>
                        <span className="text-[9px] text-white/25">{project.chain}</span>
                      </div>
                      <p className="text-[11px] text-white/35">${project.ticker} · {project.votes} votes</p>
                    </div>
                  </div>
                  <div className="hidden sm:block"><StageBadge stage={project.stage} /></div>
                  <div className="hidden items-center gap-1.5 text-xs text-white/50 sm:flex"><Users className="h-3.5 w-3.5 text-white/20" />{project.community}</div>
                  <div className={`text-right text-xs font-semibold ${project.change >= 0 ? 'text-lime-300' : 'text-rose-400'}`}>
                    {project.change >= 0 ? '+' : ''}{project.change}%
                  </div>
                  <ChevronRight className="hidden h-4 w-4 text-white/15 transition group-hover:translate-x-0.5 group-hover:text-[#c8ff3d] sm:block" />
                </article>
              ))}
              {visibleProjects.length === 0 && (
                <div className="px-4 py-12 text-center text-sm text-white/35">No projects found.</div>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-xl border border-white/[0.08] bg-[#0d101b] p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Trending chains</h3>
                <BarChart3 className="h-4 w-4 text-white/25" />
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { chain: 'Solana', projects: 128, width: '82%' },
                  { chain: 'Base', projects: 76, width: '55%' },
                  { chain: 'Ethereum', projects: 41, width: '34%' },
                ].map((item) => (
                  <div key={item.chain}>
                    <div className="mb-1.5 flex justify-between text-[11px]">
                      <span className="text-white/55">{item.chain}</span>
                      <span className="text-white/25">{item.projects} CTOs</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#c8ff3d] to-violet-500" style={{ width: item.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-violet-400/15 bg-gradient-to-br from-violet-500/15 to-[#0d101b] p-4">
              <span className="text-[9px] font-bold uppercase tracking-wider text-violet-300">Telegram bot</span>
              <h3 className="mt-2 font-serif text-lg font-bold">Found an abandoned project?</h3>
              <p className="mt-2 text-xs leading-5 text-white/40">Submit its contract and community to start a takeover proposal.</p>
              <button type="button" className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#2aabee] py-2.5 text-xs font-semibold">
                <Bot className="h-4 w-4" /> Open Telegram
              </button>
            </div>
          </aside>
        </div>

        <div className="mt-7 flex justify-center">
          <button type="button" className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-xs font-semibold text-white/55 hover:text-white">
            Load more projects <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </main>

      <footer className="mt-10 border-t border-white/[0.06] bg-[#070912]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 text-[11px] text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-[#c8ff3d] text-[#090b14]"><RotateCcw className="h-3.5 w-3.5" /></span>
            <span>CTO community discovery</span>
          </div>
          <div className="flex gap-5"><span>Terms</span><span>Privacy</span><span>Contact</span></div>
        </div>
      </footer>
    </div>
  );
}
