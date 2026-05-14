import React from 'react';
import {
  ArrowLeft, Scale, Users, FileText, Phone, CheckCircle2,
  Clock, Briefcase, HeartHandshake, CalendarCheck, Download,
  MessageSquare, ExternalLink,
} from 'lucide-react';
import { useAppContext } from './AppContext';
import { useState } from 'react';

export function AppealScreen() {
  const { goBack, navigateTo, savedAnswers, medProfile, setAppealDraftReasons } = useAppContext();
  const [mrOutcome, setMrOutcome] = useState('');
  const [generating, setGenerating] = useState(false);
  const [appealReasons, setAppealReasons] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const hasAnswers = Object.keys(savedAnswers || {}).length > 0;

  const generateReasons = async () => {
    setGenerating(true);
    setAppealReasons(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sscs1',
          savedAnswers,
          medProfile,
          mrOutcome,
        }),
      });
      const data = await res.json();
      const reasons = data.reasons || 'Could not generate. Please try again.';
      setAppealReasons(reasons);
      if (res.ok && typeof data.reasons === 'string' && data.reasons.trim()) {
        setAppealDraftReasons(data.reasons.trim());
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
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">Appeal to Tribunal</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-4">

        {/* Hero */}
        <div className="bg-rose-700 rounded-2xl p-5 text-white">
          <h2 className="text-xl font-bold mb-1">Take your case to tribunal</h2>
          <p className="text-rose-100 text-sm leading-relaxed">If your Mandatory Reconsideration was unsuccessful, you can appeal to an independent tribunal — completely separate from DWP.</p>
        </div>

        {/* Success rate */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex items-center gap-4">
          <div className="text-3xl font-black text-rose-600 shrink-0">60%</div>
          <p className="text-sm text-stone-600 leading-relaxed">of PIP appeals succeed at tribunal. Don't be put off by a refusal — the tribunal is genuinely independent.</p>
        </div>

        {/* Step 1 — Always choose oral */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 bg-rose-700 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <div>
              <p className="font-bold text-stone-900 text-sm mb-1">Choose an oral hearing — always</p>
              <p className="text-xs text-stone-500 leading-relaxed">You'll be offered a paper-based or oral (in person/video/phone) hearing. Always choose oral. Success rates are significantly higher — the panel can ask questions and hear your full story.</p>
            </div>
          </div>
        </div>

        {/* Step 2 — Submit SSCS1 */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 bg-rose-700 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-stone-900 text-sm mb-1">Submit the SSCS1 form</p>
              <p className="text-xs text-stone-500 leading-relaxed mb-3">You have 1 month from your MR decision letter to appeal. Use the SSCS1 form — state which activities you're challenging and why.</p>
              <div className="space-y-2">
                <a href="https://www.gov.uk/appeal-benefit-decision" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-rose-50 rounded-xl p-3 border border-rose-100 hover:bg-rose-100 transition-colors">
                  <FileText className="w-4 h-4 text-rose-700 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-stone-900">Appeal online — GOV.UK</p>
                    <p className="text-[10px] text-stone-500">Fastest way to submit your appeal</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-rose-400 ml-auto shrink-0" />
                </a>
                <a href="https://www.gov.uk/government/publications/appeal-a-social-security-benefits-decision-form-sscs1"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-stone-50 rounded-xl p-3 border border-stone-200 hover:bg-stone-100 transition-colors">
                  <Download className="w-4 h-4 text-stone-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-stone-900">Download SSCS1 form</p>
                    <p className="text-[10px] text-stone-500">Fill in by hand and post</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400 ml-auto shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SSCS1 Reasons Generator */}
        <div className="bg-rose-700 rounded-2xl overflow-hidden">
          <div className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-base">PIPpal writes your appeal reasons</p>
                <p className="text-rose-100 text-xs leading-relaxed mt-0.5">
                  {hasAnswers
                    ? 'We use your saved PIP answers to write structured SSCS1 appeal reasons — activity by activity, using the SAFES rule.'
                    : 'Complete your PIP questions first so we can write personalised appeal reasons.'}
                </p>
              </div>
            </div>

            {!hasAnswers ? (
              <button onClick={() => navigateTo('question_index')}
                className="w-full bg-white text-rose-700 py-3 rounded-xl font-bold text-sm hover:bg-rose-50 transition-all">
                Complete my PIP answers first →
              </button>
            ) : !appealReasons ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-rose-100 mb-1.5 block">What was the MR outcome? (paste key lines from your MR letter)</label>
                  <textarea
                    value={mrOutcome}
                    onChange={e => setMrOutcome(e.target.value)}
                    placeholder="e.g. 'DWP maintained their decision. They scored me 4 points for preparing food but I believe I need supervision to cook safely due to seizures...'"
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-rose-300 focus:outline-none focus:border-white/40 resize-none"
                  />
                </div>
                <button onClick={generateReasons} disabled={generating}
                  className="w-full bg-white text-rose-700 py-3.5 rounded-xl font-bold text-base hover:bg-rose-50 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {generating ? <><span className="animate-spin">✨</span> Writing your appeal reasons...</> : <>✨ Write my SSCS1 appeal reasons</>}
                </button>
                <p className="text-rose-200 text-[10px] text-center">Takes about 10 seconds · Uses your saved answers</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-white/10 rounded-xl p-4 max-h-72 overflow-y-auto">
                  <pre className="text-xs text-rose-50 leading-relaxed whitespace-pre-wrap font-sans">{appealReasons}</pre>
                </div>
                <div className="flex gap-2">
                  <button onClick={copyReasons}
                    className="flex-1 bg-white text-rose-700 py-3 rounded-xl font-bold text-sm hover:bg-rose-50 transition-all flex items-center justify-center gap-2">
                    {copied ? '✓ Copied!' : '📋 Copy reasons'}
                  </button>
                  <button onClick={() => setAppealReasons(null)}
                    className="px-4 py-3 bg-white/20 text-white rounded-xl text-sm font-bold hover:bg-white/30 transition-all">
                    Regenerate
                  </button>
                </div>
                <p className="text-rose-200 text-[10px] text-center">Paste these into Section 5 of your SSCS1 form. Review before submitting.</p>
              </div>
            )}
          </div>
        </div>

        {/* Step 3 — Prepare */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 bg-rose-700 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">3</span>
            </div>
            <div>
              <p className="font-bold text-stone-900 text-sm mb-2">Prepare for your hearing</p>
              <div className="space-y-2">
                {[
                  ['Bring your documents', 'PA4 report, MR letter, all medical evidence, PIP diary, medication list'],
                  ['Bring support', 'You can bring a friend, family member or carer'],
                  ['Prepare your arguments', 'For each disputed activity: what the assessor said vs what actually happens on your worst days'],
                  ['Practice out loud', "Don't minimize — describe reality. Say things like \"on bad days I can't...\""],
                ].map(([title, desc], i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-stone-600 leading-relaxed"><strong>{title}</strong> — {desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* What to expect at tribunal */}
        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4">
          <p className="font-bold text-stone-900 text-sm mb-3">What happens at tribunal</p>
          <div className="space-y-2">
            {[
              'A panel of 3 — an independent judge, a doctor, and a disability expert',
              'They are not DWP — they genuinely want to understand your situation',
              'They ask about your daily life and how your condition affects you',
              'Usually takes 30–60 minutes',
              'Decision usually arrives by post within 1–2 weeks (sometimes same day)',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-2 shrink-0" />
                <span className="text-xs text-stone-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DWP presenting officer */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
          <Briefcase className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>DWP may send a presenting officer</strong> to argue their case — don't be intimidated. The tribunal panel often challenges the DWP's position. If they don't send one (which is common), that's actually a good sign.
          </p>
        </div>

        {/* Free representation */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <HeartHandshake className="w-4 h-4 text-blue-600" />
            <p className="font-bold text-stone-900 text-sm">Free help is available</p>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed mb-3">You don't have to do this alone. Citizens Advice, local welfare rights services, and disability charities can sometimes provide free tribunal representation.</p>
          <a href="tel:08001448848" className="flex items-center justify-center gap-2 w-full bg-blue-50 text-blue-700 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors border border-blue-100">
            <Phone className="w-4 h-4" />
            Citizens Advice: 0800 144 8848
          </a>
        </div>

        {/* After the hearing */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck className="w-4 h-4 text-teal-600" />
            <p className="font-bold text-stone-900 text-sm">After the hearing</p>
          </div>
          <div className="space-y-2 text-xs text-stone-600">
            <p><strong>If successful</strong> — payments are backdated to when you first claimed. DWP must implement the decision.</p>
            <p><strong>If unsuccessful</strong> — you can request permission to appeal to the Upper Tribunal on a point of law (complex — seek legal advice).</p>
          </div>
        </div>

        {/* PIPpal Assistant CTA */}
        <div className="bg-stone-900 rounded-2xl p-4 text-white">
          <p className="font-bold text-sm mb-1">Need help writing your appeal reasons?</p>
          <p className="text-stone-400 text-xs leading-relaxed mb-3">PIPpal Assistant can help you structure your SSCS1 reasons for each disputed descriptor.</p>
          <button onClick={() => navigateTo('home')}
            className="w-full bg-white text-stone-900 py-2.5 rounded-xl font-bold text-sm hover:bg-stone-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Open PIPpal Assistant
          </button>
        </div>

      </div>
    </div>
  );
}
