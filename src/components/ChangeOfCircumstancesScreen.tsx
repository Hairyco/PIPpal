import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  Loader2,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Download,
  ClipboardList,
  Stethoscope,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from './AppContext';
import { PIP_QUESTIONS } from '../pipQuestions';
import { ContextualAssistantBar } from './ContextualAssistantBar';
import {
  ACCEPTED_UPLOAD_IDS,
  DESCRIPTOR_HARD_IDS,
  EVIDENCE_FLOW_A_IDS,
  EVIDENCE_FLOW_B_IDS,
  FLOW_B_AWARD_IDS,
  FLOW_B_MED_EXTRA_IDS,
  getDefaultCocWarmCopy,
  mergeCocWarmCopy,
  MED_STATUS_IDS,
  readCachedCocWarmCopy,
  RELIABILITY_IDS,
  SYMPTOM_IDS,
  type WhatChangedId,
  WHAT_CHANGED_IDS,
  writeCachedCocWarmCopy,
  type CocWarmCopy,
  type FlowBAwardId,
  type MedStatusId,
  type DescriptorHardId,
  type EvidenceFlowAId,
  type EvidenceFlowBId,
  type FlowBMedExtraId,
  type ReliabilityId,
  type StepHeaderKey,
  type SymptomId,
} from '../data/cocWarmCopy';

const TOTAL_STEPS = 10;

type FlowBranch = 'a' | 'b';

function cocStepHeaderKey(stepNum: number, br: FlowBranch | null): StepHeaderKey {
  if (stepNum === 1) return 's01';
  if (stepNum === 2) return br === 'b' ? 's02b' : 's02a';
  if (stepNum === 3) return br === 'b' ? 's03b' : 's03a';
  if (stepNum === 4) return 's04';
  if (stepNum === 5) return 's05';
  if (stepNum === 6) return 's06';
  if (stepNum === 7) return 's07';
  if (stepNum === 8) return 's08';
  if (stepNum === 9) return 's09';
  return 's10';
}

