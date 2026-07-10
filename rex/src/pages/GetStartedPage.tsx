import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BadgeCheck, UserPlus } from 'lucide-react';
import { Layout, BackLink } from '../components/Layout';
import { industries } from '../data/industries';
import { projectDeliverables } from '../data/devStudios';
import { CLAIM_FEE, KYC_FEE } from '../data/claimPricing';
import type { ShareGrant } from '../data/founderTokenomics';
import { MarketingRoadmapPanel } from '../components/founder/MarketingRoadmapPanel';
import { FounderTokenomicsPanel } from '../components/founder/FounderTokenomicsPanel';
import { RoadmapKycNotice } from '../components/get-started/LaunchFlowParts';
import {
  InspireMePanel,
  runInspireGenerate,
} from '../components/get-started/InspireMePanel';
import type { InspireIdeaResult } from '../utils/launchIdeaAssistant';
import { buildRecommendedRoadmap } from '../utils/recommendedRoadmap';
import { getRoadmapHorizon, type RoadmapHorizonId } from '../data/roadmapHorizons';
import { launchModeOptions, type LaunchModeId } from '../data/launchModes';
import { LAUNCH_NOTE, LAUNCH_SUMMARY } from '../data/launchTerms';
import { ProjectImagePicker, type ProjectImageSource } from '../components/get-started/ProjectImagePicker';
import { CommunityLinksForm } from '../components/get-started/CommunityLinksForm';
import { ExistingProjectAssets } from '../components/get-started/ExistingProjectAssets';
import { ProjectOriginPicker } from '../components/get-started/ProjectOriginPicker';
import { RexConceptSummaryStep } from '../components/get-started/RexConceptSummaryStep';
import {
  CreativeSuiteStep,
  type CreativeSuiteState,
} from '../components/get-started/CreativeSuiteStep';
import { saveFounderProject } from '../utils/founderProject';
import { hasRequiredTelegram, normalizeCommunityLinks } from '../utils/projectCommunity';
import type { ProjectOrigin } from '../utils/projectOrigin';
import { buildConceptSummary } from '../utils/conceptSummary';
import { MarketAnalysisStep } from '../components/get-started/MarketAnalysisStep';
import {
  applyAnalysisRecommendations,
  buildMarketAnalysis,
  type AnalysisChatMessage,
  type AnalysisDocument,
  type MarketAnalysis,
} from '../utils/marketAnalysis';

type Step = 'idea' | 'analysis' | 'summary' | 'roadmap' | 'creative' | 'launch';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30';

const STEPS: { id: Step; label: string }[] = [
  { id: 'idea', label: 'Your idea' },
  { id: 'analysis', label: 'Market analysis' },
  { id: 'summary', label: 'Rex summary' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'creative', label: 'Creative suite' },
  { id: 'launch', label: 'Launch' },
];

const EMPTY_CREATIVE: CreativeSuiteState = {
  landingPageUrl: null,
  landingPageSource: null,
  landingPageFunding: null,
  bannerAssets: [],
  queuedBannerCount: 0,
};

