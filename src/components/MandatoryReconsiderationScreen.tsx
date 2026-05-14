import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  ExternalLink,
  Upload,
  Loader2,
  Phone,
  Monitor,
  ChevronDown,
  Mail,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from './AppContext';
import { SAREmailGenerator } from './SAREmailGenerator';
import { DWPCallScript } from './DWPCallScript';
import { ContextualAssistantBar } from './ContextualAssistantBar';
import { PIP_QUESTIONS } from '../pipQuestions';

const TOTAL_STEPS = 4;

const CRMR1_URL = 'https://www.gov.uk/government/publications/challenge-a-personal-independence-payment-decision';
const PIP_TEL = '0800 917 2222';

const DAILY_LIVING_IDS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'];
const MOBILITY_IDS = ['q11', 'q12'];
const ALL_ACTIVITY_IDS = [...DAILY_LIVING_IDS, ...MOBILITY_IDS];

type MrExtractedEntry = {
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  pointsAwarded?: number | null;
};

function normalizeExtractedAnswers(raw: Record<string, unknown>): Record<string, MrExtractedEntry> {
  const out: Record<string, MrExtractedEntry> = {};
  for (const [k, v] of Object.entries(raw ?? {})) {
    if (!v || typeof v !== 'object') continue;
    const o = v as Record<string, unknown>;
    const conf = o.confidence;
    const confidence: 'high' | 'medium' | 'low' =
      conf === 'high' || conf === 'medium' || conf === 'low' ? conf : 'low';
    out[k] = {
      answer: typeof o.answer === 'string' ? o.answer : '',
      confidence,
      pointsAwarded:
        o.pointsAwarded === null || o.pointsAwarded === undefined || o.pointsAwarded === ''
          ? null
          : (() => {
              const n = typeof o.pointsAwarded === 'number' ? o.pointsAwarded : Number(String(o.pointsAwarded).trim());
              return Number.isFinite(n) ? Math.round(Math.max(0, Math.min(12, n))) : null;
            })(),
    };
  }
  return out;
}

/** Turns vision extraction into text for the mr-letter API */
function formatDecisionLetterForMrPrompt(extracted: Record<string, MrExtractedEntry>): string {
  const lines: string[] = [];
  for (const id of ALL_ACTIVITY_IDS) {
    const ex = extracted[id];
    if (!ex) continue;
    if (!ex.answer?.trim() && ex.pointsAwarded == null) continue;
    const q = PIP_QUESTIONS.find(p => p.id === id);
    const title = q?.shortTitle ?? id;
    const pts =
      ex.pointsAwarded != null
        ? `${ex.pointsAwarded} point(s) for this activity`
        : 'points not shown on the uploaded pages';
    const detail = ex.answer?.trim() || 'No line-by-line reason given on the pages we saw.';
    lines.push(`${title} (${id.toUpperCase()}): DWP awarded ${pts}. Letter text: ${detail}`);
  }
  return lines.join('\n');
}

const MR_UPLOAD_MAX_FILES = 24;
const MR_UPLOAD_MAX_TOTAL_BYTES = 3_500_000;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateMrFileSelection(files: File[]): string | null {
  if (files.length > MR_UPLOAD_MAX_FILES) {
    return `Too many files (${files.length}). Add at most ${MR_UPLOAD_MAX_FILES} images or PDFs in one go.`;
  }
  const total = files.reduce((n, f) => n + f.size, 0);
  if (total > MR_UPLOAD_MAX_TOTAL_BYTES) {
    return `These files total ${formatFileSize(total)} — keep under about ${formatFileSize(MR_UPLOAD_MAX_TOTAL_BYTES)} per upload. Try fewer pages or a smaller scan.`;
  }
  return null;
}

async function readFilesToBase64List(
  files: File[],
): Promise<{ name: string; base64: string; mimeType: string; size: number }[]> {
  return Promise.all(
    files.map(
      file =>
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
        }),
    ),
  );
}

