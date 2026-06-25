import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, UserPlus } from 'lucide-react';
import { Layout, BackLink } from '../components/Layout';
import { industries } from '../data/industries';
import { devStudios, projectDeliverables, type DeliverableId } from '../data/devStudios';
import { talentPool } from '../data/talentPool';
import { CLAIM_FEE, KYC_FEE } from '../data/claimPricing';
import { RecommendedRoadmapList, RoadmapKycNotice } from '../components/get-started/LaunchFlowParts';
import {
  InspireMePanel,
  runInspireGenerate,
} from '../components/get-started/InspireMePanel';
import { LaunchStudiosStep } from '../components/get-started/LaunchStudiosStep';
import { LaunchTalentStep } from '../components/get-started/LaunchTalentStep';
import { CoinUtilitySelect } from '../components/get-started/CoinUtilitySelect';
import { VendorChatModal } from '../components/get-started/VendorChatModal';
import type { InspireIdeaResult } from '../utils/launchIdeaAssistant';
import { buildRecommendedRoadmap } from '../utils/recommendedRoadmap';
import { getCoinUtilityLabel, type CoinUtilityId } from '../data/coinUtilities';
import type { VendorChatTarget } from '../utils/vendorChat';

type Step = 'idea' | 'roadmap' | 'studios' | 'talent' | 'launch';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30';

const STEPS: { id: Step; label: string }[] = [
  { id: 'idea', label: 'Your idea' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'studios', label: 'Studios' },
  { id: 'talent', label: 'Talent' },
  { id: 'launch', label: 'Launch' },
];

