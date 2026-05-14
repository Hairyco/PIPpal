import React, { useEffect, useRef, useState } from 'react';
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
  Info,
  Stethoscope,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from './AppContext';
import { PIP_QUESTIONS } from '../pipQuestions';

// ── Steps ────────────────────────────────────────────────────────────────────
// 1  Intro + step guide
// 2  Form type selector (PIP2 vs AR1)
// 3  Upload (+ show extracted answers in accordions)
// 4  Your conditions (link to medical profile)
// 5  How this works + Start  → navigates to question_index with cocMode on
const TOTAL_STEPS = 5;

const DAILY_LIVING_IDS = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'];
const MOBILITY_IDS = ['q11','q12'];

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

function BottomBar({ onNext, label = 'Continue', disabled = false, onBack, showBack = false }:
  { onNext: () => void; label?: string; disabled?: boolean; onBack?: () => void; showBack?: boolean }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 px-5 py-4 flex gap-3 max-w-4xl mx-auto safe-area-pb z-20">
      {showBack && onBack && (
        <button type="button" onClick={onBack}
          className="flex items-center gap-2 px-5 py-3.5 rounded-xl border-2 border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50 active:scale-[0.98] transition-all">
          <ArrowLeft className="w-4 h-4" />Back
        </button>
      )}
      <button type="button" onClick={onNext} disabled={disabled}
        className="flex-1 flex items-center justify-center gap-2 bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-teal-800 active:scale-[0.98] transition-all disabled:opacity-40 shadow-sm">
        {label}<ArrowRight className="w-4 h-4" />
      </button>
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
  extracted: Record<string, { answer: string; confidence: string }>;
  inputRef: React.RefObject<HTMLInputElement>;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  isOptional?: boolean;
  fileCount: number;
  totalBytes: number;
  maxFiles: number;
  maxTotalBytes: number;
  pickError: string | null;
};

