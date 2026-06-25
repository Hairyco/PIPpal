import { Link } from 'react-router-dom';
import { BadgeCheck, Building2, Search, Star } from 'lucide-react';
import { devStudios } from '../../data/devStudios';
import { StudioLogoBadge } from '../marketplace/StudioLogo';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30';

export interface StudiosStepState {
  studioSearch: string;
  showOwnSupplier: boolean;
  studioSkipped: boolean;
  shortlistedStudios: string[];
  ownSupplierName: string;
  ownSupplierEmail: string;
  ownSupplierWebsite: string;
}

interface LaunchStudiosStepProps extends StudiosStepState {
  onStudioSearch: (value: string) => void;
  onToggleStudio: (id: string) => void;
  onSkipStudios: () => void;
  onToggleOwnSupplierPanel: () => void;
  onOwnSupplierName: (value: string) => void;
  onOwnSupplierEmail: (value: string) => void;
  onOwnSupplierWebsite: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function LaunchStudiosStep({
  studioSearch,
  showOwnSupplier,
  studioSkipped,
  shortlistedStudios,
  ownSupplierName,
  ownSupplierEmail,
  ownSupplierWebsite,
  onStudioSearch,
  onToggleStudio,
  onSkipStudios,
  onToggleOwnSupplierPanel,
  onOwnSupplierName,
  onOwnSupplierEmail,
  onOwnSupplierWebsite,
  onBack,
  onContinue,
}: LaunchStudiosStepProps) {
  const filteredStudios = devStudios.filter(
    (s) =>
      s.name.toLowerCase().includes(studioSearch.toLowerCase()) ||
      s.specialty.toLowerCase().includes(studioSearch.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(studioSearch.toLowerCase())),
  );

  const hasOwnSupplier =
    showOwnSupplier && ownSupplierName.trim().length > 0 && ownSupplierEmail.trim().length > 0;
  const canProceed =
    shortlistedStudios.length > 0 || hasOwnSupplier || studioSkipped;

  return (
    <div className="space-y-5">
      <div className="dex-card">
        <div className="relative z-[1]">
          <h2 className="font-semibold text-white">Shortlist development studios</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Browse Rex vetted studios. Shortlist one or more — they&apos;ll be invited when your
            roadmap wallet unlocks.
          </p>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Search by name, specialty, or tag…"
              value={studioSearch}
              onChange={(e) => onStudioSearch(e.target.value)}
            />
          </div>

          <div className="mt-4 space-y-2">
            {filteredStudios.map((studio) => {
              const shortlisted = shortlistedStudios.includes(studio.id);
              return (
                <button
                  key={studio.id}
                  type="button"
                  onClick={() => onToggleStudio(studio.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                    shortlisted
                      ? 'border-sky-500/50 bg-sky-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <StudioLogoBadge studio={studio} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{studio.name}</p>
                      <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                    </div>
                    <p className="text-xs text-muted-foreground">{studio.specialty}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {studio.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="shrink-0 text-right text-xs">
                    <span className="flex items-center justify-end gap-1 text-foreground">
                      <Star className="h-3 w-3 fill-sky-400 text-sky-400" />
                      {studio.rating}
                    </span>
                    <span className="mt-1 block text-muted-foreground">from {studio.minBudget}</span>
                  </p>
                </button>
              );
            })}
          </div>

          {shortlistedStudios.length > 0 && (
            <p className="mt-3 text-xs text-sky-400">
              {shortlistedStudios.length} studio{shortlistedStudios.length > 1 ? 's' : ''}{' '}
              shortlisted.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <button
          type="button"
          onClick={onToggleOwnSupplierPanel}
          className="flex w-full items-center gap-3 text-left"
        >
          <Building2 className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-white">Can&apos;t find a studio? Source your own</p>
            <p className="text-xs text-muted-foreground">
              Bring your own agency or dev team — they must pass Rex vetting before receiving funds.
            </p>
          </div>
        </button>

        {showOwnSupplier && (
          <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">
                Studio / agency name
              </label>
              <input
                className={inputClass}
                value={ownSupplierName}
                onChange={(e) => onOwnSupplierName(e.target.value)}
                placeholder="Your supplier's name"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Contact email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={ownSupplierEmail}
                  onChange={(e) => onOwnSupplierEmail(e.target.value)}
                  placeholder="team@agency.com"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">
                  Website (optional)
                </label>
                <input
                  className={inputClass}
                  value={ownSupplierWebsite}
                  onChange={(e) => onOwnSupplierWebsite(e.target.value)}
                  placeholder="https://"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              They&apos;ll receive a vetting invite.{' '}
              <Link to="/become-a-supplier" className="text-sky-400 hover:underline">
                Or apply as a supplier here
              </Link>
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onSkipStudios}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip — decide later
          </button>
          <button
            type="button"
            disabled={!canProceed}
            onClick={onContinue}
            className="dex-btn disabled:cursor-not-allowed disabled:opacity-40"
          >
            {shortlistedStudios.length > 0
              ? `Continue (${shortlistedStudios.length} shortlisted)`
              : hasOwnSupplier
                ? 'Continue with your supplier'
                : studioSkipped
                  ? 'Continue without studio'
                  : 'Talent pool'}
          </button>
        </div>
      </div>
      {!canProceed && (
        <p className="text-center text-xs text-muted-foreground">
          Shortlist at least one studio, add your own supplier, or skip to continue.
        </p>
      )}
    </div>
  );
}
