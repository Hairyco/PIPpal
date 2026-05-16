import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Info,
  Shield,
  Lock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAppContext, Screen } from './AppContext';
import { PIP_QUESTIONS, getQuestion } from '../pipQuestions';

export function QuestionIntro() {
  const { medProfile, navigateTo, goBack, currentScreen, savedAnswers, selectedQuestionId, setDescriptorHint, setQ1Result } = useAppContext();
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const questionId = selectedQuestionId || 'q1';
  const [explainOpen, setExplainOpen] = useState(false);

  useEffect(() => {
    setExplainOpen(false);
  }, [questionId]);

  const question = getQuestion(questionId)!;

  const conditions = medProfile.conditions.map((c) => c.name.toLowerCase());

  // Find matching condition explainer
  let explainerText = question.defaultExplainer;
  let explainerExample: string | undefined;
  for (const ce of question.conditionExplainers) {
    if (ce.conditions.some((c) => conditions.some((uc) => uc.includes(c)))) {
      explainerText = ce.text;
      explainerExample = (ce as any).example;
      break;
    }
  }



  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">
          Question {question.num} of 12
        </h1>
        <span className="ml-auto text-xs font-bold bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
          {question.category}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 md:px-8 py-6 space-y-5 pb-36">

        {/* Hero Card */}
        <div className="bg-teal-700 rounded-2xl p-6 text-white shadow-sm">
          <div className="text-teal-100 text-sm font-medium mb-2 uppercase tracking-wider">
            {question.category} · Activity {question.num}
          </div>
          <h2 className="text-2xl font-bold leading-tight mb-3">
            {question.headline}
          </h2>
          <p className="text-teal-50 text-sm leading-relaxed">
            {question.subtext}
          </p>
        </div>







        {/* Condition-specific explainer — starts collapsed */}
        <div className="bg-amber-50 rounded-2xl border border-amber-100 overflow-hidden">
          <button
            type="button"
            aria-expanded={explainOpen}
            onClick={() => setExplainOpen((o) => !o)}
            className={`w-full flex items-center gap-2 px-5 py-3 text-left hover:bg-amber-100/50 transition-colors ${explainOpen ? 'border-b border-amber-200' : ''}`}
          >
            <Info className="w-5 h-5 text-amber-700 shrink-0" />
            <h3 className="font-bold text-amber-900 flex-1">This question explained</h3>
            {explainOpen ? (
              <ChevronUp className="w-5 h-5 text-amber-700 shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-amber-700 shrink-0" />
            )}
          </button>
          {explainOpen && (
            <div className="px-5 pb-5 pt-0">
              <p className="text-sm text-amber-800 leading-relaxed">{explainerText}</p>
              {explainerExample && (
                <div className="mt-3 bg-white rounded-xl p-3 border border-amber-200">
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1.5">Example answer</p>
                  <p className="text-xs text-amber-900 leading-relaxed italic">"{explainerExample}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Descriptors — always open */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="w-full px-4 py-3 flex items-center justify-between bg-stone-50 border-b border-stone-100">
            <span className="font-bold text-stone-900 text-sm">What are you scored on? Descriptors</span>
            <button
              onClick={() => navigateTo('descriptors_guide')}
              className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 shrink-0 ml-2"
            >
              Learn more →
            </button>
          </div>
          <div className="px-4 pt-4 pb-3">
            <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 flex items-start gap-2.5 mb-3">
              <span className="text-lg shrink-0">👇</span>
              <div>
                <p className="text-sm font-bold text-teal-900">Tap the one that sounds most like you</p>
                <p className="text-xs text-teal-700 mt-0.5 leading-relaxed">PIPpal will open and guide your answer around the descriptor you choose.</p>
              </div>
            </div>
          </div>
          <div className="px-3 pb-3 space-y-2">
            {question.descriptors.map((d) => (
              <button
                key={d.code}
                onClick={() => {
                  setDescriptorHint(d.code);
                  sessionStorage.setItem('pippal_descriptor_hint', d.code);
                  setQ1Result(null);
                  navigateTo('q1_chat');
                }}
                className="w-full flex gap-3 text-sm text-left rounded-xl px-3 py-3.5 border border-stone-100 bg-white hover:border-teal-300 hover:bg-teal-50 active:scale-[0.98] transition-all group shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-stone-100 group-hover:bg-teal-100 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                  <span className="font-black text-[11px] text-stone-500 group-hover:text-teal-700 transition-colors">{d.code}</span>
                </div>
                <div className="flex-1 text-stone-600 leading-snug group-hover:text-stone-900 transition-colors">{d.text}</div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`font-bold text-xs ${d.points === 0 ? 'text-stone-400' : d.points >= 8 ? 'text-teal-600' : d.points >= 4 ? 'text-blue-600' : 'text-amber-600'}`}>
                    {d.points}pts
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-teal-500 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>




      </div>

      {/* Disclaimer modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-5">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-stone-900 mb-1">Before you start</p>
                <p className="text-xs text-stone-600 leading-relaxed">
                  PIPpal helps you <strong>describe your worst days accurately</strong> — we do not encourage exaggeration or dishonesty. All suggested answers are drafts. <strong>You are responsible for reviewing and ensuring your final answers are truthful</strong> before submitting.
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 rounded-xl p-3">
              I understand that PIPpal assists me in describing my difficulties. All answers are my own.
            </p>
            <button
              onClick={() => { setShowDisclaimer(false); navigateTo('q1_chat'); }}
              className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm"
            >
              I understand — Start Question {question.num}
            </button>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="w-full text-stone-500 text-sm py-1"
            >
              Go back
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-5 md:px-8 bg-white border-t border-stone-100 z-20">
        <button
          onClick={() => questionId === 'q1' ? setShowDisclaimer(true) : navigateTo('q1_chat')}
          className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm"
        >
          Start Question {question.num}
        </button>
      </div>
    </div>
  );
}