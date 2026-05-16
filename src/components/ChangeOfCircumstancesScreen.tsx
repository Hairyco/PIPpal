import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from './AppContext';
import { PIP_QUESTIONS } from '../pipQuestions';
import {
  computeCocSessionFromSnapshot,
  type CocMedicalSnapshot,
  COC_POST_MEDICAL_SNAPSHOT_KEY,
  COC_MEDICAL_EXPECTED_KEY,
} from '../cocMedicalSnapshot';

// ── Steps ────────────────────────────────────────────────────────────────────
// 1  Original completed PIP2 copy — yes / no
// 2  Form type selector (PIP2 vs AR1)
// 3  Upload (+ show extracted answers in accordions)
// 4  Opens Medical Profile — save there applies snapshot & navigates to questions (no separate “how this works” step)
const TOTAL_STEPS = 4;

/** Persists CoC wizard step across unmount (medical profile) — survives React Strict Mode remounts; cleared when entering CoC fresh via navigateTo */
const COC_FLOW_STEP_KEY = 'coc_flow_step';

/** Whether user still has their completed PIP2 — cleared with CoC session */
const COC_HAS_ORIGINAL_PIP2_KEY = 'coc_has_original_pip2';

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
    if (n === 5) return 3;
    if (n > TOTAL_STEPS) return 1;
    return n;
  } catch {
    return 1;
  }
}

const DAILY_LIVING_IDS = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'];
const MOBILITY_IDS = ['q11','q12'];
const ALL_ACTIVITY_IDS = [...DAILY_LIVING_IDS, ...MOBILITY_IDS];

