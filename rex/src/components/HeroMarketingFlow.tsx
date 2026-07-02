import { Globe, LineChart, Megaphone, Share2, Wallet } from 'lucide-react';

const CHANNELS = [
  { id: 'website', label: 'Website', icon: Globe },
  { id: 'dex', label: 'Dexscreener', icon: LineChart },
  { id: 'x', label: 'X / Twitter', icon: Share2 },
  { id: 'ads', label: 'Paid ads', icon: Megaphone },
] as const;

export function HeroMarketingFlow() {
  return (
    <div className="mx-auto mt-10 max-w-3xl" aria-hidden>
      <div className="relative rounded-2xl border border-white/10 bg-[#0a0e17]/70 px-4 py-6 sm:px-8 sm:py-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent"
          aria-hidden
        />
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 shadow-[0_0_24px_rgba(56,189,248,0.12)]">
            <Wallet className="h-5 w-5 text-sky-400" />
            <span className="text-sm font-semibold text-white">Marketing wallet</span>
          </div>
          <div className="relative mt-4 flex h-8 w-full max-w-md items-center justify-center">
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-sky-500/50 to-sky-500/10" />
            <div className="absolute left-[12%] right-[12%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-sky-500/25 to-transparent" />
          </div>
          <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {CHANNELS.map(({ id, label, icon: Icon }) => (
              <div
                key={id}
                className="flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-center"
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                  <Icon className="h-4 w-4 text-sky-400" />
                </div>
                <span className="text-[11px] font-medium leading-tight text-white/90">{label}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 max-w-md text-[11px] leading-relaxed text-muted-foreground">
            Every trade fills your wallet — Rex routes spend to build and market your coin automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
