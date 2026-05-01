import React from 'react';
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAppContext } from './AppContext';
import { PIP_QUESTIONS, getTotalPoints } from '../pipQuestions';

export function QuestionIndex() {
  const { navigateTo, goBack, hasPaid, savedAnswers, setSelectedQuestionId } = useAppContext();

  const totalPoints = getTotalPoints(savedAnswers);
  const answeredCount = Object.keys(savedAnswers).length;

  const dailyLiving = PIP_QUESTIONS.filter((q) => q.category === 'Daily Living');
  const mobility = PIP_QUESTIONS.filter((q) => q.category === 'Mobility');

  const getPointColor = (points: number) => {
    if (points === 0) return 'text-stone-400';
    if (points >= 8) return 'text-teal-600';
    if (points >= 4) return 'text-blue-600';
    return 'text-amber-600';
  };

  const QuestionCard = ({ q }: { q: typeof PIP_QUESTIONS[0] }) => {
    const isAnswered = !!savedAnswers[q.id];
    const isLocked = !q.free && !hasPaid;
    const answer = savedAnswers[q.id];
    const descriptor = answer ? q.descriptors.find((d) => d.code === answer) : null;

    return (
      <button
        onClick={() => {
          if (isLocked) {
            navigateTo('upsell');
          } else {
            setSelectedQuestionId(q.id);
            navigateTo('q1_intro');
          }
        }}
        className={`w-full flex items-center gap-3 p-4 bg-white rounded-2xl border shadow-sm transition-all active:scale-[0.98] text-left
          ${isAnswered ? 'border-teal-200 hover:border-teal-300' : isLocked ? 'border-stone-100 opacity-70' : 'border-stone-100 hover:border-teal-200 hover:shadow-md'}`}
      >
        {/* Number/status circle */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm
          ${isAnswered ? 'bg-teal-600 text-white' : isLocked ? 'bg-stone-100 text-stone-400' : 'bg-teal-50 text-teal-700'}`}
        >
          {isAnswered ? <CheckCircle2 className="w-5 h-5" /> : q.num}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${isAnswered ? 'text-teal-900' : 'text-stone-900'}`}>
            {q.shortTitle}
          </p>
          {isAnswered && descriptor ? (
            <p className="text-xs text-stone-500 mt-0.5 truncate">
              Descriptor {answer} · <span className={`font-bold ${getPointColor(descriptor.points)}`}>{descriptor.points} pts</span>
            </p>
          ) : (
            <p className="text-xs text-stone-400 mt-0.5">{isLocked ? 'Full Access required' : 'Not yet answered'}</p>
          )}
        </div>

        {/* Right icon */}
        {isLocked ? (
          <Lock className="w-4 h-4 text-stone-300 shrink-0" />
        ) : isAnswered ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-sm font-bold ${getPointColor(descriptor?.points || 0)}`}>
              {descriptor?.points || 0}pts
            </span>
            <ChevronRight className="w-4 h-4 text-stone-300" />
          </div>
        ) : (
          <ChevronRight className="w-4 h-4 text-stone-300 shrink-0" />
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* Header */}
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">My Questions</h1>
        <span className="ml-auto text-xs font-bold bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
          {answeredCount}/12 done
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">

        {/* Score summary */}
        <div className="bg-teal-700 px-5 md:px-8 py-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-teal-200 text-sm mb-1">Total score so far</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">{totalPoints}</span>
                <span className="text-teal-200 text-sm mb-1">pts total</span>
              </div>
            </div>
            <div className="text-right">
              <TrendingUp className="w-8 h-8 text-teal-300 ml-auto mb-1" />
              <p className="text-teal-200 text-xs">{answeredCount} of 12 answered</p>
            </div>
          </div>
          <div className="w-full bg-teal-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((totalPoints / 164) * 100, 100)}%` }}
            />
          </div>
          {totalPoints >= 12 && (
            <p className="text-teal-200 text-xs mt-2">
              {totalPoints >= 12 && totalPoints < 24 ? '✓ Standard rate Daily Living likely' : ''}
              {totalPoints >= 24 ? '✓ Enhanced rate may apply — keep going!' : ''}
            </p>
          )}
        </div>

        <div className="px-5 md:px-8 py-6 space-y-6">

          {/* All done — survey + diary banner */}
          {answeredCount === 12 && (
            <div className="space-y-3">
              <div className="bg-emerald-600 rounded-2xl p-5 text-white shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">🎉</span>
                  <div className="flex-1">
                    <p className="font-bold text-base mb-1">You have completed all 12 questions!</p>
                    <p className="text-emerald-100 text-xs leading-relaxed mb-4">Well done. Your answers are saved and ready to use. We would love to know what you think — it takes 2 minutes and really helps us improve.</p>
                    <a
                      href="https://uk.trustpilot.com/review/pippal.uk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-white text-emerald-700 py-2.5 rounded-xl font-bold text-sm text-center hover:bg-emerald-50 transition-colors active:scale-[0.98] block"
                    >
                      ⭐ Leave a review on Trustpilot
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-base">📔</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-stone-900 text-sm mb-1">Start your PIP Diary</p>
                    <p className="text-xs text-stone-500 leading-relaxed mb-3">Your diary is pre-filled from your answers. Use it to record how your condition affects you each day — this is powerful evidence for your assessment. Open the diary, review the pre-filled notes, and adjust them for each day.</p>
                    <button
                      onClick={() => navigateTo('pip_diary')}
                      className="w-full bg-teal-700 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-teal-800 active:scale-[0.98] transition-all"
                    >
                      Open PIP Diary →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upgrade banner for free users */}
          {!hasPaid && (
            <button
              onClick={() => navigateTo('upsell')}
              className="w-full bg-orange-50 border border-orange-200 rounded-2xl p-4 text-left hover:bg-orange-100 transition-colors active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold text-orange-900">Unlock questions 2–12</span>
              </div>
              <p className="text-xs text-orange-700 leading-relaxed">
                Full Access unlocks all 12 questions, PIP Diary, Assessment Prep & more — £12.99 one-time.
              </p>
            </button>
          )}

          {/* Daily Living */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-stone-900">Daily Living</h2>
              <span className="text-xs text-stone-500">
                {dailyLiving.filter((q) => savedAnswers[q.id]).length}/{dailyLiving.length} answered
              </span>
            </div>
            <div className="space-y-2">
              {dailyLiving.map((q) => <QuestionCard key={q.id} q={q} />)}
            </div>
          </section>

          {/* Mobility */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-stone-900">Mobility</h2>
              <span className="text-xs text-stone-500">
                {mobility.filter((q) => savedAnswers[q.id]).length}/{mobility.length} answered
              </span>
            </div>
            <div className="space-y-2">
              {mobility.map((q) => <QuestionCard key={q.id} q={q} />)}
            </div>
          </section>

          {/* Score guide */}
          <section className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <h3 className="font-bold text-stone-900 text-sm mb-3">Score guide</h3>
            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Standard Daily Living</span>
                <span className="font-bold text-amber-600">8+ pts Daily Living</span>
              </div>
              <div className="flex justify-between">
                <span>Enhanced Daily Living</span>
                <span className="font-bold text-blue-600">12+ pts Daily Living</span>
              </div>
              <div className="flex justify-between">
                <span>Standard Mobility</span>
                <span className="font-bold text-amber-600">8+ pts Mobility</span>
              </div>
              <div className="flex justify-between">
                <span>Enhanced Mobility</span>
                <span className="font-bold text-teal-600">12+ pts Mobility</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}