type CocExtractedEntry = {
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  pointsAwarded?: number | null;
};

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
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Step {step} of {total}</p>
          <h1 className="font-bold text-stone-900 text-base leading-tight truncate">{title}</h1>
        </div>
      </div>
      <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
        <motion.div className="bg-teal-600 h-full rounded-full"
          animate={{ width: `${(step / total) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>
    </div>
  );
}

type CocUploadZoneProps = {
  label: string;
  sublabel: string;
  badge?: string;
  badgeColour?: string;
  labels: string[];
  busy: boolean;
  error: string | null;
  extracted: Record<string, CocExtractedEntry>;
  inputRef: React.RefObject<HTMLInputElement>;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  isOptional?: boolean;
  /** Shown on the dashed pick button when `isOptional` and nothing uploaded yet */
  optionalPickLabel?: string;
  fileCount: number;
  totalBytes: number;
  maxFiles: number;
  maxTotalBytes: number;
  pickError: string | null;
  /** When true, skip the compact summary row — use inside a parent "Your documents" accordion */
  embedInDocumentsGroup?: boolean;
};

/** Upload card: after successful extraction, defaults to a compact row; tap to expand full details */
function CocUploadZone({
  label, sublabel, badge, badgeColour, labels,
  busy: zoneBusy, error, extracted,
  inputRef, onPick, onRemove, isOptional, optionalPickLabel,
  fileCount, totalBytes, maxFiles, maxTotalBytes, pickError,
  embedInDocumentsGroup = false,
}: CocUploadZoneProps) {
  const [expanded, setExpanded] = useState(true);
  const uploaded = labels.length > 0;
  const done = Object.keys(extracted).length > 0;
  const overRecommendedSize = totalBytes > maxTotalBytes * 0.9;
  const canCollapse = uploaded && done && !zoneBusy && !error;
  const allowCompact = canCollapse && !embedInDocumentsGroup;

  useEffect(() => {
    if (allowCompact) setExpanded(false);
    else setExpanded(true);
  }, [allowCompact]);

  if (!uploaded) {
    return (
      <div className={`${embedInDocumentsGroup ? 'rounded-xl border border-stone-200' : 'rounded-2xl border-2 border-stone-200'} p-4 space-y-3 bg-white`}>
        {pickError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2">
            <p className="text-xs text-red-800 leading-relaxed">{pickError}</p>
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-stone-900 text-sm">{label}</p>
              {badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColour}`}>{badge}</span>}
              {isOptional && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">optional</span>}
            </div>
            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{sublabel}</p>
          </div>
        </div>
        <input ref={inputRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={onPick} />
        <button type="button" onClick={() => inputRef.current?.click()}
          className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${isOptional ? 'border-2 border-dashed border-stone-200 text-stone-600 hover:border-teal-300 hover:text-teal-700' : 'bg-teal-700 text-white hover:bg-teal-800 shadow-sm'}`}>
          <Upload className="w-4 h-4" />
          {isOptional ? (optionalPickLabel ?? 'Add file (optional)') : 'Take a photo or upload pages'}
        </button>
        <p className={`text-[10px] leading-snug ${overRecommendedSize ? 'text-amber-700 font-medium' : 'text-stone-500'}`}>
          <span className="font-semibold text-stone-600">{fileCount}</span> file{fileCount !== 1 ? 's' : ''} selected
          {totalBytes > 0 ? <> · <span className="font-semibold text-stone-600">{formatFileSize(totalBytes)}</span> total</> : null}
          {' '}(max <span className="font-semibold">{maxFiles}</span> files and ~<span className="font-semibold">{formatFileSize(maxTotalBytes)}</span> per upload)
        </p>
      </div>
    );
  }

  if (allowCompact && !expanded) {
    return (
      <div className="rounded-2xl border-2 border-teal-200 bg-teal-50/30 p-3 shadow-sm">
        {pickError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 mb-2">
            <p className="text-xs text-red-800 leading-relaxed">{pickError}</p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex-1 flex items-center gap-2 min-w-0 text-left rounded-xl py-1 pr-1 hover:bg-white/60 transition-colors"
          >
            <ChevronRight className="w-4 h-4 shrink-0 text-stone-400" />
            <FileText className="w-4 h-4 text-teal-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-stone-900 text-sm">{label}</span>
                {badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColour}`}>{badge}</span>}
              </div>
              <p className="text-[11px] text-teal-800 font-medium mt-0.5">
                Answers extracted · {fileCount} file{fileCount !== 1 ? 's' : ''}
                {totalBytes > 0 ? <> · {formatFileSize(totalBytes)}</> : null}
              </p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          </button>
          <button type="button" onClick={onRemove} className="text-xs text-stone-400 hover:text-red-500 underline shrink-0 px-1 py-2">
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${embedInDocumentsGroup ? 'rounded-xl border border-stone-200 bg-stone-50/40' : 'rounded-2xl border-2 border-teal-200 bg-teal-50/30'} p-4 space-y-3`}>
      {pickError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-xs text-red-800 leading-relaxed">{pickError}</p>
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {allowCompact ? (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="w-full text-left rounded-xl -mx-1 px-1 py-0.5 hover:bg-white/50 transition-colors"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                <p className="font-bold text-stone-900 text-sm">{label}</p>
                {badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColour}`}>{badge}</span>}
              </div>
              <p className="text-[11px] text-stone-500 mt-1 pl-6">Tap to hide details</p>
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-stone-900 text-sm">{label}</p>
                {badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColour}`}>{badge}</span>}
              </div>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{sublabel}</p>
            </>
          )}
        </div>
        {uploaded && (
          <button type="button" onClick={onRemove} className="text-xs text-stone-400 hover:text-red-500 underline shrink-0">Remove</button>
        )}
      </div>

      {(!allowCompact || expanded) && (
        <>
          {allowCompact && <p className="text-xs text-stone-500 leading-relaxed pl-6 -mt-1">{sublabel}</p>}
          <div className="space-y-1.5">
            {labels.map(name => (
              <div key={name} className="flex items-center gap-2 text-sm text-stone-700">
                <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="break-all text-xs">{name}</span>
              </div>
            ))}
            {zoneBusy && (
              <div className="flex items-center gap-2 pt-1">
                <Loader2 className="w-3.5 h-3.5 text-teal-600 animate-spin shrink-0" />
                <p className="text-xs text-stone-500">Reading document…</p>
              </div>
            )}
            {!zoneBusy && done && (
              <div className="flex items-center gap-2 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <p className="text-xs text-teal-700 font-semibold">Answers extracted</p>
              </div>
            )}
            {!zoneBusy && error && (
              <div className="flex items-start gap-2 pt-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">Couldn&apos;t read automatically — answers will be blank; add manually.</p>
              </div>
            )}
            <p className={`text-[10px] pt-1 leading-snug ${overRecommendedSize ? 'text-amber-700 font-medium' : 'text-stone-500'}`}>
              <span className="font-semibold text-stone-600">{fileCount}</span> file{fileCount !== 1 ? 's' : ''} selected
              {uploaded && totalBytes > 0 ? <> · <span className="font-semibold text-stone-600">{formatFileSize(totalBytes)}</span> total</> : null}
              {' '}(max <span className="font-semibold">{maxFiles}</span> files and ~<span className="font-semibold">{formatFileSize(maxTotalBytes)}</span> per upload)
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ChangeOfCircumstancesScreen() {
  const {
    goBack,
    navigateTo,
    isAdmin,
    savedAnswersNewClaim,
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
  const [formType, setFormType] = useState<'pip2' | 'ar1' | null>(null);
  const [notReportedOpen, setNotReportedOpen] = useState(false);
  const pip2InputRef = useRef<HTMLInputElement>(null);
  const pa4InputRef = useRef<HTMLInputElement>(null);
  const awardInputRef = useRef<HTMLInputElement>(null);

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

  const [expandedSection, setExpandedSection] = useState<'daily' | 'mobility' | null>('daily');
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  /** Single accordion on step 3 wrapping PIP2 / PA4 / award uploads */
  const [documentsUploadOpen, setDocumentsUploadOpen] = useState(true);
  const [noForm, setNoForm] = useState(false);
  /** Seed “previous” wording from answers saved during the normal new-claim walkthrough — for users who never kept a paper PIP2 */
  const [usePlatformWorkbookAnswers, setUsePlatformWorkbookAnswers] = useState(false);
  /** Optional per-activity typing: gap-fill when empty, or overrides automatic read when filled */
  const [activityFallbackNotes, setActivityFallbackNotes] = useState<Record<string, string>>({});
  /** Optional per-activity points from decision letter — overrides extracted scores when filled */
  const [cocManualPoints, setCocManualPoints] = useState<Record<string, string>>({});

  const newClaimAnswerCount = useMemo(
    () => Object.keys(savedAnswersNewClaim ?? {}).filter(k => savedAnswersNewClaim[k]?.trim()).length,
    [savedAnswersNewClaim],
  );

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
        platformWorkbookAnswers:
          usePlatformWorkbookAnswers && newClaimAnswerCount > 0 ? { ...savedAnswersNewClaim } : undefined,
        activityFallbackNotes,
        cocManualPoints,
      };
      sessionStorage.setItem(COC_POST_MEDICAL_SNAPSHOT_KEY, JSON.stringify(snapshot));
      sessionStorage.setItem(COC_FLOW_STEP_KEY, '3');
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
    usePlatformWorkbookAnswers,
    newClaimAnswerCount,
    savedAnswersNewClaim,
    activityFallbackNotes,
    cocManualPoints,
  ]);

  // Step 4 opens Medical Profile; saving there consumes snapshot → question_index
  const next = () => {
    if (step === 3) {
      writeCocMedicalSnapshotToSession();
      navigateTo('medical_profile');
      return;
    }
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };
  const back = () => {
    if (step === 1) goBack();
    else if (step === 4) setStep(3);
    else setStep(s => s - 1);
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

  const loadMockForm = () => {
    setPip2Labels(['mock_pip2_form.jpg']);
    setPip2Extracted(MOCK_DATA.pip2);

    setPa4Labels(['mock_pa4_assessor_report.pdf']);
    setPa4Extracted(MOCK_DATA.pa4);

    setAwardLabels(['mock_dwp_award_letter.pdf']);
    setAwardExtracted(MOCK_DATA.award);

    setPip2Busy(false); setPip2Error(null);
    setPa4Busy(false); setPa4Error(null);
    setAwardBusy(false); setAwardError(null);
    setPip2UploadError(null);
    setPa4UploadError(null);
    setAwardUploadError(null);
    setActivityFallbackNotes({});
    setCocManualPoints({});
    setExpandedSection('daily');
    setExpandedActivityId(null);
  };

  useLayoutEffect(() => {
    if (!import.meta.env.DEV) return;
    if (new URLSearchParams(window.location.search).get('screenshot') !== 'coc_step3') return;
    setStep(3);
    setFormType('pip2');
    loadMockForm();
    setDocumentsUploadOpen(false);
    setNoForm(false);
    setExpandedSection('daily');
    setExpandedActivityId('q1');
    sessionStorage.setItem(COC_FLOW_STEP_KEY, '3');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot marketing capture via ?screenshot=coc_step3
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

  const onPip2Pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!raw.length) return;
    const bad = validateCocFileSelection(raw);
    if (bad) {
      setPip2UploadError(bad);
      return;
    }
    setPip2UploadError(null);
    const results = await readFilesToBase64List(raw);
    setPip2Labels(results.map(f => f.name));
    setPip2Files(results);
    setPip2Extracted({});
    setPip2Error(null);
    setActivityFallbackNotes({});
    setCocManualPoints({});
  };

  const onPa4Pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!raw.length) return;
    const bad = validateCocFileSelection(raw);
    if (bad) {
      setPa4UploadError(bad);
      return;
    }
    setPa4UploadError(null);
    const results = await readFilesToBase64List(raw);
    setPa4Labels(results.map(f => f.name));
    setPa4Files(results);
    setPa4Extracted({});
    setPa4Error(null);
    setActivityFallbackNotes({});
    setCocManualPoints({});
  };

  const onAwardPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!raw.length) return;
    const bad = validateCocFileSelection(raw);
    if (bad) {
      setAwardUploadError(bad);
      return;
    }
    setAwardUploadError(null);
    const results = await readFilesToBase64List(raw);
    setAwardLabels(results.map(f => f.name));
    setAwardFiles(results);
    setAwardExtracted({});
    setAwardError(null);
  };

  const startQuestions = () => {
    const snapshot: CocMedicalSnapshot = {
      formType,
      hasPip2: pip2Labels.length > 0,
      hasPa4: pa4Labels.length > 0,
      hasAward: awardLabels.length > 0,
      pip2Extracted,
      pa4Extracted,
      awardExtracted,
      platformWorkbookAnswers:
        usePlatformWorkbookAnswers && newClaimAnswerCount > 0 ? { ...savedAnswersNewClaim } : undefined,
      activityFallbackNotes,
      cocManualPoints,
    };
    const session = computeCocSessionFromSnapshot(snapshot);
    resetCocWalkthroughProgress();
    setCocMode(true);
    setCocFormType(formType);
    setCocDocumentType(session.derivedDocType);
    setCocPreviousAnswers(session.primary);
    setCocPreviousPoints(session.cocPreviousPoints);
    setCocAssessorNotes(session.pa4Answers);
    navigateTo('question_index');
  };

  const stepTitles = [
    'Change of circumstances',
    'Which form are you completing?',
    'Answers & documents',
    'Medical profile',
  ];

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
    const platformWorkbookPreview =
      usePlatformWorkbookAnswers && newClaimAnswerCount > 0 ? (savedAnswersNewClaim[qid]?.trim() ?? '') : '';
    const isOpen = expandedActivityId === qid;
    const hasScoreHints = pip2Pts != null || pa4Pts != null || awardPts != null || manualPtsStr.trim() !== '';
    const hasAnswer = Boolean(pip2Text || pa4Text || awardText || platformWorkbookPreview || manual.trim() || hasScoreHints);
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
            {pip2Text || pa4Text || awardText ? (
              <div className="space-y-2">
                {pip2Text ? (
                  <div className="rounded-xl border border-teal-100 bg-teal-50/60 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-1">From your PIP2</p>
                    <p className="text-xs text-stone-700 leading-relaxed">"{pip2Text}"</p>
                  </div>
                ) : null}
                {platformWorkbookPreview ? (
                  <div className="rounded-xl border border-teal-200 bg-white px-3 py-2 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700 mb-1">
                      From My Questions (PIPpal workbook)
                    </p>
                    <p className="text-xs text-stone-700 leading-relaxed">"{platformWorkbookPreview}"</p>
                  </div>
                ) : null}
                {pa4Text ? (
                  <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">From assessor report (PA4)</p>
                    <p className="text-xs text-stone-700 leading-relaxed">"{pa4Text}"</p>
                  </div>
                ) : null}
                {awardText ? (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 mb-1">From your award / decision letter</p>
                    <p className="text-xs text-stone-700 leading-relaxed">"{awardText}"</p>
                  </div>
                ) : null}
              </div>
            ) : platformWorkbookPreview ? (
              <div className="rounded-xl border border-teal-200 bg-white px-3 py-2 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700 mb-1">
                  From My Questions (PIPpal workbook)
                </p>
                <p className="text-xs text-stone-700 leading-relaxed">"{platformWorkbookPreview}"</p>
              </div>
            ) : (
              <p className="text-xs text-stone-400 leading-relaxed">
                Nothing uploaded or saved from your workbook yet for this activity — you can add a reminder in the box below if you wish.
              </p>
            )}

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
                {pip2Text || pa4Text || awardText || platformWorkbookPreview ? (
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
                  pip2Text || pa4Text || awardText || platformWorkbookPreview
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
      const choose = (hasOriginal: boolean) => {
        setHasOriginalPip2Copy(hasOriginal);
        setStep(2);
      };
      return (
        <div className="space-y-5 px-5 pt-6 pb-32">
          <p className="text-sm text-stone-600 leading-relaxed">
            Do you still have your <span className="font-semibold text-stone-800">completed</span> &quot;How your disability affects you&quot; form (PIP2) from your last claim or review?
          </p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => choose(true)}
              className="w-full rounded-xl border-2 border-stone-200 bg-white p-4 text-left shadow-sm transition-all hover:border-teal-400 hover:bg-teal-50/40 active:scale-[0.99]"
            >
              <span className="font-semibold text-stone-900 text-base leading-snug">I have my original PIP2 form</span>
              <span className="mt-1 block text-[13px] text-stone-500 leading-snug">Photos or scans are fine — we&apos;ll read your wording next.</span>
            </button>
            <button
              type="button"
              onClick={() => choose(false)}
              className="w-full rounded-xl border-2 border-stone-200 bg-white p-4 text-left shadow-sm transition-all hover:border-teal-400 hover:bg-teal-50/40 active:scale-[0.99]"
            >
              <span className="font-semibold text-stone-900 text-base leading-snug">I don&apos;t have my original PIP2 form</span>
              <span className="mt-1 block text-[13px] text-stone-500 leading-snug">We&apos;ll use PA4, your decision letter, saved My Questions answers, or short reminders.</span>
            </button>
          </div>
        </div>
      );
    }

    // ── STEP 2: Form type selector (PIP2 vs AR1) ─────────────────────────────
    if (step === 2) {
      return (
        <div className="space-y-4 px-5 pt-5 pb-32">
          <p className="text-xs text-stone-600 leading-snug">
            <span className="font-semibold text-stone-800">Which paperwork did DWP send?</span>{' '}
            We match the walkthrough to the form type — tap one option.
          </p>

          <div className="space-y-2">
            {/* PIP2 option */}
            <button
              type="button"
              onClick={() => setFormType('pip2')}
              className={`w-full text-left rounded-xl border p-3.5 transition-all active:scale-[0.99] ${
                formType === 'pip2'
                  ? 'border-teal-500 bg-teal-50/90 shadow-[0_0_0_1px_rgba(20,184,166,0.15)]'
                  : 'border-stone-200/90 bg-white hover:border-stone-300 hover:bg-stone-50/80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-4 h-4 rounded-full border-[1.5px] shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                  formType === 'pip2' ? 'border-teal-500 bg-teal-500' : 'border-stone-300 bg-white'
                }`}>
                  {formType === 'pip2' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-stone-900 text-sm">PIP2 form</span>
                    <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800">
                      Full reassessment
                    </span>
                  </div>
                  <p className="text-[13px] text-stone-600 leading-snug">
                    The main form covering all activities — including after you&apos;ve told DWP your circumstances changed.
                  </p>
                </div>
              </div>
            </button>

            {/* AR1 option */}
            <button
              type="button"
              onClick={() => setFormType('ar1')}
              className={`w-full text-left rounded-xl border p-3.5 transition-all active:scale-[0.99] ${
                formType === 'ar1'
                  ? 'border-teal-500 bg-teal-50/90 shadow-[0_0_0_1px_rgba(20,184,166,0.15)]'
                  : 'border-stone-200/90 bg-white hover:border-stone-300 hover:bg-stone-50/80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-4 h-4 rounded-full border-[1.5px] shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                  formType === 'ar1' ? 'border-teal-500 bg-teal-500' : 'border-stone-300 bg-white'
                }`}>
                  {formType === 'ar1' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-stone-900 text-sm">AR1 review form</span>
                    <span className="text-[9px] font-semibold leading-tight px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800">
                      Change of circumstances
                    </span>
                  </div>
                  <p className="text-[13px] text-stone-600 leading-snug">
                    Shorter mid-award review — focus on what&apos;s <span className="font-medium text-stone-800">changed</span>, not your whole story again.
                  </p>
                </div>
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={next}
            disabled={!formType}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-40"
          >
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      );
    }

    // ── STEP 3: Upload PIP2 + optional PA4 + optional award letter ────────────────────
    if (step === 3) {
      const hasPip2 = pip2Labels.length > 0;
      const hasPa4 = pa4Labels.length > 0;
      const hasAward = awardLabels.length > 0;
      const busy = pip2Busy || pa4Busy || awardBusy;
      const hasAny = hasPip2 || hasPa4 || hasAward;
      const hasExtracted =
        Object.keys(pip2Extracted).length > 0 ||
        Object.keys(pa4Extracted).length > 0 ||
        Object.keys(awardExtracted).length > 0;
      const extractionFailedSomewhere =
        (hasPip2 && !!pip2Error) || (hasPa4 && !!pa4Error) || (hasAward && !!awardError);
      const uploadReviewReady = hasAny && (hasExtracted || extractionFailedSomewhere);
      const workbookPathOk = usePlatformWorkbookAnswers && newClaimAnswerCount > 0;
      const showActivityReview =
        !busy && (uploadReviewReady || workbookPathOk || (noForm && !hasAny));
      const canContinue = !busy && (hasAny || noForm || workbookPathOk);

      const extractedFromDocLabels = [
        Object.keys(pip2Extracted).length > 0 && 'PIP2',
        Object.keys(pa4Extracted).length > 0 && 'PA4',
        Object.keys(awardExtracted).length > 0 && 'award letter',
      ].filter(Boolean) as string[];

      const docSlotLabels = [hasPip2 && 'PIP2', hasPa4 && 'PA4', hasAward && 'Award'].filter(Boolean) as string[];

      return (
        <div className="space-y-5 px-5 pt-5 pb-32">
          {hasOriginalPip2Copy === false && (
            <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3">
              <p className="text-sm text-teal-950 leading-snug">
                You&apos;re continuing <strong className="font-semibold">without a paper PIP2</strong>. Use PA4 or your decision letter if you have them, reuse{' '}
                <strong className="font-semibold">My Questions</strong> answers below, or carry on with reminders only — same screen works either way.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-start gap-2">
              <FileText className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-900 text-sm">No paper PIP2 to photograph?</p>
                <p className="text-xs text-stone-600 leading-relaxed mt-1">
                  That is fine. Upload a PA4 or decision letter instead if you have one, reuse answers from a previous{' '}
                  <strong className="text-stone-800">new claim</strong> walkthrough saved in My Questions, or tap &quot;I don&apos;t have these
                  documents yet&quot; — then add short reminders per activity if you want DWP wording on screen before you rewrite it.
                </p>
              </div>
            </div>
            <label
              className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${usePlatformWorkbookAnswers && newClaimAnswerCount > 0 ? 'border-teal-400 bg-teal-50/50' : 'border-stone-200 bg-stone-50/70 hover:bg-stone-50'}`}
            >
              <input
                type="checkbox"
                checked={usePlatformWorkbookAnswers}
                disabled={newClaimAnswerCount === 0}
                onChange={ev => setUsePlatformWorkbookAnswers(ev.target.checked)}
                className="mt-1 w-4 h-4 rounded border-stone-300 text-teal-700 focus:ring-teal-500 disabled:opacity-40"
              />
              <span className="min-w-0">
                <span className="text-sm font-semibold text-stone-900 leading-snug">Use answers from My Questions (new claim on PIPpal)</span>
                <span className="block text-[11px] text-stone-600 leading-snug mt-1">
                  {newClaimAnswerCount > 0
                    ? `${newClaimAnswerCount} activit${newClaimAnswerCount !== 1 ? 'ies have' : 'y has'} saved wording — we show it beside each activity in the checklist below before you refresh your medical profile and continue in CoC mode.`
                    : 'Nothing saved yet. Open My Questions from Home (outside this flow), complete answers for how things were last time as best you can, then come back here and tick again.'}
                </span>
              </span>
            </label>
            <button
              type="button"
              onClick={() => navigateTo('question_index')}
              className="w-full py-3 rounded-xl text-sm font-semibold border border-stone-300 text-stone-800 hover:bg-stone-100 active:scale-[0.99] transition-all"
            >
              Open My Questions to add answers
              <ChevronRight className="inline w-4 h-4 mb-px ml-1 text-stone-500" aria-hidden />
            </button>
            <p className="text-[10px] text-stone-500 leading-snug">
              That leaves this flow briefly — reopen Change of circumstances from Home when finished. Uploaded documents are not preserved if you reload the screen.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <button
              type="button"
              aria-expanded={documentsUploadOpen}
              onClick={() => setDocumentsUploadOpen(o => !o)}
              className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left hover:bg-stone-50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold text-stone-900 text-sm">Your documents</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Original PIP2 optional — PA4 / award helpful if you still have scans
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {busy && <Loader2 className="w-4 h-4 text-teal-600 animate-spin" aria-hidden />}
                {docSlotLabels.length > 0 && !busy && (
                  <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-1 rounded-lg max-w-[11rem] truncate">
                    {docSlotLabels.join(' · ')}
                  </span>
                )}
                {documentsUploadOpen ? (
                  <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" aria-hidden />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" aria-hidden />
                )}
              </div>
            </button>
            {documentsUploadOpen && (
              <div className="border-t border-stone-100 px-3 py-3 space-y-3 bg-stone-50/40">
                <CocUploadZone
                  label="Original PIP2 form"
                  sublabel="Handy if you kept a scan — skip if you reuse My Questions wording above instead."
                  badge="Your words"
                  badgeColour="bg-teal-100 text-teal-700"
                  labels={pip2Labels}
                  busy={pip2Busy}
                  error={pip2Error}
                  extracted={pip2Extracted}
                  inputRef={pip2InputRef}
                  onPick={onPip2Pick}
                  embedInDocumentsGroup
                  onRemove={() => {
                    setPip2Labels([]); setPip2Files([]); setPip2Extracted({}); setPip2UploadError(null); setActivityFallbackNotes({}); setCocManualPoints({});
                  }}
                  isOptional
                  optionalPickLabel="Upload PIP2 (optional)"
                  fileCount={pip2Labels.length}
                  totalBytes={pip2Files.reduce((s, f) => s + f.size, 0)}
                  maxFiles={COC_UPLOAD_MAX_FILES}
                  maxTotalBytes={COC_UPLOAD_MAX_TOTAL_BYTES}
                  pickError={pip2UploadError}
                />

                <CocUploadZone
                  label="PA4 assessor report"
                  sublabel="The report written by the health professional — shows what they observed for each activity and why they scored you as they did."
                  badge="Assessor's view"
                  badgeColour="bg-amber-100 text-amber-700"
                  labels={pa4Labels}
                  busy={pa4Busy}
                  error={pa4Error}
                  extracted={pa4Extracted}
                  inputRef={pa4InputRef}
                  onPick={onPa4Pick}
                  embedInDocumentsGroup
                  onRemove={() => {
                    setPa4Labels([]); setPa4Files([]); setPa4Extracted({}); setPa4UploadError(null); setActivityFallbackNotes({}); setCocManualPoints({});
                  }}
                  isOptional
                  optionalPickLabel="Add PA4 report (optional)"
                  fileCount={pa4Labels.length}
                  totalBytes={pa4Files.reduce((s, f) => s + f.size, 0)}
                  maxFiles={COC_UPLOAD_MAX_FILES}
                  maxTotalBytes={COC_UPLOAD_MAX_TOTAL_BYTES}
                  pickError={pa4UploadError}
                />

                <CocUploadZone
                  label="PIP award or decision letter"
                  sublabel="DWP decision notice or award letter showing points for each activity — we read the scoring table to fill your previous points."
                  badge="Official scores"
                  badgeColour="bg-indigo-100 text-indigo-800"
                  labels={awardLabels}
                  busy={awardBusy}
                  error={awardError}
                  extracted={awardExtracted}
                  inputRef={awardInputRef}
                  onPick={onAwardPick}
                  embedInDocumentsGroup
                  onRemove={() => {
                    setAwardLabels([]); setAwardFiles([]); setAwardExtracted({}); setAwardUploadError(null);
                  }}
                  isOptional
                  optionalPickLabel="Add award or decision letter (optional)"
                  fileCount={awardLabels.length}
                  totalBytes={awardFiles.reduce((s, f) => s + f.size, 0)}
                  maxFiles={COC_UPLOAD_MAX_FILES}
                  maxTotalBytes={COC_UPLOAD_MAX_TOTAL_BYTES}
                  pickError={awardUploadError}
                />
              </div>
            )}
          </div>

          {/* Checklist — uploads, workbook seeds, manual reminders, no-doc route */}
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
                  : workbookPathOk
                    ? 'Your saved answers from My Questions appear under each activity. Adjust optional notes or scores before continuing — handwritten overrides take priority when you finish Medical Profile.'
                    : noForm && !hasAny
                      ? 'No scans attached — jot quick reminders below if helpful, then continue.'
                      : 'Open each activity below.'}
              </p>
              {/* Daily Living */}
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
              {/* Mobility */}
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

          {!noForm && !hasAny && (
            <button type="button" onClick={() => setNoForm(true)}
              className="w-full py-3.5 rounded-xl font-semibold text-sm border-2 border-stone-200 text-stone-700 hover:bg-stone-50 active:scale-[0.99] transition-all">
              I don't have these documents yet
            </button>
          )}

          {/* No document guidance */}
          {noForm && !hasAny && (
            <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-5 space-y-4">
              <p className="font-bold text-blue-900 text-base">Request your documents from DWP</p>
              <p className="text-sm text-blue-800 leading-relaxed">
                You&apos;re entitled to copies of your PIP2, PA4 report, and decision paperwork. Call the PIP helpline on <span className="font-bold text-blue-950">0800 917 2222</span> (freephone) and ask — copies usually arrive within a few days.
              </p>
              <div className="bg-white rounded-xl border border-blue-200 p-4">
                <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1">What to say when you call</p>
                <p className="text-sm text-blue-900 italic leading-relaxed">
                  "I'd like a copy of my PIP2, PA4 assessor report, and my decision letter with my scores please."
                </p>
              </div>
              <a href="tel:08009172222"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99] transition-all shadow-sm">
                <Phone className="w-4 h-4" />Call DWP — 0800 917 2222
              </a>
              <button type="button" onClick={next}
                className="w-full py-3 rounded-xl font-semibold text-sm border-2 border-blue-300 text-blue-800 bg-white hover:bg-blue-50 active:scale-[0.99] transition-all">
                Continue without documents for now
              </button>
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

          {/* Continue */}
          {canContinue && (
            <button type="button" onClick={next}
              className="w-full py-4 rounded-xl font-bold text-base bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm">
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          )}
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
      <StepHeader step={step} title={stepTitles[step - 1]} total={TOTAL_STEPS} onBack={back} />

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.18 }}>
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Steps 1–3: inline buttons; step 4 spinner then Medical Profile */}
    </div>
  );
}
