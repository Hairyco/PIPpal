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
  Info,
  Stethoscope,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from './AppContext';
import { PIP_QUESTIONS } from '../pipQuestions';

// ── Steps ────────────────────────────────────────────────────────────────────
// 1  Upload (+ show extracted answers in accordions)
// 2  Medical: then vs now
// 3  How this works + Start  → navigates to question_index with cocMode on
const TOTAL_STEPS = 3;

const DAILY_LIVING_IDS = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'];
const MOBILITY_IDS = ['q11','q12'];

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

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`text-left text-xs sm:text-sm font-medium px-3 py-2.5 rounded-xl border transition-all active:scale-[0.98] ${
        selected ? 'bg-teal-50 border-teal-400 text-teal-900 shadow-sm' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
      }`}>
      {children}
    </button>
  );
}

// ── Condition severity chips ──────────────────────────────────────────────────
const MED_CHANGE_OPTIONS = [
  'My condition has got worse',
  'I have a new diagnosis',
  'My medication has changed',
  'I need more help than before',
  'I have more bad days now',
  'My mobility has reduced',
  'My mental health has worsened',
  'I need more supervision',
  'I use new aids or equipment',
  'I have had a hospital stay or procedure',
];

// ── Main Component ────────────────────────────────────────────────────────────
export function ChangeOfCircumstancesScreen() {
  const { goBack, navigateTo, medProfile, isAdmin, setCocPreviousAnswers, setCocMode } = useAppContext();

  const [step, setStep] = useState(1);
  const [notReportedOpen, setNotReportedOpen] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Upload state
  const [uploadedLabels, setUploadedLabels] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; base64: string; mimeType: string }[]>([]);
  const [analysisBusy, setAnalysisBusy] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [extractedAnswers, setExtractedAnswers] = useState<Record<string, { answer: string; confidence: 'high' | 'medium' | 'low' }>>({});
  const [confirmedAnswers, setConfirmedAnswers] = useState<Record<string, string>>({});
  const [expandedSection, setExpandedSection] = useState<'daily' | 'mobility' | null>('daily');
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);

  // Medical then vs now
  const [medChanges, setMedChanges] = useState<string[]>([]);
  const [conditionNotes, setConditionNotes] = useState('');

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const back = () => step === 1 ? goBack() : setStep(s => s - 1);

  // Run Vision extraction when files arrive on step 1→2
  useEffect(() => {
    if (step !== 1 || uploadedFiles.length === 0) return;
    if (Object.keys(extractedAnswers).length > 0) return;
    let cancelled = false;
    setAnalysisBusy(true);
    setAnalysisError(null);
    async function extract() {
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'coc-document-analysis',
            files: uploadedFiles.map(f => ({ base64: f.base64, mimeType: f.mimeType })),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (data?.extractedAnswers) {
          setExtractedAnswers(data.extractedAnswers);
          const pre: Record<string, string> = {};
          for (const [key, val] of Object.entries(data.extractedAnswers as Record<string, { answer: string }>)) {
            pre[key] = (val as { answer: string }).answer ?? '';
          }
          setConfirmedAnswers(pre);
        } else {
          setAnalysisError(data?.error ?? 'Could not extract answers automatically.');
        }
      } catch {
        if (!cancelled) setAnalysisError('Could not reach the extraction service.');
      } finally {
        if (!cancelled) setAnalysisBusy(false);
      }
    }
    extract();
    return () => { cancelled = true; };
  }, [uploadedFiles]);

  // Admin mock form loader — injects realistic sample previous answers for all 12 activities
  const loadMockForm = () => {
    const mockAnswers: Record<string, { answer: string; confidence: 'high' | 'medium' | 'low' }> = {
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
    };
    const pre: Record<string, string> = {};
    for (const [k, v] of Object.entries(mockAnswers)) pre[k] = v.answer;
    setUploadedLabels(['mock_pip2_form.jpg']);
    setExtractedAnswers(mockAnswers);
    setConfirmedAnswers(pre);
    setAnalysisBusy(false);
    setAnalysisError(null);
    setExpandedSection('daily');
    setExpandedActivityId(null);
  };

  // File picker handler
  const onUploadPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const fileList = Array.from(files);
    setUploadedLabels(fileList.map(f => f.name));
    setExtractedAnswers({});
    setConfirmedAnswers({});
    setAnalysisError(null);
    const readers = fileList.map(
      file => new Promise<{ name: string; base64: string; mimeType: string }>(resolve => {
        const reader = new FileReader();
        reader.onload = ev => {
          const dataUrl = ev.target?.result as string;
          resolve({ name: file.name, base64: dataUrl.split(',')[1] ?? '', mimeType: file.type || 'image/jpeg' });
        };
        reader.readAsDataURL(file);
      })
    );
    Promise.all(readers).then(results => setUploadedFiles(results));
    e.target.value = '';
  };

  const startQuestions = () => {
    setCocMode(true);
    setCocPreviousAnswers(confirmedAnswers);
    navigateTo('question_index');
  };

  const stepTitles = [
    'Your previous form',
    'Then vs now',
    'How this works',
  ];

  const hasUploaded = uploadedLabels.length > 0;
  const hasExtracted = Object.keys(extractedAnswers).length > 0;

  const renderActivityAccordion = (qid: string) => {
    const q = PIP_QUESTIONS.find(x => x.id === qid);
    if (!q) return null;
    const extracted = extractedAnswers[qid];
    const confirmed = confirmedAnswers[qid] ?? '';
    const isOpen = expandedActivityId === qid;
    const hasAnswer = confirmed.trim().length > 0;
    const confidence = extracted?.confidence ?? 'low';
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
            {hasAnswer ? (
              <textarea
                value={confirmed}
                onChange={ev => setConfirmedAnswers(prev => ({ ...prev, [qid]: ev.target.value }))}
                rows={3}
                className="w-full text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            ) : (
              <textarea
                placeholder="Nothing found on the form — type what you remember or leave blank"
                value={confirmed}
                onChange={ev => setConfirmedAnswers(prev => ({ ...prev, [qid]: ev.target.value }))}
                rows={2}
                className="w-full text-sm text-stone-300 bg-stone-50 border border-dashed border-stone-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-teal-300 placeholder:text-stone-300"
              />
            )}
          </div>
        )}
      </div>
    );
  };

  const renderStep = () => {
    // ── STEP 1: Upload + extracted answers ──────────────────────────────────
    if (step === 1) {
      return (
        <div className="space-y-5 px-5 pt-5 pb-32">

          {/* Hero */}
          <div className="bg-teal-700 rounded-2xl p-6 text-white shadow-sm">
            <p className="text-[11px] font-bold text-teal-200 uppercase tracking-widest mb-2">Change of circumstances</p>
            <h2 className="font-bold text-2xl leading-tight mb-3">Build better answers for your review</h2>
            <p className="text-teal-100 text-sm leading-relaxed">
              DWP sends the same form as your original PIP2 — all 12 activities. We'll go through every question and help you write stronger, more detailed answers than last time.
            </p>
          </div>

          {/* Upload card */}
          {!hasUploaded ? (
            <div className="rounded-2xl border-2 border-teal-200 bg-white shadow-md p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                  <Upload className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-lg leading-snug">Got your previous PIP form?</h3>
                  <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                    Upload your original PIP2, PA4 assessor report or award letter. We'll read your previous answers — even if they're handwritten — and show them alongside each question so you can improve on them.
                  </p>
                </div>
              </div>

              <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">Accepted</p>
                <div className="flex flex-wrap gap-2">
                  {['PIP2 form', 'PA4 assessor report', 'Award letter', 'Decision notice', 'Photos of the form'].map(label => (
                    <span key={label} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-600">{label}</span>
                  ))}
                </div>
              </div>

              <input ref={uploadInputRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={onUploadPick} />
              <button type="button" onClick={() => uploadInputRef.current?.click()}
                className="w-full py-4 rounded-xl font-bold text-base bg-teal-700 text-white shadow-sm hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
                <Upload className="w-5 h-5" />Upload my previous form
              </button>
              <button type="button" onClick={next}
                className="w-full py-3.5 rounded-xl font-semibold text-sm border-2 border-stone-200 text-stone-700 hover:bg-stone-50 active:scale-[0.99] transition-all">
                I don't have it — continue without
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Files + extraction status */}
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Uploaded</p>
                  <button type="button" onClick={() => { setUploadedLabels([]); setUploadedFiles([]); setExtractedAnswers({}); setConfirmedAnswers({}); }}
                    className="text-xs text-stone-400 hover:text-stone-600 underline">Remove</button>
                </div>
                {uploadedLabels.map(name => (
                  <div key={name} className="flex items-center gap-2 text-sm text-stone-700">
                    <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="break-all">{name}</span>
                  </div>
                ))}
                {analysisBusy && (
                  <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
                    <Loader2 className="w-4 h-4 text-teal-600 animate-spin shrink-0" />
                    <p className="text-sm text-stone-600">Reading your form and extracting answers…</p>
                  </div>
                )}
                {!analysisBusy && hasExtracted && (
                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <p className="text-sm text-teal-700 font-semibold">Answers extracted — check them below</p>
                  </div>
                )}
                {!analysisBusy && analysisError && (
                  <div className="flex items-start gap-2 pt-2 border-t border-stone-100">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">Couldn't read the documents automatically. You can continue and your answers will appear as blank in the wizard.</p>
                  </div>
                )}
              </div>

              {/* Extracted answers in accordions */}
              {(hasExtracted || analysisError) && (
                <div className="space-y-2">
                  <p className="text-xs text-stone-500 px-1">
                    {hasExtracted
                      ? 'These are the answers we extracted. Tap any activity to check — you can correct anything that wasn\'t read clearly.'
                      : 'No answers were extracted. You can still add them manually below, or skip and build fresh answers in the wizard.'}
                  </p>

                  {/* Daily Living accordion group */}
                  <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                    <button type="button"
                      onClick={() => setExpandedSection(expandedSection === 'daily' ? null : 'daily')}
                      className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-stone-50">
                      <div>
                        <p className="font-bold text-stone-900 text-sm">Daily Living activities</p>
                        <p className="text-xs text-stone-400 mt-0.5">Activities 1–10</p>
                      </div>
                      {expandedSection === 'daily'
                        ? <ChevronUp className="w-4 h-4 text-stone-400" />
                        : <ChevronDown className="w-4 h-4 text-stone-400" />}
                    </button>
                    {expandedSection === 'daily' && (
                      <div className="border-t border-stone-100">
                        {DAILY_LIVING_IDS.map(renderActivityAccordion)}
                      </div>
                    )}
                  </div>

                  {/* Mobility accordion group */}
                  <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                    <button type="button"
                      onClick={() => setExpandedSection(expandedSection === 'mobility' ? null : 'mobility')}
                      className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-stone-50">
                      <div>
                        <p className="font-bold text-stone-900 text-sm">Mobility activities</p>
                        <p className="text-xs text-stone-400 mt-0.5">Activities 11–12</p>
                      </div>
                      {expandedSection === 'mobility'
                        ? <ChevronUp className="w-4 h-4 text-stone-400" />
                        : <ChevronDown className="w-4 h-4 text-stone-400" />}
                    </button>
                    {expandedSection === 'mobility' && (
                      <div className="border-t border-stone-100">
                        {MOBILITY_IDS.map(renderActivityAccordion)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Haven't reported yet? */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 overflow-hidden">
            <button type="button" onClick={() => setNotReportedOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-sm font-semibold text-blue-900">Haven't told DWP yet?</span>
              </div>
              {notReportedOpen ? <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-blue-600 shrink-0" />}
            </button>
            {notReportedOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-blue-200/70">
                <p className="text-sm font-semibold text-blue-900 mt-3">Tell DWP as soon as possible</p>
                <p className="text-sm text-blue-800 leading-relaxed">Any increase is backdated to the date you first contact them — not when you return the form. The sooner you call, the more you're entitled to.</p>
                <a href="tel:08009172222"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99] transition-all shadow-sm">
                  <Phone className="w-4 h-4" />Call DWP — 0800 917 2222
                </a>
                <p className="text-xs text-blue-700 leading-relaxed text-center">You can prepare everything here first. When you're ready to call, your answers will be waiting.</p>
              </div>
            )}
          </div>

          {/* Risk stats */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="font-bold text-amber-900 text-sm">Something to know first</p>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              When you tell DWP things have got worse, they look at your whole award again — not just what's changed. For most people the award goes up or stays the same. But it's worth knowing it could go down too.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { pct: '37%', label: 'Award increases', color: 'bg-teal-50 border-teal-200 text-teal-800' },
                { pct: '46%', label: 'Stays the same', color: 'bg-stone-100 border-stone-200 text-stone-700' },
                { pct: '17%', label: 'Award reduces', color: 'bg-red-50 border-red-200 text-red-800' },
              ].map(({ pct, label, color }) => (
                <div key={label} className={`rounded-xl border p-2.5 text-center ${color}`}>
                  <p className="font-bold text-base leading-tight">{pct}</p>
                  <p className="text-[10px] mt-0.5 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Admin preview panel */}
          {isAdmin && (
            <div className="rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/60 p-4 space-y-3">
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Admin preview</p>
              <p className="text-xs text-amber-800 leading-relaxed">
                Load a mock form with sample previous answers so you can walk through every step.
              </p>
              <button type="button" onClick={loadMockForm}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-amber-700 text-white hover:bg-amber-800 active:scale-[0.99] transition-all">
                Load mock uploaded form + answers
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(2)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold border border-amber-400 text-amber-900 hover:bg-amber-100 transition-all">
                  → Step 2
                </button>
                <button type="button" onClick={() => setStep(3)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold border border-amber-400 text-amber-900 hover:bg-amber-100 transition-all">
                  → Step 3
                </button>
                <button type="button" onClick={startQuestions}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold border border-amber-400 text-amber-900 hover:bg-amber-100 transition-all">
                  → Questions
                </button>
              </div>
            </div>
          )}

          {/* Continue button — inline, not BottomBar on step 1 */}
          {hasUploaded && (
            <button type="button" onClick={next} disabled={analysisBusy}
              className="w-full py-4 rounded-xl font-bold text-base bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
              {analysisBusy ? <><Loader2 className="w-5 h-5 animate-spin" />Reading your form…</> : <>Continue<ArrowRight className="w-5 h-5" /></>}
            </button>
          )}
        </div>
      );
    }

    // ── STEP 2: Medical then vs now ─────────────────────────────────────────
    if (step === 2) {
      return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">Tell us about your conditions</h2>
            <p className="text-teal-100 text-sm leading-relaxed">
              PIPpal uses your conditions to tailor every question and build answers in the right context.
            </p>
          </div>

          {/* Conditions — mirror ClaimFlow step 3 */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-bold text-stone-900 text-sm">Your conditions</p>
              <button type="button" onClick={() => navigateTo('medical_profile')}
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
              <button type="button" onClick={() => navigateTo('medical_profile')}
                className="w-full py-3 rounded-xl text-sm font-semibold border-2 border-dashed border-teal-200 text-teal-700 hover:bg-teal-50 transition-all">
                + Add your conditions
              </button>
            )}
          </div>

          {/* What's changed since last assessment */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
            <div>
              <p className="font-bold text-stone-900 text-sm">What's changed since your last assessment?</p>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Tap everything that applies. This gives your assessor context alongside your individual answers.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {MED_CHANGE_OPTIONS.map(opt => (
                <Chip key={opt} selected={medChanges.includes(opt)}
                  onClick={() => setMedChanges(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt])}>
                  {opt}
                </Chip>
              ))}
            </div>
          </div>

          {/* Free text for any other detail */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-2">
            <p className="font-bold text-stone-900 text-sm">Anything else you want DWP to know?</p>
            <p className="text-xs text-stone-500">Optional — this will be included in your covering summary.</p>
            <textarea
              value={conditionNotes}
              onChange={e => setConditionNotes(e.target.value)}
              rows={3}
              placeholder="e.g. I was hospitalised twice last year. My pain levels are much higher than they were during my last assessment."
              className="w-full text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-teal-300 placeholder:text-stone-300"
            />
          </div>
        </div>
      );
    }

    // ── STEP 3: How this works (mirrors ClaimFlow step 4) ───────────────────
    if (step === 3) {
      return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">Now let's build your answers</h2>
            <p className="text-teal-100 text-sm leading-relaxed">
              You'll go through all 12 activities — the same questions as your original form. For each one, we show what you wrote before so you can write something stronger.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-stone-900">Here's how this works</h3>
            {[
              { icon: '📋', title: 'Your previous answer is shown first', body: 'For every activity, you\'ll see exactly what was on your original form. This is your starting point.' },
              { icon: '💬', title: 'We ask, you tap', body: 'Simple tap-to-select questions for each activity — no blank boxes to fill in. Think about your bad days.' },
              { icon: '✍️', title: 'We write a stronger answer', body: 'PIPpal builds a new answer using your selections — in the language DWP assessors need to see. Better than last time.' },
              { icon: '✏️', title: 'You can improve it', body: 'Once built, you can tweak every answer before you submit. It\'s your claim — we do the heavy lifting.' },
              { icon: '⏸️', title: 'Save and come back', body: 'Your answers are saved automatically. Do one activity at a time if you need to.' },
            ].map((tip, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-xl shrink-0">{tip.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{tip.title}</p>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{tip.body}</p>
                </div>
              </div>
            ))}
          </div>

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

      {/* Step 1: inline buttons; step 2: BottomBar; step 3: inline Start button */}
      {step === 2 && (
        <BottomBar showBack onBack={back} onNext={next} />
      )}
    </div>
  );
}
