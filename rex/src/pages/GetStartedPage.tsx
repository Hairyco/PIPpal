import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Search,
  Star,
  UserPlus,
  Users,
} from 'lucide-react';
import { Layout, BackLink } from '../components/Layout';
import { industries } from '../data/industries';
import { devStudios, projectDeliverables, type DeliverableId } from '../data/devStudios';
import { getTalentForDeliverable, talentPool } from '../data/talentPool';
import { CLAIM_FEE } from '../data/claimPricing';
import { LaunchPreview } from '../components/get-started/LaunchPreview';

type Step = 'idea' | 'studios' | 'talent' | 'review';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30';

const STEPS: { id: Step; label: string }[] = [
  { id: 'idea', label: 'Your idea' },
  { id: 'studios', label: 'Studios' },
  { id: 'talent', label: 'Talent pool' },
  { id: 'review', label: 'Launch' },
];

export function GetStartedPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('idea');
  const [studioSearch, setStudioSearch] = useState('');
  const [showOwnSupplier, setShowOwnSupplier] = useState(false);
  const [studioSkipped, setStudioSkipped] = useState(false);
  const [launched, setLaunched] = useState(false);

  const [projectName, setProjectName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [deliverables, setDeliverables] = useState<DeliverableId[]>([]);
  const [shortlistedStudios, setShortlistedStudios] = useState<string[]>([]);
  const [ownSupplierName, setOwnSupplierName] = useState('');
  const [ownSupplierEmail, setOwnSupplierEmail] = useState('');
  const [ownSupplierWebsite, setOwnSupplierWebsite] = useState('');
  const [talentAssignments, setTalentAssignments] = useState<Record<string, string>>({});

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const filteredStudios = devStudios.filter(
    (s) =>
      s.name.toLowerCase().includes(studioSearch.toLowerCase()) ||
      s.specialty.toLowerCase().includes(studioSearch.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(studioSearch.toLowerCase())),
  );

  const toggleDeliverable = (id: DeliverableId) => {
    setDeliverables((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const toggleStudio = (id: string) => {
    setStudioSkipped(false);
    setShowOwnSupplier(false);
    setShortlistedStudios((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const skipStudios = () => {
    setStudioSkipped(true);
    setShowOwnSupplier(false);
    setShortlistedStudios([]);
    setOwnSupplierName('');
    setOwnSupplierEmail('');
    setOwnSupplierWebsite('');
  };

  const openOwnSupplier = () => {
    setStudioSkipped(false);
    setShowOwnSupplier(true);
  };

  const assignTalent = (deliverableId: string, talentId: string) => {
    setTalentAssignments((prev) => ({
      ...prev,
      [deliverableId]: prev[deliverableId] === talentId ? '' : talentId,
    }));
  };

  const canProceedIdea = projectName.trim() && categoryId && description.trim() && deliverables.length > 0;
  const hasOwnSupplier =
    showOwnSupplier && ownSupplierName.trim().length > 0 && ownSupplierEmail.trim().length > 0;
  const canProceedStudios =
    shortlistedStudios.length > 0 || hasOwnSupplier || studioSkipped;

  const previewData = {
    projectName,
    categoryId,
    description,
    deliverables,
    shortlistedStudios,
    showOwnSupplier,
    ownSupplierName,
    studioSkipped,
    talentAssignments,
  };

  if (launched) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
          <h1 className="mt-6 font-serif text-3xl font-bold text-white">Project launched!</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            {projectName} is live on Rex. Your marketing wallet is active and your team shortlist is
            saved to the roadmap.
          </p>
          <button type="button" onClick={() => navigate('/')} className="dex-btn mt-8">
            Back to home
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 pb-16">
        <BackLink />

        <div className="mx-auto mt-6 max-w-6xl">
          <p className="text-sm font-medium uppercase tracking-wider text-sky-400">Launch for $1</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-white md:text-4xl">
            Get started
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Describe your idea, shortlist a dev studio, fill gaps with talent from the pool, and
            launch.
          </p>

          <div className="mt-8 flex max-w-3xl gap-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex flex-1 flex-col gap-1.5">
                <div
                  className={`h-1 rounded-full ${
                    i <= stepIndex ? 'bg-sky-500' : 'bg-white/10'
                  }`}
                />
                <span
                  className={`text-[10px] font-medium sm:text-xs ${
                    i === stepIndex ? 'text-sky-400' : 'text-muted-foreground'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-8 grid max-w-6xl gap-8 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0 max-w-3xl">
          {step === 'idea' && (
            <div className="space-y-5">
              <div className="dex-card">
                <div className="relative z-[1] space-y-4">
                  <h2 className="font-semibold text-white">Tell us about your project</h2>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Project name
                    </label>
                    <input
                      className={inputClass}
                      placeholder="e.g. FitTrack, My SaaS idea"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Category
                    </label>
                    <select
                      className={inputClass}
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value="">Select a category…</option>
                      {industries.map((ind) => (
                        <option key={ind.id} value={ind.id}>
                          {ind.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      What&apos;s the idea?
                    </label>
                    <textarea
                      className={inputClass}
                      rows={4}
                      placeholder="Describe what you're building, who it's for, and what problem it solves…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="dex-card">
                <div className="relative z-[1]">
                  <h2 className="font-semibold text-white">What do you need built?</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Select deliverables — e.g. a website, mobile app, or smart contract. You&apos;ll
                    assign talent to each part in the next steps.
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {projectDeliverables.map((d) => {
                      const selected = deliverables.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleDeliverable(d.id)}
                          className={`rounded-xl border p-3 text-left transition-colors ${
                            selected
                              ? 'border-sky-500/50 bg-sky-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <p className="text-sm font-medium text-white">{d.label}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{d.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!canProceedIdea}
                  onClick={() => setStep('studios')}
                  className="dex-btn disabled:opacity-40"
                >
                  Shortlist studios
                  <ArrowRight className="ml-2 inline h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'studios' && (
            <div className="space-y-5">
              <div className="dex-card">
                <div className="relative z-[1]">
                  <h2 className="font-semibold text-white">Shortlist development studios</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Browse Rex vetted studios. Shortlist one or more — they&apos;ll be invited when
                    your roadmap wallet unlocks.
                  </p>

                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      className={`${inputClass} pl-9`}
                      placeholder="Search by name, specialty, or tag…"
                      value={studioSearch}
                      onChange={(e) => setStudioSearch(e.target.value)}
                    />
                  </div>

                  <div className="mt-4 space-y-2">
                    {filteredStudios.map((studio) => {
                      const shortlisted = shortlistedStudios.includes(studio.id);
                      return (
                        <button
                          key={studio.id}
                          type="button"
                          onClick={() => toggleStudio(studio.id)}
                          className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                            shortlisted
                              ? 'border-sky-500/50 bg-sky-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
                            style={{ backgroundColor: studio.color }}
                          >
                            {studio.initials}
                          </div>
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
                          <div className="shrink-0 text-right text-xs">
                            <span className="flex items-center gap-1 text-foreground">
                              <Star className="h-3 w-3 fill-sky-400 text-sky-400" />
                              {studio.rating}
                            </span>
                            <p className="mt-1 text-muted-foreground">from {studio.minBudget}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {shortlistedStudios.length > 0 && (
                    <p className="mt-3 text-xs text-sky-400">
                      {shortlistedStudios.length} studio{shortlistedStudios.length > 1 ? 's' : ''}{' '}
                      shortlisted — continue to talent pool or review.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <button
                  type="button"
                  onClick={() => {
                    if (showOwnSupplier) {
                      setShowOwnSupplier(false);
                    } else {
                      openOwnSupplier();
                    }
                  }}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <Building2 className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Can&apos;t find a studio? Source your own
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bring your own agency or dev team — they must pass Rex vetting before receiving
                      funds.
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
                        onChange={(e) => {
                          setStudioSkipped(false);
                          setOwnSupplierName(e.target.value);
                        }}
                        placeholder="Your supplier's name"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs text-muted-foreground">
                          Contact email
                        </label>
                        <input
                          type="email"
                          className={inputClass}
                          value={ownSupplierEmail}
                          onChange={(e) => {
                            setStudioSkipped(false);
                            setOwnSupplierEmail(e.target.value);
                          }}
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
                          onChange={(e) => setOwnSupplierWebsite(e.target.value)}
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
                  onClick={() => setStep('idea')}
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </button>
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={skipStudios}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Skip — decide later
                  </button>
                  <button
                    type="button"
                    disabled={!canProceedStudios}
                    onClick={() => setStep('talent')}
                    className="dex-btn disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {shortlistedStudios.length > 0
                      ? `Continue (${shortlistedStudios.length} shortlisted)`
                      : hasOwnSupplier
                        ? 'Continue with your supplier'
                        : studioSkipped
                          ? 'Continue without studio'
                          : 'Talent pool'}
                    <ArrowRight className="ml-2 inline h-4 w-4" />
                  </button>
                </div>
              </div>
              {!canProceedStudios && (
                <p className="text-center text-xs text-muted-foreground">
                  Shortlist at least one studio, add your own supplier, or skip to continue.
                </p>
              )}
            </div>
          )}

          {step === 'talent' && (
            <div className="space-y-5">
              <div className="dex-card">
                <div className="relative z-[1]">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-sky-400" />
                    <h2 className="font-semibold text-white">Talent pool</h2>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Some parts of your project need individuals — not a full studio. Hire vetted
                    freelancers for specific deliverables like building your website, design, or
                    contracts.
                  </p>

                  <div className="mt-6 space-y-6">
                    {deliverables.map((deliverableId) => {
                      const deliverable = projectDeliverables.find((d) => d.id === deliverableId)!;
                      const workers = getTalentForDeliverable(deliverableId);
                      const assignedId = talentAssignments[deliverableId];

                      return (
                        <div key={deliverableId} className="rounded-xl border border-white/10 p-4">
                          <p className="text-sm font-medium text-white">{deliverable.label}</p>
                          <p className="text-xs text-muted-foreground">{deliverable.description}</p>

                          {workers.length === 0 ? (
                            <p className="mt-3 text-xs text-muted-foreground">
                              No talent listed yet — your studio can handle this part.
                            </p>
                          ) : (
                            <div className="mt-3 space-y-2">
                              {workers.map((worker) => {
                                const assigned = assignedId === worker.id;
                                return (
                                  <button
                                    key={worker.id}
                                    type="button"
                                    disabled={!worker.available}
                                    onClick={() => assignTalent(deliverableId, worker.id)}
                                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors disabled:opacity-50 ${
                                      assigned
                                        ? 'border-emerald-500/40 bg-emerald-500/10'
                                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                                    }`}
                                  >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                                      {worker.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-white">
                                        {worker.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">{worker.role}</p>
                                      <p className="text-[10px] text-muted-foreground">
                                        {worker.specialty}
                                      </p>
                                    </div>
                                    <div className="shrink-0 text-right text-xs">
                                      <p className="font-medium text-foreground">{worker.rate}</p>
                                      <p className="flex items-center justify-end gap-1 text-muted-foreground">
                                        <Star className="h-3 w-3 fill-sky-400 text-sky-400" />
                                        {worker.rating}
                                      </p>
                                      {!worker.available && (
                                        <p className="text-rose-400">Unavailable</p>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">
                    Optional — skip workers you don&apos;t need. {talentPool.length} vetted
                    freelancers in the Rex talent pool.{' '}
                    <Link to="/become-a-supplier" className="text-sky-400 hover:underline">
                      Join as talent
                    </Link>
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep('studios')}
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </button>
                <button type="button" onClick={() => setStep('review')} className="dex-btn">
                  Review & launch
                  <ArrowRight className="ml-2 inline h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-5">
              <div className="dex-card">
                <div className="relative z-[1] space-y-4">
                  <h2 className="font-semibold text-white">Review your launch</h2>

                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm">
                    <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
                      Project
                    </p>
                    <p className="mt-1 font-medium text-white">{projectName}</p>
                    <p className="text-xs text-muted-foreground">
                      {industries.find((i) => i.id === categoryId)?.name}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">{description}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Deliverables
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {deliverables.map((id) => (
                        <span
                          key={id}
                          className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-foreground"
                        >
                          {projectDeliverables.find((d) => d.id === id)?.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {hasOwnSupplier && shortlistedStudios.length === 0
                        ? 'Your supplier'
                        : studioSkipped
                          ? 'Development studio'
                          : 'Shortlisted studios'}
                    </p>
                    {studioSkipped ? (
                      <p className="mt-1 text-sm text-muted-foreground">Decide later</p>
                    ) : hasOwnSupplier && shortlistedStudios.length === 0 ? (
                      <p className="mt-1 text-sm text-white">
                        {ownSupplierName}{' '}
                        <span className="text-muted-foreground">(pending vetting)</span>
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-1">
                        {shortlistedStudios.map((id) => {
                          const studio = devStudios.find((s) => s.id === id)!;
                          return (
                            <li key={id} className="text-sm text-white">
                              {studio.name}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Talent assignments
                    </p>
                    {Object.entries(talentAssignments).filter(([, id]) => id).length === 0 ? (
                      <p className="mt-1 text-sm text-muted-foreground">None — studio handles all</p>
                    ) : (
                      <ul className="mt-2 space-y-1">
                        {Object.entries(talentAssignments)
                          .filter(([, id]) => id)
                          .map(([deliverableId, talentId]) => {
                            const d = projectDeliverables.find((x) => x.id === deliverableId);
                            const t = talentPool.find((x) => x.id === talentId);
                            return (
                              <li key={deliverableId} className="text-sm text-white">
                                {d?.label}: <span className="text-sky-400">{t?.name}</span>
                              </li>
                            );
                          })}
                      </ul>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-sky-500/25 bg-sky-500/5 p-4">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-sky-400" />
                      <span className="font-semibold text-white">Launch fee</span>
                    </div>
                    <span className="text-2xl font-bold text-sky-400">${CLAIM_FEE}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep('talent')}
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </button>
                <button type="button" onClick={() => setLaunched(true)} className="dex-btn">
                  Launch for ${CLAIM_FEE}
                </button>
              </div>
            </div>
          )}
          </div>

          <div className="order-first lg:order-last">
            <LaunchPreview data={previewData} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
