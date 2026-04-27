import React, { useState } from 'react';
import {
  ArrowLeft,
  Info,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  BookOpen,
  Shield,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { useAppContext, Screen } from './AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PIP_QUESTIONS, getQuestion } from '../pipQuestions';

export function QuestionIntro() {
  const { medProfile, navigateTo, goBack, hasPaid, currentScreen, savedAnswers } = useAppContext();
  const [showDescriptors, setShowDescriptors] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Determine which question we're on based on saved state
  // Default to q1 for the intro screen
  const questionId = 'q1';
  const question = getQuestion(questionId)!;

  const conditions = medProfile.conditions.map((c) => c.name.toLowerCase());

  // Find matching condition explainer
  let explainerText = question.defaultExplainer;
  for (const ce of question.conditionExplainers) {
    if (ce.conditions.some((c) => conditions.some((uc) => uc.includes(c)))) {
      explainerText = ce.text;
      break;
    }
  }

  const answeredCount = Object.keys(savedAnswers).length;
  const totalPoints = PIP_QUESTIONS.reduce((acc, q) => {
    const answer = savedAnswers[q.id];
    if (answer) {
      const descriptor = q.descriptors.find((d) => d.code === answer);
      if (descriptor) acc += descriptor.points;
    }
    return acc;
  }, 0);

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

        {/* Paper form note */}
        <div className="bg-blue-50 rounded-xl px-4 py-3 border border-blue-100 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>Note:</strong> We call this Question {question.num}, but on the official PIP2 paper form it's {question.pipFormRef}. We skip the admin questions and focus on the ones that affect your score.
          </p>
        </div>

        {/* Progress */}
        {answeredCount > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <div className="flex justify-between items-end mb-2">
              <div className="text-sm font-bold text-stone-900">Your progress</div>
              <div className="text-xs font-medium text-stone-500">{answeredCount} / 12 answered · {totalPoints} pts so far</div>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${(answeredCount / 12) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Stat callout */}
        <div className="bg-indigo-50 rounded-xl px-4 py-3 border border-indigo-100 flex items-start gap-2.5">
          <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-800 leading-relaxed">
            <strong>Well-prepared claims are significantly more likely to succeed.</strong>{' '}
            Take your time with each answer — describing your worst days clearly is what makes the difference.
          </p>
        </div>

        {/* Condition-specific explainer */}
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-amber-900">What this question means for you</h3>
          </div>
          <p className="text-sm text-amber-800 leading-relaxed">{explainerText}</p>
        </div>

        {/* Descriptors */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowDescriptors(!showDescriptors)}
            className="w-full p-4 flex items-center justify-between bg-stone-50 hover:bg-stone-100 transition-colors"
          >
            <span className="font-bold text-stone-900 text-sm">Descriptors — What are you scored on?</span>
            {showDescriptors
              ? <ChevronUp className="w-5 h-5 text-stone-500" />
              : <ChevronDown className="w-5 h-5 text-stone-500" />
            }
          </button>
          <AnimatePresence>
            {showDescriptors && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-3 border-t border-stone-100">
                  {question.descriptors.map((d) => (
                    <div key={d.code} className="flex gap-3 text-sm">
                      <div className="font-bold w-4 text-stone-400">{d.code}</div>
                      <div className="flex-1 text-stone-600">{d.text}</div>
                      <div className={`font-bold shrink-0 ${d.points === 0 ? 'text-stone-400' : d.points >= 8 ? 'text-teal-600' : d.points >= 4 ? 'text-blue-600' : 'text-amber-600'}`}>
                        {d.points}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* All 12 questions preview */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-stone-50 border-b border-stone-100">
            <h3 className="font-bold text-stone-900 text-sm">All 12 PIP Questions</h3>
            <p className="text-xs text-stone-500 mt-0.5">Complete them all to maximise your score</p>
          </div>
          <div className="divide-y divide-stone-100">
            {PIP_QUESTIONS.map((q) => {
              const isAnswered = !!savedAnswers[q.id];
              const isCurrent = q.id === questionId;
              const isLocked = !q.free && !hasPaid;
              return (
                <div
                  key={q.id}
                  className={`flex items-center gap-3 px-4 py-3 ${isCurrent ? 'bg-teal-50' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                    ${isAnswered ? 'bg-teal-600 text-white' : isCurrent ? 'bg-teal-100 text-teal-700' : 'bg-stone-100 text-stone-500'}`}
                  >
                    {isAnswered ? '✓' : q.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isCurrent ? 'text-teal-900' : 'text-stone-700'}`}>
                      {q.shortTitle}
                    </p>
                    <p className="text-[10px] text-stone-400">{q.category}</p>
                  </div>
                  {isLocked ? (
                    <Lock className="w-4 h-4 text-stone-300 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-stone-300 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* PIP Diary tip */}
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex flex-col gap-3">
          <div className="flex items-start gap-2.5">
            <BookOpen className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800 leading-relaxed">
              <strong>Tip:</strong> {question.tip}
            </p>
          </div>
          {hasPaid && (
            <button
              onClick={() => navigateTo('pip_diary')}
              className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              Open PIP Diary →
            </button>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 md:px-8 bg-white border-t border-stone-100 space-y-4 z-20">
        {/* Disclaimer */}
        <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
          <div className="flex items-start gap-3 mb-3">
            <Shield className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <p className="text-xs text-stone-600 leading-relaxed">
              PIPpal helps you <strong>describe your worst days accurately</strong> — we do not encourage exaggeration or dishonesty. All suggested answers are drafts.{' '}
              <strong>You are responsible for reviewing and ensuring your final answers are truthful</strong> before submitting.
            </p>
          </div>
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={disclaimerAccepted}
              onChange={(e) => setDisclaimerAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500/20 cursor-pointer"
            />
            <span className="text-xs text-stone-700 leading-relaxed group-hover:text-stone-900 transition-colors">
              I understand that PIPpal assists me in describing my difficulties. All answers are my own.
            </span>
          </label>
        </div>

        <button
          onClick={() => navigateTo('q1_chat')}
          disabled={!disclaimerAccepted}
          className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Question {question.num}
        </button>
      </div>
    </div>
  );
}