function StepHeader({
  step,
  title,
  total,
  subtitle,
  onBack,
}: {
  step: number;
  title: string;
  total: number;
  subtitle?: string;
  onBack: () => void;
}) {
  return (
    <div className="bg-white border-b border-stone-100 px-5 py-4 sticky top-0 z-10">
      <div className="flex items-center gap-3 mb-2">
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
          <h1 className="font-bold text-stone-900 text-base leading-tight">{title}</h1>
          {subtitle && <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">{subtitle}</p>}
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
  label,
  disabled,
  onBack,
  showBack,
}: {
  onNext: () => void;
  label: string;
  disabled?: boolean;
  onBack?: () => void;
  showBack?: boolean;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 px-5 py-4 flex gap-3 max-w-4xl mx-auto z-20">
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

const STEP_INFO: { title: string; subtitle: string }[] = [
  {
    title: 'Upload your decision letter',
    subtitle: 'We read DWP’s scores and reasons from the pages you add.',
  },
  {
    title: 'Your Mandatory Reconsideration wording',
    subtitle: 'This is the response you send to DWP — usually as a letter with your form or evidence.',
  },
  {
    title: 'Send your MR and gather evidence',
    subtitle: 'Official form, deadline, PA4 report, and what to attach.',
  },
  {
    title: 'After you send',
    subtitle: 'What DWP does next, the MR decision, and appeals.',
  },
];

function ActivityAccordionBlock({
  ids,
  extracted,
  title,
  defaultOpen,
}: {
  ids: string[];
  extracted: Record<string, MrExtractedEntry>;
  title: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const rows = ids
    .map(id => {
      const q = PIP_QUESTIONS.find(p => p.id === id);
      const ex = extracted[id];
      return { id, q, ex };
    })
    .filter(x => x.ex && (x.ex.answer || x.ex.pointsAwarded != null));

  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-stone-50 hover:bg-stone-100 transition-colors"
      >
        <span className="text-xs font-bold text-stone-800">{title}</span>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="divide-y divide-stone-100">
          {rows.map(({ id, q, ex }) => (
            <div key={id} className="px-3 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-stone-900">{q?.shortTitle ?? id}</p>
                {ex!.pointsAwarded != null && (
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full shrink-0">
                    {ex!.pointsAwarded} pts
                  </span>
                )}
              </div>
              {ex!.answer ? (
                <p className="text-[11px] text-stone-600 leading-relaxed mt-1">{ex!.answer}</p>
              ) : (
                <p className="text-[11px] text-stone-400 mt-1 italic">Points only — no line detail.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MandatoryReconsiderationScreen() {
  const { goBack, navigateTo, savedAnswers, medProfile } = useAppContext();
  const [step, setStep] = useState(1);
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [mrLetter, setMrLetter] = useState<string | null>(null);
  const [letterCopied, setLetterCopied] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [showStructure, setShowStructure] = useState(false);

  const letterFileRef = useRef<HTMLInputElement>(null);
  const [letterLabels, setLetterLabels] = useState<string[]>([]);
  const [letterFiles, setLetterFiles] = useState<
    { name: string; base64: string; mimeType: string; size: number }[]
  >([]);
  const [letterBusy, setLetterBusy] = useState(false);
  const [letterError, setLetterError] = useState<string | null>(null);
  const [letterUploadError, setLetterUploadError] = useState<string | null>(null);
  const [letterExtracted, setLetterExtracted] = useState<Record<string, MrExtractedEntry>>({});

  const hasAnswers = Object.keys(savedAnswers || {}).length > 0;
  const extractionText = useMemo(
    () => formatDecisionLetterForMrPrompt(letterExtracted),
    [letterExtracted],
  );
  const hasExtraction = extractionText.length > 0;
  const canGenerateLetter =
    hasAnswers || hasExtraction || userNotes.trim().length > 0;

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const back = () => (step === 1 ? goBack() : setStep(s => s - 1));
  const bottomNext = () => {
    if (step === TOTAL_STEPS) setStep(1);
    else next();
  };

  const generateLetter = async () => {
    if (!canGenerateLetter) return;
    setGeneratingLetter(true);
    setMrLetter(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mr-letter',
          savedAnswers: savedAnswers || {},
          medProfile,
          decisionLetterExtraction: extractionText || undefined,
          decisionDetails: userNotes.trim() || undefined,
          disputedActivities: [],
        }),
      });
      const data = await res.json().catch(() => ({}));
      setMrLetter(data.letter || 'Could not generate letter. Please try again.');
    } catch {
      setMrLetter('Something went wrong. Please try again.');
    } finally {
      setGeneratingLetter(false);
    }
  };

  const copyLetter = () => {
    if (!mrLetter) return;
    navigator.clipboard?.writeText(mrLetter);
    setLetterCopied(true);
    setTimeout(() => setLetterCopied(false), 2000);
  };

  useEffect(() => {
    if (letterFiles.length === 0 || Object.keys(letterExtracted).length > 0) return;

    async function run() {
      setLetterBusy(true);
      setLetterError(null);
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'coc-document-analysis',
            files: letterFiles.map(f => ({ base64: f.base64, mimeType: f.mimeType })),
            docType: 'award_letter',
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (data?.extractedAnswers) {
          setLetterExtracted(normalizeExtractedAnswers(data.extractedAnswers as Record<string, unknown>));
        } else {
          setLetterError(data?.error ?? 'Could not read that document automatically.');
        }
      } catch {
        setLetterError('Could not reach the extraction service.');
      } finally {
        setLetterBusy(false);
      }
    }
    run();
  }, [letterFiles, letterExtracted]);

  const onLetterPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!raw.length) return;
    const bad = validateMrFileSelection(raw);
    if (bad) {
      setLetterUploadError(bad);
      return;
    }
    setLetterUploadError(null);
    const results = await readFilesToBase64List(raw);
    setLetterLabels(results.map(f => f.name));
    setLetterFiles(results);
    setLetterExtracted({});
    setLetterError(null);
    setMrLetter(null);
  };

  const clearLetterUpload = () => {
    setLetterLabels([]);
    setLetterFiles([]);
    setLetterExtracted({});
    setLetterError(null);
    setLetterUploadError(null);
    setMrLetter(null);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 px-5 pt-5 pb-6">
            <div className="bg-teal-700 rounded-2xl p-5 text-white">
              <h2 className="font-bold text-xl mb-2">Give us your decision letter</h2>
              <p className="text-teal-100 text-sm leading-relaxed">
                DWP’s letter lists the points you were given for each daily living and mobility activity. When you
                upload it here, we read those lines so your Mandatory Reconsideration response matches what they said —
                not guesswork.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed">
                You usually have <strong>one month</strong> from the <strong>date on the letter</strong> to ask for a
                Mandatory Reconsideration. Keep that date visible on your fridge or phone.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
              <p className="font-bold text-stone-900 text-sm">Upload photos or PDF pages</p>
              <p className="text-xs text-stone-500 leading-relaxed">
                Use clear photos or scans. Include the pages with the activity table and points if you can — that is
                what we read best.
              </p>

              {letterUploadError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-xs text-red-800 leading-relaxed">{letterUploadError}</p>
                </div>
              )}

              <input
                ref={letterFileRef}
                type="file"
                accept="image/*,.pdf"
                multiple
                className="hidden"
                onChange={onLetterPick}
              />

              {letterLabels.length === 0 ? (
                <button
                  type="button"
                  onClick={() => letterFileRef.current?.click()}
                  className="w-full border-2 border-dashed border-stone-200 rounded-xl py-4 flex flex-col items-center gap-2 hover:border-teal-400 hover:bg-teal-50 transition-colors active:scale-[0.99]"
                >
                  <Upload className="w-5 h-5 text-stone-400" />
                  <p className="text-xs font-medium text-stone-600">Take a photo or choose files</p>
                </button>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 items-center">
                    {letterLabels.map((name, i) => (
                      <span
                        key={`${name}-${i}`}
                        className="text-[11px] bg-stone-100 text-stone-700 px-2 py-1 rounded-lg max-w-full truncate"
                      >
                        {name}
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={clearLetterUpload}
                      className="text-[11px] font-semibold text-teal-700 hover:text-teal-900"
                    >
                      Remove all
                    </button>
                  </div>
                  {letterBusy && (
                    <div className="flex items-center gap-2 text-xs text-stone-600">
                      <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                      Reading your letter…
                    </div>
                  )}
                  {letterError && (
                    <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      {letterError}
                    </p>
                  )}
                  {!letterBusy && hasExtraction && (
                    <p className="text-xs text-teal-800 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2">
                      We found activity lines on your letter. On the next step we will turn that into wording you can
                      send to DWP. You can still add your own points in a text box there.
                    </p>
                  )}
                </>
              )}
            </div>

            {!letterBusy && hasExtraction && (
              <div className="space-y-2">
                <ActivityAccordionBlock
                  ids={DAILY_LIVING_IDS}
                  extracted={letterExtracted}
                  title="What we read — daily living"
                  defaultOpen
                />
                <ActivityAccordionBlock
                  ids={MOBILITY_IDS}
                  extracted={letterExtracted}
                  title="What we read — mobility"
                  defaultOpen={false}
                />
              </div>
            )}

            {letterLabels.length === 0 && (
              <p className="text-[11px] text-stone-500 px-1 leading-relaxed">
                No scan yet? You can still continue — on the next step, type what DWP awarded or build answers in My
                Questions first. A photo of the letter still gives the strongest draft.
              </p>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 px-5 pt-5 pb-6">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-2">
              <div className="flex gap-2 items-start">
                <FileText className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900 text-sm">What you are creating</p>
                  <p className="text-xs text-stone-500 leading-relaxed mt-1">
                    This step builds the <strong className="text-stone-700">written Mandatory Reconsideration</strong>{' '}
                    you send <strong className="text-stone-700">to DWP</strong> — for example in the post, attached to
                    your CRMR1 form, or pasted into an online challenge if your letter says you can. It is{' '}
                    <strong className="text-stone-700">not</strong> the same as an email to request your PA4 (that
                    comes in step 3).
                  </p>
                </div>
              </div>
            </div>

            {!hasExtraction && !hasAnswers && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-relaxed">
                  For the best result, go back to step 1 and upload your decision letter, or complete your answers under{' '}
                  <strong className="text-amber-950">My Questions</strong> so we can match DWP’s scores to your own
                  wording. You can still type what DWP said in the box below and generate a starter letter.
                </p>
              </div>
            )}

            <div className="bg-teal-700 rounded-2xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">Generate your MR wording</p>
                    <p className="text-teal-100 text-xs leading-relaxed mt-0.5">
                      We combine what we read from your letter (if you uploaded one), your saved PIP answers, and
                      anything you add below. A decision maker reads reliability — safe, acceptable, often enough, in
                      time, without wiping you out (sometimes shortened as SAFES).
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-teal-100 mb-1.5 block">
                      Add anything DWP missed or got wrong (optional)
                    </label>
                    <textarea
                      value={userNotes}
                      onChange={e => setUserNotes(e.target.value)}
                      placeholder="Examples: which activities feel wrong, worst-day examples, or extra symptoms not reflected in the letter…"
                      rows={4}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-teal-300/80 focus:outline-none focus:border-white/40 resize-none"
                    />
                  </div>

                  {!hasAnswers && (
                    <button
                      type="button"
                      onClick={() => navigateTo('question_index')}
                      className="w-full py-2.5 rounded-xl border border-white/40 text-white text-sm font-semibold hover:bg-white/10 active:scale-[0.98] transition-all"
                    >
                      Add detail via My Questions (recommended)
                      <ArrowRight className="w-4 h-4 inline-block ml-1 -mt-0.5" />
                    </button>
                  )}

                  {!mrLetter ? (
                    <>
                      <button
                        type="button"
                        onClick={generateLetter}
                        disabled={generatingLetter || !canGenerateLetter}
                        className="w-full bg-white text-teal-700 py-3.5 rounded-xl font-bold text-base hover:bg-teal-50 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {generatingLetter ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Drafting your response…
                          </>
                        ) : (
                          <>Create my Mandatory Reconsideration wording</>
                        )}
                      </button>
                      {!canGenerateLetter && (
                        <p className="text-teal-200 text-[10px] text-center">
                          Upload your letter on step 1, add notes here, or save answers in My Questions.
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-white/10 rounded-xl p-4 max-h-80 overflow-y-auto">
                        <pre className="text-xs text-teal-50 leading-relaxed whitespace-pre-wrap font-sans">{mrLetter}</pre>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={copyLetter}
                          className="flex-1 bg-white text-teal-700 py-3 rounded-xl font-bold text-sm hover:bg-teal-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                          {letterCopied ? 'Copied' : 'Copy wording'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setMrLetter(null)}
                          className="px-4 py-3 bg-white/20 text-white rounded-xl text-sm font-bold hover:bg-white/30 transition-all active:scale-[0.98]"
                        >
                          Regenerate
                        </button>
                      </div>
                      <p className="text-teal-200 text-[10px] text-center">
                        Replace bracketed placeholders with your details. Read it once carefully before sealing or
                        uploading.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowStructure(!showStructure)}
              className="w-full flex items-center justify-between bg-white rounded-xl border border-stone-200 px-3 py-2.5 hover:bg-stone-50 transition-colors"
            >
              <span className="text-xs font-bold text-stone-700">How a strong MR is structured</span>
              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${showStructure ? 'rotate-180' : ''}`} />
            </button>

            {showStructure && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
                {[
                  ['1', 'Your details', 'Name, address, National Insurance number, claim reference from your letter'],
                  ['2', 'Say you want a Mandatory Reconsideration', 'One clear sentence'],
                  ['3', 'Each activity you dispute', 'What the letter scored, what actually happens on bad days, which descriptor fits, and reliability (SAFES)'],
                  ['4', 'Evidence', 'Number each enclosure — GP letters, diary, PA4, carer statement'],
                ].map(([num, title, desc]) => (
                  <div key={num} className="flex gap-2.5 items-start bg-stone-50 rounded-lg p-2.5">
                    <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {num}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800">{title}</p>
                      <p className="text-[11px] text-stone-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
                <p className="text-[11px] text-stone-600 bg-teal-50 rounded-lg px-3 py-2 border border-teal-100">
                  DWP should only treat you as able to do a task if you can do it safely, to an acceptable standard,
                  as often as needed, in a reasonable time, and without exhausting yourself. If any link breaks on your
                  worst days, explain that with examples.
                </p>
              </div>
            )}

            <ContextualAssistantBar
              label="Want this tightened before you send?"
              sublabel="Ask PIPpal to refine your MR wording"
              prompt="I have a draft Mandatory Reconsideration for PIP. Here is what DWP awarded and what I want to challenge…"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 px-5 pt-5 pb-6">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
              <p className="font-bold text-stone-900 text-sm">Send your Mandatory Reconsideration to DWP</p>
              <p className="text-xs text-stone-500 leading-relaxed">
                You normally ask within <strong className="text-stone-800">one month</strong> of the date on your
                letter. Tell them clearly you want a Mandatory Reconsideration and send a copy of your wording plus
                evidence.
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2 items-start text-xs text-stone-600">
                  <Phone className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-stone-800">Phone</strong> — <span className="font-mono font-semibold">{PIP_TEL}</span>{' '}
                    (textphone 0800 917 7777). Say you want an MR and confirm the address or channel to send your
                    letter to if they ask.
                  </span>
                </li>
                <li className="flex gap-2 items-start text-xs text-stone-600">
                  <Mail className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-stone-800">Post or office submission</strong> — use the official pack below
                    when you challenge in writing; keep copies and proof of posting if you can.
                  </span>
                </li>
                <li className="flex gap-2 items-start text-xs text-stone-600">
                  <Monitor className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-stone-800">Online</strong> — if your decision letter or benefits account
                    explains an online reply route, use it as instructed alongside anything you attach.
                  </span>
                </li>
              </ul>
            </div>

            <a
              href={CRMR1_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-teal-50 rounded-2xl p-4 border border-teal-100 hover:bg-teal-100 transition-colors active:scale-[0.99]"
            >
              <Download className="w-5 h-5 text-teal-700 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-stone-900">Use the official GOV.UK pack (CRMR1)</p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  “Challenge a Personal Independence Payment decision” — download the right forms and follow the guidance
                  sheets that come with the pack.
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-teal-600 shrink-0" />
            </a>

            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="font-bold text-stone-900 text-sm mb-2">Request your PA4 (assessor report)</p>
              <p className="text-xs text-stone-500 leading-relaxed mb-3">
                The PA4 is what the assessor sent to DWP before the decision. You need it to challenge factual gaps or
                wrong descriptors. That is usually a <strong className="text-stone-700">separate request</strong> (SAR or
                written request) — not the same envelope as your MR, unless your local office bundles everything for you.
              </p>
              <div className="space-y-2">
                <DWPCallScript type="chasing" />
                <SAREmailGenerator context="pa4" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="font-bold text-stone-900 text-sm mb-2">Evidence to include</p>
              <p className="text-xs text-stone-500 leading-relaxed mb-2">
                Send copies — keep your originals. Refer to them in your MR wording.
              </p>
              <div className="space-y-1.5">
                {[
                  'GP or specialist letters',
                  'Care plans and clinic letters',
                  'Prescription or medication printouts',
                  'Symptom diaries',
                  'Short statements from people who see your day-to-day difficulties',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-stone-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 px-5 pt-5 pb-6">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="font-bold text-stone-900 text-sm mb-2">DWP looks at your claim again</p>
              <p className="text-xs text-stone-500 leading-relaxed">
                A <strong className="text-stone-800">different decision maker</strong> reviews your MR and evidence.
                Timescales vary — weeks are common, but it can take longer. Chase in writing if you need peace of mind,
                and keep notes of calls.
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <p className="text-xs text-stone-600 leading-relaxed">
                Long delay and no decision? Ask Citizens Advice or another adviser whether a &quot;lapse&quot; approach
                could apply — do not rely on old forum posts alone; rules change.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="font-bold text-stone-900 text-sm mb-2">The Mandatory Reconsideration notice</p>
              <p className="text-xs text-stone-500 leading-relaxed mb-3">
                DWP will write with the outcome. Your award might go up, stay the same, go down, or stop. Read every
                line — especially dates and rates.
              </p>
              <ul className="space-y-1.5">
                {['Increase award', 'No change', 'Reduce award', 'Stop PIP'].map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-xs text-amber-950 leading-relaxed">
                <strong className="text-amber-950">Still disagree</strong> — you normally appeal to the tribunal after
                you have the MR decision notice, unless the law or your paperwork sets out something different. That
                letter explains timescales.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('appeal')}
              className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
            >
              Next: appeals and tribunal
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const meta = STEP_INFO[step - 1];

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <StepHeader
        step={step}
        title={meta.title}
        subtitle={meta.subtitle}
        total={TOTAL_STEPS}
        onBack={back}
      />

      <div className="flex-1 overflow-y-auto pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomBar
        onNext={bottomNext}
        label={step === TOTAL_STEPS ? 'Start again from step 1' : 'Continue'}
        showBack={step > 1}
        onBack={back}
        disabled={false}
      />
    </div>
  );
}
