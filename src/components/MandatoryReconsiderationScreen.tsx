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
  ChevronDown,
} from 'lucide-react';
import { useAppContext } from './AppContext';
import { SAREmailGenerator } from './SAREmailGenerator';
import { ContextualAssistantBar } from './ContextualAssistantBar';
import { PIP_QUESTIONS } from '../pipQuestions';

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

function Collapse({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-2xl border border-stone-100 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-stone-50 transition-colors"
      >
        <span className="text-sm font-bold text-stone-900">{title}</span>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 pt-0 border-t border-stone-50">{children}</div>}
    </div>
  );
}

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
  const { goBack, navigateTo, savedAnswers, medProfile, setMrDraftLetter } = useAppContext();

  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [mrLetter, setMrLetter] = useState<string | null>(null);
  const [letterCopied, setLetterCopied] = useState(false);
  const [userNotes, setUserNotes] = useState('');

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
  const extractionText = useMemo(() => formatDecisionLetterForMrPrompt(letterExtracted), [letterExtracted]);
  const hasExtraction = extractionText.length > 0;
  const canGenerateLetter = hasAnswers || hasExtraction || userNotes.trim().length > 0;

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
      const letterText =
        typeof data.letter === 'string' ? data.letter : 'Could not generate letter. Please try again.';
      setMrLetter(letterText);
      if (res.ok && typeof data.letter === 'string' && data.letter.trim()) {
        setMrDraftLetter(data.letter.trim());
      }
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

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10 shrink-0">
        <button
          type="button"
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg leading-tight">Mandatory Reconsideration</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-4 pb-10">
        <div className="bg-teal-700 rounded-2xl p-5 text-white">
          <h2 className="font-bold text-lg mb-3">Explain why the decision is wrong — and gather evidence</h2>
          <p className="text-teal-100 text-sm leading-relaxed mb-3">
            A Mandatory Reconsideration (MR) is the essential first step if you disagree with a Personal Independence Payment (PIP) decision. It effectively asks the Department for Work and Pensions (DWP) to look at your claim again.
          </p>
          <p className="text-teal-100 text-sm leading-relaxed">
            You can request an MR if you were denied PIP entirely, awarded a lower rate than expected, or given an award for a shorter period than you think is fair.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed">
            Ask for a Mandatory Reconsideration within <strong>one month</strong> from the{' '}
            <strong>date on your letter</strong> (refusal or award you disagree with). If that date passes, seek advice —
            you may still have options in some circumstances.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Upload className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-stone-900 text-sm">1. Upload your PIP decision letter</p>
              <p className="text-xs text-stone-500 leading-relaxed mt-1">
                Refusal letter or award you are challenging — we read DWP&apos;s scoring table when it&apos;s visible. Clear
                photos or PDF pages work best.
              </p>
            </div>
          </div>

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
              <span className="text-xs font-medium text-stone-600">Tap to add photos or files</span>
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
                <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{letterError}</p>
              )}
            </>
          )}
        </div>

        {!letterBusy && hasExtraction && (
          <div className="space-y-2">
            <ActivityAccordionBlock
              ids={DAILY_LIVING_IDS}
              extracted={letterExtracted}
              title="Scores we read — daily living"
              defaultOpen
            />
            <ActivityAccordionBlock
              ids={MOBILITY_IDS}
              extracted={letterExtracted}
              title="Scores we read — mobility"
              defaultOpen={false}
            />
          </div>
        )}

        <div className="bg-teal-700 rounded-2xl overflow-hidden">
          <div className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-base">2. Create your MR response</p>
                <p className="text-teal-100 text-xs leading-relaxed mt-0.5">
                  Draft wording you can paste into a letter or form for DWP. We use your uploaded letter (
                  {hasExtraction ? 'points extracted' : 'upload for best results'}), optional notes below, and your My
                  Questions answers when you have them.
                </p>
              </div>
            </div>

            {!hasAnswers && (
              <button
                type="button"
                onClick={() => navigateTo('question_index')}
                className="w-full mb-3 py-2.5 rounded-xl border border-white/40 text-white text-sm font-semibold hover:bg-white/10 active:scale-[0.98] transition-all"
              >
                Build answers in My Questions (recommended)
                <ArrowRight className="w-4 h-4 inline-block ml-1 -mt-0.5" />
              </button>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-teal-100 mb-1.5 block">
                  Which points feel wrong — and real examples (optional but helpful)
                </label>
                <textarea
                  value={userNotes}
                  onChange={e => setUserNotes(e.target.value)}
                  placeholder="e.g. preparing food scored too low — I leave pans on the hob when anxious, several days a week, not just on flare-ups..."
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-teal-300/80 focus:outline-none focus:border-white/40 resize-none"
                />
              </div>

              {!mrLetter ? (
                <button
                  type="button"
                  onClick={generateLetter}
                  disabled={generatingLetter || !canGenerateLetter}
                  className="w-full bg-white text-teal-700 py-3.5 rounded-xl font-bold text-base hover:bg-teal-50 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generatingLetter ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating your MR response…
                    </>
                  ) : (
                    <>Create my MR response</>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white/10 rounded-xl p-4 max-h-96 overflow-y-auto">
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
                </div>
              )}
              {!canGenerateLetter && !mrLetter && (
                <p className="text-teal-200 text-[10px] text-center leading-relaxed">
                  Upload your decision letter above, write a short note, or save answers under My Questions to enable this
                  button.
                </p>
              )}
              {mrLetter && (
                <p className="text-teal-200 text-[10px] text-center leading-relaxed">
                  Fill in bracket placeholders, then read everything once before you send. Evidence is listed below — attach
                  copies and refer to them in your letter if you use them.
                </p>
              )}
            </div>
          </div>
        </div>

        <Collapse title="Common things to put in your case" defaultOpen={false}>
          <ul className="space-y-2 text-xs text-stone-700 leading-relaxed">
            <li className="flex gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
              Your PIP decision letter (you can upload it here)
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
              The points or activities you believe are incorrect
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
              Real examples from daily life — not only a list of diagnoses
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
              Detail where it fits: pain, fatigue, anxiety, prompting or supervision, accidents or risk, how often problems
              happen
            </li>
          </ul>
        </Collapse>

        <Collapse title="Supporting evidence you can attach" defaultOpen={false}>
          <ul className="space-y-1.5 text-xs text-stone-700">
            {[
              'Letters from your GP',
              'Specialist or consultant letters',
              'Medication lists',
              'Care plans',
              'Occupational therapy reports',
              'Mental health support letters',
              'Hospital records',
              'Symptom diaries',
              'Statements from carers, friends, or family',
            ].map(item => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </Collapse>

        <Collapse title="What a strong MR usually does" defaultOpen>
          <p className="text-xs text-stone-600 leading-relaxed mb-3">
            Tie each issue to{' '}
            <strong className="text-stone-800">which descriptor or activity</strong> should apply,{' '}
            <strong className="text-stone-800">why</strong>, and{' '}
            <strong className="text-stone-800">short real-world examples</strong> rather than diagnoses alone.
          </p>
          <blockquote className="border-l-4 border-teal-300 pl-3 text-xs italic text-stone-700 leading-relaxed bg-stone-50 py-3 rounded-r-lg mb-3">
            &quot;I cannot cook safely without prompting because I forget pans on the hob due to anxiety and poor concentration.
            This happens most days.&quot;
          </blockquote>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Strong supporting evidence helps, but your own clear examples still matter — especially when they match the
            reliability rules (safely, often enough, in reasonable time, without wiping you out on bad days).
          </p>
        </Collapse>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
          <p className="font-bold text-stone-900 text-sm">Send your MR to DWP</p>
          <p className="text-xs text-stone-600 leading-relaxed">
            Include your wording and numbered copies of evidence. Keep what you send. Phone first if you prefer, then confirm
            in writing if they ask you to.
          </p>
          <div className="flex gap-2 items-start text-xs text-stone-600">
            <Phone className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <span>
              PIP enquiries:{' '}
              <span className="font-mono font-semibold">{PIP_TEL}</span> (textphone 0800 917 7777)
            </span>
          </div>
          <a
            href={CRMR1_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-teal-50 rounded-xl p-3 border border-teal-100 hover:bg-teal-100 transition-colors active:scale-[0.99]"
          >
            <Download className="w-4 h-4 text-teal-700 shrink-0" />
            <span className="flex-1 text-xs font-bold text-stone-900">Official MR pack on GOV.UK (includes CRMR1)</span>
            <ExternalLink className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          </a>
        </div>

        <Collapse title="Need your PA4 assessor report?" defaultOpen={false}>
          <p className="text-xs text-stone-600 leading-relaxed mb-3">
            The PA4 is what the contractor sent DWP before the decision. Useful if DWP relied on wording you disagree with.
            Request it separately (for example via SAR) — it is not the same document as your MR letter.
          </p>
          <SAREmailGenerator context="pa4" />
        </Collapse>

        <ContextualAssistantBar
          label="Want help sharpening this?"
          sublabel="Paste your draft or say what DWP refused"
          prompt="I'm challenging my PIP decision with a Mandatory Reconsideration. Here's what DWP awarded and what's wrong..."
        />

        <button
          type="button"
          onClick={() => navigateTo('appeal')}
          className="w-full py-3 rounded-xl border border-stone-200 bg-white text-stone-700 font-semibold text-sm hover:bg-stone-50 active:scale-[0.98] transition-all"
        >
          If MR finishes and you still disagree — appeals
          <ArrowRight className="w-4 h-4 inline-block ml-1 -mt-0.5 text-stone-500" />
        </button>
      </div>
    </div>
  );
}
