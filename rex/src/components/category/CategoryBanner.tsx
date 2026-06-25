import { useState } from 'react';
import type { Industry } from '../data/industries';

interface CategoryBannerProps {
  industry: Industry;
  activeCount: number;
  ideasCount: number;
}

export function CategoryBanner({ industry, activeCount, ideasCount }: CategoryBannerProps) {
  const [bannerFailed, setBannerFailed] = useState(false);
  const bannerSrc = industry.banner ?? industry.image;
  const iconSrc = industry.icon ?? industry.image;

  return (
    <div className="dex-card overflow-hidden !p-0 [&::before]:z-[2]">
      <div className="relative z-[1] h-36 shrink-0 overflow-hidden bg-gradient-to-br from-sky-500/20 via-indigo-500/15 to-[#0a0e17] sm:h-44 md:h-52">
        {!bannerFailed ? (
          <img
            src={bannerSrc}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            onError={() => setBannerFailed(true)}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] via-[#0a0e17]/55 to-black/15" />
        <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-md">
          {industry.tag}
        </span>
      </div>

      <div className="relative z-[1] px-4 pb-5 sm:px-6 sm:pb-6">
        <div className="-mt-10 flex flex-col gap-5 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 items-end gap-4">
            <img
              src={iconSrc}
              alt={industry.name}
              className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-4 ring-[#0a0e17] sm:h-24 sm:w-24"
              loading="eager"
            />
            <div className="min-w-0 pb-1">
              <h1 className="font-serif text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                {industry.name}
              </h1>
              <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
                {industry.description}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-6 border-t border-white/10 pt-4 text-sm sm:border-t-0 sm:pt-0 sm:pb-1">
            <div>
              <p className="text-muted-foreground">Active</p>
              <p className="text-lg font-semibold text-sky-400">{activeCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ideas</p>
              <p className="text-lg font-semibold text-foreground">{ideasCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="text-lg font-semibold text-foreground">
                {industry.projectCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
