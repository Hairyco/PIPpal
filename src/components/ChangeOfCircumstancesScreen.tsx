import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Phone,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from 'lucide-react';
import { BackpayCalculator } from './BackpayCalculator';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from './AppContext';
import { PIP_QUESTIONS } from '../pipQuestions';
import {
  computeCocSessionFromSnapshot,
  clearCocWizardSessionKeys,
  type CocMedicalSnapshot,
  COC_POST_MEDICAL_SNAPSHOT_KEY,
  COC_MEDICAL_EXPECTED_KEY,
  COC_FLOW_STEP_KEY,
  COC_HAS_ORIGINAL_PIP2_KEY,
  COC_WIZARD_TOTAL_STEPS,
} from '../cocMedicalSnapshot';

// ── Steps (AR1 branching archived — see ../archive/coc-step2-form-type-picker.tsx)
// 1  Original completed PIP2 copy — yes / no (+ guide without PIP2)
// 2  Answers & documents — uploads (+ DWP / previous answers); Continue → activity review
// 3  Per-activity checklist (prior wording / optional tweaks)
// 4  Opens Medical Profile — saves snapshot → questions

function readStoredHasOriginalPip2(): boolean | null {
  try {
    const v = sessionStorage.getItem(COC_HAS_ORIGINAL_PIP2_KEY);
    if (v === 'true') return true;
    if (v === 'false') return false;
    return null;
  } catch {
    return null;
  }
}

function readStoredCocStep(): number {
  try {
    const raw = sessionStorage.getItem(COC_FLOW_STEP_KEY);
    if (!raw) return 1;
    const n = parseInt(raw, 10);
    if (Number.isNaN(n) || n < 1) return 1;
    const capped = Math.min(n, COC_WIZARD_TOTAL_STEPS);
    if (capped <= 3) return capped;
    return COC_WIZARD_TOTAL_STEPS;
  } catch {
    return 1;
  }
}

const DAILY_LIVING_IDS = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'];
const MOBILITY_IDS = ['q11','q12'];

type CocExtractedEntry = {
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  pointsAwarded?: number | null;
};

/** Unified CoC uploads — routed to extraction bucket after classify / user pick */
type CocDocSlot = 'pip2' | 'pa4' | 'award_letter';
type CocFileItem = { name: string; base64: string; mimeType: string; size: number };

function normalizeActivityPoints(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n)) return null;
  return Math.round(Math.max(0, Math.min(12, n)));
}

function normalizeExtractedAnswers(raw: Record<string, unknown>): Record<string, CocExtractedEntry> {
  const out: Record<string, CocExtractedEntry> = {};
  for (const [k, v] of Object.entries(raw ?? {})) {
    if (!v || typeof v !== 'object') continue;
    const o = v as Record<string, unknown>;
    const conf = o.confidence;
    const confidence: 'high' | 'medium' | 'low' =
      conf === 'high' || conf === 'medium' || conf === 'low' ? conf : 'low';
    out[k] = {
      answer: typeof o.answer === 'string' ? o.answer : '',
      confidence,
      pointsAwarded: normalizeActivityPoints(o.pointsAwarded),
    };
  }
  return out;
}

/** Keeps JSON body under Vercel's ~4.5 MB serverless limit after base64 encoding overhead */
const COC_UPLOAD_MAX_FILES = 24;
const COC_UPLOAD_MAX_TOTAL_BYTES = 3_500_000;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateCocFileSelection(files: File[]): string | null {
  if (files.length > COC_UPLOAD_MAX_FILES) {
    return `Too many files (${files.length}). Add at most ${COC_UPLOAD_MAX_FILES} images or PDFs in one go (use one PDF for the full form, or upload in two steps: remove files, then add the rest).`;
  }
  const total = files.reduce((n, f) => n + f.size, 0);
  if (total > COC_UPLOAD_MAX_TOTAL_BYTES) {
    return `These files total ${formatFileSize(total)} — together they need to stay under about ${formatFileSize(COC_UPLOAD_MAX_TOTAL_BYTES)} per upload (server limit). Try fewer pages, lower photo resolution, or compress your scan.`;
  }
  return null;
}