export function GetStartedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>('idea');
  const [launched, setLaunched] = useState(false);

  const [projectName, setProjectName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [coinUtilities, setCoinUtilities] = useState<CoinUtilityId[]>([]);
  const [deliverables, setDeliverables] = useState<DeliverableId[]>([]);
  const [inspireOpen, setInspireOpen] = useState(false);
  const [inspireInterest, setInspireInterest] = useState('');
  const [inspireResult, setInspireResult] = useState<InspireIdeaResult | null>(null);
  const [inspiring, setInspiring] = useState(false);

  const [studioSearch, setStudioSearch] = useState('');
  const [showOwnSupplier, setShowOwnSupplier] = useState(false);
  const [studioSkipped, setStudioSkipped] = useState(false);
  const [shortlistedStudios, setShortlistedStudios] = useState<string[]>([]);
  const [ownSupplierName, setOwnSupplierName] = useState('');
  const [ownSupplierEmail, setOwnSupplierEmail] = useState('');
  const [ownSupplierWebsite, setOwnSupplierWebsite] = useState('');
  const [talentAssignments, setTalentAssignments] = useState<Record<string, string>>({});
  const [chatTarget, setChatTarget] = useState<VendorChatTarget | null>(null);
  const [vendorChats, setVendorChats] = useState<VendorChatTarget[]>([]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const openVendorChat = (target: VendorChatTarget) => {
    setChatTarget(target);
    setVendorChats((prev) =>
      prev.some((chat) => chat.key === target.key) ? prev : [...prev, target],
    );
  };

  const vendorChatKeys = vendorChats.map((chat) => chat.key);

  useEffect(() => {
    const category = searchParams.get('category');
    const name = searchParams.get('name');
    const idea = searchParams.get('idea');
    if (category) setCategoryId(category);
    if (name) setProjectName(name);
    if (idea) setDescription(idea);
    if (category === 'celebrity-coins' && (name || idea)) {
      setDeliverables((prev) => {
        const next = new Set(prev);
        next.add('smart-contract');
        next.add('marketing');
        return [...next];
      });
      setCoinUtilities((prev) => {
        const next = new Set(prev);
        next.add('auto-marketing');
        next.add('fan-perks');
        return [...next];
      });
    }
  }, [searchParams]);

  const toggleDeliverable = (id: DeliverableId) => {
    setDeliverables((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const canProceedIdea =
    projectName.trim() &&
    categoryId &&
    description.trim() &&
    coinUtilities.length > 0 &&
    deliverables.length > 0;

  const hasOwnSupplier =
    showOwnSupplier && ownSupplierName.trim().length > 0 && ownSupplierEmail.trim().length > 0;

  const milestones = useMemo(
    () =>
      buildRecommendedRoadmap({
        categoryId,
        projectName,
        deliverables,
      }),
    [categoryId, projectName, deliverables],
  );

  const goToStep = (target: Step) => {
    const targetIndex = STEPS.findIndex((s) => s.id === target);
    if (targetIndex <= stepIndex) setStep(target);
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

  const assignTalent = (deliverableId: string, talentId: string) => {
    setTalentAssignments((prev) => ({
      ...prev,
      [deliverableId]: prev[deliverableId] === talentId ? '' : talentId,
    }));
  };

  const handleInspireGenerate = () => {
    runInspireGenerate(inspireInterest, categoryId, setInspireResult, setInspiring);
  };

  const handleSelectInspirePill = (label: string, pillCategoryId?: string) => {
    setInspireInterest(label);
    if (pillCategoryId) setCategoryId(pillCategoryId);
  };

  const applyInspiredIdea = () => {
    if (!inspireResult) return;
    if (!projectName.trim()) setProjectName(inspireResult.title);
    setDescription(inspireResult.description);
    setInspireOpen(false);
  };

  if (launched) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
          <h1 className="mt-6 font-serif text-3xl font-bold text-white">Project launched!</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            {projectName} is live on Rex with your recommended roadmap, marketing wallet, and team
            shortlist saved.
            {vendorChats.length > 0 && (
              <>
                {' '}
                Vendor chats stay open — finalise scope and pricing in your founder dashboard.
              </>
            )}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={`/project/${categoryId}/new/promote?name=${encodeURIComponent(projectName)}`}
              className="dex-btn-green"
            >
              Promote your coin
            </Link>
            <button type="button" onClick={() => navigate('/')} className="dex-btn">
              Back to home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 pb-16">
        <BackLink />

        <div className="mt-6 max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-wider text-sky-400">Launch for $1</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-white md:text-4xl">Get started</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Describe your idea, review Rex&apos;s recommended roadmap, shortlist studios and talent,
            then launch. Complete KYC (${KYC_FEE}) for full founder controls.
          </p>

          <div className="mt-8 flex gap-1.5 sm:gap-2">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                disabled={i > stepIndex}
                onClick={() => goToStep(s.id)}
                className={`flex flex-1 flex-col gap-1.5 text-left ${
                  i <= stepIndex ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                <div
                  className={`h-1 rounded-full transition-colors ${
                    i <= stepIndex ? 'bg-sky-500' : 'bg-white/10'
                  }`}
                />
                <span
                  className={`text-[9px] font-medium sm:text-xs ${
                    i === stepIndex ? 'text-sky-400' : 'text-muted-foreground'
                  }`}
                >
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 max-w-3xl">
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

                  <CoinUtilitySelect selected={coinUtilities} onChange={setCoinUtilities} />

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
                    <InspireMePanel
                      open={inspireOpen}
                      interest={inspireInterest}
                      result={inspireResult}
                      loading={inspiring}
                      onToggle={() => setInspireOpen((open) => !open)}
                      onInterestChange={setInspireInterest}
                      onSelectPill={handleSelectInspirePill}
                      onGenerate={handleInspireGenerate}
                      onUseIdea={applyInspiredIdea}
                    />
                  </div>
                </div>
              </div>

              <div className="dex-card">
                <div className="relative z-[1]">
                  <h2 className="font-semibold text-white">What do you need built?</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Rex uses these to shape your recommended roadmap milestones.
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
                  onClick={() => setStep('roadmap')}
                  className="dex-btn disabled:opacity-40"
                >
                  See recommended roadmap
                  <ArrowRight className="ml-2 inline h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'roadmap' && (
            <div className="space-y-5">
              <div className="dex-card">
                <div className="relative z-[1] space-y-4">
                  <div>
                    <h2 className="font-semibold text-white">Recommended roadmap</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Based on {projectName} in{' '}
                      {industries.find((i) => i.id === categoryId)?.name}. Rex manages payouts
                      until you complete KYC.
                    </p>
                  </div>

                  <RoadmapKycNotice />
                  <RecommendedRoadmapList milestones={milestones} />
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep('idea')}
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </button>
                <button type="button" onClick={() => setStep('studios')} className="dex-btn">
                  Shortlist studios
                  <ArrowRight className="ml-2 inline h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'studios' && (
            <LaunchStudiosStep
              studioSearch={studioSearch}
              showOwnSupplier={showOwnSupplier}
              studioSkipped={studioSkipped}
              shortlistedStudios={shortlistedStudios}
              ownSupplierName={ownSupplierName}
              ownSupplierEmail={ownSupplierEmail}
              ownSupplierWebsite={ownSupplierWebsite}
              onStudioSearch={setStudioSearch}
              onToggleStudio={toggleStudio}
              onSkipStudios={skipStudios}
              onToggleOwnSupplierPanel={() => setShowOwnSupplier((v) => !v)}
              onOwnSupplierName={(v) => {
                setStudioSkipped(false);
                setOwnSupplierName(v);
              }}
              onOwnSupplierEmail={(v) => {
                setStudioSkipped(false);
                setOwnSupplierEmail(v);
              }}
              onOwnSupplierWebsite={setOwnSupplierWebsite}
              vendorChatKeys={vendorChatKeys}
              onOpenChat={openVendorChat}
              onBack={() => setStep('roadmap')}
              onContinue={() => setStep('talent')}
            />
          )}

          {step === 'talent' && (
            <LaunchTalentStep
              deliverables={deliverables}
              talentAssignments={talentAssignments}
              vendorChatKeys={vendorChatKeys}
              onAssignTalent={assignTalent}
              onOpenChat={openVendorChat}
              onBack={() => setStep('studios')}
              onContinue={() => setStep('launch')}
            />
          )}

          {step === 'launch' && (
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
                      Coin utilities
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {coinUtilities.map((id) => (
                        <span
                          key={id}
                          className="rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-0.5 text-xs text-sky-300"
                        >
                          {getCoinUtilityLabel(id)}
                        </span>
                      ))}
                    </div>
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
                      Roadmap
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {milestones.length} milestones — Rex managed until KYC
                    </p>
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

                  {vendorChats.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Vendor conversations
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {vendorChats.length} active chat{vendorChats.length > 1 ? 's' : ''} — scope
                        and pricing to finalise after launch
                      </p>
                      <ul className="mt-2 space-y-1">
                        {vendorChats.map((chat) => (
                          <li key={chat.key} className="flex items-center justify-between text-sm">
                            <span className="text-white">{chat.name}</span>
                            <button
                              type="button"
                              onClick={() => setChatTarget(chat)}
                              className="text-xs font-medium text-sky-400 hover:text-sky-300"
                            >
                              Open chat
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between rounded-xl border border-sky-500/25 bg-sky-500/5 p-4">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-sky-400" />
                      <span className="font-semibold text-white">Launch fee</span>
                    </div>
                    <span className="text-2xl font-bold text-sky-400">${CLAIM_FEE}</span>
                  </div>
                </div>
              </div>

              <div className="dex-card border-amber-500/20">
                <div className="relative z-[1] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3">
                    <BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-amber-400" />
                    <div>
                      <p className="font-semibold text-white">Unlock full founder controls</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Complete KYC for ${KYC_FEE} to edit milestones, reassign vendors, and approve
                        marketing spend yourself.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-500/15"
                  >
                    KYC — ${KYC_FEE}
                  </button>
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
      </div>

      {chatTarget && (
        <VendorChatModal target={chatTarget} onClose={() => setChatTarget(null)} />
      )}
    </Layout>
  );
}