export function GetStartedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>('idea');

  const [projectName, setProjectName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [projectImageUrl, setProjectImageUrl] = useState<string | null>(null);
  const [projectImageSource, setProjectImageSource] = useState<ProjectImageSource>(null);
  const [projectOrigin, setProjectOrigin] = useState<ProjectOrigin>('new');
  const [existingProductUrl, setExistingProductUrl] = useState('');
  const [projectAssets, setProjectAssets] = useState<string[]>([]);
  const [telegramGroup, setTelegramGroup] = useState('');
  const [discordUrl, setDiscordUrl] = useState('');
  const [roadmapHorizon, setRoadmapHorizon] = useState<RoadmapHorizonId>('12-months');
  const [shareGrants, setShareGrants] = useState<ShareGrant[]>([]);
  const [creativeSuite, setCreativeSuite] = useState<CreativeSuiteState>(EMPTY_CREATIVE);
  const [inspireOpen, setInspireOpen] = useState(false);
  const [inspireInterest, setInspireInterest] = useState('');
  const [inspireResult, setInspireResult] = useState<InspireIdeaResult | null>(null);
  const [inspiring, setInspiring] = useState(false);
  const [launchMode, setLaunchMode] = useState<LaunchModeId>('immediate');
  const [analysisDocuments, setAnalysisDocuments] = useState<AnalysisDocument[]>([]);
  const [analysisChat, setAnalysisChat] = useState<AnalysisChatMessage[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [selectedRecommendationIds, setSelectedRecommendationIds] = useState<string[]>([]);
  const [analysisApproved, setAnalysisApproved] = useState(false);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  useEffect(() => {
    const category = searchParams.get('category');
    const name = searchParams.get('name');
    const idea = searchParams.get('idea');
    if (category) setCategoryId(category);
    if (name) setProjectName(name);
    if (idea) setDescription(idea);
  }, [searchParams]);

  const communityLinks = useMemo(
    () =>
      normalizeCommunityLinks({
        telegramGroup,
        discordUrl,
      }),
    [telegramGroup, discordUrl],
  );

  const isExisting = projectOrigin === 'existing';

  useEffect(() => {
    if (step !== 'analysis' || analysisApproved) return;
    const next = buildMarketAnalysis({
      projectName,
      categoryId,
      description,
      projectOrigin,
      existingProductUrl: existingProductUrl.trim() || undefined,
      documents: analysisDocuments,
    });
    setMarketAnalysis(next);
    setSelectedRecommendationIds(next.recommendations.map((r) => r.id));
  }, [
    step,
    analysisApproved,
    projectName,
    categoryId,
    description,
    projectOrigin,
    existingProductUrl,
    analysisDocuments,
  ]);

  const conceptSummary = useMemo(
    () =>
      buildConceptSummary({
        projectName,
        categoryId,
        description,
        projectOrigin,
      }),
    [projectName, categoryId, description, projectOrigin],
  );

  const deliverables = conceptSummary.inferredDeliverables;

  const hasExistingProof =
    !isExisting || existingProductUrl.trim().length > 0 || projectAssets.length > 0;

  const canProceedIdea =
    projectName.trim() &&
    categoryId &&
    description.trim() &&
    hasRequiredTelegram(communityLinks.telegramGroup) &&
    hasExistingProof;

  const previewProject = useMemo(
    (): import('../utils/founderProject').FounderProject => ({
      projectName,
      categoryId,
      description,
      coinUtilities: [],
      deliverables,
      roadmapHorizon,
      shareGrants,
      kycCompleted: false,
      shortlistedStudios: [],
      studioSkipped: true,
      ownSupplierName: '',
      ownSupplierEmail: '',
      talentAssignments: {},
      vendorChats: [],
      launchMode: 'immediate',
      launchedAt: new Date().toISOString(),
      projectImageUrl,
      projectImageSource: projectImageSource ?? undefined,
      projectOrigin,
      existingProductUrl: isExisting ? existingProductUrl.trim() || undefined : undefined,
      projectAssets: isExisting && projectAssets.length > 0 ? projectAssets : undefined,
      landingPageUrl: creativeSuite.landingPageUrl,
      landingPageSource: creativeSuite.landingPageSource ?? undefined,
      landingPageFunding: creativeSuite.landingPageFunding ?? undefined,
      bannerAssets: creativeSuite.bannerAssets.length > 0 ? creativeSuite.bannerAssets : undefined,
      queuedBannerCount: creativeSuite.queuedBannerCount || undefined,
      telegramGroup: communityLinks.telegramGroup,
      discordUrl: communityLinks.discordUrl,
    }),
    [
      projectName,
      categoryId,
      description,
      deliverables,
      roadmapHorizon,
      shareGrants,
      projectImageUrl,
      projectImageSource,
      communityLinks,
      projectOrigin,
      existingProductUrl,
      projectAssets,
      isExisting,
      creativeSuite,
    ],
  );

  const milestones = useMemo(
    () =>
      buildRecommendedRoadmap({
        categoryId,
        projectName,
        deliverables,
        horizon: roadmapHorizon,
      }),
    [categoryId, projectName, deliverables, roadmapHorizon],
  );

  const goToStep = (target: Step) => {
    const targetIndex = STEPS.findIndex((s) => s.id === target);
    if (targetIndex <= stepIndex) setStep(target);
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

  const handleLaunch = () => {
    saveFounderProject({
      projectName: projectName.trim(),
      categoryId,
      description: description.trim(),
      coinUtilities: [],
      deliverables,
      roadmapHorizon,
      shareGrants,
      kycCompleted: false,
      shortlistedStudios: [],
      studioSkipped: true,
      ownSupplierName: '',
      ownSupplierEmail: '',
      talentAssignments: {},
      vendorChats: [],
      launchMode,
      launchedAt: new Date().toISOString(),
      projectImageUrl,
      projectImageSource: projectImageSource ?? undefined,
      projectOrigin,
      existingProductUrl: isExisting ? existingProductUrl.trim() || undefined : undefined,
      projectAssets: isExisting && projectAssets.length > 0 ? projectAssets : undefined,
      landingPageUrl: creativeSuite.landingPageUrl,
      landingPageSource: creativeSuite.landingPageSource ?? undefined,
      landingPageFunding: creativeSuite.landingPageFunding ?? undefined,
      bannerAssets: creativeSuite.bannerAssets.length > 0 ? creativeSuite.bannerAssets : undefined,
      queuedBannerCount: creativeSuite.queuedBannerCount || undefined,
      telegramGroup: communityLinks.telegramGroup,
      discordUrl: communityLinks.discordUrl,
    });
    navigate(launchMode === 'staging' ? '/dashboard?welcome=1&staging=1' : '/dashboard?welcome=1');
  };

  const handleApproveAnalysis = () => {
    if (!marketAnalysis) return;
    const updated = applyAnalysisRecommendations(
      description,
      marketAnalysis.recommendations,
      selectedRecommendationIds,
    );
    if (updated !== description) setDescription(updated);
    setAnalysisApproved(true);
  };

  const handleAnalysisDocumentsChange = (docs: AnalysisDocument[]) => {
    setAnalysisDocuments(docs);
    if (!analysisApproved) {
      const next = buildMarketAnalysis({
        projectName,
        categoryId,
        description,
        projectOrigin,
        existingProductUrl: existingProductUrl.trim() || undefined,
        documents: docs,
      });
      setMarketAnalysis(next);
      setSelectedRecommendationIds((prev) => [
        ...new Set([...prev, ...next.recommendations.map((r) => r.id)]),
      ]);
    }
  };

  const categoryLabel = industries.find((i) => i.id === categoryId)?.name;
  const landingSlug = projectName.trim()
    ? `${projectName.trim().toLowerCase().replace(/\s+/g, '-')}.rex.app`
    : 'your-project.rex.app';

  return (
    <Layout>
      <div className="container py-8 pb-16">
        <div className="mx-auto max-w-4xl">
          <BackLink />
        </div>

        <div className="mx-auto mt-6 max-w-4xl">
          <p className="text-sm font-medium uppercase tracking-wider text-sky-400">Launch for $1</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-white md:text-4xl">Get started</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Share your idea, review Rex&apos;s concept summary and roadmap, build launch assets in
            the creative suite, then go live. Complete KYC (${KYC_FEE}) for full founder controls.
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

        <div className="mx-auto mt-8 max-w-4xl min-w-0 overflow-x-hidden">
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

                  <ProjectOriginPicker value={projectOrigin} onChange={setProjectOrigin} />

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      {isExisting ? 'Tell us about your product' : "What's the idea?"}
                    </label>
                    <textarea
                      className={inputClass}
                      rows={4}
                      placeholder={
                        isExisting
                          ? 'What does your product do today, who uses it, and what growth do you want from Rex?'
                          : "Describe what you're building, who it's for, and what problem it solves…"
                      }
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

                  {isExisting && (
                    <ExistingProjectAssets
                      productUrl={existingProductUrl}
                      onProductUrlChange={setExistingProductUrl}
                      assets={projectAssets}
                      onAssetsChange={setProjectAssets}
                    />
                  )}

                  <ProjectImagePicker
                    imageUrl={projectImageUrl}
                    imageSource={projectImageSource}
                    onChange={(url, source) => {
                      setProjectImageUrl(url);
                      setProjectImageSource(source);
                    }}
                    projectName={projectName}
                    description={description}
                    categoryLabel={categoryLabel}
                  />

                  <CommunityLinksForm
                    value={communityLinks}
                    onChange={(links) => {
                      setTelegramGroup(links.telegramGroup);
                      setDiscordUrl(links.discordUrl ?? '');
                    }}
                  />
                </div>
              </div>

              {isExisting && !hasExistingProof && (
                <p className="text-xs text-amber-400/90">
                  Add your product URL or at least one brand asset to continue.
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!canProceedIdea}
                  onClick={() => {
                    setAnalysisApproved(false);
                    setAnalysisChat([]);
                    setStep('analysis');
                  }}
                  className="dex-btn disabled:opacity-40"
                >
                  Run market analysis
                  <ArrowRight className="ml-2 inline h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'analysis' && marketAnalysis && (
            <MarketAnalysisStep
              projectName={projectName}
              analysis={marketAnalysis}
              onAnalysisChange={setMarketAnalysis}
              documents={analysisDocuments}
              onDocumentsChange={handleAnalysisDocumentsChange}
              chatMessages={analysisChat}
              onChatMessagesChange={setAnalysisChat}
              selectedRecommendationIds={selectedRecommendationIds}
              onSelectedRecommendationIdsChange={setSelectedRecommendationIds}
              approved={analysisApproved}
              onApprove={handleApproveAnalysis}
              categoryId={categoryId}
              description={description}
              onBack={() => setStep('idea')}
              onContinue={() => setStep('summary')}
            />
          )}

          {step === 'summary' && (
            <RexConceptSummaryStep
              summary={conceptSummary}
              categoryLabel={categoryLabel}
              onBack={() => setStep('analysis')}
              onContinue={() => setStep('roadmap')}
            />
          )}

          {step === 'roadmap' && (
            <div className="min-w-0 space-y-5 overflow-x-hidden">
              <div className="dex-card min-w-0 overflow-hidden">
                <div className="relative z-[1] min-w-0">
                  <div className="mb-5">
                    <h2 className="font-semibold text-white">Marketing roadmap</h2>
                    <p className="mt-1 break-words text-sm text-muted-foreground">
                      Rex&apos;s recommended campaign for {projectName || 'your project'} in{' '}
                      {categoryLabel ?? 'your category'} — community push first, then charting and
                      scale as your wallet grows.
                    </p>
                  </div>

                  <MarketingRoadmapPanel
                    project={previewProject}
                    roadmapHorizon={roadmapHorizon}
                    kycCompleted={false}
                    onHorizonChange={setRoadmapHorizon}
                  />

                  <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
                    <FounderTokenomicsPanel
                      horizon={roadmapHorizon}
                      shareGrants={shareGrants}
                      onShareGrantsChange={setShareGrants}
                      editable
                      defaultExpanded={false}
                    />
                    <RoadmapKycNotice />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setStep('summary')}
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </button>
                <button type="button" onClick={() => setStep('creative')} className="dex-btn">
                  Open creative suite
                  <ArrowRight className="ml-2 inline h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'creative' && (
            <CreativeSuiteStep
              projectName={projectName}
              description={description}
              categoryLabel={categoryLabel}
              value={creativeSuite}
              onChange={setCreativeSuite}
              onBack={() => setStep('roadmap')}
              onContinue={() => setStep('launch')}
            />
          )}

          {step === 'launch' && (
            <div className="space-y-5">
              <div className="dex-card">
                <div className="relative z-[1] space-y-4">
                  <h2 className="font-semibold text-white">Review & launch</h2>
                  <p className="text-sm text-muted-foreground">{LAUNCH_SUMMARY}</p>

                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Launch timing</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {launchModeOptions.map((option) => {
                        const Icon = option.icon;
                        const selected = launchMode === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setLaunchMode(option.id)}
                            className={`rounded-xl border p-3 text-left transition-colors ${
                              selected
                                ? 'border-sky-500/50 bg-sky-500/10'
                                : 'border-white/10 bg-white/5 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                  selected ? 'bg-sky-500/20 text-sky-300' : 'bg-white/5 text-muted-foreground'
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </span>
                              <span>
                                <p className="text-sm font-medium text-white">{option.title}</p>
                                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                  {option.description}
                                </p>
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-3 text-xs text-muted-foreground">
                    {LAUNCH_NOTE}
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm">
                    <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
                      Project
                    </p>
                    <p className="mt-1 font-medium text-white">{projectName}</p>
                    <p className="text-xs text-muted-foreground">
                      {categoryLabel}
                      {isExisting && ' · Existing project'}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">{description}</p>
                    {isExisting && existingProductUrl.trim() && (
                      <p className="mt-2 text-xs text-sky-400">{existingProductUrl.trim()}</p>
                    )}
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm">
                    <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
                      Rex concept
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {conceptSummary.summary}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {deliverables.map((id) => (
                        <span
                          key={id}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-foreground"
                        >
                          {projectDeliverables.find((d) => d.id === id)?.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm">
                    <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
                      Creative suite
                    </p>
                    {creativeSuite.landingPageUrl ? (
                      <p className="mt-1 text-xs text-white">
                        Landing page · {landingSlug}
                        {creativeSuite.landingPageFunding === 'rex-coin' && (
                          <span className="ml-1 text-emerald-400">· ready on launch</span>
                        )}
                      </p>
                    ) : creativeSuite.landingPageFunding === 'marketing-wallet' ? (
                      <p className="mt-1 text-xs text-amber-300/90">
                        Landing page queued — generates when marketing wallet fills
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground">
                        No landing page yet — add from dashboard
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {creativeSuite.bannerAssets.length} banner
                      {creativeSuite.bannerAssets.length === 1 ? '' : 's'} uploaded
                      {creativeSuite.queuedBannerCount > 0 &&
                        ` · ${creativeSuite.queuedBannerCount} queued`}
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-sm">
                    <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
                      Community
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Telegram: {communityLinks.telegramGroup}
                    </p>
                    {communityLinks.discordUrl && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Discord: {communityLinks.discordUrl}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Roadmap
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {getRoadmapHorizon(roadmapHorizon).label} · {milestones.length} milestones ·
                      {shareGrants.length > 0
                        ? ` ${shareGrants.length} share grant${shareGrants.length === 1 ? '' : 's'}`
                        : ' no share grants yet'}
                    </p>
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
                  onClick={() => setStep('creative')}
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </button>
                <button type="button" onClick={handleLaunch} className="dex-btn">
                  {launchMode === 'staging'
                    ? `Start prelaunch — $${CLAIM_FEE}`
                    : `Launch immediately — $${CLAIM_FEE}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
