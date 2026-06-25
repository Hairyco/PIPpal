import { useState, type ReactNode } from 'react';
import { BadgeCheck, Check, Star } from 'lucide-react';
import type { DevStudio } from '../../data/devStudios';
import { projectDeliverables } from '../../data/devStudios';
import type { TalentWorker } from '../../data/talentPool';
import type { Influencer } from '../../data/influencers';
import { StudioLogo } from './StudioLogo';

function skillLabel(id: string): string {
  return projectDeliverables.find((d) => d.id === id)?.label ?? id;
}

type StatItem = {
  label: string;
  value: string;
  accent?: boolean;
};

function CardShell({
  banner,
  avatar,
  profile,
  name,
  subtitle,
  roleLine,
  tags,
  stats,
  highlights,
  footer,
  footerLabel,
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
  stats: StatItem[];
  highlights?: string[];
  footer: ReactNode;
  footerLabel?: string;
  verified?: boolean;
  available?: boolean;
}) {
  const [bannerFailed, setBannerFailed] = useState(false);

  return (
    <div className="dex-card flex h-full min-h-[360px] flex-col overflow-hidden !p-0 transition-opacity hover:opacity-95 sm:min-h-[400px] [&::before]:z-[2]">
      <div className="relative z-[1] h-28 shrink-0 overflow-hidden bg-gradient-to-br from-sky-500/20 via-indigo-500/15 to-[#0a0e17] sm:h-36">
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
        {verified && (
          <span className="absolute left-3 top-3 rounded-full border border-sky-500/30 bg-black/50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-sky-300 backdrop-blur-md">
            Rex vetted
          </span>
        )}
        {available !== undefined && (
          <span
            className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-medium backdrop-blur-md ${
              available
                ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                : 'border-white/15 bg-black/50 text-muted-foreground'
            }`}
          >
            {available ? 'Available' : 'Booked'}
          </span>
        )}
      </div>

      <div className="relative z-[1] flex flex-1 flex-col px-4 pb-5 pt-0 sm:px-5 sm:pb-6">
        <div className="-mt-9 flex items-end gap-3 sm:-mt-11">
          <div className="relative shrink-0">
            {profile ??
              (avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="h-16 w-16 rounded-2xl object-cover ring-4 ring-[#0a0e17] sm:h-[4.5rem] sm:w-[4.5rem]"
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
              <h3 className="truncate text-base font-semibold text-white sm:text-lg">{name}</h3>
              {verified && (
                <BadgeCheck className="h-4 w-4 shrink-0 text-sky-400" aria-label="Vetted" />
              )}
            </div>
            {roleLine && <p className="text-xs font-medium text-sky-400/90 sm:text-sm">{roleLine}</p>}
          </div>
        </div>

        <p className="mt-2.5 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {subtitle}
        </p>

        <div className="mt-3 flex min-h-[48px] flex-wrap content-start gap-1.5 sm:mt-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[10px] font-medium text-sky-300 sm:text-[11px]"
            >
              {tag}
            </span>
          ))}
        </div>

        {highlights && highlights.length > 0 && (
          <ul className="mt-3 space-y-1.5 border-t border-white/10 pt-3 sm:mt-4">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground sm:text-[13px]">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-400" aria-hidden />
                <span className="line-clamp-1">{item}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 sm:mt-auto sm:gap-3 sm:p-3">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-0 text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              <p
                className={`mt-0.5 truncate text-sm font-semibold sm:text-base ${
                  stat.accent ? 'text-sky-400' : 'text-white'
                }`}
              >
                {stat.accent && <Star className="mr-0.5 inline h-3.5 w-3.5 fill-sky-400 text-sky-400" />}
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 px-3 py-2.5 sm:mt-4">
          {footerLabel && (
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {footerLabel}
            </span>
          )}
          <div className="min-w-0 text-right text-sm text-muted-foreground">{footer}</div>
        </div>
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
      verified
      highlights={[
        `Ships ${studio.tags.slice(0, 2).join(' & ')} projects end-to-end`,
        `${studio.projects} Rex milestones completed`,
        'Milestone escrow & staged payouts',
      ]}
      stats={[
        { label: 'Rating', value: String(studio.rating), accent: true },
        { label: 'Projects', value: String(studio.projects) },
        { label: 'Experience', value: `${studio.yearsExperience} yrs` },
      ]}
      footerLabel="From"
      footer={<span className="font-semibold text-white">{studio.minBudget}</span>}
    />
  );
}

export function IndependentCard({ worker }: { worker: TalentWorker }) {
  const deliverables = worker.skills
    .map((id) => projectDeliverables.find((d) => d.id === id))
    .filter(Boolean);

  return (
    <CardShell
      banner={worker.banner}
      avatar={worker.avatar}
      name={worker.name}
      subtitle={worker.specialty}
      roleLine={worker.role}
      tags={worker.skills.map(skillLabel)}
      available={worker.available}
      highlights={deliverables.slice(0, 3).map((d) => d!.description)}
      stats={[
        { label: 'Rating', value: String(worker.rating), accent: true },
        { label: 'Jobs', value: String(worker.completedJobs) },
        { label: 'Experience', value: `${worker.yearsExperience} yrs` },
      ]}
      footerLabel="Rate"
      footer={
        <>
          <span className="font-semibold text-white">{worker.rate}</span>
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
      available={influencer.available}
      highlights={[
        `Active on ${influencer.platforms.join(' & ')}`,
        `${influencer.campaigns} brand campaigns delivered`,
        `${influencer.yearsExperience} years creating launch content`,
      ]}
      stats={[
        { label: 'Rating', value: String(influencer.rating), accent: true },
        { label: 'Followers', value: influencer.followers },
        { label: 'Campaigns', value: String(influencer.campaigns) },
      ]}
      footerLabel="Rate"
      footer={
        <>
          <span className="font-semibold text-white">{influencer.rate}</span>
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
