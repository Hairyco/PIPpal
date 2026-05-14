import React, { useEffect, useRef, useState } from 'react';
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

const TOTAL_STEPS = 7;

const CRMR1_URL = 'https://www.gov.uk/government/publications/challenge-a-personal-independence-payment-decision';

const DAILY_LIVING_IDS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'];
const MOBILITY_IDS = ['q11', 'q12'];

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

const STEP_TITLES = [
  'Your decision letter',
  'Get your PA4 report',
  'Request a Mandatory Reconsideration',
  'Explain why the decision is wrong',
  'Send supporting evidence',
  'What happens while DWP reviews',
  'The MR outcome and what you can do next',
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
                <p className="text-[11px] text-stone-400 mt-1 italic">No line detail — points only.</p>
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
  const [decisionDetails, setDecisionDetails] = useState('');
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

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const back = () => (step === 1 ? goBack() : setStep(s => s - 1));
  const bottomNext = () => {
    if (step === TOTAL_STEPS) setStep(1);
    else next();
  };

  const generateLetter = async () => {
    setGeneratingLetter(true);
    setMrLetter(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mr-letter',
          savedAnswers,
          medProfile,
          decisionDetails,
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
  };

  const clearLetterUpload = () => {
    setLetterLabels([]);
    setLetterFiles([]);
    setLetterExtracted({});
    setLetterError(null);
    setLetterUploadError(null);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 px-5 pt-5 pb-6">
            <div className="bg-teal-700 rounded-2xl p-5 text-white">
              <h2 className="font-bold text-xl mb-2">Start from your decision letter</h2>
              <p className="text-teal-100 text-sm leading-relaxed">
                The letter explains your award, the points for each activity, and the reasons for the decision. Uploading
                it lets PIPpal read those scores so you can see exactly what you are challenging.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed">
                You normally have <strong>1 month</strong> from the <strong>date on the decision letter</strong> to ask
                for a Mandatory Reconsideration. Note that deadline — you will see it again in the next steps.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-700" />
                <p className="font-bold text-stone-900 text-sm">Upload your decision letter</p>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Photos or PDF pages of your DWP decision notice or award letter. We extract the scoring table when it
                is visible on the pages you upload.
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
                  <p className="text-xs font-medium text-stone-600">Take a photo or upload pages</p>
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
                  {!letterBusy && Object.keys(letterExtracted).length > 0 && (
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Use these lines to spot which activities and descriptors look wrong compared with your day-to-day
                      life. Your MR should focus on those activities, using real examples and the reliability rules (see
                      step 4).
                    </p>
                  )}
                </>
              )}
            </div>

            {!letterBusy && Object.keys(letterExtracted).length > 0 && (
              <div className="space-y-2">
                <ActivityAccordionBlock
                  ids={DAILY_LIVING_IDS}
                  extracted={letterExtracted}
                  title="Daily living activities"
                  defaultOpen
                />
                <ActivityAccordionBlock
                  ids={MOBILITY_IDS}
                  extracted={letterExtracted}
                  title="Mobility activities"
                  defaultOpen={false}
                />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 px-5 pt-5 pb-6">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="font-bold text-stone-900 text-sm mb-2">Request your PA4 (assessor report)</p>
              <p className="text-xs text-stone-500 leading-relaxed mb-3">
                Your assessment was carried out by a private contractor (for example Capita or IAS / Atos), not DWP. The
                health professional completes a PA4 report; a DWP decision maker then uses it when they decide your
                award. To challenge the decision fairly, you need to see what the assessor recorded — request a copy
                under a Subject Access Request if you do not already have it.
              </p>
              <div className="space-y-2">
                <DWPCallScript type="chasing" />
                <SAREmailGenerator context="pa4" />
              </div>
            </div>
            <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                When your PA4 arrives, check each activity against your decision letter. Your MR and evidence can refer
                to both documents — especially where the report is incomplete or does not match what you experience on
                your worst days.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 px-5 pt-5 pb-6">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
              <p className="font-bold text-stone-900 text-sm">Request a Mandatory Reconsideration in time</p>
              <p className="text-xs text-stone-500 leading-relaxed">
                You usually need to ask for an MR within <strong className="text-stone-700">one month</strong> of the
                date on your decision letter. You can do that:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2 items-start text-xs text-stone-600">
                  <Phone className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-stone-800">By phone</strong> — PIP enquiries:{' '}
                    <span className="font-mono font-semibold">0800 917 2222</span> (textphone 0800 917 7777). Say you
                    want a Mandatory Reconsideration and ask how to confirm it in writing.
                  </span>
                </li>
                <li className="flex gap-2 items-start text-xs text-stone-600">
                  <Mail className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-stone-800">In writing</strong> — often the clearest way to set out your case
                    and attach evidence. Keep a copy of everything you send.
                  </span>
                </li>
                <li className="flex gap-2 items-start text-xs text-stone-600">
                  <Monitor className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-stone-800">Online</strong> — where DWP offers a reply route, your decision
                    letter or account may explain how to respond online. Use that only if it fits your situation; many
                    people still post or email their MR and evidence.
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
                <p className="text-sm font-bold text-stone-900">Use the correct GOV.UK form</p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Download the form for challenging a PIP decision (CRMR1 pack). Follow the instructions that come with
                  it — this is the standard paperwork for requesting an MR in writing.
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-teal-600 shrink-0" />
            </a>

            <p className="text-[11px] text-stone-500 px-1 leading-relaxed">
              If you are unsure which reference numbers or dates to quote, take them from your decision letter. You can
              still start your written MR before every piece of evidence is ready — but do not miss the one-month
              deadline if you can avoid it.
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 px-5 pt-5 pb-6">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="font-bold text-stone-900 text-sm mb-2">Explain why the decision is wrong</p>
              <p className="text-xs text-stone-500 leading-relaxed mb-3">
                Focus your MR on the activities and descriptors that do not match your needs. Explain what help you
                actually need, with <strong className="text-stone-700">real examples</strong> of difficulties (especially
                on bad days), and say what evidence supports you.
              </p>
              <ul className="space-y-1.5 mb-4">
                {[
                  'Which daily living or mobility activities were scored too low',
                  'What you cannot do reliably, safely, or in a reasonable time',
                  'Which descriptor letter should apply, and why',
                  'Any evidence that backs that up (you will attach copies as in the next step)',
                ].map((t, i) => (
                  <li key={i} className="flex gap-2 text-xs text-stone-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setShowStructure(!showStructure)}
                className="w-full flex items-center justify-between bg-stone-50 rounded-xl px-3 py-2.5 hover:bg-stone-100 transition-colors mb-2"
              >
                <span className="text-xs font-bold text-stone-700">Letter structure guide</span>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${showStructure ? 'rotate-180' : ''}`} />
              </button>

              {showStructure && (
                <div className="space-y-2 mb-3">
                  {[
                    ['1', 'Your details', 'Name, address, National Insurance number, claim reference from your letter'],
                    ['2', 'Your request', 'Say clearly that you are asking for a Mandatory Reconsideration'],
                    ['3', 'Each activity you dispute', 'What the decision/assessment said, what actually happens, which descriptor should apply, and why (use SAFES below)'],
                    ['4', 'Evidence', 'List what you are attaching'],
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
                </div>
              )}

              <p className="text-[11px] text-stone-500 bg-teal-50 rounded-lg px-3 py-2 border border-teal-100">
                <strong className="text-stone-800">The SAFES rule:</strong> DWP can only treat you as able to do a task
                if you can do it safely, to an acceptable standard, as often as you need to, in a reasonable time, and
                without exhausting yourself. If any one of those fails on your worst days, say so with examples.
              </p>
            </div>

            <div className="bg-teal-700 rounded-2xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">PIPpal drafts your MR letter</p>
                    <p className="text-teal-100 text-xs leading-relaxed mt-0.5">
                      {hasAnswers
                        ? 'We use your saved PIP question answers to produce a draft MR letter. Add what the decision letter said below if you can.'
                        : 'Complete your PIP answers in the app first — we use them to personalise your draft. You can still paste what DWP said in the box below.'}
                    </p>
                  </div>
                </div>

                {!hasAnswers ? (
                  <button
                    type="button"
                    onClick={() => navigateTo('question_index')}
                    className="w-full bg-white text-teal-700 py-3 rounded-xl font-bold text-sm hover:bg-teal-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Complete my PIP answers first
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : !mrLetter ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-teal-100 mb-1.5 block">
                        What did DWP say? (optional — paste key lines from your decision letter)
                      </label>
                      <textarea
                        value={decisionDetails}
                        onChange={e => setDecisionDetails(e.target.value)}
                        placeholder="For example: the points they gave for preparing food, and the reason they gave in the letter..."
                        rows={4}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-teal-300/80 focus:outline-none focus:border-white/40 resize-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={generateLetter}
                      disabled={generatingLetter}
                      className="w-full bg-white text-teal-700 py-3.5 rounded-xl font-bold text-base hover:bg-teal-50 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {generatingLetter ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Writing your letter…
                        </>
                      ) : (
                        <>Write my MR letter</>
                      )}
                    </button>
                    <p className="text-teal-200 text-[10px] text-center">Uses your saved answers · Review before sending</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-white/10 rounded-xl p-4 max-h-72 overflow-y-auto">
                      <pre className="text-xs text-teal-50 leading-relaxed whitespace-pre-wrap font-sans">{mrLetter}</pre>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={copyLetter}
                        className="flex-1 bg-white text-teal-700 py-3 rounded-xl font-bold text-sm hover:bg-teal-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        {letterCopied ? 'Copied' : 'Copy letter'}
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
                      Add your own details where shown, then send with your CRMR1 or covering letter as you choose.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <ContextualAssistantBar
              label="Need help wording your MR?"
              sublabel="Ask for a second pair of eyes before you send"
              prompt="I am writing a Mandatory Reconsideration for PIP. Here is what I want to challenge and the evidence I have..."
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-4 px-5 pt-5 pb-6">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="font-bold text-stone-900 text-sm mb-2">Send supporting evidence</p>
              <p className="text-xs text-stone-500 leading-relaxed mb-3">
                You do not need to send original documents — copies are fine. Number or list them in your letter so DWP
                can match them to your points.
              </p>
              <div className="space-y-1.5">
                {[
                  'Letters from your GP or specialist',
                  'Care plans or treatment summaries',
                  'Prescription lists or pharmacy printouts',
                  'Symptom or disability diaries',
                  'Statements from carers, family, or people who know how your condition affects you day to day',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-stone-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-stone-500 px-1 leading-relaxed">
              Your PA4 and decision letter are also evidence — highlight where they are inconsistent with your daily life
              or with each other.
            </p>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4 px-5 pt-5 pb-6">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="font-bold text-stone-900 text-sm mb-2">DWP reviews the decision</p>
              <p className="text-xs text-stone-500 leading-relaxed mb-3">
                A <strong className="text-stone-700">different decision maker</strong> looks at your claim, your MR, and
                any new evidence. There is no fixed timescale, but many people hear within several weeks — it can take
                longer. Keep copies of what you sent and note the dates you chased DWP if you need to.
              </p>
            </div>
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <p className="text-xs text-stone-600 leading-relaxed">
                <strong className="text-stone-800">Waiting a long time with no outcome?</strong> After a prolonged wait,
                some people ask DWP for a &quot;lapse&quot; position so they can move to the next stage — seek current
                advice (for example from Citizens Advice) if you are in that situation.
              </p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4 px-5 pt-5 pb-6">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="font-bold text-stone-900 text-sm mb-2">Receive the MR notice</p>
              <p className="text-xs text-stone-500 leading-relaxed mb-3">
                DWP will write to you with the result of the reconsideration. The outcome may be to:
              </p>
              <ul className="space-y-1.5">
                {[
                  'Increase your award',
                  'Leave it the same',
                  'Reduce it',
                  'Stop your PIP altogether',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-xs text-amber-950 leading-relaxed">
                <strong className="text-amber-950">If you still disagree</strong> — you can usually appeal to an
                independent tribunal. You normally need the Mandatory Reconsideration notice (the decision after MR)
                before you can appeal. Read that letter carefully; it explains how to appeal and the time limit.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('appeal')}
              className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
            >
              If the MR does not help — learn about appeals
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <StepHeader step={step} title={STEP_TITLES[step - 1]} total={TOTAL_STEPS} onBack={back} />

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
        label={step === TOTAL_STEPS ? 'Back to step 1' : 'Continue'}
        showBack={step > 1}
        onBack={back}
        disabled={false}
      />
    </div>
  );
}
