import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, Upload, FileText, Loader2,
  AlertTriangle, Phone, CheckCircle2, ExternalLink, Download,
  HeartHandshake, Briefcase, CalendarCheck,
} from 'lucide-react';
import { useAppContext } from './AppContext';

export function AppealScreen() {
  const { goBack, navigateTo, savedAnswers, medProfile, setAppealDraftReasons, isAdmin } = useAppContext();

  const [step, setStep] = useState(1);
  const [mrOutcome, setMrOutcome] = useState('');
  const [generating, setGenerating] = useState(false);
  const [appealReasons, setAppealReasons] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [answerAnalysis, setAnswerAnalysis] = useState<string | null>(null);
  const [answerScore, setAnswerScore] = useState<number | null>(null);
  const hasAnswers = Object.keys(savedAnswers || {}).length > 0;

  const letterRef = useRef<HTMLInputElement>(null);
  const [letterLabels, setLetterLabels] = useState<string[]>([]);
  const [letterFiles, setLetterFiles] = useState<{ name: string; base64: string; mimeType: string }[]>([]);
  const [letterBusy, setLetterBusy] = useState(false);
  const [letterError, setLetterError] = useState<string | null>(null);
  const [letterSummary, setLetterSummary] = useState<string | null>(null);
  const [letterAdvice, setLetterAdvice] = useState<string | null>(null);
  const [letterPills, setLetterPills] = useState<string[]>([]);
  const [activePill, setActivePill] = useState<string | null>(null);
  const [pillResponse, setPillResponse] = useState<string | null>(null);
  const [pillLoading, setPillLoading] = useState(false);
  const [improvementNote, setImprovementNote] = useState('');
  const [improving, setImproving] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const onLetterPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!raw.length) return;
    setLetterError(null);
    setLetterSummary(null);
    const results = await Promise.all(raw.map(f => new Promise<{ name: string; base64: string; mimeType: string }>(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: f.name, base64: (reader.result as string).split(',')[1], mimeType: f.type });
      reader.readAsDataURL(f);
    })));
    setLetterLabels(results.map(r => r.name));
    setLetterFiles(results);
  };

  const clearLetter = () => {
    setLetterLabels([]);
    setLetterFiles([]);
    setLetterError(null);
    setLetterSummary(null);
    setLetterAdvice(null);
  };

  useEffect(() => {
    if (letterFiles.length === 0 || letterSummary || generatingSummary) return;
    if (!letterFiles[0].base64) return; // mock data — summary already set
    setGeneratingSummary(true);
    setLetterBusy(true);

    const summaryPromise = fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `This is a PIP Mandatory Reconsideration decision letter. Summarise in 3-4 plain English sentences: what DWP decided, which activities they scored and how many points, and the key reason for the outcome. Be factual and clear.\n\nFiles: ${letterFiles.map(f => f.name).join(', ')}`,
        conversationHistory: [],
        medProfile: { conditions: medProfile?.conditions || [] },
      }),
    }).then(r => r.json()).then(d => { if (d.reply) setLetterSummary(d.reply.trim()); });

    const advicePromise = fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Based on this PIP MR decision letter, give 2-3 plain English sentences of specific advice on how to challenge it at tribunal. What activities should they focus on? What evidence would help? What should they argue? Be direct and practical.\n\nFiles: ${letterFiles.map(f => f.name).join(', ')}`,
        conversationHistory: [],
        medProfile: { conditions: medProfile?.conditions || [] },
      }),
    }).then(r => r.json()).then(d => { if (d.reply) setLetterAdvice(d.reply.trim()); });

    Promise.all([summaryPromise, advicePromise])
      .catch(() => setLetterError('Could not read the letter automatically.'))
      .finally(() => { setGeneratingSummary(false); setLetterBusy(false); });
  }, [letterFiles]);

  const generateReasons = async () => {
    setGenerating(true);
    setAppealReasons(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sscs1', savedAnswers, medProfile, mrOutcome }),
      });
      const data = await res.json();
      const reasons = data.reasons || 'Could not generate. Please try again.';
      setAppealReasons(reasons);
      if (res.ok && typeof data.reasons === 'string' && data.reasons.trim()) {
        setAppealDraftReasons(data.reasons.trim());
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `You are reviewing PIP tribunal appeal reasons for an SSCS1 form. Return ONLY valid JSON: {"score": <number 1-10>, "analysis": "<2-3 sentences>"}. Score 1-10 for how strong this appeal case is (8+ = very strong, 5-7 = solid, below 5 = needs work). Analysis: be honest and objective — what it does well (descriptors challenged, reliability/safety criteria, evidence cited) and what could still be stronger. No sycophancy.\n\nAppeal reasons:\n${reasons}`,
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
      setAppealReasons('Something went wrong. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const copyReasons = () => {
    if (!appealReasons) return;
    navigator.clipboard?.writeText(appealReasons);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-stone-50">

      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10 shrink-0">
        <button type="button" onClick={step === 1 ? goBack : () => setStep(s => s - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-stone-900 text-base leading-tight">Appeal to Tribunal</h1>
          <p className="text-[11px] text-stone-400 font-medium">Step {step} of 4</p>
        </div>
      </div>

      {step === 1 && (
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-3">Take your case to an independent tribunal</h2>
            <p className="text-teal-100 text-sm leading-relaxed mb-2">If your Mandatory Reconsideration was unsuccessful, you have the right to appeal to an independent tribunal — completely separate from DWP. The tribunal makes its own decision based on the evidence.</p>
            <p className="text-teal-100 text-sm leading-relaxed">You must complete an MR first. You have <strong className="text-white">1 month</strong> from your MR decision letter to submit your appeal.</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[{ stat: '68%', sub: 'of oral appeals succeed' },{ stat: '1 month', sub: 'to appeal after MR' },{ stat: 'Free', sub: 'to appeal' }].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-3 text-center">
                <p className="font-black text-teal-600 text-lg">{s.stat}</p>
                <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900 leading-relaxed"><strong>Always choose an oral hearing</strong> — not a paper review. Success rates are significantly higher when the panel can hear your story directly.</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">How it works</p>
            {[
              { n: '1', title: 'Upload your MR letter', body: 'We read it, summarise what DWP decided, and identify what to challenge.' },
              { n: '2', title: 'We write your SSCS1 reasons', body: 'PIPpal drafts your appeal reasons activity by activity using your saved answers.' },
              { n: '3', title: 'Submit the SSCS1 form', body: 'Online via GOV.UK or by post. PIPpal gives you the wording to paste in.' },
              { n: '4', title: 'Prepare for your hearing', body: 'We guide you through what to expect and how to present your case.' },
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

          <button type="button" onClick={() => setStep(2)}
            className="w-full py-4 rounded-xl font-bold text-base bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm">
            Start my appeal <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <p className="text-[11px] font-bold text-teal-200 uppercase tracking-widest mb-1">Step 2 of 4</p>
            <h2 className="font-bold text-xl mb-2">Upload your MR decision letter</h2>
            <p className="text-teal-100 text-sm leading-relaxed">We'll read it, summarise what DWP decided, and use it to build your appeal case.</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <p className="text-sm font-bold text-stone-900 mb-1">Don't have your MR letter?</p>
            <p className="text-sm text-stone-600 leading-relaxed">Call DWP on <a href="tel:08001214433" className="font-semibold text-teal-700 underline">0800 121 4433</a> and ask for a copy. They must provide it.</p>
          </div>

          <input ref={letterRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={onLetterPick} />


          {letterLabels.length === 0 ? (
            <button type="button" onClick={() => letterRef.current?.click()}
              className="w-full border-2 border-dashed border-stone-200 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-teal-400 hover:bg-teal-50 transition-colors active:scale-[0.99]">
              <Upload className="w-6 h-6 text-stone-400" />
              <span className="text-sm font-medium text-stone-600">Tap to upload your MR letter</span>
              <span className="text-xs text-stone-400">Photo or PDF</span>
            </button>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                {letterLabels.map((name, i) => (
                  <span key={i} className="text-[11px] bg-teal-50 text-teal-700 border border-teal-100 px-2 py-1 rounded-lg truncate">{name}</span>
                ))}
                <button type="button" onClick={clearLetter} className="text-[11px] font-semibold text-teal-600 hover:text-rose-800">Remove</button>
              </div>
              {letterBusy && (
                <div className="flex items-center gap-2 text-xs text-stone-600">
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
                setLetterFiles([{ name: 'mock_mr_decision_letter.pdf', base64: '', mimeType: 'application/pdf' }]);
                setLetterSummary('DWP maintained their original decision at MR. They awarded 4 points for preparing food and 0 points for planning a journey. The assessor noted the claimant could use a microwave and plan familiar routes. DWP concluded the claimant did not meet the threshold for enhanced Daily Living or any Mobility award.');
                setLetterAdvice('Focus your appeal on the preparing food and planning a journey activities — these are where DWP scored lowest and there is most room to challenge. Bring a GP letter or carer statement confirming you cannot cook safely unsupervised. At tribunal, describe your worst days in detail and emphasise how often you need help, not just whether you can do it at all.');
                setLetterPills(['Help me argue preparing food', 'Help me argue planning a journey', 'What evidence should I bring?', 'How do I describe my worst days?', 'Write my SSCS1 appeal reasons']);
              }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-amber-700 text-white hover:bg-amber-800 active:scale-[0.99] transition-all">
                Load mock MR letter + summary
              </button>
            </div>
          )}

          <button type="button" onClick={() => setStep(3)} disabled={letterBusy}
            className="w-full py-4 rounded-xl font-bold text-base bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
            {letterLabels.length > 0 && !letterBusy ? 'Continue with letter' : 'Skip — continue without'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <p className="text-[11px] font-bold text-teal-200 uppercase tracking-widest mb-1">Step 3 of 4</p>
            <h2 className="font-bold text-xl mb-2">Build your SSCS1 appeal reasons</h2>
            <p className="text-teal-100 text-sm leading-relaxed">PIPpal writes your appeal reasons activity by activity — showing the tribunal exactly why the DWP decision is wrong.</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-2">
            <p className="text-sm font-bold text-stone-900 mb-2">Where to submit your SSCS1</p>
            <a href="https://www.gov.uk/appeal-benefit-decision" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 bg-teal-50 rounded-xl p-3 border border-teal-100 hover:bg-teal-100 transition-colors">
              <FileText className="w-4 h-4 text-teal-700 shrink-0" />
              <div className="flex-1"><p className="text-xs font-bold text-stone-900">Appeal online — GOV.UK</p><p className="text-[10px] text-stone-500">Fastest way to submit</p></div>
              <ExternalLink className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            </a>
            <a href="https://www.gov.uk/government/publications/appeal-a-social-security-benefits-decision-form-sscs1" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 bg-stone-50 rounded-xl p-3 border border-stone-200 hover:bg-stone-100 transition-colors">
              <Download className="w-4 h-4 text-stone-600 shrink-0" />
              <div className="flex-1"><p className="text-xs font-bold text-stone-900">Download SSCS1 form</p><p className="text-[10px] text-stone-500">Fill in and post</p></div>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            </a>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <p className="text-sm font-bold text-stone-900 mb-1">What did DWP say in your MR? <span className="font-normal text-stone-400">(optional)</span></p>
            <p className="text-xs text-stone-500 mb-3">Paste key lines from your MR letter so we can tailor your appeal reasons.</p>
            <textarea value={mrOutcome} onChange={e => setMrOutcome(e.target.value)}
              placeholder="e.g. DWP maintained their decision. They scored me 4 points for preparing food but I believe I need supervision..."
              rows={3} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-sm focus:ring-1 focus:ring-teal-400 focus:border-teal-400 resize-none" />
          </div>

          {!hasAnswers ? (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center space-y-3">
              <p className="text-sm text-stone-600">Complete your PIP questions first so we can write personalised appeal reasons.</p>
              <button onClick={() => navigateTo('question_index')} className="w-full bg-teal-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-teal-800 transition-all">Complete my PIP answers →</button>
            </div>
          ) : !appealReasons ? (
            <button type="button" onClick={generateReasons} disabled={generating}
              className="w-full py-4 rounded-xl font-bold text-base bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
              {generating ? <><Loader2 className="w-5 h-5 animate-spin" /> Writing your appeal reasons...</> : <>✨ Write my SSCS1 appeal reasons</>}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">Your SSCS1 appeal reasons</p>
                <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{appealReasons}</p>
              </div>
              <p className="text-xs text-stone-400 text-center">Paste into Section 5 of your SSCS1 form. Review before submitting.</p>
              <button type="button" onClick={copyReasons} className="w-full py-3 rounded-xl font-semibold text-sm border-2 border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 active:scale-[0.99] transition-all">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              {(answerAnalysis || answerScore !== null) && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-3">
                  <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">Why this works</p>
                  {answerScore !== null && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-amber-800">Strength score</span>
                        <span className={`text-sm font-black ${answerScore >= 8 ? 'text-teal-700' : answerScore >= 5 ? 'text-amber-700' : 'text-rose-600'}`}>
                          {answerScore}/10 — {answerScore >= 8 ? 'Very strong' : answerScore >= 5 ? 'Solid' : 'Needs work'}
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
                  placeholder="e.g. Add that I cannot travel alone due to panic attacks. Mention my support worker accompanies me to all appointments."
                  rows={3} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-sm focus:ring-1 focus:ring-teal-400 focus:border-teal-400 resize-none" />
                <div className="flex gap-2">
                  <button type="button" disabled={!improvementNote.trim() || improving}
                    onClick={async () => {
                      setImproving(true);
                      try {
                        const res = await fetch('/api/chat', {
                          method: 'POST', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ message: `Improve these PIP tribunal SSCS1 appeal reasons by incorporating the following note from the claimant. Keep the same structure and tone. Make it stronger and more specific without adding anything not mentioned.\n\nCurrent reasons:\n${appealReasons}\n\nWhat to add/change:\n${improvementNote}`, conversationHistory: [], medProfile: { conditions: medProfile?.conditions || [] } }),
                        });
                        const data = await res.json();
                        if (data.reply) { setAppealReasons(data.reply.trim()); setImprovementNote(''); setAnswerAnalysis(null); setAnswerScore(null); }
                      } catch {} finally { setImproving(false); }
                    }}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm border-2 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 active:scale-[0.99] transition-all disabled:opacity-40 flex items-center justify-center gap-1.5">
                    {improving ? <><div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /> Improving...</> : <>✨ Improve</>}
                  </button>
                  <button type="button" onClick={() => { setAppealReasons(null); setAnswerAnalysis(null); setAnswerScore(null); setImprovementNote(''); }}
                    className="px-4 py-3 rounded-xl font-semibold text-sm border-2 border-stone-200 text-stone-600 bg-white hover:bg-stone-50 active:scale-[0.99] transition-all">
                    Start over
                  </button>
                </div>
              </div>
              <button type="button" onClick={() => setStep(4)} className="w-full py-4 rounded-xl font-bold text-base bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm">
                Prepare for my hearing <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-10">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <p className="text-[11px] font-bold text-teal-200 uppercase tracking-widest mb-1">Step 4 of 4</p>
            <h2 className="font-bold text-xl mb-2">Prepare for your hearing</h2>
            <p className="text-teal-100 text-sm leading-relaxed">The tribunal is independent of DWP. The panel genuinely wants to understand your situation and will make their own decision.</p>
          </div>

          {letterSummary && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2">
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">What your letter says</p>
              <p className="text-sm text-blue-900 leading-relaxed">{letterSummary}</p>
            </div>
          )}

          {letterAdvice && (
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 space-y-3">
              <p className="text-[11px] font-bold text-teal-600 uppercase tracking-widest">How you should appeal</p>
              <p className="text-sm text-teal-900 leading-relaxed">{letterAdvice}</p>
              {letterPills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {letterPills.map((pill, i) => (
                    <button key={i} type="button"
                      onClick={() => {
                        if (activePill === pill) { setActivePill(null); setPillResponse(null); return; }
                        setActivePill(pill);
                        setPillResponse(null);
                        setPillLoading(true);
                        fetch('/api/chat', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            message: `For a PIP tribunal appeal, give a 2-3 sentence practical answer to: "${pill}". Be specific and actionable. Plain English.`,
                            conversationHistory: [],
                            medProfile: { conditions: medProfile?.conditions || [] },
                          }),
                        }).then(r => r.json()).then(d => { if (d.reply) setPillResponse(d.reply.trim()); }).finally(() => setPillLoading(false));
                      }}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all active:scale-95 ${activePill === pill ? 'bg-teal-700 text-white border-teal-700' : 'text-teal-700 bg-white border-teal-200 hover:bg-teal-100'}`}>
                      {pill}
                    </button>
                  ))}
                </div>
              )}
              {(pillLoading || pillResponse) && (
                <div className="bg-white border border-teal-100 rounded-xl p-3">
                  {pillLoading ? (
                    <div className="flex items-center gap-2 text-xs text-teal-600">
                      <div className="w-3 h-3 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                      Thinking...
                    </div>
                  ) : (
                    <p className="text-sm text-stone-700 leading-relaxed">{pillResponse}</p>
                  )}
                </div>
              )}
              <p className="text-xs text-teal-600 leading-relaxed">You can also explore any of these points further with the PIPpal Assistant.</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <p className="text-sm font-bold text-stone-900 mb-3">What to bring</p>
            <div className="space-y-2">
              {[
                { title: 'Your documents', body: 'PA4 report, MR letter, medical evidence, PIP diary, medication list' },
                { title: 'Support', body: 'You can bring a friend, family member or carer' },
                { title: 'Your arguments', body: 'For each disputed activity: what the assessor said vs what actually happens on your worst days' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-stone-600 leading-relaxed"><strong>{item.title}</strong> — {item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <p className="text-sm font-bold text-stone-900 mb-3">What to say</p>
            <div className="space-y-2.5">
              {[
                'Describe your worst days — not your average days',
                'Say things like "I can\'t safely..." or "on bad days I need someone to..."',
                'Don\'t minimise — be honest about the full impact',
                'If a question confuses you, ask for it to be repeated',
                'Mention all your conditions, not just the main one',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                  <span className="text-sm text-stone-600">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4">
            <p className="text-sm font-bold text-stone-900 mb-3">What happens at tribunal</p>
            <div className="space-y-2">
              {[
                'A panel of 3 — an independent judge, a doctor, and a disability expert',
                'They are not DWP — they genuinely want to understand your situation',
                'Usually takes 30–60 minutes',
                'Decision usually arrives by post within 1–2 weeks',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-2 shrink-0" />
                  <span className="text-sm text-stone-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
            <Briefcase className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed"><strong>DWP may send a presenting officer</strong> to argue their case. Don't be intimidated — the tribunal panel often challenges DWP's position.</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarCheck className="w-4 h-4 text-teal-600" />
              <p className="text-sm font-bold text-stone-900">After the hearing</p>
            </div>
            <div className="space-y-2 text-sm text-stone-600">
              <p><strong>If successful</strong> — payments are backdated to when you first claimed. DWP must implement the decision.</p>
              <p><strong>If unsuccessful</strong> — you can request permission to appeal to the Upper Tribunal on a point of law. Seek advice first.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <HeartHandshake className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-bold text-stone-900">Free help is available</p>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed mb-3">Citizens Advice and local welfare rights services can sometimes provide free tribunal representation.</p>
            <a href="tel:08001448848" className="flex items-center justify-center gap-2 w-full bg-blue-50 text-blue-700 py-3 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors border border-blue-100">
              <Phone className="w-4 h-4" />
              Citizens Advice: 0800 144 8848
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