/** Upload card: after successful extraction, defaults to a compact row; tap to expand full details */
function CocUploadZone({
  label, sublabel, badge, badgeColour, labels,
  busy: zoneBusy, error, extracted,
  inputRef, onPick, onRemove, isOptional,
  fileCount, totalBytes, maxFiles, maxTotalBytes, pickError,
}: CocUploadZoneProps) {
  const [expanded, setExpanded] = useState(true);
  const uploaded = labels.length > 0;
  const done = Object.keys(extracted).length > 0;
  const overRecommendedSize = totalBytes > maxTotalBytes * 0.9;
  const canCollapse = uploaded && done && !zoneBusy && !error;

  useEffect(() => {
    if (canCollapse) setExpanded(false);
    else setExpanded(true);
  }, [canCollapse]);

  if (!uploaded) {
    return (
      <div className={`rounded-2xl border-2 p-4 space-y-3 border-stone-200 bg-white`}>
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
          {isOptional ? 'Add PA4 report (optional)' : 'Take a photo or upload pages'}
        </button>
        <p className={`text-[10px] leading-snug ${overRecommendedSize ? 'text-amber-700 font-medium' : 'text-stone-500'}`}>
          <span className="font-semibold text-stone-600">{fileCount}</span> file{fileCount !== 1 ? 's' : ''} selected
          {totalBytes > 0 ? <> · <span className="font-semibold text-stone-600">{formatFileSize(totalBytes)}</span> total</> : null}
          {' '}(max <span className="font-semibold">{maxFiles}</span> files and ~<span className="font-semibold">{formatFileSize(maxTotalBytes)}</span> per upload)
        </p>
      </div>
    );
  }

  if (canCollapse && !expanded) {
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
    <div className={`rounded-2xl border-2 p-4 space-y-3 border-teal-200 bg-teal-50/30`}>
      {pickError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-xs text-red-800 leading-relaxed">{pickError}</p>
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {canCollapse ? (
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

      {(!canCollapse || expanded) && (
        <>
          {canCollapse && <p className="text-xs text-stone-500 leading-relaxed pl-6 -mt-1">{sublabel}</p>}
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
  const { goBack, navigateTo, medProfile, isAdmin, setCocPreviousAnswers, setCocMode, setCocFormType, setCocDocumentType, setCocAssessorNotes } = useAppContext();

  const [step, setStep] = useState(() => {
    const saved = sessionStorage.getItem('coc_return_step');
    if (saved) { sessionStorage.removeItem('coc_return_step'); return parseInt(saved); }
    return 1;
  });
  const [formType, setFormType] = useState<'pip2' | 'ar1' | null>(null);
  const [notReportedOpen, setNotReportedOpen] = useState(false);
  const pip2InputRef = useRef<HTMLInputElement>(null);
  const pa4InputRef = useRef<HTMLInputElement>(null);

  // PIP2 upload state
  const [pip2Labels, setPip2Labels] = useState<string[]>([]);
  const [pip2Files, setPip2Files] = useState<{ name: string; base64: string; mimeType: string; size: number }[]>([]);
  const [pip2Busy, setPip2Busy] = useState(false);
  const [pip2Error, setPip2Error] = useState<string | null>(null);
  const [pip2UploadError, setPip2UploadError] = useState<string | null>(null);
  const [pip2Extracted, setPip2Extracted] = useState<Record<string, { answer: string; confidence: 'high' | 'medium' | 'low' }>>({});

  // PA4 upload state
  const [pa4Labels, setPa4Labels] = useState<string[]>([]);
  const [pa4Files, setPa4Files] = useState<{ name: string; base64: string; mimeType: string; size: number }[]>([]);
  const [pa4Busy, setPa4Busy] = useState(false);
  const [pa4Error, setPa4Error] = useState<string | null>(null);
  const [pa4UploadError, setPa4UploadError] = useState<string | null>(null);
  const [pa4Extracted, setPa4Extracted] = useState<Record<string, { answer: string; confidence: 'high' | 'medium' | 'low' }>>({});

  const [expandedSection, setExpandedSection] = useState<'daily' | 'mobility' | null>('daily');
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [noForm, setNoForm] = useState(false);
  /** Optional per-activity typing: gap-fill when empty, or overrides automatic read when filled */
  const [activityFallbackNotes, setActivityFallbackNotes] = useState<Record<string, string>>({});

  // Medical then vs now
  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const back = () => step === 1 ? goBack() : setStep(s => s - 1);

  // Extraction helper
  async function runExtraction(
    files: { base64: string; mimeType: string }[],
    docType: 'pip2' | 'pa4',
    setBusy: (v: boolean) => void,
    setError: (v: string | null) => void,
    setExtracted: (v: Record<string, { answer: string; confidence: 'high' | 'medium' | 'low' }>) => void,
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
        setExtracted(data.extractedAnswers);
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

  // Admin mock form loader — content varies by selected document type
  const MOCK_DATA: Record<string, Record<string, { answer: string; confidence: 'high' | 'medium' | 'low' }>> = {
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
      q1:  { answer: 'Claimant states they use a microwave only and cannot use the hob due to pain and fatigue. A perching stool is used at the kitchen counter. Partner reported to assist with preparing hot food daily. Observed reduced grip strength on examination. Recommended descriptor: E (supervision required). 4 points.', confidence: 'high' },
      q2:  { answer: 'Claimant uses adapted cutlery. Tremor observed during assessment — moderate bilateral hand tremor. Claimant states food is cut up by partner on most days. Eating is slow; claimant did not finish food brought to assessment. Recommended descriptor: C (uses aid/appliance). 2 points.', confidence: 'high' },
      q3:  { answer: 'Claimant uses a pre-filled dosette box filled by carer weekly. States they forget doses without prompting. No evidence of missed doses causing harm at time of assessment. Recommended descriptor: C (prompting required). 1 point.', confidence: 'medium' },
      q4:  { answer: 'Claimant uses a shower seat and grab rails (prescription evidence provided). States they cannot wash hair or lower body independently. Partner stated to assist daily. Claimant arrived to assessment with hair unwashed. Recommended descriptor: D (assistance with bathing). 2 points.', confidence: 'high' },
      q5:  { answer: 'Claimant reports daily use of continence pads (prescription confirmed). Urgency stated as primary issue — claimant describes not always making it to the toilet in time. Grab rails fitted. Recommended descriptor: C (use of aids/appliances for toilet). 2 points.', confidence: 'high' },
      q6:  { answer: 'Claimant attended in elasticated-waist clothing and slip-on shoes. States dressing independently takes over 30 minutes on average and they require a long-handled aid for socks. Partner confirmed they assist with complex clothing. Recommended descriptor: C (uses an aid). 2 points.', confidence: 'medium' },
      q7:  { answer: 'Speech was audible throughout assessment but claimant\'s voice became quiet and less clear toward the end of the session. Claimant reported difficulty maintaining conversation when fatigued. No formal speech or language disorder evident. Recommended descriptor: A (no difficulty). 0 points.', confidence: 'high' },
      q8:  { answer: 'Claimant uses a handheld magnifier (brought to assessment). Reports re-reading required for complex documents. Confirmed ability to read standard newspaper print with magnifier. Recommended descriptor: B (uses an aid). 2 points.', confidence: 'high' },
      q9:  { answer: 'Claimant reported significant anxiety in social situations. Attended assessment alone but stated this required considerable effort. Reports cancelling social engagements frequently. No observed distress during assessment but stated one-to-one situations are manageable; groups are not. Recommended descriptor: C (needs prompting to engage). 2 points.', confidence: 'medium' },
      q10: { answer: 'Claimant states partner checks bank statements. Some confusion noted when discussing budgeting — claimant could not recall recent spending when asked. Benefit payments managed by partner. Recommended descriptor: C (needs prompting for complex decisions). 2 points.', confidence: 'high' },
      q11: { answer: 'Claimant did not use public transport to attend — arrived by taxi with partner. States they cannot use unfamiliar routes alone. Pre-assessment questionnaire noted severe anxiety when route includes unpredictable elements (e.g. cancelled trains). Recommended descriptor: E (cannot follow journeys without another person). 8 points.', confidence: 'high' },
      q12: { answer: 'Claimant walked from waiting area to assessment room (approx. 40m) with a walking stick and one rest. Stated this was a better day. Claims to use a manual wheelchair on most days. No wheelchair observed at assessment. Timed walk test not completed — claimant declined. Recommended descriptor: C (can walk up to 50m). 4 points.', confidence: 'high' },
    },
  };

  const loadMockForm = () => {
    setPip2Labels(['mock_pip2_form.jpg']);
    setPip2Extracted(MOCK_DATA.pip2);

    setPa4Labels(['mock_pa4_assessor_report.pdf']);
    setPa4Extracted(MOCK_DATA.pa4);

    setPip2Busy(false); setPip2Error(null);
    setPa4Busy(false); setPa4Error(null);
    setPip2UploadError(null);
    setPa4UploadError(null);
    setActivityFallbackNotes({});
    setExpandedSection('daily');
    setExpandedActivityId(null);
  };

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
  };

  const startQuestions = () => {
    const hasPip2 = pip2Labels.length > 0;
    const hasPa4 = pa4Labels.length > 0;
    const derivedDocType = hasPip2 && hasPa4 ? 'both' : hasPa4 ? 'pa4_only' : 'pip2_only';

    // PIP2 answers = primary (claimant's words)
    const pip2Answers: Record<string, string> = {};
    for (const [k, v] of Object.entries(pip2Extracted)) pip2Answers[k] = v.answer ?? '';

    // PA4 answers = assessor notes stored separately
    const pa4Answers: Record<string, string> = {};
    for (const [k, v] of Object.entries(pa4Extracted)) pa4Answers[k] = v.answer ?? '';

    // What goes into wizard as "previous answer": pip2 if available, pa4 fills gaps
    const primary = { ...pa4Answers };
    for (const [k, v] of Object.entries(pip2Answers)) { if (v) primary[k] = v; }

    // Optional typing: fills gaps, or replaces automatic read when you correct a box
    for (const [k, v] of Object.entries(activityFallbackNotes)) {
      const t = v?.trim();
      if (t) primary[k] = t;
    }

    setCocMode(true);
    setCocFormType(formType);
    setCocDocumentType(derivedDocType);
    setCocPreviousAnswers(primary);
    setCocAssessorNotes(pa4Answers);
    navigateTo('question_index');
  };

  const stepTitles = [
    'Change of circumstances',
    'Which form are you completing?',
    'Upload your documents',
    'Your conditions',
    'How this works',
  ];

  const renderActivityAccordion = (qid: string) => {
    const q = PIP_QUESTIONS.find(x => x.id === qid);
    if (!q) return null;
    const extractedPip2 = pip2Extracted[qid];
    const extractedPa4 = pa4Extracted[qid];
    const pip2Text = extractedPip2?.answer?.trim() ?? '';
    const pa4Text = extractedPa4?.answer?.trim() ?? '';
    const manual = activityFallbackNotes[qid] ?? '';
    const isOpen = expandedActivityId === qid;
    const hasAnswer = Boolean(pip2Text || pa4Text || manual.trim());
    const confidence = (extractedPip2 ?? extractedPa4)?.confidence ?? 'low';
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
            {pip2Text || pa4Text ? (
              <div className="space-y-2">
                {pip2Text ? (
                  <div className="rounded-xl border border-teal-100 bg-teal-50/60 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-1">From your PIP2</p>
                    <p className="text-xs text-stone-700 leading-relaxed">"{pip2Text}"</p>
                  </div>
                ) : null}
                {pa4Text ? (
                  <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">From assessor report (PA4)</p>
                    <p className="text-xs text-stone-700 leading-relaxed">"{pa4Text}"</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-xs text-stone-400 leading-relaxed">
                Nothing was read from your documents for this activity.
              </p>
            )}

            <div className="rounded-xl border border-stone-200 bg-stone-50/90 px-3 py-3 space-y-2">
              <p className="text-[11px] text-stone-600 leading-relaxed">
                {pip2Text || pa4Text ? (
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
                placeholder={pip2Text || pa4Text ? 'Optional — correct wording only if needed' : 'Optional — only if you remember what was on the form'}
                className="w-full text-sm text-stone-700 bg-white border border-stone-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-teal-300 placeholder:text-stone-400"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep = () => {
    // ── STEP 1: Intro + step guide ───────────────────────────────────────────
    if (step === 1) {
      const guideSteps = [
        { title: 'Choose your form', body: 'Confirm whether DWP sent you the full PIP2 or the AR1 review form — we tailor the walkthrough to match.' },
        { title: 'Upload your documents', body: 'Add your previous PIP2 (your own words) and, if you have it, your PA4 assessor report, as photos or PDFs.' },
        { title: 'Your conditions', body: 'Check your conditions are complete and correct — PIPpal uses them to tailor every question and answer.' },
        { title: 'Start the 12 activities', body: 'See how it works, then work through each activity with your old answers beside you.' },
      ];
      return (
        <div className="space-y-5 px-5 pt-5 pb-32">
          <div className="bg-teal-800 rounded-2xl p-6 text-white shadow-sm">
            <p className="text-[11px] font-bold text-teal-200 uppercase tracking-widest mb-2">Change of circumstances</p>
            <h2 className="font-bold text-2xl leading-tight mb-3">What this is for</h2>
            <p className="text-teal-50 text-sm leading-relaxed">
              A <span className="font-semibold text-white">change of circumstances</span> means you want to tell the DWP that something important has changed since your last claim or review.
            </p>
            <p className="text-teal-100 text-sm leading-relaxed mt-2">
              PIPpal walks you through each activity using your old PIP2 wording and, if you have it, your assessor report, so you can see what to improve and describe what has changed clearly for the form you&apos;re filling in now. If you don&apos;t have your original PIP2 form, that&apos;s fine — we can still help.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
            <div>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Step guide</p>
              <h3 className="font-semibold text-stone-900 text-base leading-snug">What you&apos;ll do in this walkthrough</h3>
            </div>
            <ol className="space-y-3.5">
              {guideSteps.map((item, i) => (
                <li key={item.title} className="flex gap-3">
                  <span className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <button
            type="button"
            onClick={next}
            className="w-full py-4 rounded-xl font-bold text-base bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      );
    }

    // ── STEP 2: Form type selector (PIP2 vs AR1) ─────────────────────────────
    if (step === 2) {
      return (
        <div className="space-y-5 px-5 pt-5 pb-32">
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3.5">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Form type</p>
            <h3 className="font-semibold text-stone-800 text-base leading-snug mb-1">Which form are you completing?</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Pick the one that matches the form DWP sent — we&apos;ll match the walkthrough to that.
            </p>
          </div>

          <div className="space-y-3">
            {/* PIP2 option */}
            <button
              type="button"
              onClick={() => setFormType('pip2')}
              className={`w-full text-left rounded-2xl border-2 p-5 transition-all active:scale-[0.98] ${
                formType === 'pip2'
                  ? 'border-teal-500 bg-teal-50 shadow-sm'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                  formType === 'pip2' ? 'border-teal-500 bg-teal-500' : 'border-stone-300'
                }`}>
                  {formType === 'pip2' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-stone-900 text-base">PIP2 form</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">Full reassessment</span>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Choose this if you&apos;ve <span className="font-semibold text-stone-800">reported a change of circumstances</span> to DWP and the form they want back is the main <span className="font-semibold text-stone-800">PIP2</span> — where you describe how your disability affects you across every activity. That&apos;s the form this walkthrough matches.
                  </p>
                  <p className="text-xs text-stone-400 mt-2">Also used for new claims and full renewals; here we focus on building stronger answers when your situation has changed since your last award.</p>
                </div>
              </div>
            </button>

            {/* AR1 option */}
            <button
              type="button"
              onClick={() => setFormType('ar1')}
              className={`w-full text-left rounded-2xl border-2 p-5 transition-all active:scale-[0.98] ${
                formType === 'ar1'
                  ? 'border-teal-500 bg-teal-50 shadow-sm'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                  formType === 'ar1' ? 'border-teal-500 bg-teal-500' : 'border-stone-300'
                }`}>
                  {formType === 'ar1' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-stone-900 text-base">AR1 review form</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Change of circumstances</span>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    The review form DWP sends when your award is being checked. You mainly need to describe what has <span className="font-semibold">changed</span> since your last assessment — not repeat everything.
                  </p>
                  <p className="text-xs text-stone-400 mt-2">Sent mid-award when DWP wants to know if your condition or circumstances have changed.</p>
                </div>
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={next}
            disabled={!formType}
            className="w-full py-4 rounded-xl font-bold text-base bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-40"
          >
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      );
    }

    // ── STEP 3: Upload PIP2 (required) + PA4 (optional) ────────────────────
    if (step === 3) {
      const hasPip2 = pip2Labels.length > 0;
      const hasPa4 = pa4Labels.length > 0;
      const busy = pip2Busy || pa4Busy;
      const hasAny = hasPip2 || hasPa4;
      const hasExtracted = Object.keys(pip2Extracted).length > 0 || Object.keys(pa4Extracted).length > 0;
      const extractionFailedSomewhere = (hasPip2 && !!pip2Error) || (hasPa4 && !!pa4Error);
      const showActivityReview = hasAny && !busy && (hasExtracted || extractionFailedSomewhere);
      const canContinue = hasAny && !busy;

      return (
        <div className="space-y-5 px-5 pt-5 pb-32">

          {/* PIP2 upload zone */}
          <CocUploadZone
            label="Original PIP2 form"
            sublabel="The form you filled in and returned to DWP — your own handwritten or typed answers."
            badge="Your words"
            badgeColour="bg-teal-100 text-teal-700"
            labels={pip2Labels}
            busy={pip2Busy}
            error={pip2Error}
            extracted={pip2Extracted}
            inputRef={pip2InputRef}
            onPick={onPip2Pick}
            onRemove={() => {
              setPip2Labels([]); setPip2Files([]); setPip2Extracted({}); setPip2UploadError(null); setActivityFallbackNotes({});
            }}
            fileCount={pip2Labels.length}
            totalBytes={pip2Files.reduce((s, f) => s + f.size, 0)}
            maxFiles={COC_UPLOAD_MAX_FILES}
            maxTotalBytes={COC_UPLOAD_MAX_TOTAL_BYTES}
            pickError={pip2UploadError}
          />

          {/* PA4 upload zone */}
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
            onRemove={() => {
              setPa4Labels([]); setPa4Files([]); setPa4Extracted({}); setPa4UploadError(null); setActivityFallbackNotes({});
            }}
            isOptional
            fileCount={pa4Labels.length}
            totalBytes={pa4Files.reduce((s, f) => s + f.size, 0)}
            maxFiles={COC_UPLOAD_MAX_FILES}
            maxTotalBytes={COC_UPLOAD_MAX_TOTAL_BYTES}
            pickError={pa4UploadError}
          />

          {/* No document guidance */}
          {noForm && !hasAny && (
            <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-5 space-y-4">
              <p className="font-bold text-blue-900 text-base">Request your documents from DWP</p>
              <p className="text-sm text-blue-800 leading-relaxed">
                You're entitled to copies of your PIP2 form and PA4 assessor report. Call DWP and ask — they usually arrive within a few days.
              </p>
              <div className="bg-white rounded-xl border border-blue-200 p-4">
                <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1">What to say when you call</p>
                <p className="text-sm text-blue-900 italic leading-relaxed">
                  "I'd like a copy of my original PIP2 form and my PA4 assessor report please."
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
          {!noForm && !hasAny && (
            <button type="button" onClick={() => setNoForm(true)}
              className="w-full py-3.5 rounded-xl font-semibold text-sm border-2 border-stone-200 text-stone-700 hover:bg-stone-50 active:scale-[0.99] transition-all">
              I don't have these documents yet
            </button>
          )}

          {/* Extracted answers review — or full list when reading failed */}
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
                {!hasExtracted
                  ? 'Open each activity below. Each one has an optional box — add what you remember if reading failed, or leave blank and go to the questions.'
                  : Object.keys(pa4Extracted).length > 0 && Object.keys(pip2Extracted).length > 0
                    ? 'Answers extracted from both documents — open each activity to see your PIP2 and assessor text. Use the optional box at the bottom if anything needs correcting or was missed.'
                    : Object.keys(pa4Extracted).length > 0 && Object.keys(pip2Extracted).length === 0
                      ? 'Answers extracted from your PA4 — open each activity below. Use the optional box if the scan missed something or you want to add your own wording.'
                      : 'Answers extracted from your PIP2 — open each activity below. Use the optional box if the scan missed something or you want to correct the read.'}
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

          {/* Admin preview panel */}
          {isAdmin && (
            <div className="rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/60 p-4 space-y-3">
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Admin preview</p>
              <button type="button" onClick={loadMockForm}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-amber-700 text-white hover:bg-amber-800 active:scale-[0.99] transition-all">
                Load mock PIP2 + PA4 answers
              </button>
              <div className="flex gap-2 flex-wrap">
                {[4, 5].map(s => (
                  <button key={s} type="button" onClick={() => setStep(s)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold border border-amber-400 text-amber-900 hover:bg-amber-100 transition-all">
                    → Step {s}
                  </button>
                ))}
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

    // ── STEP 4: Your conditions (medical profile) ──────────────────────────
    if (step === 4) {
      return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">Your conditions</h2>
            <p className="text-teal-100 text-sm leading-relaxed">
              PIPpal uses your conditions to tailor every question and build answers in the right context.
            </p>
          </div>

          {/* Conditions — mirror ClaimFlow step 3 */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-bold text-stone-900 text-sm">Your conditions</p>
              <button type="button" onClick={() => {
                sessionStorage.setItem('coc_return_step', '4');
                navigateTo('medical_profile');
              }}
                className="text-xs font-semibold text-teal-600 hover:text-teal-800 underline underline-offset-2">
                Edit in medical profile
              </button>
            </div>
            {medProfile.conditions.length > 0 ? (
              <div className="space-y-2">
                {medProfile.conditions.map((c: { name: string }, i: number) => (
                  <div key={i} className="flex items-center gap-2 bg-stone-50 rounded-xl px-3 py-2.5">
                    <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="text-sm text-stone-700 font-medium">{c.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <button type="button" onClick={() => {
                sessionStorage.setItem('coc_return_step', '4');
                navigateTo('medical_profile');
              }}
                className="w-full py-3 rounded-xl text-sm font-semibold border-2 border-dashed border-teal-200 text-teal-700 hover:bg-teal-50 transition-all">
                + Add your conditions
              </button>
            )}
          </div>
        </div>
      );
    }

    // ── STEP 5: How this works ───────────────────────────────────────────────
    if (step === 5) {
      return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">Now let's build your answers</h2>
            <p className="text-teal-100 text-sm leading-relaxed">
              You'll go through all 12 activities — the same questions as your original form. For each one, we show what you wrote before so you can write something stronger.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-stone-900">How this works</h3>
            {(formType === 'ar1' ? [
              { title: 'Your previous answer is shown first', body: 'For every activity you\'ll see what you wrote last time — so you know exactly what DWP already has on file.' },
              { title: 'Focus on what\'s changed', body: 'The AR1 is about updating your record. You can stick to what\'s got worse, more frequent, or harder — there\'s no need to repeat everything DWP already has.' },
              { title: 'We write the change for you', body: 'PIPpal builds a concise update in the language assessors need — explaining the deterioration clearly and with the right detail.' },
              { title: 'You can improve it', body: 'Once built, you can tweak every answer before you submit. It\'s your claim — we do the heavy lifting.' },
              { title: 'Save and come back', body: 'Your answers are saved automatically. One activity at a time is fine if that suits you better.' },
            ] : [
              { title: 'Your previous answer is shown first', body: 'For every activity, you\'ll see exactly what was on your original form. This is your starting point.' },
              { title: 'Tap-through questions', body: 'Simple tap-to-select questions for each activity — no blank boxes to fill in. When you choose, it helps to think about harder days — that\'s what DWP needs to understand.' },
              { title: 'We write a stronger answer', body: 'PIPpal builds a new answer using your selections — in the language DWP assessors need to see. Better than last time.' },
              { title: 'You can improve it', body: 'Once built, you can tweak every answer before you submit. It\'s your claim — we do the heavy lifting.' },
              { title: 'Save and come back', body: 'Your answers are saved automatically. One activity at a time is fine if that suits you better.' },
            ]).map((tip, i) => (
              <div key={i} className="flex gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-black text-white ${formType === 'ar1' ? 'bg-purple-500' : 'bg-teal-600'}`}>{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{tip.title}</p>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{tip.body}</p>
                </div>
              </div>
            ))}
          </div>

          {formType === 'ar1' && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">AR1 tip</p>
              <p className="text-sm text-purple-900 leading-relaxed">
                DWP already has your previous answers. Rewriting everything isn&apos;t necessary — a clear explanation of what has changed and why your needs are greater now is enough.
              </p>
            </div>
          )}

          <button type="button" onClick={startQuestions}
            className="w-full flex items-center justify-center gap-2 bg-teal-700 text-white py-4 rounded-xl font-bold text-base hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm">
            Start the 12 activities
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-stone-400 text-center">You can come back to any activity at any time</p>
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

      {/* Steps 1–3 & 5: inline buttons; step 4: BottomBar */}
      {step === 4 && (
        <BottomBar showBack onBack={back} onNext={next} />
      )}
    </div>
  );
}
