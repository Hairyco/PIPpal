import React, { useState } from 'react';
import {
  ArrowLeft, AlertTriangle, Phone, ChevronRight,
  MessageSquare, Calculator, Sparkles,
} from 'lucide-react';
import { useAppContext } from './AppContext';

export function ChangeOfCircumstancesScreen() {
  const { goBack, navigateTo, hasPaid, savedAnswers, medProfile } = useAppContext();
  const hasAnswers = Object.keys(savedAnswers).length > 0;
  const [whatChanged, setWhatChanged] = useState('');
  const [generatingCoC, setGeneratingCoC] = useState(false);
  const [cocResult, setCocResult] = useState<string | null>(null);
  const [cocCopied, setCocCopied] = useState(false);

  const generateCoCAnswers = async () => {
    setGeneratingCoC(true);
    setCocResult(null);
    try {
      const res = await fetch('/api/generate-coc-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          savedAnswers,
          medProfile,
          changes: [{ activity: 'All affected activities', whatChanged }],
        }),
      });
      const data = await res.json();
      setCocResult(data.updatedAnswers || 'Could not generate. Please try again.');
    } catch {
      setCocResult('Something went wrong. Please try again.');
    } finally {
      setGeneratingCoC(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">Change of Circumstances</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-4">

        {/* Hero */}
        <div className="bg-purple-700 rounded-2xl p-5 text-white">
          <h2 className="text-xl font-bold mb-1">Your condition has changed</h2>
          <p className="text-purple-100 text-sm leading-relaxed">If your condition has got worse or you have a new diagnosis, you can ask DWP to review your award. You could get more money.</p>
        </div>

        {/* Important warning — upfront */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 text-sm mb-1">Your whole award gets reviewed</p>
            <p className="text-xs text-amber-800 leading-relaxed">Reporting a change means DWP looks at everything again — not just what's changed. Your award could go up, stay the same, or go down. <strong>88% of people</strong> who report a change keep their PIP or get more. Only report if your needs have genuinely increased.</p>
          </div>
        </div>

        {/* When to report */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <p className="font-bold text-stone-900 text-sm mb-3">When to report a change</p>
          <div className="space-y-2">
            {[
              'Your condition has got significantly worse',
              'You have been diagnosed with a new condition',
              'You now need more help day-to-day than before',
              'Your medication has changed significantly',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <span className="text-sm text-stone-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 — get records */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <p className="font-bold text-stone-900 text-sm mb-1">Step 1 — Get your previous records</p>
          <p className="text-xs text-stone-500 leading-relaxed mb-3">Before filling in a new form, request your original PIP2 and assessor report from DWP. This lets you show exactly what has changed since your last assessment.</p>
          <SAREmailGenerator context="pip2" />
        </div>

        {/* Step 2 — call DWP */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <p className="font-bold text-stone-900 text-sm mb-1">Step 2 — Call DWP to report the change</p>
          <p className="text-xs text-stone-500 leading-relaxed mb-3">Call the PIP enquiry line for existing claims. They'll tell you what happens next.</p>
          <DWPCallScript type="update" />
        </div>

        {/* Step 3 — PIPpal generates updated answers */}
        <div className="bg-purple-700 rounded-2xl overflow-hidden">
          <div className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-base">Step 3 — PIPpal updates your answers</p>
                <p className="text-purple-100 text-xs leading-relaxed mt-0.5">
                  {!hasPaid ? 'Unlock Full Access to use this feature.' : hasAnswers ? 'Tell us what has changed and we'll rewrite your answers to show the worsening — ready to copy onto your new PIP2.' : 'Complete your original PIP answers first so we can show what has changed.'}
                </p>
              </div>
            </div>

            {!hasPaid ? (
              <button onClick={() => navigateTo('upsell')} className="w-full bg-white text-purple-700 py-3 rounded-xl font-bold text-sm hover:bg-purple-50 transition-all flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Unlock Full Access →
              </button>
            ) : !hasAnswers ? (
              <button onClick={() => navigateTo('question_index')} className="w-full bg-white text-purple-700 py-3 rounded-xl font-bold text-sm hover:bg-purple-50 transition-all">
                Complete my PIP answers first →
              </button>
            ) : !cocResult ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-purple-100 mb-1.5 block">What has got worse since your last assessment?</label>
                  <textarea
                    value={whatChanged}
                    onChange={e => setWhatChanged(e.target.value)}
                    placeholder="e.g. 'My anxiety has got much worse. I can no longer go to shops alone. My chronic pain has spread to my legs and I now need a walking stick. I have been diagnosed with fibromyalgia since my last assessment...'"
                    rows={4}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-purple-300 focus:outline-none focus:border-white/40 resize-none"
                  />
                </div>
                <button onClick={generateCoCAnswers} disabled={generatingCoC || !whatChanged.trim()}
                  className="w-full bg-white text-purple-700 py-3.5 rounded-xl font-bold text-base hover:bg-purple-50 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {generatingCoC ? <><span className="animate-spin">✨</span> Rewriting your answers...</> : <>✨ Update my answers for this review</>}
                </button>
                <p className="text-purple-200 text-[10px] text-center">Takes about 10 seconds · Builds on your existing answers</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-white/10 rounded-xl p-4 max-h-72 overflow-y-auto">
                  <pre className="text-xs text-purple-50 leading-relaxed whitespace-pre-wrap font-sans">{cocResult}</pre>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { navigator.clipboard?.writeText(cocResult || ''); setCocCopied(true); setTimeout(() => setCocCopied(false), 2000); }}
                    className="flex-1 bg-white text-purple-700 py-3 rounded-xl font-bold text-sm hover:bg-purple-50 transition-all flex items-center justify-center gap-2">
                    {cocCopied ? '✓ Copied!' : '📋 Copy updated answers'}
                  </button>
                  <button onClick={() => setCocResult(null)}
                    className="px-4 py-3 bg-white/20 text-white rounded-xl text-sm font-bold hover:bg-white/30 transition-all">
                    Redo
                  </button>
                </div>
                <p className="text-purple-200 text-[10px] text-center">Copy these onto your new PIP2 form. Review for accuracy before sending.</p>
              </div>
            )}
          </div>
        </div>

        <ContextualAssistantBar
          label="Questions about reporting a change?"
          sublabel="PIPpal can help you prepare"
          prompt="I want to report a change of circumstances for my PIP claim as my condition has worsened. What should I know?"
        />

        {/* Estimate new award */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-50 rounded-full flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-stone-900 text-sm">Estimate your new award</p>
            <p className="text-xs text-stone-500">See what your updated payments could look like</p>
          </div>
          <button onClick={() => navigateTo('payment_calculator')} className="text-xs font-bold text-purple-700 hover:text-purple-800">
            Open →
          </button>
        </div>

      </div>
    </div>
  );
}
