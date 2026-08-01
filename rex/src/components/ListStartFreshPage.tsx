import { ArrowRight, Globe, MessageCircle, Sparkles } from 'lucide-react';
import { CLONE_HOSTING_FEE_SOL } from '../data/claimPricing';

type Props = {
  symbol: string;
  logoUrl?: string | null;
  primaryBtnClass: string;
  backBtnClass: string;
  onCloneSite: () => void;
  onAddSocials: () => void;
  onAddXLogo: () => void;
  onContinueToDashboard: () => void;
  onSkipToDashboard: () => void;
};

const ACTIONS = [
  {
    id: 'clone',
    icon: Globe,
    title: 'Clone existing website',
    detail: (fee: number) => `${fee} SOL from marketing wallet · hosting included`,
  },
  {
    id: 'socials',
    icon: MessageCircle,
    title: 'Add new socials',
    detail: () => 'Fresh X, Telegram, and Discord for the CTO',
  },
  {
    id: 'logo',
    icon: Sparkles,
    title: 'Add logo for X',
    detail: () => 'Save the mark, then set it as your X profile photo',
  },
] as const;

export function ListStartFreshPage({
  symbol,
  logoUrl,
  primaryBtnClass,
  backBtnClass,
  onCloneSite,
  onAddSocials,
  onAddXLogo,
  onContinueToDashboard,
  onSkipToDashboard,
}: Props) {
  const handlers = {
    clone: onCloneSite,
    socials: onAddSocials,
    logo: onAddXLogo,
  } as const;

  return (
    <div className="relative mx-auto max-w-xl">
      <div
        className="pointer-events-none absolute -inset-x-6 -top-8 h-56 bg-[radial-gradient(ellipse_at_top,rgba(200,255,61,0.12),transparent_65%)]"
        aria-hidden
      />

      <div className="relative space-y-8">
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-2xl border border-white/[0.12] object-cover shadow-[0_0_40px_rgba(200,255,61,0.12)]"
            />
          ) : (
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/[0.12] bg-white/[0.04] font-serif text-base font-bold text-[#d5ff69]">
              {symbol.replace(/^\$/, '').slice(0, 2)}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#c8ff3d]/85">
              Listed on CTOgo
            </p>
            <h1 className="mt-0.5 font-serif text-3xl font-bold tracking-tight text-white">
              {symbol}
            </h1>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-white">Start fresh</h2>
          <p className="mt-2 max-w-md text-[14px] leading-relaxed text-white/50">
            Optionally replace the old site and socials so holders see a clean CTO.
          </p>
        </div>

        <ul className="space-y-2">
          {ACTIONS.map(({ id, icon: Icon, title, detail }) => (
            <li key={id}>
              <button
                type="button"
                onClick={handlers[id]}
                className="group flex w-full items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-4 text-left transition hover:border-[#c8ff3d]/30 hover:bg-[#c8ff3d]/[0.05]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#c8ff3d]/12 text-[#d5ff69] transition group-hover:bg-[#c8ff3d]/18">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-white">{title}</span>
                  <span className="mt-0.5 block text-[12px] text-white/40">
                    {detail(CLONE_HOSTING_FEE_SOL)}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-[#d5ff69]" />
              </button>
            </li>
          ))}
        </ul>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={onSkipToDashboard} className={backBtnClass}>
            Skip for now
          </button>
          <button
            type="button"
            onClick={onContinueToDashboard}
            className={`${primaryBtnClass} sm:min-w-[14rem]`}
          >
            Continue to dashboard
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
