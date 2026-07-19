import { useMemo, useState } from 'react';
import {
  BarChart3,
  Bell,
  Bot,
  ChevronDown,
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
  Wallet,
  Zap,
} from 'lucide-react';

type Project = {
  rank: number;
  name: string;
  ticker: string;
  chain: 'SOL';
  category: 'Meme' | 'AI' | 'DeFi';
  stage: 'Forming' | 'Voting' | 'Relaunching' | 'Live';
  community: string;
  votes: number;
  votesToday: number;
  price: string;
  change1h: number | null;
  change6h: number | null;
  change24h: number;
  marketCap: string;
  fdv: string;
  volume24h: string;
  marketingWallet: string;
  marketingBalance: string;
  raidsActive: number;
  raidsJoined: string;
  roadmapMilestone: string;
  roadmapDone: number;
  roadmapTotal: number;
  score: number;
  colors: string;
  logo: string;
  verified?: boolean;
  boost?: number;
  promoted?: boolean;
};

const projects: Project[] = [
  { rank: 1, name: 'Moon Pigeon', ticker: 'MPEG', chain: 'SOL', category: 'Meme', stage: 'Voting', community: '4.8K', votes: 3660, votesToday: 50, price: '$0.000421', change1h: 2.4, change6h: 9.98, change24h: 34.8, marketCap: '$842K', fdv: '$1.2M', volume24h: '$186K', marketingWallet: '7xA2…mPeg', marketingBalance: '48.2 SOL', raidsActive: 3, raidsJoined: '1.2K', roadmapMilestone: 'Marketing fund threshold', roadmapDone: 3, roadmapTotal: 8, score: 92, colors: 'from-fuchsia-400 to-violet-700', logo: '/meme-logos/peponk.png', verified: true, boost: 50 },
  { rank: 2, name: 'Terminal Frog', ticker: 'TFROG', chain: 'SOL', category: 'Meme', stage: 'Forming', community: '2.1K', votes: 1860, votesToday: 36, price: '$0.000187', change1h: -1.1, change6h: 4.2, change24h: 22.4, marketCap: '$412K', fdv: '$690K', volume24h: '$94K', marketingWallet: 'Fg9k…frog', marketingBalance: '21.6 SOL', raidsActive: 2, raidsJoined: '840', roadmapMilestone: 'Community channels live', roadmapDone: 2, roadmapTotal: 8, score: 87, colors: 'from-lime-300 to-emerald-700', logo: '/meme-logos/tendies.png', verified: true, boost: 36 },
  { rank: 3, name: 'Lunar Martian', ticker: 'LMARS', chain: 'SOL', category: 'AI', stage: 'Relaunching', community: '8.4K', votes: 1190, votesToday: 25, price: '$0.001104', change1h: 0.8, change6h: -2.4, change24h: 18.1, marketCap: '$1.1M', fdv: '$2.4M', volume24h: '$255K', marketingWallet: 'Lm9r…mars', marketingBalance: '62.4 SOL', raidsActive: 5, raidsJoined: '2.4K', roadmapMilestone: 'Supplier assigned', roadmapDone: 5, roadmapTotal: 10, score: 79, colors: 'from-sky-400 to-blue-700', logo: '/meme-logos/lunar-lad.png', verified: true, boost: 25 },
  { rank: 4, name: 'Degen Hotline', ticker: 'CALL', chain: 'SOL', category: 'Meme', stage: 'Voting', community: '1.6K', votes: 1400, votesToday: 13, price: '$0.000062', change1h: null, change6h: 1.6, change24h: 11.6, marketCap: '$220K', fdv: '$410K', volume24h: '$41K', marketingWallet: 'Ca11…line', marketingBalance: '14.8 SOL', raidsActive: 1, raidsJoined: '310', roadmapMilestone: 'Bonding curve launch', roadmapDone: 1, roadmapTotal: 6, score: 73, colors: 'from-orange-300 to-red-700', logo: '/meme-logos/unicorn-fart-dust.png', boost: 13 },
  { rank: 5, name: 'Pixel Goblin', ticker: 'GOB', chain: 'SOL', category: 'AI', stage: 'Forming', community: '6.2K', votes: 341, votesToday: 12, price: '$0.000891', change1h: 5.2, change6h: 12.4, change24h: 8.3, marketCap: '$560K', fdv: '$780K', volume24h: '$72K', marketingWallet: 'Gob1…pixl', marketingBalance: '33.0 SOL', raidsActive: 4, raidsJoined: '1.8K', roadmapMilestone: 'Roadmap wallet unlock', roadmapDone: 4, roadmapTotal: 9, score: 68, colors: 'from-cyan-300 to-teal-700', logo: '/meme-logos/wiki-cat.png', verified: true, boost: 12, promoted: true },
  { rank: 6, name: 'Exit Liquidity', ticker: 'EXIT', chain: 'SOL', category: 'DeFi', stage: 'Live', community: '3.7K', votes: 230, votesToday: 11, price: '$0.000244', change1h: -3.4, change6h: -8.1, change24h: -4.2, marketCap: '$198K', fdv: '$310K', volume24h: '$29K', marketingWallet: 'Ex1t…flow', marketingBalance: '8.6 SOL', raidsActive: 0, raidsJoined: '96', roadmapMilestone: 'Alpha prototype', roadmapDone: 6, roadmapTotal: 10, score: 61, colors: 'from-amber-300 to-orange-700', logo: '/meme-logos/robinhood-dog.png', boost: 11, promoted: true },
  { rank: 7, name: 'Night Shift', ticker: 'NITE', chain: 'SOL', category: 'DeFi', stage: 'Voting', community: '980', votes: 264, votesToday: 9, price: '$0.000055', change1h: 1.1, change6h: null, change24h: 6.8, marketCap: '$88K', fdv: '$140K', volume24h: '$18K', marketingWallet: 'Ni7e…shft', marketingBalance: '9.4 SOL', raidsActive: 2, raidsJoined: '420', roadmapMilestone: 'Marketing wave 2', roadmapDone: 2, roadmapTotal: 7, score: 58, colors: 'from-indigo-300 to-purple-800', logo: '/meme-logos/choctopus.png', boost: 9, promoted: true },
  { rank: 8, name: 'Rug Survivor', ticker: 'SURV', chain: 'SOL', category: 'Meme', stage: 'Forming', community: '1.2K', votes: 215, votesToday: 7, price: '$0.000019', change1h: -0.4, change6h: 3.3, change24h: 3.1, marketCap: '$64K', fdv: '$95K', volume24h: '$11K', marketingWallet: 'SuRv…live', marketingBalance: '4.1 SOL', raidsActive: 1, raidsJoined: '188', roadmapMilestone: 'Community channels live', roadmapDone: 1, roadmapTotal: 6, score: 54, colors: 'from-rose-300 to-pink-700', logo: '/meme-logos/batcat.png', boost: 7, promoted: true },
];

