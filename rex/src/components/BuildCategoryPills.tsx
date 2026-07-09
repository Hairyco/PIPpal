import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Building2,
  Coins,
  Gamepad2,
  Music,
  Smartphone,
  Sparkles,
  Star,
  Trophy,
  Tv,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const BUILD_PILLS: {
  label: string;
  categoryId: string;
  icon: LucideIcon;
}[] = [
  { label: 'Blockchain', categoryId: 'defi', icon: Coins },
  { label: 'Gaming app', categoryId: 'gaming', icon: Gamepad2 },
  { label: 'AI product', categoryId: 'ai-tech', icon: Sparkles },
  { label: 'Mobile app', categoryId: 'apps', icon: Smartphone },
  { label: 'Media platform', categoryId: 'media', icon: Tv },
  { label: 'Meme coin', categoryId: 'meme-coins', icon: Zap },
  { label: 'Celebrity token', categoryId: 'celebrity-coins', icon: Star },
  { label: 'Sports fan token', categoryId: 'sport', icon: Trophy },
  { label: 'Music project', categoryId: 'music', icon: Music },
  { label: 'Real estate', categoryId: 'real-estate', icon: Building2 },
];

export function BuildCategoryPills() {
  return (
    <section className="container pb-10 pt-2" aria-label="Build by category">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#060a12]/60 px-5 py-8 shadow-[0_24px_80px_-40px_rgba(14,165,233,0.35)] backdrop-blur-sm sm:px-10 sm:py-10">
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent sm:inset-x-12"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl"
          aria-hidden
        />

        <div className="relative text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-sky-400/90">
            What are you launching?
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-white md:text-[2.5rem]">
            Build a<span className="text-sky-400">:</span>
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Pick a category — we&apos;ll open launch with your roadmap and marketing plan ready.
          </p>
        </div>

        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {BUILD_PILLS.map((pill) => {
            const Icon = pill.icon;
            return (
              <Link
                key={pill.categoryId}
                to={`/get-started?category=${pill.categoryId}`}
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#030711]/70 px-4 py-2.5 text-sm font-medium text-white/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-500/40 hover:bg-sky-500/[0.08] hover:text-white hover:shadow-[0_10px_28px_-14px_rgba(14,165,233,0.55)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-sky-400/90 transition-colors group-hover:bg-sky-500/15 group-hover:text-sky-300">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {pill.label}
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-sky-400 group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
