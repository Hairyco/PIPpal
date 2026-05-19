import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Home,
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
  const { goBack, navigateTo, savedAnswers, medProfile, setMrDraftLetter, isAdmin } = useAppContext();

  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [mrLetter, setMrLetter] = useState<string | null>(null);
  const [letterCopied, setLetterCopied] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [answerAnalysis, setAnswerAnalysis] = useState<string | null>(null);
  const [answerScore, setAnswerScore] = useState<number | null>(null);

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
        // Generate objective analysis
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `You are reviewing a PIP Mandatory Reconsideration draft. Return ONLY valid JSON in this exact format: {"score": <number 1-10>, "analysis": "<2-3 sentences>"}. Score 1-10 for how strong this MR argument is (8+ = very strong, 5-7 = solid, below 5 = needs work). Analysis: be honest and objective — what it does well (specific descriptors, reliability criteria, evidence cited) and what could still be stronger. No sycophancy.\n\nDraft:\n${letterText}`,
            conversationHistory: [],
            medProfile: { conditions: medProfile?.conditions || [] },
          }),
        }).then(r => r.json()).then(d => {
          if (d.reply) {
            try {
              const parsed = JSON.parse(d.reply.replace(/```json|```/g, '').trim());
              if (parsed.score) setAnswerScore(Number(parsed.score));
              if (parsed.analysis) setAnswerAnalysis(parsed.analysis.trim());
            } catch { setAnswerAnalysis(d.reply.trim()); }
          }
        }).catch(() => {});
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

  const [step, setStep] = useState(1);
  const [mrRoute, setMrRoute] = useState<'form' | 'letter' | null>(null);
  const [mrSummary, setMrSummary] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [letterSummary, setLetterSummary] = useState<string | null>(null);
  const [letterAdvice, setLetterAdvice] = useState<string | null>(null);
  const [letterPills, setLetterPills] = useState<string[]>([]);
  const [addedPills, setAddedPills] = useState<Set<string>>(new Set());
  const [pillResponse, setPillResponse] = useState<string | null>(null);
  const [pillLoading, setPillLoading] = useState(false);
  const [improvementNote, setImprovementNote] = useState('');
  const [improving, setImproving] = useState(false);

  // Auto-generate summary when letter is extracted
  useEffect(() => {
    if (!hasExtraction || mrSummary || generatingSummary) return;
    if (letterLabels[0] === 'mock_mr_decision_letter.pdf') return; // mock — summary already set
    setGeneratingSummary(true);

    const summaryCall = fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Summarise this PIP decision letter in plain English for the claimant. Focus on: what they were awarded (or denied), the points given per activity, and the key reasons DWP gave. Keep it to 3-4 sentences. Be clear and factual.\n\nDecision letter content:\n${extractionText}`,
        conversationHistory: [],
        medProfile: { conditions: medProfile?.conditions || [] },
      }),
    }).then(r => r.json()).then(d => { if (d.reply) setMrSummary(d.reply.trim()); }).catch(() => {});

    const adviceCall = fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Based on this PIP decision letter, write 2-3 plain English sentences about which activities to challenge and why. Be direct — tell the claimant what DWP got wrong and what to focus on. Do NOT give them instructions on what to say. PIPpal will write the case for them.\n\nThen on a new line, return a JSON array of 4-5 short first-person statements (5-8 words each) that the claimant can tap to confirm are true — facts about their real experience that would strengthen the challenge. These should be things claimants often forget to mention, specific to the activities scored in this letter. Format: ADVICE: <text>\nPILLS: ["statement 1", "statement 2"]\n\nDecision letter:\n${extractionText}`,
        conversationHistory: [],
        medProfile: { conditions: medProfile?.conditions || [] },
      }),
    }).then(r => r.json()).then(d => {
      if (d.reply) {
        const adviceMatch = d.reply.match(/ADVICE:\s*(.+?)(?:\nPILLS:|$)/s);
        const pillsMatch = d.reply.match(/PILLS:\s*(\[[\s\S]+\])/);
        if (adviceMatch) setLetterAdvice(adviceMatch[1].trim());
        if (pillsMatch) {
          try {
            const pills = JSON.parse(pillsMatch[1]);
            if (Array.isArray(pills)) setLetterPills(pills.slice(0, 5));
          } catch {}
        }
      }
    }).catch(() => {});

    Promise.all([summaryCall, adviceCall]).finally(() => setGeneratingSummary(false));
  }, [hasExtraction]);

  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* Header */}
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10 shrink-0">
        <button
          type="button"
          onClick={step === 1 ? goBack : () => setStep(s => s - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-stone-900 text-base leading-tight">Mandatory Reconsideration</h1>
          <p className="text-[11px] text-stone-400 font-medium">Step {step} of 4</p>
        </div>
        <button type="button" onClick={() => navigateTo('home')}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95">
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* ── STEP 1: What is MR + deadline ────────────────────────────────────── */}
      {step === 1 && (
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-28">
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
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-1" />
            <p className="text-sm text-amber-900 leading-relaxed">
              Ask for a Mandatory Reconsideration within <strong>one month</strong> from the <strong>date on your letter</strong> (refusal or award you disagree with). If that date passes, seek advice — you may still have options in some circumstances.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">How it works</p>
            {[
              { n: '1', title: 'Choose your method', body: 'You can complete the official CRMR1 form, or write a letter — both are valid.' },
              { n: '2', title: 'Upload your decision letter', body: 'We read it, summarise it, and identify what DWP got wrong.' },
              { n: '3', title: 'We build your case', body: 'PIPpal drafts your arguments activity by activity using your saved answers.' },
              { n: '4', title: 'Review and submit', body: 'Check your MR, copy it, and send to DWP by post or online.' },
            ].map(item => (
              <div key={item.n} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-[11px] font-bold">{item.n}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Medical profile status */}
          {(() => {
            const conditions = medProfile?.conditions?.filter((c: any) => c.name?.trim()) || [];
            return (
              <div className={`rounded-2xl border p-4 ${conditions.length > 0 ? 'bg-teal-50 border-teal-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${conditions.length > 0 ? 'text-teal-600' : 'text-amber-700'}`}>
                      {conditions.length > 0 ? '✓ Medical profile' : '⚠️ Medical profile incomplete'}
                    </p>
                    {conditions.length > 0 ? (
                      <p className="text-sm text-teal-800 leading-relaxed">
                        <strong>{conditions.map((c: any) => c.name).join(', ')}</strong> — your MR will be personalised to these conditions.
                      </p>
                    ) : (
                      <p className="text-sm text-amber-800 leading-relaxed">
                        Add your conditions so PIPpal can write a personalised mr. Without this your case will be generic.
                      </p>
                    )}
                  </div>
                  <button type="button" onClick={() => navigateTo('medical_profile')}
                    className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition-all active:scale-95 ${conditions.length > 0 ? 'text-teal-700 bg-white border-teal-200 hover:bg-teal-100' : 'text-amber-800 bg-white border-amber-300 hover:bg-amber-100'}`}>
                    {conditions.length > 0 ? 'Update' : 'Add now'}
                  </button>
                </div>
              </div>
            );
          })()}

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full py-4 rounded-xl font-bold text-base bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            Start my MR <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ── STEP 2: Choose route ─────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <p className="text-[11px] font-bold text-teal-200 uppercase tracking-widest mb-1">Step 2 of 4</p>
            <h2 className="font-bold text-xl mb-2">How do you want to submit?</h2>
            <p className="text-teal-100 text-sm leading-relaxed">Both options are equally valid. Choose whichever feels easier — PIPpal helps with both.</p>
          </div>

          <button
            type="button"
            onClick={() => { setMrRoute('form'); setStep(3); }}
            className="w-full bg-white border-2 border-stone-200 rounded-2xl p-5 text-left hover:border-teal-400 hover:bg-teal-50/30 active:scale-[0.99] transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-bold text-stone-900 text-base">Fill out Form CRMR1</p>
                <p className="text-sm text-stone-500 mt-1 leading-relaxed">The official DWP form. We help you complete each field with the right information. Recommended if you prefer a structured approach.</p>
                <span className="inline-block mt-2 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">We generate your answers</span>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setMrRoute('letter'); setStep(3); }}
            className="w-full bg-white border-2 border-stone-200 rounded-2xl p-5 text-left hover:border-teal-400 hover:bg-teal-50/30 active:scale-[0.99] transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">✉️</span>
              <div>
                <p className="font-bold text-stone-900 text-base">Write a letter</p>
                <p className="text-sm text-stone-500 mt-1 leading-relaxed">A clear, personal letter to DWP challenging the decision. We draft it for you based on your PIP answers and the decision letter.</p>
                <span className="inline-block mt-2 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">We draft the full letter</span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ── STEP 3: Upload decision letter ───────────────────────────────────── */}
      {step === 3 && (
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <p className="text-[11px] font-bold text-teal-200 uppercase tracking-widest mb-1">Step 3 of 4</p>
            <h2 className="font-bold text-xl mb-2">Upload your decision letter</h2>
            <p className="text-teal-100 text-sm leading-relaxed">We'll read it, summarise it, and use it to build a stronger case. Clear photos or PDF work best.</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <p className="text-sm font-bold text-stone-900 mb-1">Don't have your letter?</p>
            <p className="text-sm text-stone-600 leading-relaxed">Call DWP on <a href="tel:08001214433" className="font-semibold text-teal-700 underline">0800 121 4433</a> and ask them to send you a copy of your decision letter. They must provide it on request.</p>
          </div>

          {letterUploadError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-xs text-red-800 leading-relaxed">{letterUploadError}</p>
            </div>
          )}


          <input ref={letterFileRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={onLetterPick} />

          {letterLabels.length === 0 ? (
            <button
              type="button"
              onClick={() => letterFileRef.current?.click()}
              className="w-full border-2 border-dashed border-stone-200 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-teal-400 hover:bg-teal-50 transition-colors active:scale-[0.99]"
            >
              <Upload className="w-6 h-6 text-stone-400" />
              <span className="text-sm font-medium text-stone-600">Tap to upload your decision letter</span>
              <span className="text-xs text-stone-400">Photo or PDF · up to 10 pages</span>
            </button>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-2">
              <div className="flex flex-wrap gap-2 items-center">
                {letterLabels.map((name, i) => (
                  <span key={`${name}-${i}`} className="text-[11px] bg-teal-50 text-teal-700 border border-teal-100 px-2 py-1 rounded-lg max-w-full truncate">{name}</span>
                ))}
                <button type="button" onClick={clearLetterUpload} className="text-[11px] font-semibold text-rose-600 hover:text-rose-800">Remove</button>
              </div>
              {letterBusy && (
                <div className="flex items-center gap-2 text-xs text-stone-600 pt-1">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                  Reading your letter...
                </div>
              )}
              {letterError && <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{letterError}</p>}
            </div>
          )}

          {/* Admin preview panel */}
          {isAdmin && (
            <div className="rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/60 p-4 space-y-3">
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Admin preview</p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4].map(s => (
                  <button key={s} type="button" onClick={() => setStep(s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${step === s ? 'bg-amber-700 text-white border-amber-700' : 'border-amber-400 text-amber-900 hover:bg-amber-100'}`}>
                    Step {s}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => {
                setLetterLabels(['mock_mr_decision_letter.pdf']);
                setLetterFiles([{ name: 'mock_mr_decision_letter.pdf', base64: '', mimeType: 'application/pdf', size: 0 }]);
                setLetterSummary('DWP maintained their original decision. They awarded 4 points for preparing food (Descriptor B) and 0 points for managing therapy. The key reason given was that the assessor observed the claimant could use a microwave independently and no supervision was noted during the assessment.');
                setLetterAdvice('Challenge the preparing food score by showing you cannot cook safely on most days — not just occasionally. For managing therapy, provide a letter from your GP confirming the frequency and complexity of your treatment. Focus on the reliability and safety criteria: can you do it safely, repeatedly, and to an acceptable standard?');
                setLetterPills(['I need someone present when I cook', 'I\'ve burned myself or left the hob on', 'I can only manage ready meals', 'My GP knows about my difficulties', 'I take much longer than a healthy person']);
              }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-amber-700 text-white hover:bg-amber-800 active:scale-[0.99] transition-all">
                Load mock MR letter + summary
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(4)}
              disabled={letterBusy}
              className="flex-1 py-4 rounded-xl font-bold text-base bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {letterLabels.length > 0 && !letterBusy ? 'Continue with letter' : 'Skip — continue without'} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Summary + generate ──────────────────────────────────────── */}
      {step === 4 && (
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <p className="text-[11px] font-bold text-teal-200 uppercase tracking-widest mb-1">Step 4 of 4</p>
            <h2 className="font-bold text-xl mb-2">{mrRoute === 'form' ? 'Build your CRMR1 answers' : 'Build your MR letter'}</h2>
            <p className="text-teal-100 text-sm leading-relaxed">PIPpal will use your saved answers and decision letter to draft your {mrRoute === 'form' ? 'form responses' : 'letter'} — showing DWP exactly why the decision is wrong.</p>
          </div>

          {/* Decision letter summary */}
          {(hasExtraction || letterSummary) && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">What your letter says</p>
              {generatingSummary ? (
                <div className="space-y-2">
                  <div className="h-3 bg-blue-200 rounded animate-pulse w-full" />
                  <div className="h-3 bg-blue-200 rounded animate-pulse w-4/5" />
                  <div className="h-3 bg-blue-200 rounded animate-pulse w-3/5" />
                </div>
              ) : (letterSummary || mrSummary) ? (
                <p className="text-sm text-blue-900 leading-relaxed">{letterSummary || mrSummary}</p>
              ) : (
                <p className="text-sm text-blue-700 italic">Reading your letter...</p>
              )}
            </div>
          )}

          {letterAdvice && (
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 space-y-3">
              <p className="text-[11px] font-bold text-teal-600 uppercase tracking-widest">How you should challenge this</p>
              <p className="text-sm text-teal-900 leading-relaxed">{letterAdvice}</p>
              {letterPills.length > 0 && (
                <>
                  <p className="text-xs text-teal-700 font-medium">Tap anything that's true for you — we'll add it to your case:</p>
                  <div className="flex flex-wrap gap-2">
                    {letterPills.map((pill, i) => {
                      const added = addedPills.has(pill);
                      return (
                        <button key={i} type="button"
                          onClick={() => {
                            setAddedPills(prev => {
                              const next = new Set(prev);
                              if (next.has(pill)) {
                                next.delete(pill);
                                setImprovementNote(prev => prev.replace(pill + '. ', '').replace(pill, '').trim());
                              } else {
                                next.add(pill);
                                setImprovementNote(prev => prev ? prev + ' ' + pill + '.' : pill + '.');
                              }
                              return next;
                            });
                          }}
                          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all active:scale-95 ${added ? 'bg-teal-700 text-white border-teal-700' : 'text-teal-700 bg-white border-teal-200 hover:bg-teal-100'}`}>
                          {added ? '✓ ' : '+ '}{pill}
                        </button>
                      );
                    })}
                  </div>
                  {addedPills.size > 0 && (
                    <p className="text-xs text-teal-600">{addedPills.size} fact{addedPills.size > 1 ? 's' : ''} added. Use <strong>✨ Improve</strong> below to strengthen your draft.</p>
                  )}
                </>
              )}
              <p className="text-xs text-teal-600 leading-relaxed">You can also explore this further with the PIPpal Assistant.</p>
            </div>
          )}

          {/* Add notes */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <p className="text-sm font-bold text-stone-900 mb-1">Anything to add? <span className="font-normal text-stone-400">(optional)</span></p>
            <p className="text-xs text-stone-500 mb-3">Tell us what you think DWP got wrong, or any important details not in your saved answers.</p>
            <textarea
              value={userNotes}
              onChange={e => setUserNotes(e.target.value)}
              placeholder="e.g. They gave me 0 points for preparing food but I can't use the hob safely and my partner does all cooking..."
              rows={4}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-sm focus:ring-1 focus:ring-teal-400 focus:border-teal-400 resize-none"
            />
          </div>

          {!mrLetter ? (
            <button
              type="button"
              onClick={generateLetter}
              disabled={generatingLetter || !canGenerateLetter}
              className="w-full py-4 rounded-xl font-bold text-base bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {generatingLetter ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Building your {mrRoute === 'form' ? 'answers' : 'letter'}...</>
              ) : (
                <>✨ Generate my {mrRoute === 'form' ? 'CRMR1 answers' : 'MR letter'}</>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Your {mrRoute === 'form' ? 'CRMR1 answers' : 'MR letter'}</p>
                  <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">✏️ Tap to edit</span>
                </div>
                <textarea
                  value={mrLetter ?? ''}
                  onChange={e => setMrLetter(e.target.value)}
                  rows={12}
                  className="w-full text-sm text-stone-700 leading-relaxed bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 resize-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={copyLetter}
                  className="py-3 rounded-xl font-semibold text-sm border-2 border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 active:scale-[0.99] transition-all">
                  {letterCopied ? '✓ Copied' : '📋 Copy'}
                </button>
                <button type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: mrRoute === 'form' ? 'PIPpal — CRMR1 Answers' : 'PIPpal — MR Letter', text: mrLetter ?? '' }).catch(() => {});
                    } else { copyLetter(); }
                  }}
                  className="py-3 rounded-xl font-semibold text-sm border-2 border-stone-200 text-stone-700 bg-white hover:bg-stone-50 active:scale-[0.99] transition-all">
                  🔗 Share
                </button>
                <button type="button"
                  onClick={async () => {
                    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
                    const text = (mrLetter ?? '');
                    const lines = text.split('\n');
                    const docChildren = [new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: mrRoute === 'form' ? 'PIPpal CRMR1 Answers' : 'PIPpal Mandatory Reconsideration', bold: true, size: 32, font: 'Arial' })] }), ...lines.map(line => line.trim() === '' ? new Paragraph('') : new Paragraph({ children: [new TextRun({ text: line, size: 24, font: 'Arial' })] }))];
                    const doc = new Document({ sections: [{ children: docChildren }] });
                    const buf = await Packer.toBlob(doc);
                    const url = URL.createObjectURL(buf);
                    const a = document.createElement('a');
                    a.href = url; a.download = mrRoute === 'form' ? 'PIPpal-CRMR1.docx' : 'PIPpal-MR-Letter.docx'; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="py-3 rounded-xl font-semibold text-sm border-2 border-stone-200 text-stone-700 bg-white hover:bg-stone-50 active:scale-[0.99] transition-all">
                  ⬇️ Save
                </button>
              </div>

              {(answerAnalysis || answerScore !== null) && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-3">
                  <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">Why this works</p>
                  {answerScore !== null && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-amber-800">Strength score</span>
                        <span className={`text-sm font-black ${answerScore >= 8 ? 'text-teal-700' : answerScore >= 5 ? 'text-amber-700' : 'text-rose-600'}`}>
                          {answerScore}/10 — {answerScore >= 8 ? 'Very strong' : answerScore >= 6 ? 'Strong' : answerScore >= 4 ? 'Building strength' : 'Could be stronger'}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-amber-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${answerScore >= 8 ? 'bg-teal-500' : answerScore >= 5 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${(answerScore / 10) * 100}%` }} />
                      </div>
                    </div>
                  )}
                  {answerAnalysis && <p className="text-sm text-amber-900 leading-relaxed">{answerAnalysis}</p>}
                </div>
              )}
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
                <p className="text-sm font-bold text-stone-900">Want to strengthen it?</p>
                <p className="text-xs text-stone-500 leading-relaxed">Tell us what to add or change — a specific incident, extra evidence, a point DWP missed — and we'll rewrite it.</p>
                <textarea value={improvementNote} onChange={e => setImprovementNote(e.target.value)}
                  placeholder="e.g. Add that I burned myself twice last month. Include that my GP confirmed I need supervision when cooking."
                  rows={3} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-sm focus:ring-1 focus:ring-teal-400 focus:border-teal-400 resize-none" />
                <div className="flex gap-2">
                  <button type="button" disabled={!improvementNote.trim() || improving}
                    onClick={async () => {
                      setImproving(true);
                      try {
                        const res = await fetch('/api/chat', {
                          method: 'POST', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ message: `Improve this PIP ${mrRoute === 'form' ? 'CRMR1 form answer' : 'Mandatory Reconsideration letter'} by incorporating the following note. Keep the same structure. Make it stronger without adding anything not mentioned.\n\nCurrent draft:\n${mrLetter}\n\nWhat to add/change:\n${improvementNote}`, conversationHistory: [], medProfile: { conditions: medProfile?.conditions || [] } }),
                        });
                        const data = await res.json();
                        if (data.reply) { setMrLetter(data.reply.trim()); setImprovementNote(''); setAnswerAnalysis(null); setAnswerScore(null); }
                      } catch {} finally { setImproving(false); }
                    }}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm border-2 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 active:scale-[0.99] transition-all disabled:opacity-40 flex items-center justify-center gap-1.5">
                    {improving ? <><div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /> Improving...</> : <>✨ Improve</>}
                  </button>
                  <button type="button" onClick={() => { setMrLetter(null); setAnswerAnalysis(null); setAnswerScore(null); setImprovementNote(''); setGeneratingLetter(false); }}
                    className="px-4 py-3 rounded-xl font-semibold text-sm border-2 border-stone-200 text-stone-600 bg-white hover:bg-stone-50 active:scale-[0.99] transition-all">
                    Start over
                  </button>
                </div>
              </div>
            </div>
          )}

          {!canGenerateLetter && !mrLetter && (
            <p className="text-xs text-stone-400 text-center leading-relaxed">Upload your decision letter or complete your PIP questions first — or add notes above — to generate your {mrRoute === 'form' ? 'answers' : 'letter'}.</p>
          )}
        </div>
      )}
    </div>
  );
}