const tickerProjects = projects;
const promotedProjects = projects.filter((project) => project.promoted);
const shortcuts = [
  { label: 'Top Today', icon: Clock3 },
  { label: 'Top All Time', icon: Trophy },
  { label: 'New CTOs', icon: Sparkles },
  { label: 'Trending', icon: Flame },
];
const categories = ['All', 'Meme', 'AI', 'DeFi'];

const heroMemeLogos = [
  { src: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png', alt: 'DOGE', className: 'left-[42%] top-[4%] h-12 w-12 animate-float-a' },
  { src: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png', alt: 'SHIB', className: 'right-[8%] top-[14%] h-11 w-11 animate-float-b' },
  { src: 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg', alt: 'PEPE', className: 'right-[0%] top-[42%] h-12 w-12 animate-float-c' },
  { src: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg', alt: 'BONK', className: 'right-[10%] bottom-[10%] h-10 w-10 animate-float-a' },
  { src: 'https://assets.coingecko.com/coins/images/33566/small/dogwifhat.jpg', alt: 'WIF', className: 'left-[38%] bottom-[2%] h-11 w-11 animate-float-b' },
  { src: 'https://assets.coingecko.com/coins/images/16746/small/PNG_image.png', alt: 'FLOKI', className: 'left-[12%] bottom-[18%] h-10 w-10 animate-float-c' },
  { src: '/meme-logos/peponk.png', alt: 'PEPONK', className: 'left-[6%] top-[28%] h-11 w-11 animate-float-a' },
  { src: '/meme-logos/tendies.png', alt: 'TENDIES', className: 'left-[28%] top-[12%] h-9 w-9 animate-float-b' },
];

function HeroLogoCollage() {
  return (
    <div className="relative mx-auto h-[168px] w-[168px] sm:h-[180px] sm:w-[180px]" aria-hidden>
      <div className="absolute inset-[18%] rounded-full border border-white/[0.06]" />
      <div className="absolute inset-[34%] rounded-full border border-[#c8ff3d]/15" />
      {heroMemeLogos.map((logo) => (
        <img
          key={logo.alt}
          src={logo.src}
          alt=""
          className={`absolute rounded-full object-cover shadow-[0_8px_24px_rgba(0,0,0,0.45)] ring-2 ring-white/10 ${logo.className}`}
          loading="lazy"
        />
      ))}
    </div>
  );
}

const tableCols =
  'grid-cols-[28px_36px_minmax(180px,1.4fr)_72px_64px_84px_128px_88px_72px_72px_168px_72px]';

function ProjectMark({ project, size = 'h-10 w-10', rounded = 'rounded-full' }: { project: Project; size?: string; rounded?: string }) {
  return (
    <div className={`${size} shrink-0 overflow-hidden ${rounded} bg-gradient-to-br ${project.colors} ring-1 ring-white/10`}>
      <img
        src={project.logo}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

function ChainPill() {
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/[0.06] text-[10px] font-bold text-white/55" title="Solana">
      ◎
    </span>
  );
}

function Pct({ value }: { value: number | null }) {
  if (value === null) return <span className="text-white/25">--</span>;
  return (
    <span className={value >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
      {value.toFixed(2)}%
    </span>
  );
}

function formatVotes(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 2).replace(/\.00$/, '')}K`;
  return String(n);
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

function RoadmapCell({ project }: { project: Project }) {
  const pct = Math.round((project.roadmapDone / project.roadmapTotal) * 100);
  return (
    <div className="min-w-0">
      <p className="truncate text-[11px] font-medium text-sky-300">{project.roadmapMilestone}</p>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
          <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-[#c8ff3d]" style={{ width: `${pct}%` }} />
        </div>
        <span className="shrink-0 text-[10px] tabular-nums text-white/35">
          {project.roadmapDone}/{project.roadmapTotal}
        </span>
      </div>
    </div>
  );
}

export function HomePage() {
  const [query, setQuery] = useState('');
  const [activeShortcut, setActiveShortcut] = useState('Top Today');
  const [activeCategory, setActiveCategory] = useState('All');
  const [starred, setStarred] = useState<Record<string, boolean>>({});

  const visibleProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesQuery =
        !normalized ||
        project.name.toLowerCase().includes(normalized) ||
        project.ticker.toLowerCase().includes(normalized);
      const matchesCategory =
        activeCategory === 'All' ||
        project.category === activeCategory;
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
                  <span className={project.change24h >= 0 ? 'text-lime-300' : 'text-rose-400'}>
                    {project.change24h >= 0 ? '+' : ''}{project.change24h}%
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
              placeholder="Search Solana CTOs"
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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_40%,rgba(200,255,61,0.14),transparent_42%),radial-gradient(circle_at_88%_55%,rgba(124,58,237,0.28),transparent_44%)]" />
          <div className="relative grid items-center gap-5 px-5 py-6 sm:px-7 sm:py-7 md:grid-cols-[1fr_auto] md:gap-8">
            <div className="min-w-0">
              <h1 className="max-w-xl font-serif text-3xl font-bold leading-[1.1] tracking-[-0.03em] sm:text-4xl">
                The home of community takeovers
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg bg-[#c8ff3d] px-5 py-2.5 text-sm font-semibold text-[#090b14] transition hover:bg-[#d5ff69]"
                >
                  Launch a CTO
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2aabee] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3bb5f5]"
                >
                  <Bot className="h-4 w-4" />
                  Telegram bot
                </button>
              </div>
            </div>
            <div className="mx-auto w-fit shrink-0 md:mx-0 md:pr-2">
              <HeroLogoCollage />
            </div>
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold">Promoted CTOs</h2>
            <button type="button" className="text-xs font-semibold text-[#c8ff3d]">Promote</button>
          </div>
          <div className="layout-clip -mx-3 overflow-hidden px-3 pb-1 sm:-mx-5 sm:px-5">
            <div className="flex w-max max-w-none animate-scroll-left-fast gap-3 hover:[animation-play-state:paused] motion-reduce:animate-none">
              {[...promotedProjects, ...promotedProjects].map((project, index) => (
                <article
                  key={`${project.ticker}-${index}`}
                  className="group w-[300px] shrink-0 rounded-xl border border-white/[0.08] bg-[#0d101b] p-4 transition hover:border-[#c8ff3d]/20"
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
                      <p className={`text-xs font-semibold ${project.change24h >= 0 ? 'text-lime-300' : 'text-rose-400'}`}>
                        {project.change24h >= 0 ? '+' : ''}{project.change24h}%
                      </p>
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
          </div>
        </section>

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_250px]">
          <section className="min-w-0">
            <div className="mb-4">
              <h2 className="font-serif text-2xl font-bold">Top CTOs Today</h2>
              <p className="mt-1 text-xs text-white/35">Solana community takeovers ranked by activity over the last 24 hours.</p>
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

            <div className="rounded-xl border border-white/[0.08] bg-[#0d101b]">
              <div className="hide-scrollbar overflow-x-auto overscroll-x-contain">
                <div className={`min-w-[1100px]`}>
                  <div className={`grid ${tableCols} items-center gap-2 border-b border-white/[0.06] px-3 py-2.5 text-[10px] font-semibold text-white/30`}>
                    <span className="text-center"><Star className="mx-auto h-3 w-3" /></span>
                    <span className="text-center">#</span>
                    <span>Asset</span>
                    <span className="text-right">Price</span>
                    <span className="text-right">%24h</span>
                    <span className="text-right">Market Cap</span>
                    <span>Marketing wallet</span>
                    <span className="text-right">Balance</span>
                    <span className="text-right">Raids</span>
                    <span className="text-right">Joined</span>
                    <span>Roadmap</span>
                    <span className="text-right">Votes ▾</span>
                  </div>
                  {visibleProjects.map((project) => (
                    <article
                      key={project.ticker}
                      className={`grid ${tableCols} items-center gap-2 border-b border-white/[0.05] px-3 py-3 last:border-0 hover:bg-white/[0.02]`}
                    >
                      <button
                        type="button"
                        aria-label={`Star ${project.ticker}`}
                        onClick={() => setStarred((prev) => ({ ...prev, [project.ticker]: !prev[project.ticker] }))}
                        className="grid place-items-center text-white/20 hover:text-[#c8ff3d]"
                      >
                        <Star className={`h-3.5 w-3.5 ${starred[project.ticker] ? 'fill-[#c8ff3d] text-[#c8ff3d]' : ''}`} />
                      </button>
                      <span className="text-center text-xs text-white/35">{project.rank}</span>
                      <div className="flex min-w-0 items-center gap-2.5">
                        <ProjectMark project={project} size="h-9 w-9" rounded="rounded-lg" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate text-sm font-bold">{project.ticker}</p>
                            {project.verified && (
                              <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-amber-300 text-[8px] font-black text-black">✓</span>
                            )}
                            {project.boost != null && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-300">
                                <Zap className="h-3 w-3 fill-amber-300" />{project.boost}
                              </span>
                            )}
                          </div>
                          <p className="truncate text-[11px] text-white/35">{project.name}</p>
                        </div>
                        <ChainPill />
                      </div>
                      <span className="text-right text-xs font-medium">{project.price}</span>
                      <span className="text-right text-xs"><Pct value={project.change24h} /></span>
                      <span className="text-right text-xs text-white/80">{project.marketCap}</span>
                      <button type="button" className="inline-flex min-w-0 items-center gap-1.5 truncate rounded-md bg-white/[0.04] px-2 py-1 text-left text-[11px] font-medium text-[#c8ff3d] hover:bg-white/[0.07]">
                        <Wallet className="h-3 w-3 shrink-0" />
                        <span className="truncate">{project.marketingWallet}</span>
                      </button>
                      <span className="text-right text-xs font-semibold text-white/85">{project.marketingBalance}</span>
                      <span className={`text-right text-xs font-semibold ${project.raidsActive > 0 ? 'text-[#c8ff3d]' : 'text-white/25'}`}>
                        {project.raidsActive > 0 ? project.raidsActive : '--'}
                      </span>
                      <span className="text-right text-xs text-white/70">{project.raidsJoined}</span>
                      <RoadmapCell project={project} />
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#4ea1ff]">{formatVotes(project.votes)}</p>
                        <p className="text-[10px] text-white/35">{project.votesToday}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {visibleProjects.length === 0 && (
                <div className="px-4 py-12 text-center text-sm text-white/35">No projects found.</div>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-xl border border-white/[0.08] bg-[#0d101b] p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Solana activity</h3>
                <BarChart3 className="h-4 w-4 text-white/25" />
              </div>
              <p className="mt-1 text-[11px] text-white/35">CTO coverage is Solana-only for now.</p>
              <div className="mt-4 space-y-3">
                {[
                  { label: 'Active CTOs', value: '128', width: '82%' },
                  { label: 'Forming today', value: '24', width: '48%' },
                  { label: 'Live relaunches', value: '11', width: '28%' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-1.5 flex justify-between text-[11px]">
                      <span className="text-white/55">{item.label}</span>
                      <span className="text-white/25">{item.value}</span>
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
              <p className="mt-2 text-xs leading-5 text-white/40">Submit a Solana contract and community to start a takeover proposal.</p>
              <button type="button" className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#2aabee] py-2.5 text-xs font-semibold">
                <Bot className="h-4 w-4" /> Telegram bot
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
            <span>Solana CTO discovery</span>
          </div>
          <div className="flex gap-5"><span>Terms</span><span>Privacy</span><span>Contact</span></div>
        </div>
      </footer>
    </div>
  );
}