// ── Header ────────────────────────────────────────────────────────────────────
function StepHeader({ step, title, total, onBack }: { step: number; title: string; total: number; onBack: () => void }) {
  return (
    <div className="bg-white border-b border-stone-100 px-5 py-4 sticky top-0 z-10">
      <div className="flex items-center gap-3 mb-3">
        <button type="button" onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-stone-900 text-base leading-tight truncate">Step {step} of {total}</h1>
          <p className="text-xs text-stone-500 mt-0.5 truncate">{title}</p>
        </div>
      </div>
      <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
        <motion.div className="bg-teal-600 h-full rounded-full"
          animate={{ width: `${(step / total) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>
    </div>
  );
}


// ── Main Component ────────────────────────────────────────────────────────────
export function ChangeOfCircumstancesScreen() {
  const {
    goBack,
    navigateTo,
    isAdmin,
    setCocPreviousAnswers,
    setCocPreviousPoints,
    setCocMode,
    setCocFormType,
    setCocDocumentType,
    setCocAssessorNotes,
    resetCocWalkthroughProgress,
  } = useAppContext();

  const [step, setStep] = useState(readStoredCocStep);
  const [hasOriginalPip2Copy, setHasOriginalPip2Copy] = useState<boolean | null>(() => readStoredHasOriginalPip2());

  useEffect(() => {
    sessionStorage.setItem(COC_FLOW_STEP_KEY, String(step));
  }, [step]);

  useEffect(() => {
    if (hasOriginalPip2Copy === null) {
      try {
        sessionStorage.removeItem(COC_HAS_ORIGINAL_PIP2_KEY);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      sessionStorage.setItem(COC_HAS_ORIGINAL_PIP2_KEY, hasOriginalPip2Copy ? 'true' : 'false');
    } catch {
      /* ignore */
    }
  }, [hasOriginalPip2Copy]);
  const [formType] = useState<'pip2' | 'ar1'>('pip2');
  const [notReportedOpen, setNotReportedOpen] = useState(false);
  const combinedDocsInputRef = useRef<HTMLInputElement>(null);

  // PIP2 upload state
  const [pip2Labels, setPip2Labels] = useState<string[]>([]);
  const [pip2Files, setPip2Files] = useState<{ name: string; base64: string; mimeType: string; size: number }[]>([]);
  const [pip2Busy, setPip2Busy] = useState(false);
  const [pip2Error, setPip2Error] = useState<string | null>(null);
  const [pip2UploadError, setPip2UploadError] = useState<string | null>(null);
  const [pip2Extracted, setPip2Extracted] = useState<Record<string, CocExtractedEntry>>({});

  // PA4 upload state
  const [pa4Labels, setPa4Labels] = useState<string[]>([]);
  const [pa4Files, setPa4Files] = useState<{ name: string; base64: string; mimeType: string; size: number }[]>([]);
  const [pa4Busy, setPa4Busy] = useState(false);
  const [pa4Error, setPa4Error] = useState<string | null>(null);
  const [pa4UploadError, setPa4UploadError] = useState<string | null>(null);
  const [pa4Extracted, setPa4Extracted] = useState<Record<string, CocExtractedEntry>>({});

  // Award / decision letter (optional — best source for official points per activity)
  const [awardLabels, setAwardLabels] = useState<string[]>([]);
  const [awardFiles, setAwardFiles] = useState<{ name: string; base64: string; mimeType: string; size: number }[]>([]);
  const [awardBusy, setAwardBusy] = useState(false);
  const [awardError, setAwardError] = useState<string | null>(null);
  const [awardUploadError, setAwardUploadError] = useState<string | null>(null);
  const [awardExtracted, setAwardExtracted] = useState<Record<string, CocExtractedEntry>>({});

  /** Single unified picker errors + classify step before extraction */
  const [combinedPickError, setCombinedPickError] = useState<string | null>(null);
  const [classifyBusy, setClassifyBusy] = useState(false);
  const [docKindModal, setDocKindModal] = useState<null | { files: CocFileItem[]; suggested: CocDocSlot | null }>(null);
  const [draftDocKindPick, setDraftDocKindPick] = useState<CocDocSlot>('pip2');

  const [expandedSection, setExpandedSection] = useState<'daily' | 'mobility' | null>(null);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [noForm, setNoForm] = useState(false);
  const [showUploadLoading, setShowUploadLoading] = useState(false);
  /** Optional per-activity typing: gap-fill when empty, or overrides automatic read when filled */
  const [activityFallbackNotes, setActivityFallbackNotes] = useState<Record<string, string>>({});
  /** Optional per-activity points from decision letter — overrides extracted scores when filled */
  const [cocManualPoints, setCocManualPoints] = useState<Record<string, string>>({});
  /** After “I don't have my PIP2”, show paperwork guide before step 2 */
  const [missingOriginalPip2Guide, setMissingOriginalPip2Guide] = useState(false);

  useEffect(() => {
    if (step !== 3) return;
    setExpandedSection(null);
    setExpandedActivityId(null);
  }, [step]);

  const writeCocMedicalSnapshotToSession = useCallback(() => {
    try {
      const snapshot: CocMedicalSnapshot = {
        formType,
        hasPip2: pip2Labels.length > 0,
        hasPa4: pa4Labels.length > 0,
        hasAward: awardLabels.length > 0,
        pip2Extracted,
        pa4Extracted,
        awardExtracted,
        activityFallbackNotes,
        cocManualPoints,
      };
      sessionStorage.setItem(COC_POST_MEDICAL_SNAPSHOT_KEY, JSON.stringify(snapshot));
      sessionStorage.setItem(COC_MEDICAL_EXPECTED_KEY, '1');
    } catch {
      /* ignore */
    }
  }, [
    formType,
    pip2Labels.length,
    pa4Labels.length,
    awardLabels.length,
    pip2Extracted,
    pa4Extracted,
    awardExtracted,
    activityFallbackNotes,
    cocManualPoints,
  ]);

  // Continuing from uploads opens Medical Profile; saving there consumes snapshot → question_index
  const next = () => {
    if (step === 3) {
      setStep(4);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    setStep(s => Math.min(s + 1, COC_WIZARD_TOTAL_STEPS));
  };
  const back = () => {
    if (step === 1) {
      if (missingOriginalPip2Guide) {
        setMissingOriginalPip2Guide(false);
        return;
      }
      goBack();
      return;
    }
    if (step === 2) {
      setMissingOriginalPip2Guide(false);
      setStep(1);
      return;
    }
    if (step === 3) {
      setStep(2);
      return;
    }
    if (step === 4) {
      setStep(3);
    }
  };

  useLayoutEffect(() => {
    if (step !== 4) return;
    writeCocMedicalSnapshotToSession();
    navigateTo('medical_profile');
  }, [step, navigateTo, writeCocMedicalSnapshotToSession]);

  // Extraction helper
  async function runExtraction(
    files: { base64: string; mimeType: string }[],
    docType: 'pip2' | 'pa4' | 'award_letter',
    setBusy: (v: boolean) => void,
    setError: (v: string | null) => void,
    setExtracted: (v: Record<string, CocExtractedEntry>) => void,
  ) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'coc-document-analysis', files, docType }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.extractedAnswers) {
        setExtracted(normalizeExtractedAnswers(data.extractedAnswers as Record<string, unknown>));
      } else {
        setError(data?.error ?? 'Could not extract answers automatically.');
      }
    } catch {
      setError('Could not reach the extraction service.');
    } finally {
      setBusy(false);
    }
  }

  // Run extraction when PIP2 files arrive
  useEffect(() => {
    if (pip2Files.length === 0 || Object.keys(pip2Extracted).length > 0) return;
    runExtraction(
      pip2Files.map(f => ({ base64: f.base64, mimeType: f.mimeType })),
      'pip2', setPip2Busy, setPip2Error, setPip2Extracted,
    );
  }, [pip2Files]);

  // Run extraction when PA4 files arrive
  useEffect(() => {
    if (pa4Files.length === 0 || Object.keys(pa4Extracted).length > 0) return;
    runExtraction(
      pa4Files.map(f => ({ base64: f.base64, mimeType: f.mimeType })),
      'pa4', setPa4Busy, setPa4Error, setPa4Extracted,
    );
  }, [pa4Files]);

  // Run extraction when award letter files arrive
  useEffect(() => {
    if (awardFiles.length === 0 || Object.keys(awardExtracted).length > 0) return;
    runExtraction(
      awardFiles.map(f => ({ base64: f.base64, mimeType: f.mimeType })),
      'award_letter', setAwardBusy, setAwardError, setAwardExtracted,
    );
  }, [awardFiles]);

  // Admin mock form loader — content varies by selected document type
  const MOCK_DATA: Record<string, Record<string, CocExtractedEntry>> = {
    pip2: {
      q1:  { answer: 'I can prepare a simple meal but I need to sit down regularly due to pain. I use the microwave most days as standing at the hob is too difficult. My partner helps with anything involving heavy pans or the oven.', confidence: 'high' },
      q2:  { answer: 'I can eat independently but I sometimes drop cutlery due to tremors. I need food cutting up on bad days. I eat slowly and often leave meals unfinished due to fatigue and pain.', confidence: 'high' },
      q3:  { answer: 'I take several medications daily. I sometimes forget doses when my concentration is low. I have a dosette box my carer fills weekly. I need reminders from my partner most days.', confidence: 'medium' },
      q4:  { answer: 'I use a shower seat and grab rails. I cannot stand in the shower for more than a few minutes. I need help washing my hair and reaching my lower body. I have a bath board but rarely use the bath now.', confidence: 'high' },
      q5:  { answer: 'I have urgency issues and do not always make it in time. I use pads on bad days. Getting on and off the toilet is difficult without grab rails. I need more time than most people.', confidence: 'high' },
      q6:  { answer: 'I cannot do up buttons or fastenings. I wear loose clothing with elasticated waists. Putting on socks and shoes requires a long-handled device. Dressing takes me much longer than it used to.', confidence: 'medium' },
      q7:  { answer: 'I can communicate verbally but my voice becomes quiet and strained when I am in pain or fatigued. I sometimes lose my train of thought mid-sentence. I prefer face-to-face over phone calls.', confidence: 'high' },
      q8:  { answer: 'I can read standard print but struggle with small text. I use a magnifier. Concentration difficulties mean I often need to re-read things several times before I understand them.', confidence: 'high' },
      q9:  { answer: 'I find social interactions exhausting. I avoid busy or noisy environments. I can manage brief conversations but need recovery time afterwards. I have cancelled plans due to my condition on many occasions.', confidence: 'medium' },
      q10: { answer: 'I manage basic day-to-day purchases but struggle with complex financial decisions. I sometimes make mistakes with change or forget what I have spent. My partner checks my bank statements with me.', confidence: 'high' },
      q11: { answer: 'I cannot use public transport alone due to anxiety and unpredictable symptoms. I rely on my partner or taxis for all journeys. I need to know the route and toilet locations in advance. Unfamiliar routes cause severe anxiety.', confidence: 'high' },
      q12: { answer: 'I can walk short distances on a good day but I use a walking stick. I cannot walk more than 50 metres without stopping due to pain and breathlessness. On bad days I use a wheelchair.', confidence: 'high' },
    },
    pa4: {
      q1:  { answer: 'Claimant states they use a microwave only and cannot use the hob due to pain and fatigue. A perching stool is used at the kitchen counter. Partner reported to assist with preparing hot food daily. Observed reduced grip strength on examination. Recommended descriptor: E (supervision required). 4 points.', confidence: 'high', pointsAwarded: 4 },
      q2:  { answer: 'Claimant uses adapted cutlery. Tremor observed during assessment — moderate bilateral hand tremor. Claimant states food is cut up by partner on most days. Eating is slow; claimant did not finish food brought to assessment. Recommended descriptor: C (uses aid/appliance). 2 points.', confidence: 'high', pointsAwarded: 2 },
      q3:  { answer: 'Claimant uses a pre-filled dosette box filled by carer weekly. States they forget doses without prompting. No evidence of missed doses causing harm at time of assessment. Recommended descriptor: C (prompting required). 1 point.', confidence: 'medium', pointsAwarded: 1 },
      q4:  { answer: 'Claimant uses a shower seat and grab rails (prescription evidence provided). States they cannot wash hair or lower body independently. Partner stated to assist daily. Claimant arrived to assessment with hair unwashed. Recommended descriptor: D (assistance with bathing). 2 points.', confidence: 'high', pointsAwarded: 2 },
      q5:  { answer: 'Claimant reports daily use of continence pads (prescription confirmed). Urgency stated as primary issue — claimant describes not always making it to the toilet in time. Grab rails fitted. Recommended descriptor: C (use of aids/appliances for toilet). 2 points.', confidence: 'high', pointsAwarded: 2 },
      q6:  { answer: 'Claimant attended in elasticated-waist clothing and slip-on shoes. States dressing independently takes over 30 minutes on average and they require a long-handled aid for socks. Partner confirmed they assist with complex clothing. Recommended descriptor: C (uses an aid). 2 points.', confidence: 'medium', pointsAwarded: 2 },
      q7:  { answer: 'Speech was audible throughout assessment but claimant\'s voice became quiet and less clear toward the end of the session. Claimant reported difficulty maintaining conversation when fatigued. No formal speech or language disorder evident. Recommended descriptor: A (no difficulty). 0 points.', confidence: 'high', pointsAwarded: 0 },
      q8:  { answer: 'Claimant uses a handheld magnifier (brought to assessment). Reports re-reading required for complex documents. Confirmed ability to read standard newspaper print with magnifier. Recommended descriptor: B (uses an aid). 2 points.', confidence: 'high', pointsAwarded: 2 },
      q9:  { answer: 'Claimant reported significant anxiety in social situations. Attended assessment alone but stated this required considerable effort. Reports cancelling social engagements frequently. No observed distress during assessment but stated one-to-one situations are manageable; groups are not. Recommended descriptor: C (needs prompting to engage). 2 points.', confidence: 'medium', pointsAwarded: 2 },
      q10: { answer: 'Claimant states partner checks bank statements. Some confusion noted when discussing budgeting — claimant could not recall recent spending when asked. Benefit payments managed by partner. Recommended descriptor: C (needs prompting for complex decisions). 2 points.', confidence: 'high', pointsAwarded: 2 },
      q11: { answer: 'Claimant did not use public transport to attend — arrived by taxi with partner. States they cannot use unfamiliar routes alone. Pre-assessment questionnaire noted severe anxiety when route includes unpredictable elements (e.g. cancelled trains). Recommended descriptor: E (cannot follow journeys without another person). 8 points.', confidence: 'high', pointsAwarded: 8 },
      q12: { answer: 'Claimant walked from waiting area to assessment room (approx. 40m) with a walking stick and one rest. Stated this was a better day. Claims to use a manual wheelchair on most days. No wheelchair observed at assessment. Timed walk test not completed — claimant declined. Recommended descriptor: C (can walk up to 50m). 4 points.', confidence: 'high', pointsAwarded: 4 },
    },
    award: {
      q1:  { answer: 'Preparing food — 4 points (descriptor E).', confidence: 'high', pointsAwarded: 4 },
      q2:  { answer: 'Taking nutrition — 2 points.', confidence: 'high', pointsAwarded: 2 },
      q3:  { answer: 'Managing therapy — 1 point.', confidence: 'medium', pointsAwarded: 1 },
      q4:  { answer: 'Washing and bathing — 2 points.', confidence: 'high', pointsAwarded: 2 },
      q5:  { answer: 'Managing toilet needs — 2 points.', confidence: 'high', pointsAwarded: 2 },
      q6:  { answer: 'Dressing and undressing — 2 points.', confidence: 'medium', pointsAwarded: 2 },
      q7:  { answer: 'Communicating verbally — 0 points.', confidence: 'high', pointsAwarded: 0 },
      q8:  { answer: 'Reading — 2 points.', confidence: 'high', pointsAwarded: 2 },
      q9:  { answer: 'Engaging with others — 2 points.', confidence: 'medium', pointsAwarded: 2 },
      q10: { answer: 'Making budgeting decisions — 2 points.', confidence: 'high', pointsAwarded: 2 },
      q11: { answer: 'Planning and following journeys — 8 points.', confidence: 'high', pointsAwarded: 8 },
      q12: { answer: 'Moving around — 4 points.', confidence: 'high', pointsAwarded: 4 },
    },
  };

  function seedMockDocBuckets(opts: { pip2: boolean; pa4: boolean; award: boolean }) {
    if (opts.pip2) {
      setPip2Labels(['mock_pip2_form.jpg']);
      setPip2Extracted(MOCK_DATA.pip2);
    } else {
      setPip2Labels([]);
      setPip2Files([]);
      setPip2Extracted({});
    }
    if (opts.pa4) {
      setPa4Labels(['mock_pa4_assessor_report.pdf']);
      setPa4Extracted(MOCK_DATA.pa4);
    } else {
      setPa4Labels([]);
      setPa4Files([]);
      setPa4Extracted({});
    }
    if (opts.award) {
      setAwardLabels(['mock_dwp_award_letter.pdf']);
      setAwardExtracted(MOCK_DATA.award);
    } else {
      setAwardLabels([]);
      setAwardFiles([]);
      setAwardExtracted({});
    }
    setPip2Busy(false);
    setPa4Busy(false);
    setAwardBusy(false);
    setPip2Error(null);
    setPa4Error(null);
    setAwardError(null);
    setPip2UploadError(null);
    setPa4UploadError(null);
    setAwardUploadError(null);
    setCombinedPickError(null);
    setDocKindModal(null);
    setClassifyBusy(false);
  }

  type CocStep3DevPreviewPreset =
    | 'all'
    | 'pip2'
    | 'pip2_pa4'
    | 'pip2_award'
    | 'pa4'
    | 'award'
    | 'pa4_award'
    | 'no_docs';

  function applyDevCocStep3PreviewPreset(preset: CocStep3DevPreviewPreset) {
    setActivityFallbackNotes({});
    setCocManualPoints({});
    try {
      sessionStorage.setItem(COC_FLOW_STEP_KEY, '3');
    } catch {
      /* ignore */
    }

    setExpandedSection('daily');
    setExpandedActivityId('q1');

    if (preset === 'no_docs') {
      seedMockDocBuckets({ pip2: false, pa4: false, award: false });
      setNoForm(true);
      setStep(3);
      return;
    }

    setNoForm(false);

    switch (preset) {
      case 'all':
        seedMockDocBuckets({ pip2: true, pa4: true, award: true });
        break;
      case 'pip2':
        seedMockDocBuckets({ pip2: true, pa4: false, award: false });
        break;
      case 'pip2_pa4':
        seedMockDocBuckets({ pip2: true, pa4: true, award: false });
        break;
      case 'pip2_award':
        seedMockDocBuckets({ pip2: true, pa4: false, award: true });
        break;
      case 'pa4':
        seedMockDocBuckets({ pip2: false, pa4: true, award: false });
        break;
      case 'award':
        seedMockDocBuckets({ pip2: false, pa4: false, award: true });
        break;
      case 'pa4_award':
        seedMockDocBuckets({ pip2: false, pa4: true, award: true });
        break;
      default:
        seedMockDocBuckets({ pip2: true, pa4: true, award: true });
    }

    setStep(3);
  }

  const loadMockForm = () => {
    seedMockDocBuckets({ pip2: true, pa4: true, award: true });
    setActivityFallbackNotes({});
    setCocManualPoints({});
    setNoForm(false);

    setExpandedSection('daily');
    setExpandedActivityId(null);
  };

  /** Dev-only CoC Step 3 with mock uploads — see collapsible DEV note on Change of Circumstances screen */
  useLayoutEffect(() => {
    if (!import.meta.env.DEV) return;
    const v = new URLSearchParams(window.location.search).get('screenshot');
    if (!v) return;

    const SHOT_PREVIEW: Partial<Record<string, CocStep3DevPreviewPreset>> = {
      coc_step3: 'all',
      coc_step3_all: 'all',
      coc_step3_pip2_only: 'pip2',
      coc_step3_pip2_pa4: 'pip2_pa4',
      coc_step3_pip2_award: 'pip2_award',
      coc_step3_pa4_only: 'pa4',
      coc_step3_award_only: 'award',
      coc_step3_pa4_award: 'pa4_award',
      coc_step3_no_docs: 'no_docs',
    };

    const preset = SHOT_PREVIEW[v];
    if (preset === undefined) return;

    applyDevCocStep3PreviewPreset(preset);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot dev URL seeding via ?screenshot=
  }, []);

  useLayoutEffect(() => {
    if (!import.meta.env.DEV) return;
    if (new URLSearchParams(window.location.search).get('screenshot') !== 'coc_step2') return;
    setStep(2);
    loadMockForm();
    setNoForm(false);
    setExpandedSection('daily');
    setExpandedActivityId('q1');
    sessionStorage.setItem(COC_FLOW_STEP_KEY, '2');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot marketing capture via ?screenshot=coc_step2
  }, []);

  async function readFilesToBase64List(files: File[]): Promise<{ name: string; base64: string; mimeType: string; size: number }[]> {
    return Promise.all(files.map(file =>
      new Promise<{ name: string; base64: string; mimeType: string; size: number }>(resolve => {
        const reader = new FileReader();
        reader.onload = ev => {
          const dataUrl = ev.target?.result as string;
          resolve({
            name: file.name,
            base64: dataUrl.split(',')[1] ?? '',
            mimeType: file.type || 'image/jpeg',
            size: file.size,
          });
        };
        reader.readAsDataURL(file);
      })
    ));
  }

  function mergeBatchIntoBucket(slot: CocDocSlot, batch: CocFileItem[]) {
    setNoForm(false);
    setActivityFallbackNotes({});
    setCocManualPoints({});
    if (slot === 'pip2') {
      setPip2Labels(prev => [...prev, ...batch.map(b => b.name)]);
      setPip2Files(prev => [...prev, ...batch]);
      setPip2Extracted({});
      setPip2Error(null);
      setPip2UploadError(null);
    } else if (slot === 'pa4') {
      setPa4Labels(prev => [...prev, ...batch.map(b => b.name)]);
      setPa4Files(prev => [...prev, ...batch]);
      setPa4Extracted({});
      setPa4Error(null);
      setPa4UploadError(null);
    } else {
      setAwardLabels(prev => [...prev, ...batch.map(b => b.name)]);
      setAwardFiles(prev => [...prev, ...batch]);
      setAwardExtracted({});
      setAwardError(null);
      setAwardUploadError(null);
    }
  }

  async function classifyAndMergeBatch(batch: CocFileItem[]) {
    setClassifyBusy(true);
    setCombinedPickError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'coc-document-classify',
          files: batch.map(f => ({ base64: f.base64, mimeType: f.mimeType })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        documentKind?: string | null;
        confidence?: string | null;
      };
      const k = data.documentKind;
      const conf = typeof data.confidence === 'string' ? data.confidence : 'low';
      const recognised: CocDocSlot | null =
        k === 'pa4' ? 'pa4' : k === 'award_letter' ? 'award_letter' : k === 'pip2' ? 'pip2' : null;
      if (recognised && conf === 'high') {
        mergeBatchIntoBucket(recognised, batch);
        return;
      }
      setDraftDocKindPick(recognised ?? 'pip2');
      setDocKindModal({ files: batch, suggested: recognised });
    } catch {
      setDraftDocKindPick('pip2');
      setDocKindModal({ files: batch, suggested: null });
    } finally {
      setClassifyBusy(false);
    }
  }

  const onCombinedDocsPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!raw.length) return;
    if (pip2Busy || pa4Busy || awardBusy || classifyBusy) return;
    const bad = validateCocFileSelection(raw);
    if (bad) {
      setCombinedPickError(bad);
      return;
    }
    setCombinedPickError(null);
    const results = await readFilesToBase64List(raw);
    await classifyAndMergeBatch(results);
  };

  function removeBucket(slot: CocDocSlot) {
    setActivityFallbackNotes({});
    setCocManualPoints({});
    if (slot === 'pip2') {
      setPip2Labels([]);
      setPip2Files([]);
      setPip2Extracted({});
      setPip2Error(null);
      setPip2UploadError(null);
    } else if (slot === 'pa4') {
      setPa4Labels([]);
      setPa4Files([]);
      setPa4Extracted({});
      setPa4Error(null);
      setPa4UploadError(null);
    } else {
      setAwardLabels([]);
      setAwardFiles([]);
      setAwardExtracted({});
      setAwardError(null);
      setAwardUploadError(null);
    }
  }

  const startQuestions = () => {
    const snapshot: CocMedicalSnapshot = {
      formType,
      hasPip2: pip2Labels.length > 0,
      hasPa4: pa4Labels.length > 0,
      hasAward: awardLabels.length > 0,
      pip2Extracted,
      pa4Extracted,
      awardExtracted,
      activityFallbackNotes,
      cocManualPoints,
    };
    const session = computeCocSessionFromSnapshot(snapshot);
    clearCocWizardSessionKeys();
    resetCocWalkthroughProgress();
    setCocMode(true);
    setCocFormType(formType);
    setCocDocumentType(session.derivedDocType);
    setCocPreviousAnswers(session.primary);
    setCocPreviousPoints(session.cocPreviousPoints);
    setCocAssessorNotes(session.pa4Answers);
    navigateTo('question_index');
  };

  const stepTitles = ['Change of circumstances', 'Answers & documents', 'Check activities', 'Medical profile'];

  const renderActivityAccordion = (qid: string) => {
    const q = PIP_QUESTIONS.find(x => x.id === qid);
    if (!q) return null;
    const extractedPip2 = pip2Extracted[qid];
    const extractedPa4 = pa4Extracted[qid];
    const extractedAward = awardExtracted[qid];
    const pip2Text = extractedPip2?.answer?.trim() ?? '';
    const pa4Text = extractedPa4?.answer?.trim() ?? '';
    const awardText = extractedAward?.answer?.trim() ?? '';
    const manual = activityFallbackNotes[qid] ?? '';
    const pip2Pts = normalizeActivityPoints(extractedPip2?.pointsAwarded);
    const pa4Pts = normalizeActivityPoints(extractedPa4?.pointsAwarded);
    const awardPts = normalizeActivityPoints(extractedAward?.pointsAwarded);
    const manualPtsStr = cocManualPoints[qid] ?? '';
    const hasPip2Docs = pip2Labels.length > 0;
    const hasPa4Docs = pa4Labels.length > 0;
    const hasAwardDocs = awardLabels.length > 0;
    const isOpen = expandedActivityId === qid;
    const hasScoreHints = pip2Pts != null || pa4Pts != null || awardPts != null || manualPtsStr.trim() !== '';
    const hasAnswer = Boolean(pip2Text || pa4Text || awardText || manual.trim() || hasScoreHints);
    const confidence = (extractedPip2 ?? extractedPa4 ?? extractedAward)?.confidence ?? 'low';
    return (
      <div key={qid} className="border-b border-stone-100 last:border-0">
        <button type="button"
          onClick={() => setExpandedActivityId(isOpen ? null : qid)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-stone-50 transition-colors">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className={`w-2 h-2 rounded-full shrink-0 ${hasAnswer ? 'bg-teal-500' : 'bg-stone-200'}`} />
            <span className="text-sm font-medium text-stone-800 truncate">{q.shortTitle}</span>
            {confidence === 'low' && hasAnswer && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold shrink-0">check</span>
            )}
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
        </button>
        {isOpen && (
          <div className="px-4 pb-4 space-y-2">
            <p className="text-xs text-stone-500 italic leading-relaxed">{q.headline}</p>
            <div className="space-y-2">
              {/* PIP2 */}
              {pip2Text ? (
                <div className="rounded-xl border border-teal-100 bg-teal-50/60 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-1">From your PIP2</p>
                  <p className="text-xs text-stone-700 leading-relaxed">"{pip2Text}"</p>
                </div>
              ) : hasPip2Docs ? (
                <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">From your PIP2</p>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Nothing was read for this activity from your PIP2 upload — add a correction below if you remember
                    what you wrote.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/60 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">From your PIP2</p>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    No PIP2 uploaded — go back a step to add one if you want prior wording pulled in automatically.
                  </p>
                </div>
              )}
              {/* PA4 */}
              {pa4Text ? (
                <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">
                    From assessor report (PA4)
                  </p>
                  <p className="text-xs text-stone-700 leading-relaxed">"{pa4Text}"</p>
                </div>
              ) : hasPa4Docs ? (
                <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    From assessor report (PA4)
                  </p>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Nothing was read for this activity from your PA4 — add a correction below if needed.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-stone-200 bg-amber-50/30 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800/70 mb-1">
                    From assessor report (PA4)
                  </p>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    No PA4 uploaded — add one on the previous step if you want assessor wording shown here.
                  </p>
                </div>
              )}
              {/* Award */}
              {awardText ? (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 mb-1">
                    From your award / decision letter
                  </p>
                  <p className="text-xs text-stone-700 leading-relaxed">"{awardText}"</p>
                </div>
              ) : hasAwardDocs ? (
                <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    From your award / decision letter
                  </p>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Nothing was read for this activity from your decision letter — add a correction below if needed.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-stone-200 bg-indigo-50/30 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/70 mb-1">
                    From your award / decision letter
                  </p>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    No award or decision letter uploaded — add one on the previous step if you want scores and wording
                    here.
                  </p>
                </div>
              )}
            </div>

            {(pip2Pts != null || pa4Pts != null || awardPts != null) && (
              <div className="flex flex-wrap gap-2">
                {pip2Pts != null && (
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-teal-100 text-teal-800">
                    Points from read (PIP2): {pip2Pts}
                  </span>
                )}
                {pa4Pts != null && (
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-amber-100 text-amber-800">
                    Points from read (PA4): {pa4Pts}
                  </span>
                )}
                {awardPts != null && (
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-indigo-100 text-indigo-900">
                    Points from read (award letter): {awardPts}
                  </span>
                )}
              </div>
            )}

            <div className="rounded-xl border border-stone-200 bg-stone-50/90 px-3 py-3 space-y-2">
              <p className="text-[11px] text-stone-600 leading-relaxed">
                {pip2Text || pa4Text || awardText ? (
                  <>
                    <span className="font-semibold text-stone-700">Optional.</span> If anything above doesn&apos;t match your papers or the reader missed words, type what should count as your previous answer for this activity. We&apos;ll use what you type in the walkthrough instead of the automatic text. Leave blank if it looks right.
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-stone-700">Optional backup.</span> Blurry photos, glare, and unclear handwriting are common — automatic reading sometimes misses a box. If you remember what you or the assessor wrote here, type it so we can show it next to this question in the walkthrough. Skip it if you prefer to start fresh in the questions.
                  </>
                )}
              </p>
              <textarea
                value={manual}
                onChange={ev => setActivityFallbackNotes(prev => ({ ...prev, [qid]: ev.target.value }))}
                rows={3}
                placeholder={
                  pip2Text || pa4Text || awardText
                    ? 'Optional — correct wording only if needed'
                    : 'Optional — only if you remember what was on the form'
                }
                className="w-full text-sm text-stone-700 bg-white border border-stone-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-teal-300 placeholder:text-stone-400"
              />
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50/90 px-3 py-3 space-y-2">
              <p className="text-[11px] text-stone-600 leading-relaxed">
                <span className="font-semibold text-stone-700">Optional — points on your last award.</span> If your letter shows points for this activity (0–12), enter it here. When you type a number, it overrides scores we read from your award letter, PIP2, or PA4 for this line.
              </p>
              <input
                type="number"
                min={0}
                max={12}
                inputMode="numeric"
                value={manualPtsStr}
                onChange={ev => setCocManualPoints(prev => ({ ...prev, [qid]: ev.target.value }))}
                placeholder="e.g. 4"
                className="w-full max-w-[8rem] text-sm text-stone-700 bg-white border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300 placeholder:text-stone-400"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep = () => {
    // ── STEP 1: Original PIP2 copy — yes / no ─────────────────────────────────
    if (step === 1) {
      const chooseHave = () => {
        setHasOriginalPip2Copy(true);
        setMissingOriginalPip2Guide(false);
        setStep(2);
      };
      const chooseMissing = () => {
        setHasOriginalPip2Copy(false);
        setMissingOriginalPip2Guide(false);
        setStep(2);
      };
      const continueFromMissingGuide = () => {
        setMissingOriginalPip2Guide(false);
        setStep(2);
      };

      const beforeYouContinuePanel = (
        <div className="rounded-2xl border-2 border-teal-300 bg-teal-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-teal-800 mb-1">Before you continue</p>
          <p className="text-sm text-teal-950 leading-snug">
            No paperwork to hand? Request your <strong className="font-semibold">PIP2</strong>,{' '}
            <strong className="font-semibold">PA4</strong>, and{' '}
            <strong className="font-semibold">decision letter</strong> from DWP, or carry on without files in the next
            steps.
          </p>
          <a
            href="tel:08009172222"
            className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-teal-800 underline decoration-teal-500/60 underline-offset-2 hover:text-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 rounded-sm"
          >
            <Phone className="w-4 h-4 shrink-0" aria-hidden />
            Call 0800 917 2222 — PIP enquiries
          </a>
        </div>
      );

      if (missingOriginalPip2Guide) {
        return (
          <div className="space-y-5 px-5 pt-5 pb-32">
            <div className="bg-teal-800 rounded-2xl p-6 text-white shadow-sm">
              <p className="text-[11px] font-bold text-teal-200 uppercase tracking-widest mb-2">Change of circumstances</p>
              <h2 className="font-bold text-2xl leading-tight mb-3">Without your PIP2</h2>
              <p className="text-teal-50 text-sm leading-relaxed">
                Here&apos;s how you can still line up wording for DWP — then we&apos;ll ask which form you&apos;re on and
                what you can upload.
              </p>
            </div>
            {beforeYouContinuePanel}
            <button
              type="button"
              onClick={continueFromMissingGuide}
              className="w-full py-4 rounded-xl font-bold text-base bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              Continue <ArrowRight className="w-5 h-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setMissingOriginalPip2Guide(false)}
              className="w-full py-3 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 bg-white hover:bg-stone-50 active:scale-[0.99] transition-all"
            >
              Choose a different answer
            </button>
          </div>
        );
      }

      return (
        <div className="space-y-5 px-5 pt-5 pb-32">
          <div className="bg-teal-800 rounded-2xl p-6 text-white shadow-sm">
            <p className="text-[11px] font-bold text-teal-200 uppercase tracking-widest mb-2">Change of circumstances</p>
            <h2 className="font-bold text-2xl leading-tight mb-3">Report a change</h2>
            <p className="text-teal-50 text-sm leading-relaxed">
              A change of circumstances means you want to tell the DWP that your condition has got worse, or something important has changed since your last claim or review. This is an opportunity to receive a <strong className="text-white">higher award</strong> and increased payments.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={chooseHave}
              className="w-full rounded-xl border-2 border-stone-200 bg-white p-4 text-left shadow-sm transition-all hover:border-teal-400 hover:bg-teal-50/40 active:scale-[0.99]"
            >
              <span className="font-semibold text-stone-900 text-base leading-snug">I have my original PIP2 form</span>
            </button>
            <button
              type="button"
              onClick={chooseMissing}
              className="w-full rounded-xl border-2 border-stone-200 bg-white p-4 text-left shadow-sm transition-all hover:border-teal-400 hover:bg-teal-50/40 active:scale-[0.99]"
            >
              <span className="font-semibold text-stone-900 text-base leading-snug">
                I don&apos;t have my original PIP2 form
              </span>
            </button>
          </div>
        </div>
      );
    }

    // ── UPLOAD LOADING SCREEN ──────────────────────────────────────────────────
    if (showUploadLoading) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-stone-50 z-50 px-8">
          <div className="flex flex-col items-center gap-6 max-w-xs text-center">
            <div className="w-16 h-16 bg-teal-700 rounded-2xl flex items-center justify-center shadow-lg">
              <div className="flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{animationDelay:`${i*150}ms`}} />)}
              </div>
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-xl mb-2">Reading your documents...</h2>
              <p className="text-sm text-stone-500 leading-relaxed">We're extracting your previous answers and assessor notes so we can show you exactly what changed.</p>
            </div>
            <p className="text-[11px] text-stone-400">This takes a few seconds</p>
          </div>
        </div>
      );
    }

    // ── STEP 2 (NO FORM PATH): How scoring works ─────────────────────────────
    if (step === 2 && hasOriginalPip2Copy === false) {
      return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <p className="text-[11px] font-bold text-teal-200 uppercase tracking-widest mb-1">Change of circumstances</p>
            <h2 className="font-bold text-xl mb-2">How DWP scores your claim</h2>
            <p className="text-teal-100 text-sm leading-relaxed">Since your circumstances have changed, it's worth understanding how DWP will reassess you — even if you've been through this before.</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🔑</span>
              <h3 className="font-bold text-stone-900 text-sm">What DWP looks for in a CoC</h3>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed mb-3">DWP won't just take your word that things have changed — they need to see <strong className="text-stone-900">evidence of deterioration</strong>. Here's what they focus on:</p>
            <div className="space-y-2.5">
              {[
                { title: 'Has it got more frequent?', body: 'Activities you could do 3 days a week but now struggle with every day carry more weight.' },
                { title: 'Do you need more help now?', body: 'If you previously managed alone but now need prompting, supervision, or someone present — that matters.' },
                { title: 'Has it become less safe?', body: 'Increased risk of falls, accidents, or injury since your last award is a strong indicator of change.' },
                { title: 'Are you taking significantly longer?', body: 'Tasks that now take much longer than before, or leave you exhausted afterwards, count.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 py-2.5 border-b border-stone-50 last:border-0">
                  <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-teal-700 text-[10px] font-black">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-teal-700 font-medium mt-3 bg-teal-50 rounded-xl px-3 py-2">PIPpal will help you describe all of this clearly — using the language DWP assessors are trained to look for.</p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0 mt-0.5">⚠️</span>
              <div>
                <p className="text-sm font-bold text-stone-900">Reassessment covers your whole claim</p>
                <p className="text-sm text-stone-600 mt-1 leading-relaxed">When you report a change, DWP reassesses <strong>everything</strong> — not just what's changed. Your award could go up, stay the same, or go down.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[{stat:'65%',sub:'of new claims rejected'},{stat:'33%',sub:'of CoC claims get more'},{stat:'6 months',sub:'average decision time'}].map((s,i)=>(
                <div key={i} className="bg-white rounded-xl p-2.5 text-center border border-stone-200">
                  <p className="font-black text-teal-700 text-base">{s.stat}</p>
                  <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={next}
            className="w-full py-4 rounded-xl font-bold text-base bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            Continue <ArrowRight className="w-5 h-5" aria-hidden />
          </button>
        </div>
      );
    }

    // ── STEP 3 (NO FORM PATH): Your conditions ───────────────────────────────
    if (step === 3 && hasOriginalPip2Copy === false) {
      return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <p className="text-[11px] font-bold text-teal-200 uppercase tracking-widest mb-1">Change of circumstances</p>
            <h2 className="font-bold text-xl mb-2">Your conditions</h2>
            <p className="text-teal-100 text-sm leading-relaxed">Make sure your medical profile is up to date — PIPpal uses this to personalise every question and write answers that reflect your current situation.</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <p className="text-sm font-bold text-stone-900 mb-1">Why this matters for CoC</p>
            <p className="text-sm text-stone-600 leading-relaxed">If your conditions have changed — new diagnosis, worsening symptoms, new medication — update your profile now. Your answers will be built around what you tell us here.</p>
          </div>

          <button
            type="button"
            onClick={() => {
              // They explicitly chose to update — go to medical profile, then questions
              sessionStorage.setItem(COC_MEDICAL_EXPECTED_KEY, '1');
              sessionStorage.setItem(COC_POST_MEDICAL_SNAPSHOT_KEY, JSON.stringify({
                formType: 'pip2',
                pip2Labels: [],
                pa4Labels: [],
                awardLabels: [],
                pip2Extracted: {},
                pa4Extracted: {},
                awardExtracted: {},
                activityFallbackNotes: {},
                cocManualPoints: {},
              }));
              setCocMode(true);
              navigateTo('medical_profile');
            }}
            className="w-full flex items-center justify-between bg-white border border-stone-200 rounded-2xl px-4 py-4 shadow-sm hover:border-teal-300 hover:bg-teal-50/30 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-lg">🏥</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-stone-900">Update medical profile</p>
                <p className="text-xs text-stone-500">Conditions, medications, notes</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400" />
          </button>

          <button
            type="button"
            onClick={() => {
              // They skipped — still send through medical profile first, then to questions
              sessionStorage.setItem(COC_MEDICAL_EXPECTED_KEY, '1');
              sessionStorage.setItem(COC_POST_MEDICAL_SNAPSHOT_KEY, JSON.stringify({
                formType: 'pip2',
                pip2Labels: [],
                pa4Labels: [],
                awardLabels: [],
                pip2Extracted: {},
                pa4Extracted: {},
                awardExtracted: {},
                activityFallbackNotes: {},
                cocManualPoints: {},
              }));
              setCocMode(true);
              navigateTo('medical_profile');
            }}
            className="w-full py-4 rounded-xl font-bold text-base bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            Continue <ArrowRight className="w-5 h-5" aria-hidden />
          </button>
        </div>
      );
    }

    // ── STEP 4 (NO FORM PATH): How PIPpal writes your answers ───────────────
    if (step === 4 && hasOriginalPip2Copy === false) {
      return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <p className="text-[11px] font-bold text-teal-200 uppercase tracking-widest mb-1">Change of circumstances</p>
            <h2 className="font-bold text-xl mb-2">How this works</h2>
            <p className="text-teal-100 text-sm leading-relaxed">PIPpal asks simple questions and builds your change of circumstances answers for you.</p>
          </div>

          {[
            { icon: '💬', title: 'We ask, you tap', body: 'For each of the 12 activities, we ask simple questions about how things are now. You just tap the options that apply.' },
            { icon: '✍️', title: 'We show what has changed', body: 'PIPpal builds answers that clearly show your situation has worsened — using the language DWP assessors need to see.' },
            { icon: '✏️', title: 'You can improve it', body: "Once we've built your answer, you can tweak or strengthen it. It's your claim — we just do the hard work." },
            { icon: '⚠️', title: 'Be honest about now', body: 'Describe your situation as it is today — on your worst or typical bad days. Not how it was before.' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex gap-3">
              <span className="text-xl shrink-0">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem(COC_MEDICAL_EXPECTED_KEY, '1');
              sessionStorage.setItem(COC_POST_MEDICAL_SNAPSHOT_KEY, JSON.stringify({
                formType: 'pip2', pip2Labels: [], pa4Labels: [], awardLabels: [],
                pip2Extracted: {}, pa4Extracted: {}, awardExtracted: {},
                activityFallbackNotes: {}, cocManualPoints: {},
              }));
              setCocMode(true);
              navigateTo('question_index');
            }}
            className="w-full py-4 rounded-xl font-bold text-base bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            Start my change of circumstances <ArrowRight className="w-5 h-5" aria-hidden />
          </button>
        </div>
      );
    }

    // ── STEP 2 (HAS FORM PATH): Upload PIP2 + optional PA4 + optional award letter ──────────────────
    if (step === 2) {
      const hasPip2 = pip2Labels.length > 0;
      const hasPa4 = pa4Labels.length > 0;
      const hasAward = awardLabels.length > 0;
      const busy = pip2Busy || pa4Busy || awardBusy || classifyBusy;
      const hasAny = hasPip2 || hasPa4 || hasAward;
      const canContinue = !busy && (hasAny || noForm);

      const docSlotLabels = [hasPip2 && 'PIP2', hasPa4 && 'PA4', hasAward && 'Award'].filter(Boolean) as string[];

      return (
        <div className="space-y-5 px-5 pt-5 pb-32">
          {hasOriginalPip2Copy === false && (
            <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3">
              <p className="text-sm text-teal-950 leading-snug">
                You&apos;re continuing <strong className="font-semibold">without a paper PIP2</strong>. Use PA4 or your
                decision letter if you have them, or carry on with reminders only on the following step — same flow either
                way.
              </p>
            </div>
          )}

          {/* Upload first */}
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-teal-200 shrink-0" aria-hidden />
              <h2 className="font-bold text-base">What we need here</h2>
            </div>
            <p className="text-teal-100 text-sm leading-relaxed">
              Add photos or PDFs of your PIP paperwork if you have them.
            </p>
          </div>

          <input
            ref={combinedDocsInputRef}
            type="file"
            accept="image/*,.pdf"
            multiple
            className="hidden"
            onChange={onCombinedDocsPick}
          />

          <div className="space-y-4">
            {classifyBusy && (
              <div className="flex items-center gap-2 text-sm text-teal-800 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
                <span>Working out document type…</span>
              </div>
            )}
            {busy && !classifyBusy && docSlotLabels.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-teal-800 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
                <span>Reading {docSlotLabels.join(' · ')}…</span>
              </div>
            )}
            {combinedPickError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                <p className="text-xs text-red-800 leading-relaxed">{combinedPickError}</p>
              </div>
            )}

            {!hasAny ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => combinedDocsInputRef.current?.click()}
                className="w-full rounded-2xl border-2 border-dashed border-stone-200 bg-white hover:border-teal-300 disabled:opacity-45 transition-all p-6 text-left active:scale-[0.99]"
              >
                <Upload className="w-8 h-8 text-stone-300 mb-3" aria-hidden />
                <p className="font-semibold text-stone-700 text-base mb-1">Upload your PIP paperwork</p>
                <p className="text-xs text-stone-500 leading-relaxed mb-2">
                  Add scans or PDFs here: your PIP2 form, PA4 assessor report, or DWP award / decision letter.
                </p>
                <p className="text-[11px] text-stone-400">
                  Tap to upload · photos or PDF · up to {COC_UPLOAD_MAX_FILES} files (~{formatFileSize(COC_UPLOAD_MAX_TOTAL_BYTES)} maximum)
                </p>
              </button>
            ) : (
              <div className="space-y-3">
                {hasPip2 && (
                  <div className="rounded-2xl border border-stone-200 bg-white p-4 flex gap-3 items-start shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-teal-700" aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-900 text-sm">PIP2 form <span className="text-teal-700 font-semibold text-xs ml-1">your words</span></p>
                      <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2">{pip2Labels.join(', ')}</p>
                      {pip2Busy && (
                        <p className="text-xs text-teal-700 flex items-center gap-1 mt-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden /> Reading…
                        </p>
                      )}
                      {pip2Error && (
                        <p className="text-xs text-amber-800 mt-2 flex gap-1.5 items-start">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden />{pip2Error}
                        </p>
                      )}
                      {!pip2Busy && Object.keys(pip2Extracted).length > 0 && (
                        <p className="text-xs text-teal-700 font-medium mt-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden /> Next: check beside each activity
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBucket('pip2')}
                      disabled={pip2Busy}
                      className="text-xs font-semibold text-stone-400 hover:text-red-600 shrink-0 disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {hasPa4 && (
                  <div className="rounded-2xl border border-stone-200 bg-white p-4 flex gap-3 items-start shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-amber-700" aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-900 text-sm">PA4 report <span className="text-amber-700 font-semibold text-xs ml-1">assessor&apos;s view</span></p>
                      <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2">{pa4Labels.join(', ')}</p>
                      {pa4Busy && (
                        <p className="text-xs text-teal-700 flex items-center gap-1 mt-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden /> Reading…
                        </p>
                      )}
                      {pa4Error && (
                        <p className="text-xs text-amber-800 mt-2 flex gap-1.5 items-start">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden />{pa4Error}
                        </p>
                      )}
                      {!pa4Busy && Object.keys(pa4Extracted).length > 0 && (
                        <p className="text-xs text-teal-700 font-medium mt-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden /> Next: check beside each activity
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBucket('pa4')}
                      disabled={pa4Busy}
                      className="text-xs font-semibold text-stone-400 hover:text-red-600 shrink-0 disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {hasAward && (
                  <div className="rounded-2xl border border-stone-200 bg-white p-4 flex gap-3 items-start shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-indigo-800" aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-900 text-sm">Award / decision letter <span className="text-indigo-700 font-semibold text-xs ml-1">scores</span></p>
                      <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2">{awardLabels.join(', ')}</p>
                      {awardBusy && (
                        <p className="text-xs text-teal-700 flex items-center gap-1 mt-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden /> Reading…
                        </p>
                      )}
                      {awardError && (
                        <p className="text-xs text-amber-800 mt-2 flex gap-1.5 items-start">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden />{awardError}
                        </p>
                      )}
                      {!awardBusy && Object.keys(awardExtracted).length > 0 && (
                        <p className="text-xs text-teal-700 font-medium mt-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden /> Next: check beside each activity
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBucket('award_letter')}
                      disabled={awardBusy}
                      className="text-xs font-semibold text-stone-400 hover:text-red-600 shrink-0 disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => combinedDocsInputRef.current?.click()}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-stone-200 text-sm font-semibold text-stone-600 hover:border-teal-300 hover:bg-teal-50/40 transition-all disabled:opacity-45"
                >
                  + Add more paperwork
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-stone-400 text-center leading-relaxed px-1">
            Auto-reading works best on clear scans; whenever we&apos;re unsure, we&apos;ll ask you to pick what you uploaded — your new answers always come from the questionnaire.
          </p>

          {/* Get the strongest claim — below upload slots */}
          <div className="rounded-2xl border border-teal-200/80 bg-white p-4 shadow-sm space-y-2">
            <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Get the strongest claim</p>
            <p className="text-sm text-stone-700 leading-snug">
              Don&apos;t have everything to hand? Call DWP free on{' '}
              <a href="tel:08009172222" className="font-semibold text-teal-700 underline decoration-teal-400/70 underline-offset-2">0800 917 2222</a>
              {' '}and ask for your PIP2, PA4 assessor report, and decision letter (with scores). Official copies usually arrive quickly.
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                if (hasAny) {
                  setShowUploadLoading(true);
                  setTimeout(() => {
                    setShowUploadLoading(false);
                    next();
                  }, 3000);
                } else {
                  next();
                }
              }}
              disabled={!canContinue || busy}
              className="w-full py-4 rounded-xl font-bold text-base bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-40"
            >
              Continue <ArrowRight className="w-5 h-5" aria-hidden />
            </button>
            {!canContinue && !busy && (
              <p className="text-xs text-stone-500 text-center leading-relaxed px-1">
                Upload your paperwork above to continue.
              </p>
            )}
          </div>

          {docKindModal && (
            <div
              className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6 bg-black/45"
              onClick={(e) => {
                if (e.target === e.currentTarget) setDocKindModal(null);
              }}
              role="presentation"
            >
              <div
                className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-100 p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="coc-doc-kind-heading"
              >
                <h3 id="coc-doc-kind-heading" className="font-bold text-stone-900 text-base leading-snug">
                  Which paperwork is in this upload?
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  We weren&apos;t sure from the scan alone. Pick what you&apos;re uploading — you can{' '}
                  <span className="font-semibold text-stone-700">Add more paperwork</span> afterwards for another type.
                </p>
                {docKindModal.suggested ? (
                  <p className="text-[11px] text-teal-800 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
                    Likely suggestion:{' '}
                    <span className="font-semibold">
                      {docKindModal.suggested === 'pip2'
                        ? 'PIP2'
                        : docKindModal.suggested === 'pa4'
                          ? 'PA4'
                          : 'Award letter'}
                    </span>
                  </p>
                ) : null}
                <div className="space-y-2">
                  {(
                    [
                      { id: 'pip2' as const, title: 'My PIP2 form', hint: 'What you wrote — tick boxes / free text' },
                      { id: 'pa4' as const, title: 'PA4 assessor report', hint: 'Health professional observations' },
                      { id: 'award_letter' as const, title: 'Award / decision letter', hint: 'DWP notice with scores' },
                    ] satisfies { id: CocDocSlot; title: string; hint: string }[]
                  ).map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDraftDocKindPick(opt.id)}
                      className={`w-full text-left rounded-xl border px-3 py-3 transition-all ${draftDocKindPick === opt.id ? 'border-teal-600 bg-teal-50 shadow-[inset_0_0_0_1px_rgba(13,148,136,0.2)]' : 'border-stone-200 hover:border-stone-300 bg-white'}`}
                    >
                      <p className="font-semibold text-stone-900 text-sm">{opt.title}</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">{opt.hint}</p>
                    </button>
                  ))}
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    className="w-full py-3 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors"
                    onClick={() => setDocKindModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="w-full py-3 rounded-xl text-sm font-bold bg-teal-700 text-white hover:bg-teal-800 transition-colors"
                    onClick={() => {
                      mergeBatchIntoBucket(draftDocKindPick, docKindModal.files);
                      setDocKindModal(null);
                    }}
                  >
                    Use this upload
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Admin preview panel */}
          {isAdmin && (
            <div className="rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/60 p-4 space-y-3">
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Admin preview</p>
              <button type="button" onClick={loadMockForm}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-amber-700 text-white hover:bg-amber-800 active:scale-[0.99] transition-all">
                Load mock PIP2 + PA4 + award letter
              </button>
              <div className="flex gap-2 flex-wrap">
                <button type="button" onClick={() => setStep(3)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold border border-amber-400 text-amber-900 hover:bg-amber-100 transition-all">
                  → Step 3 (Activity review)
                </button>
                <button type="button" onClick={() => setStep(4)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold border border-amber-400 text-amber-900 hover:bg-amber-100 transition-all">
                  → Step 4 (Medical redirect)
                </button>
                <button type="button" onClick={startQuestions}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold border border-amber-400 text-amber-900 hover:bg-amber-100 transition-all">
                  → Questions
                </button>
              </div>
            </div>
          )}

        </div>
      );
    }

    // ── STEP 3: Per-activity review (PIP2 / PA4 / uploads / reminders) ───────
    if (step === 3) {
      const hasPip2 = pip2Labels.length > 0;
      const hasPa4 = pa4Labels.length > 0;
      const hasAward = awardLabels.length > 0;
      const busy = pip2Busy || pa4Busy || awardBusy || classifyBusy;
      const hasAny = hasPip2 || hasPa4 || hasAward;
      const hasExtracted =
        Object.keys(pip2Extracted).length > 0 ||
        Object.keys(pa4Extracted).length > 0 ||
        Object.keys(awardExtracted).length > 0;
      const extractionFailedSomewhere =
        (hasPip2 && !!pip2Error) || (hasPa4 && !!pa4Error) || (hasAward && !!awardError);
      const uploadReviewReady = hasAny && (hasExtracted || extractionFailedSomewhere);
      const showActivityReview = !busy && (uploadReviewReady || (noForm && !hasAny));
      const canContinueMedical = !busy;

      const extractedFromDocLabels = [
        Object.keys(pip2Extracted).length > 0 && 'PIP2',
        Object.keys(pa4Extracted).length > 0 && 'PA4',
        Object.keys(awardExtracted).length > 0 && 'award letter',
      ].filter(Boolean) as string[];

      return (
        <div className="space-y-5 px-5 pt-5 pb-32">
          <div className="bg-teal-800 rounded-2xl p-5 text-white shadow-sm">
            <p className="text-[11px] font-bold text-teal-200 uppercase tracking-widest mb-2">Answers & documents</p>
            <h2 className="font-bold text-lg leading-snug mb-2">Check each activity</h2>
            <p className="text-teal-50 text-sm leading-relaxed">
              Expand Daily Living and Mobility below — anything read from uploads shows under each activity. Use the
              optional boxes to correct or add wording, then continue.
            </p>
          </div>

          {busy && (
            <div className="flex items-center gap-2 text-sm text-teal-800 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
              <span>Still reading uploads from the previous step…</span>
            </div>
          )}

          {noForm && !hasAny && (
            <p className="text-xs text-center text-stone-600 bg-stone-100/90 border border-stone-200 rounded-xl px-4 py-3">
              Continuing without uploads — use the reminders under each activity if helpful. You can go back one step to add scans anytime.
            </p>
          )}

          {/* Checklist — uploads / manual reminders / no-doc route */}
          {showActivityReview && (
            <div className="space-y-2">
              {extractionFailedSomewhere && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 space-y-1.5">
                  <p className="text-xs font-semibold text-amber-900">We couldn&apos;t read one of your uploads automatically</p>
                  <p className="text-[11px] text-amber-900/90 leading-relaxed">
                    That usually means a blurry photo, a glare on the page, handwriting the scanner couldn&apos;t make out, or a short connection problem — not something you did wrong. Optional boxes appear below for each activity where nothing came through: add what you remember if you want it next to that question, or leave them blank and continue. Your new answers are still built properly in the walkthrough.
                  </p>
                </div>
              )}
              <p className="text-xs text-stone-500 px-1">
                {uploadReviewReady
                  ? !hasExtracted
                    ? 'Open each activity below. Each one has an optional box — add what you remember if reading failed, or leave blank and go to the questions.'
                    : extractedFromDocLabels.length > 0
                      ? `Content read from your ${extractedFromDocLabels.join(', ')} — open each activity to check the text and points. Use the optional boxes if anything needs correcting.`
                      : 'Open each activity below.'
                  : noForm && !hasAny
                    ? 'No scans attached — jot quick reminders below if helpful, then continue.'
                    : 'Open each activity below.'}
              </p>
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <button type="button"
                  onClick={() => setExpandedSection(expandedSection === 'daily' ? null : 'daily')}
                  className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-stone-50">
                  <div>
                    <p className="font-bold text-stone-900 text-sm">Daily Living activities</p>
                    <p className="text-xs text-stone-400 mt-0.5">Activities 1–10</p>
                  </div>
                  {expandedSection === 'daily' ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                </button>
                {expandedSection === 'daily' && (
                  <div className="border-t border-stone-100">
                    {DAILY_LIVING_IDS.map(renderActivityAccordion)}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <button type="button"
                  onClick={() => setExpandedSection(expandedSection === 'mobility' ? null : 'mobility')}
                  className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-stone-50">
                  <div>
                    <p className="font-bold text-stone-900 text-sm">Mobility activities</p>
                    <p className="text-xs text-stone-400 mt-0.5">Activities 11–12</p>
                  </div>
                  {expandedSection === 'mobility' ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                </button>
                {expandedSection === 'mobility' && (
                  <div className="border-t border-stone-100">
                    {MOBILITY_IDS.map(renderActivityAccordion)}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <button
              type="button"
              onClick={next}
              disabled={!canContinueMedical}
              className="w-full py-4 rounded-xl font-bold text-base bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-40"
            >
              Continue <ArrowRight className="w-5 h-5" aria-hidden />
            </button>
          </div>
        </div>
      );
    }

    // ── STEP 4: Redirect-only — Medical Profile (see useLayoutEffect) ───────
    if (step === 4) {
      return (
        <div className="flex flex-col flex-1 items-center justify-center px-5 py-20 gap-3 min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-sm text-stone-500 text-center">Opening medical profile…</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <StepHeader step={step} title={stepTitles[step - 1]} total={COC_WIZARD_TOTAL_STEPS} onBack={back} />

      {import.meta.env.DEV && (
        <details className="mx-5 mt-2 border border-amber-200 rounded-xl px-3 py-2 bg-amber-50/90 text-[11px] text-stone-700 leading-snug">
          <summary className="cursor-pointer font-semibold text-amber-900">
            DEV: preview Check activities (step 3) — missing uploads
          </summary>
          <div className="mt-2 space-y-2 text-stone-600">
            <p>
              Reload in dev while on this flow with{' '}
              <code className="text-[10px] bg-white/80 px-1 py-px rounded border border-amber-200">?screenshot=…</code>{' '}
              (logged-in + paid bypass as with other screenshot captures).
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[10px] font-mono text-stone-800">
              <li>coc_step3_pip2_only — PIP2 filled; PA4 + award &quot;not uploaded&quot; cards</li>
              <li>coc_step3_pip2_pa4 — no award letter card</li>
              <li>coc_step3_pip2_award — no PA4 card</li>
              <li>coc_step3_pa4_only · coc_step3_award_only · coc_step3_pa4_award</li>
              <li>coc_step3_no_docs — no scans (reminders-only path)</li>
              <li>coc_step3_all or coc_step3 — full three excerpts (q1 expanded)</li>
            </ul>
          </div>
        </details>
      )}

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.18 }}>
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Steps 1–3 scroll; step 4 hands off to Medical Profile */}
    </div>
  );
}
