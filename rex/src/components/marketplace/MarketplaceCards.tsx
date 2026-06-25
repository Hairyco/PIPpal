import { useState, type ReactNode } from 'react';
import { BadgeCheck, Star } from 'lucide-react';
import type { DevStudio } from '../../data/devStudios';
import { projectDeliverables } from '../../data/devStudios';
import type { TalentWorker } from '../../data/talentPool';
import type { Influencer } from '../../data/influencers';
import { StudioLogo } from './StudioLogo';

function skillLabel(id: string): string {
  return projectDeliverables.find((d) => d.id === id)?.label ?? id;
}

function CardShell({
  banner,
  avatar,
  profile,
  name,
  subtitle,
  roleLine,
  tags,
  rating,
  statPrimary,
  statSecondary,
  footer,
  verified,
  available,
}: {
  banner: string;
  avatar?: string;
  profile?: ReactNode;
  name: string;
  subtitle: string;
  roleLine?: string;
  tags: string[];
  rating: number;
  statPrimary: string;
  statSecondary: string;
  footer: ReactNode;
  verified?: boolean;
  available?: boolean;
}) {
  const [bannerFailed, setBannerFailed] = useState(false);

  return (
    <div className="dex-card flex h-full min-h-[280px] flex-col overflow-hidden !p-0 transition-opacity hover:opacity-95 sm:min-h-[320px] [&::before]:z-[2]">
      <div className="relative z-[1] h-24 shrink-0 overflow-hidden bg-gradient-to-br from-sky-500/20 via-indigo-500/15 to-[#0a0e17] sm:h-32">
        {!bannerFailed ? (
          <img
            src={banner}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            onError={() => setBannerFailed(true)}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] via-[#0a0e17]/50 to-black/10" />
      </div>

      <div className="relative z-[1] flex flex-1 flex-col px-3 pb-4 sm:px-5 sm:pb-5">
        <div className="-mt-8 flex items-end gap-2 sm:-mt-10 sm:gap-3">
          <div className="relative shrink-0">
            {profile ??
              (avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="h-14 w-14 rounded-2xl object-cover ring-4 ring-[#0a0e17] sm:h-20 sm:w-20"
                  loading="lazy"
                />
              ) : null)}
            {available !== undefined && (
              <span
                className={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-[#0a0e17] ${
                  available ? 'bg-emerald-400' : 'bg-white/30'
                }`}
                aria-hidden
              />
            )}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold text-white sm:text-lg">{name}</h3>
              {verified && (
                <BadgeCheck className="h-4 w-4 shrink-0 text-sky-400" aria-label="Vetted" />
              )}
            </div>
            {roleLine && <p className="text-xs font-medium text-sky-400/90">{roleLine}</p>}
          </div>
        </div>

        <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground sm:mt-3 sm:text-sm">{subtitle}</p>

        <div className="mt-3 flex min-h-[44px] flex-wrap content-start gap-1 sm:mt-4 sm:min-h-[52px] sm:gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[10px] font-medium text-sky-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-3 text-[10px] sm:flex-row sm:items-center sm:justify-between sm:pt-4 sm:text-xs">
          <div className="flex items-center gap-1 font-medium text-white">
            <Star className="h-3.5 w-3.5 fill-sky-400 text-sky-400 sm:h-4 sm:w-4" />
            {rating}
            <span className="font-normal text-muted-foreground">rating</span>
          </div>
          <div className="text-muted-foreground sm:text-right">
            <p>{statPrimary}</p>
            <p>{statSecondary}</p>
          </div>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">{footer}</div>
      </div>
    </div>
  );
}

export function StudioCard({ studio }: { studio: DevStudio }) {
  return (
    <CardShell
      banner={studio.banner}
      profile={<StudioLogo studio={studio} />}
      name={studio.name}
      subtitle={studio.specialty}
      tags={studio.tags}
      rating={studio.rating}
      statPrimary={`${studio.projects} projects`}
      statSecondary={`${studio.yearsExperience} yrs experience`}
      verified
      footer={
        <>
          From <span className="font-medium text-white">{studio.minBudget}</span>
        </>
      }
    />
  );
}

export function IndependentCard({ worker }: { worker: TalentWorker }) {
  return (
    <CardShell
      banner={worker.banner}
      avatar={worker.avatar}
      name={worker.name}
      subtitle={worker.specialty}
      roleLine={worker.role}
      tags={worker.skills.map(skillLabel)}
      rating={worker.rating}
      statPrimary={`${worker.completedJobs} jobs done`}
      statSecondary={`${worker.yearsExperience} yrs experience`}
      available={worker.available}
      footer={
        <>
          <span className="font-medium text-white">{worker.rate}</span>
          {worker.available ? (
            <span className="text-emerald-400"> · Available now</span>
          ) : (
            <span> · Booked</span>
          )}
        </>
      }
    />
  );
}

export function InfluencerCard({ influencer }: { influencer: Influencer }) {
  return (
    <CardShell
      banner={influencer.banner}
      avatar={influencer.avatar}
      name={influencer.name}
      subtitle={influencer.specialty}
      roleLine={influencer.role}
      tags={influencer.platforms}
      rating={influencer.rating}
      statPrimary={`${influencer.followers} followers`}
      statSecondary={`${influencer.campaigns} campaigns`}
      available={influencer.available}
      footer={
        <>
          <span className="font-medium text-white">{influencer.rate}</span>
          {influencer.available ? (
            <span className="text-emerald-400"> · Available now</span>
          ) : (
            <span> · Booked</span>
          )}
        </>
      }
    />
  );
}