function StepHeader({
  step,
  title,
  total,
  onBack,
}: {
  step: number;
  title: string;
  total: number;
  onBack: () => void;
}) {
  return (
    <div className="bg-white border-b border-stone-100 px-5 py-4 sticky top-0 z-10">
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
            Step {step} of {total}
          </p>
          <h1 className="font-bold text-stone-900 text-base leading-tight truncate">{title}</h1>
        </div>
      </div>
      <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
        <motion.div
          className="bg-teal-600 h-full rounded-full"
          animate={{ width: `${(step / total) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

function BottomBar({
  onNext,
  label = 'Continue',
  disabled = false,
  onBack,
  showBack = false,
}: {
  onNext: () => void;
  label?: string;
  disabled?: boolean;
  onBack?: () => void;
  showBack?: boolean;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 px-5 py-4 flex gap-3 max-w-4xl mx-auto safe-area-pb z-20">
      {showBack && onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3.5 rounded-xl border-2 border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50 active:scale-[0.98] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="flex-1 flex items-center justify-center gap-2 bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-teal-800 active:scale-[0.98] transition-all disabled:opacity-40 shadow-sm"
      >
        {label}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left text-xs sm:text-sm font-medium px-3 py-2.5 rounded-xl border transition-all active:scale-[0.98] ${
        selected
          ? 'bg-teal-50 border-teal-400 text-teal-900 shadow-sm'
          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
      }`}
    >
      {children}
    </button>
  );
}

export function ChangeOfCircumstancesScreen() {
  const { goBack, navigateTo, hasPaid, savedAnswers, medProfile, isAdmin } = useAppContext();
  const hasAnswers = Object.keys(savedAnswers || {}).length > 0;

  const [warmCopy, setWarmCopy] = useState<CocWarmCopy>(() => readCachedCocWarmCopy() ?? getDefaultCocWarmCopy());
  const [warmCopyLoading, setWarmCopyLoading] = useState(() => readCachedCocWarmCopy() == null);

  const [step, setStep] = useState(1);
  const [branch, setBranch] = useState<FlowBranch | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const [uploadedLabels, setUploadedLabels] = useState<string[]>([]);
  const [analysisBusy, setAnalysisBusy] = useState(false);

  const [awardFocusIds, setAwardFocusIds] = useState<string[]>(() =>
    PIP_QUESTIONS.filter(q => savedAnswers?.[q.id]).map(q => q.id)
  );

  const [whatChanged, setWhatChanged] = useState<WhatChangedId[]>([]);
  const [medStatus, setMedStatus] = useState<MedStatusId[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomId[]>([]);
  const [flowBExtras, setFlowBExtras] = useState<FlowBMedExtraId[]>([]);

  const [dailyRate, setDailyRate] = useState<'unset' | 'none' | 'standard' | 'enhanced'>('unset');
  const [mobRate, setMobRate] = useState<'unset' | 'none' | 'standard' | 'enhanced'>('unset');
  const [prevAreas, setPrevAreas] = useState<FlowBAwardId[]>([]);

  const [descriptorPick, setDescriptorPick] = useState<string>('q1');
  const [descriptorMap, setDescriptorMap] = useState<
    Record<string, { diff: Set<DescriptorHardId>; rel: Set<ReliabilityId> }>
  >({});

  const [evidencePick, setEvidencePick] = useState<Array<EvidenceFlowAId | EvidenceFlowBId>>([]);

  const [summaryBody, setSummaryBody] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);
  const lastSummaryKey = useRef('');
  const summaryFingerprint = useMemo(
    () =>
      JSON.stringify({
        branch,
        whatChanged,
        medStatus,
        symptoms,
        flowBExtras,
        dailyRate,
        mobRate,
        prevAreas,
        awardFocusIds,
        descriptorMap: Object.fromEntries(
          Object.entries(descriptorMap).map(([k, v]) => [
            k,
            {
              diff: [...(v?.diff ?? new Set<DescriptorHardId>())],
              rel: [...(v?.rel ?? new Set<ReliabilityId>())],
            },
          ])
        ),
        evidencePick,
        uploadedLabels,
        narrativeLabelsSig: JSON.stringify(warmCopy.labels),
      }),
    [
      branch,
      whatChanged,
      medStatus,
      symptoms,
      flowBExtras,
      dailyRate,
      mobRate,
      prevAreas,
      awardFocusIds,
      descriptorMap,
      evidencePick,
      uploadedLabels,
      warmCopy.labels,
    ]
  );

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const back = () => {
    if (step === 1) goBack();
    else setStep(s => s - 1);
  };

  function toggleId<T extends string>(list: T[], setList: React.Dispatch<React.SetStateAction<T[]>>, value: T) {
    setList(prev => (prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value]));
  }

  function setDescriptorSelections(
    qid: string,
    updater: (
      prev: { diff: Set<DescriptorHardId>; rel: Set<ReliabilityId> }
    ) => {
      diff: Set<DescriptorHardId>;
      rel: Set<ReliabilityId>;
    }
  ) {
    setDescriptorMap(prev => {
      const cur =
        prev[qid] ??
        ({
          diff: new Set<DescriptorHardId>(),
          rel: new Set<ReliabilityId>(),
        });
      const nextSlots = updater(cur);
      return { ...prev, [qid]: nextSlots };
    });
  }

  /** Load warmer walkthrough wording from ChatGPT once per session cache. */
  useEffect(() => {
    const cached = readCachedCocWarmCopy();
    if (cached) {
      setWarmCopy(cached);
      setWarmCopyLoading(false);
      return undefined;
    }

    let cancelled = false;
    async function pull() {
      const baseCopy = getDefaultCocWarmCopy();
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'coc-walkthrough-copy', baseCopy, medProfile }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (data?.walkthroughCopy && typeof data.walkthroughCopy === 'object') {
          const merged = mergeCocWarmCopy(baseCopy, data.walkthroughCopy);
          setWarmCopy(merged);
          writeCachedCocWarmCopy(merged);
        } else {
          setWarmCopy(baseCopy);
        }
      } catch {
        if (!cancelled) setWarmCopy(baseCopy);
      } finally {
        if (!cancelled) setWarmCopyLoading(false);
      }
    }
    pull();
    return () => {
      cancelled = true;
    };
  }, [medProfile]);

  /** Flow A: fake “reading uploads” pause */
  useEffect(() => {
    if (step !== 2 || branch !== 'a') return;
    setAnalysisBusy(true);
    const t = window.setTimeout(() => setAnalysisBusy(false), 1100);
    return () => window.clearTimeout(t);
  }, [step, branch]);

  const wc = warmCopy;

  function buildChangeNarrative(): string {
    const L = wc.labels;

    const lines: string[] = [];
    lines.push(`Path: ${branch === 'a' ? 'Guided flow with uploads' : 'Guided flow without documents'}`);
    if (uploadedLabels.length) lines.push(`Files named: ${uploadedLabels.join(', ')}`);

    lines.push('');
    lines.push('What feels worse or different now');
    lines.push(
      whatChanged.length ? whatChanged.map(id => L.whatChanged[id]).join('; ') : 'Not specified via taps.'
    );

    lines.push('', 'Health snapshot (taps)');
    lines.push(`Status markers: ${medStatus.length ? medStatus.map(id => L.medStatus[id]).join('; ') : '—'}`);
    lines.push(`Symptoms: ${symptoms.length ? symptoms.map(id => L.symptoms[id]).join('; ') : '—'}`);
    if (branch === 'b' && flowBExtras.length)
      lines.push(`Day-to-day: ${flowBExtras.map(id => L.flowBMedExtra[id]).join('; ')}`);

    if (branch === 'b') {
      lines.push('', 'Award overview (manual taps)');
      lines.push(
        `Daily living: ${dailyRate === 'unset' ? '—' : wc.bandLabels[dailyRate as keyof CocWarmCopy['bandLabels']] ?? dailyRate}`
      );
      lines.push(
        `Mobility: ${mobRate === 'unset' ? '—' : wc.bandLabels[mobRate as keyof CocWarmCopy['bandLabels']] ?? mobRate}`
      );
      if (prevAreas.length) lines.push(`Previously awarded (areas): ${prevAreas.map(id => L.flowBAward[id]).join('; ')}`);
    }

    lines.push('', 'Activities to stress in wording');
    const focusIds =
      branch === 'a'
        ? (awardFocusIds.length ? awardFocusIds : PIP_QUESTIONS.slice(0, 4).map(q => q.id))
        : (awardFocusIds.length ? awardFocusIds : PIP_QUESTIONS.slice(0, 4).map(q => q.id));
    focusIds.forEach(id => {
      const q = PIP_QUESTIONS.find(x => x.id === id);
      const dm = descriptorMap[id];
      if (!q) return;
      const dLabels = [...(dm?.diff ?? [])].map(x => L.descriptorHard[x]);
      const rLabels = [...(dm?.rel ?? [])].map(x => L.reliability[x]);
      const d = dLabels.length ? dLabels.join('; ') : '—';
      const r = rLabels.length ? rLabels.join('; ') : '—';
      lines.push(`${q.shortTitle}: difficulties — ${d}; reliability — ${r}`);
    });

    lines.push('', 'Evidence to gather next');
    const evTxt = evidencePick.length
      ? evidencePick
          .map(id => {
            const a = wc.labels.evidenceA[id as EvidenceFlowAId];
            if (a) return a;
            return wc.labels.evidenceB[id as EvidenceFlowBId];
          })
          .join('; ')
      : '—';
    lines.push(evTxt);

    if (medProfile?.conditions?.length) {
      lines.push('', `Saved profile conditions: ${medProfile.conditions.map((c: { name?: string }) => c.name).filter(Boolean).join(', ')}`);
    }

    return lines.join('\n');
  }

  useEffect(() => {
    if (step !== 9) return;

    if (summaryFingerprint === lastSummaryKey.current) return;
    lastSummaryKey.current = summaryFingerprint;

    let cancelled = false;

    async function gen() {
      setSummaryLoading(true);
      const narrative = buildChangeNarrative();

      if (hasPaid && hasAnswers) {
        try {
          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'coc-answers',
              savedAnswers,
              medProfile,
              changes: [{ activity: 'Change of circumstances (guided taps)', whatChanged: narrative }],
            }),
          });
          const data = await res.json();
          const text = typeof data.updatedAnswers === 'string' ? data.updatedAnswers : '';
          if (text && !cancelled) {
            setSummaryBody(text);
            setSummaryLoading(false);
            return;
          }
        } catch {
          /* fall through */
        }
      }

      if (!cancelled) {
        setSummaryBody(buildLocalDraftSummary(narrative));
        setSummaryLoading(false);
      }
    }

    gen().catch(() => {
      if (!cancelled) {
        setSummaryBody(buildLocalDraftSummary(buildChangeNarrative()));
        setSummaryLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [step, summaryFingerprint, hasPaid, hasAnswers, savedAnswers, medProfile]);

  function buildLocalDraftSummary(narrative: string): string {
    const head = branch === 'a' ? wc.steps.s09.offlineBannerA : wc.steps.s09.offlineBannerB;
    const tail =
      narrative +
      `\n\n---\nSuggested next actions:\n• Call DWP on your existing claim line when you're ready to report.\n• Open your pip answers from the dashboard so examples stay consistent.\n• Export from Downloads when you're on full access.\n`;

    return `${head}\n\n${tail}`;
  }

  function snapQuestion(qid: string) {
    toggleId(awardFocusIds, setAwardFocusIds, qid);
  }

  const stepTitle = wc.stepHeaders[cocStepHeaderKey(step, branch)];

  const currentDescriptor =
    descriptorMap[descriptorPick] ??
    ({
      diff: new Set<DescriptorHardId>(),
      rel: new Set<ReliabilityId>(),
    });

  function canContinue(): boolean {
    if (step === 1) return false;
    if (step === 4 && whatChanged.length === 0) return false;
    if (step === 3 && branch === 'b') return dailyRate !== 'unset' && mobRate !== 'unset';
    if (step === 9 && summaryLoading) return false;
    return true;
  }

  const onUploadPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadedLabels(Array.from(files).map(f => f.name));
    setBranch('a');
    setAwardFocusIds(prev =>
      prev.length > 0 ? prev : PIP_QUESTIONS.slice(0, 6).map(q => q.id)
    );
    setStep(2);
    e.target.value = '';
  };

  const skipUpload = () => {
    setBranch('b');
    setUploadedLabels([]);
    setStep(2);
  };

  const renderStep = () => {
    if (step === 1) {
      const s = wc.steps.s01;
      return (
        <div className="space-y-5 px-5 pt-5 pb-10">
          {warmCopyLoading && (
            <p className="text-center text-[11px] text-stone-400 -mb-3">Refreshing gentle wording…</p>
          )}

          <div className="bg-teal-700 rounded-2xl p-6 text-white shadow-sm">
            <p className="text-[11px] font-bold text-teal-200 uppercase tracking-widest mb-2">{s.heroEyebrow}</p>
            <h2 className="font-bold text-2xl leading-tight mb-3">{s.heroTitle}</h2>
            <p className="text-teal-100 text-sm leading-relaxed">{s.heroSubtitle}</p>
          </div>

          <div className="rounded-2xl border-2 border-teal-200 bg-white shadow-md p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                <Upload className="w-6 h-6 text-teal-700" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-lg leading-snug">{s.uploadTitle}</h3>
                <p className="text-sm text-stone-500 mt-1 leading-relaxed">{s.uploadBody}</p>
              </div>
            </div>

            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">{s.acceptedLabel}</p>
              <div className="flex flex-wrap gap-2">
                {ACCEPTED_UPLOAD_IDS.map(id => (
                  <span key={id} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-600">
                    {s.acceptedChips[id]}
                  </span>
                ))}
              </div>
            </div>

            <input ref={uploadInputRef} type="file" accept="image/*,.pdf,.doc,.docx" multiple className="hidden" onChange={onUploadPick} />

            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              className="w-full py-4 rounded-xl font-bold text-base bg-teal-700 text-white shadow-sm hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[52px]"
            >
              <Upload className="w-5 h-5" />
              {s.uploadButton}
            </button>

            <button
              type="button"
              onClick={skipUpload}
              className="w-full py-3.5 rounded-xl font-semibold text-sm border-2 border-stone-200 text-stone-700 hover:bg-stone-50 active:scale-[0.99] transition-all"
            >
              {s.skipButton}
            </button>
          </div>

          {isAdmin && (
            <div className="rounded-2xl border border-dashed border-amber-400 bg-amber-50/90 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-800 shrink-0" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-950">{s.adminEyebrow}</p>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">{s.adminBody}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBranch('a');
                    setUploadedLabels(['(Admin preview placeholder)']);
                    setAwardFocusIds(prev => (prev.length > 0 ? prev : PIP_QUESTIONS.slice(0, 6).map(q => q.id)));
                    setStep(2);
                  }}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold bg-amber-800 text-white hover:bg-amber-900 active:scale-[0.99] transition-all"
                >
                  {s.adminPreviewUpload}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBranch('b');
                    setUploadedLabels([]);
                    setStep(2);
                  }}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border-2 border-amber-700 text-amber-950 hover:bg-amber-100 active:scale-[0.99] transition-all"
                >
                  {s.adminPreviewSkip}
                </button>
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 text-sm mb-1">{s.riskTitle}</p>
              <p className="text-xs text-amber-800 leading-relaxed">{s.riskBody}</p>
            </div>
          </div>
        </div>
      );
    }

    if (step === 2 && branch === 'a') {
      const s = wc.steps.s02a;
      return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">{s.leadTitle}</h2>
            <p className="text-teal-100 text-sm leading-relaxed">{s.leadBody}</p>
          </div>

          {analysisBusy ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center py-14 gap-4">
              <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
              <p className="text-sm font-medium text-stone-600 text-center px-6">{s.analysisLoading}</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-2">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">{s.queuedLabel}</p>
                <ul className="space-y-1.5">
                  {uploadedLabels.map(name => (
                    <li key={name} className="text-sm text-stone-700 flex gap-2">
                      <FileText className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span className="break-all">{name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
                <p className="font-bold text-stone-900">{s.signalsTitle}</p>
                <p className="text-xs text-stone-500">{s.signalsBody}</p>
                <div className="flex flex-wrap gap-2">
                  {(awardFocusIds.length ? awardFocusIds : PIP_QUESTIONS.slice(0, 6).map(q => q.id)).map(qid => {
                    const q = PIP_QUESTIONS.find(x => x.id === qid);
                    if (!q) return null;
                    return (
                      <Chip key={qid} selected={awardFocusIds.includes(qid)} onClick={() => snapQuestion(qid)}>
                        {q.shortTitle}
                      </Chip>
                    );
                  })}
                </div>
                {Object.keys(savedAnswers || {}).length === 0 ? (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-2">{s.hintNoAnswers}</p>
                ) : (
                  <p className="text-xs text-stone-600 bg-stone-50 border border-stone-100 rounded-lg p-2">{s.hintWithAnswers}</p>
                )}
              </div>
            </>
          )}
        </div>
      );
    }

    if (step === 2 && branch === 'b') {
      const s = wc.steps.s02b;
      return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">{s.leadTitle}</h2>
            <p className="text-teal-100 text-sm leading-relaxed">{s.leadBody}</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
            <p className="font-bold text-stone-900">{s.worthTitle}</p>
            <ul className="text-sm text-stone-600 space-y-2 list-disc list-inside">
              {s.worthItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    if (step === 3 && branch === 'a') {
      const s = wc.steps.s03a;
      const daily = PIP_QUESTIONS.filter(q => q.category === 'Daily Living');
      const mob = PIP_QUESTIONS.filter(q => q.category === 'Mobility');
      return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">{s.leadTitle}</h2>
            <p className="text-teal-100 text-sm leading-relaxed">{s.leadBody}</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-2">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">{s.dailyLivingLabel}</p>
            <div className="flex flex-wrap gap-2">
              {daily.map(q => (
                <Chip key={q.id} selected={awardFocusIds.includes(q.id)} onClick={() => snapQuestion(q.id)}>
                  {q.shortTitle}
                </Chip>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-2">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">{s.mobilityLabel}</p>
            <div className="flex flex-wrap gap-2">
              {mob.map(q => (
                <Chip key={q.id} selected={awardFocusIds.includes(q.id)} onClick={() => snapQuestion(q.id)}>
                  {q.shortTitle}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (step === 3 && branch === 'b') {
      const s = wc.steps.s03b;
      const bandOptions = (
        selected: typeof dailyRate | typeof mobRate,
        onPick: (k: 'none' | 'standard' | 'enhanced') => void
      ) =>
        (
          [
            ['none', wc.bandLabels.none],
            ['standard', wc.bandLabels.standard],
            ['enhanced', wc.bandLabels.enhanced],
          ] as const
        ).map(([key, label]) => (
          <Chip key={key} selected={selected === key} onClick={() => onPick(key)}>
            {label}
          </Chip>
        ));
      return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">{s.leadTitle}</h2>
            <p className="text-teal-100 text-sm leading-relaxed">{s.leadBody}</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-2">
            <p className="font-bold text-stone-900">{s.dailyLivingSection}</p>
            <div className="flex flex-wrap gap-2">{bandOptions(dailyRate, k => setDailyRate(k))}</div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-2">
            <p className="font-bold text-stone-900">{s.mobilitySection}</p>
            <div className="flex flex-wrap gap-2">{bandOptions(mobRate, k => setMobRate(k))}</div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-2">
            <p className="font-bold text-stone-900">{s.prevAwardSection}</p>
            <div className="flex flex-wrap gap-2">
              {FLOW_B_AWARD_IDS.map(id => (
                <Chip key={id} selected={prevAreas.includes(id)} onClick={() => toggleId(prevAreas, setPrevAreas, id)}>
                  {wc.labels.flowBAward[id]}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (step === 4) {
      const s = wc.steps.s04;
      return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">{s.leadTitle}</h2>
            <p className="text-teal-100 text-sm leading-relaxed">{s.leadBody}</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <div className="flex flex-wrap gap-2">
              {WHAT_CHANGED_IDS.map(id => (
                <Chip key={id} selected={whatChanged.includes(id)} onClick={() => toggleId(whatChanged, setWhatChanged, id)}>
                  {wc.labels.whatChanged[id]}
                </Chip>
              ))}
            </div>
            {whatChanged.length === 0 && <p className="text-xs text-amber-800 mt-3">{s.pickOneHint}</p>}
          </div>
        </div>
      );
    }

    if (step === 5) {
      const s = wc.steps.s05;
      return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">{s.leadTitle}</h2>
            <p className="text-teal-100 text-sm leading-relaxed">{s.leadBody}</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
            <p className="font-bold text-stone-900">{s.statusSection}</p>
            <div className="flex flex-wrap gap-2">
              {MED_STATUS_IDS.map(id => (
                <Chip key={id} selected={medStatus.includes(id)} onClick={() => toggleId(medStatus, setMedStatus, id)}>
                  {wc.labels.medStatus[id]}
                </Chip>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
            <p className="font-bold text-stone-900">{s.symptomSection}</p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_IDS.map(id => (
                <Chip key={id} selected={symptoms.includes(id)} onClick={() => toggleId(symptoms, setSymptoms, id)}>
                  {wc.labels.symptoms[id]}
                </Chip>
              ))}
            </div>
          </div>

          {branch === 'b' && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
              <p className="font-bold text-stone-900">{s.flowBExtraSection}</p>
              <div className="flex flex-wrap gap-2">
                {FLOW_B_MED_EXTRA_IDS.map(id => (
                  <Chip key={id} selected={flowBExtras.includes(id)} onClick={() => toggleId(flowBExtras, setFlowBExtras, id)}>
                    {wc.labels.flowBMedExtra[id]}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigateTo('medical_profile')}
            className="w-full flex items-center justify-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 font-semibold text-sm py-3 rounded-xl hover:bg-teal-100 active:scale-[0.98] transition-all"
          >
            <Stethoscope className="w-4 h-4" />
            {s.medicalProfileCta}
          </button>
        </div>
      );
    }

    if (step === 6) {
      const s = wc.steps.s06;
      const qPick = PIP_QUESTIONS.find(q => q.id === descriptorPick) ?? PIP_QUESTIONS[0];
      return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">{s.leadTitle}</h2>
            <p className="text-teal-100 text-sm leading-relaxed">{s.leadBody}</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {PIP_QUESTIONS.map(q => (
              <button
                key={q.id}
                type="button"
                onClick={() => setDescriptorPick(q.id)}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap ${
                  descriptorPick === q.id ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-stone-600 border-stone-200'
                }`}
              >
                {q.shortTitle}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
            <p className="font-bold text-stone-900">{qPick.shortTitle}</p>
            <p className="text-xs text-stone-500 leading-relaxed mb-2">{qPick.headline}</p>

            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">{s.difficultiesLabel}</p>
            <div className="flex flex-wrap gap-2">
              {DESCRIPTOR_HARD_IDS.map(opt => (
                <Chip
                  key={opt}
                  selected={currentDescriptor.diff.has(opt)}
                  onClick={() =>
                    setDescriptorSelections(descriptorPick, prev => {
                      const nextDiff = new Set(prev.diff);
                      if (nextDiff.has(opt)) nextDiff.delete(opt);
                      else nextDiff.add(opt);
                      return { diff: nextDiff, rel: prev.rel };
                    })
                  }
                >
                  {wc.labels.descriptorHard[opt]}
                </Chip>
              ))}
            </div>

            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider pt-2">{s.reliabilityLabel}</p>
            <div className="flex flex-wrap gap-2">
              {RELIABILITY_IDS.map(opt => (
                <Chip
                  key={opt}
                  selected={currentDescriptor.rel.has(opt)}
                  onClick={() =>
                    setDescriptorSelections(descriptorPick, prev => {
                      const nextR = new Set(prev.rel);
                      if (nextR.has(opt)) nextR.delete(opt);
                      else nextR.add(opt);
                      return { diff: prev.diff, rel: nextR };
                    })
                  }
                >
                  {wc.labels.reliability[opt]}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (step === 7) {
      const s = wc.steps.s07;
      const poolIds = branch === 'a' ? EVIDENCE_FLOW_A_IDS : EVIDENCE_FLOW_B_IDS;
      return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">{s.leadTitle}</h2>
            <p className="text-teal-100 text-sm leading-relaxed">{s.leadBody}</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-2">
            <div className="flex flex-wrap gap-2">
              {poolIds.map(id => {
                const lab =
                  branch === 'a' ? wc.labels.evidenceA[id as EvidenceFlowAId] : wc.labels.evidenceB[id as EvidenceFlowBId];
                return (
                  <Chip key={id} selected={evidencePick.includes(id)} onClick={() => toggleId(evidencePick, setEvidencePick, id)}>
                    {lab}
                  </Chip>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (step === 8) {
      const s = wc.steps.s08;
      return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">{s.leadTitle}</h2>
            <p className="text-teal-100 text-sm leading-relaxed">{s.leadBody}</p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900 leading-relaxed">{s.amberBody}</p>
          </div>
        </div>
      );
    }

    if (step === 9) {
      const s = wc.steps.s09;
      return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">{s.leadTitle}</h2>
            <p className="text-teal-100 text-sm leading-relaxed">
              {hasPaid && hasAnswers ? s.leadBodyPaid : s.leadBodyFree}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            {summaryLoading ? (
              <div className="flex flex-col items-center gap-4 py-12">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                <p className="text-sm text-stone-600">{s.loadingLine}</p>
              </div>
            ) : summaryBody ? (
              <pre className="text-xs text-stone-700 whitespace-pre-wrap font-sans leading-relaxed">{summaryBody}</pre>
            ) : (
              <p className="text-sm text-stone-500">{s.emptyLine}</p>
            )}
          </div>
        </div>
      );
    }

    if (step === 10) {
      const s = wc.steps.s10;
      return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-teal-200" />
            <h2 className="font-bold text-xl mb-2">{s.leadTitle}</h2>
            <p className="text-teal-100 text-sm leading-relaxed">{s.leadBody}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (summaryBody) void navigator.clipboard?.writeText(summaryBody);
              setSummaryCopied(true);
              window.setTimeout(() => setSummaryCopied(false), 2000);
            }}
            disabled={!summaryBody}
            className="w-full py-3.5 rounded-xl font-semibold text-sm bg-stone-100 border border-stone-200 text-stone-700 disabled:opacity-40"
          >
            {summaryCopied ? s.copyButtonDone : s.copyButton}
          </button>

          <button
            type="button"
            onClick={() => navigateTo('question_index')}
            className="w-full flex items-center justify-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 font-semibold text-sm py-3 rounded-xl hover:bg-teal-100 transition-all"
          >
            <ClipboardList className="w-4 h-4" />
            {s.tuneAnswers}
          </button>

          <button
            type="button"
            onClick={() => navigateTo('downloads')}
            className="w-full flex items-center justify-center gap-2 bg-teal-700 text-white font-semibold text-sm py-3 rounded-xl hover:bg-teal-800 transition-all shadow-sm disabled:opacity-40"
            disabled={!hasPaid}
            title={!hasPaid ? 'Unlock downloads on full access' : undefined}
          >
            <Download className="w-4 h-4" />
            {s.openDownloads}
          </button>

          {!hasPaid && <p className="text-[11px] text-stone-500 text-center">{s.downloadsLockedNote}</p>}

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
              <Calculator className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-stone-900 text-sm">{s.calcTitle}</p>
              <p className="text-xs text-stone-500">{s.calcSub}</p>
            </div>
            <button type="button" onClick={() => navigateTo('payment_calculator')} className="text-xs font-bold text-teal-700">
              {s.calcOpen}
            </button>
          </div>

          <ContextualAssistantBar label={s.assistantLabel} sublabel={s.assistantSublabel} prompt="I'm preparing a change of circumstances for PIP. What should I know before calling DWP?" />

          <button type="button" onClick={() => navigateTo('home')} className="w-full py-4 rounded-xl font-bold bg-stone-900 text-white">
            {s.homeCta}
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <StepHeader step={step} title={stepTitle} total={TOTAL_STEPS} onBack={back} />

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.18 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {step > 1 && step < TOTAL_STEPS && (
        <BottomBar
          showBack
          onBack={back}
          onNext={next}
          disabled={!canContinue()}
          label={step === 9 ? summaryLoading ? 'Please wait…' : 'Continue' : 'Continue'}
        />
      )}
    </div>
  );
}
