import React, { useMemo, useState } from 'react';
import { ChevronRight, TrendingUp, Info } from 'lucide-react';
import { useAppContext } from './AppContext';
import { PIP_QUESTIONS } from '../pipQuestions';

// Maps question ID to the descriptor points from pipQuestions.ts
function getPointsForAnswer(questionId: string, answerStr: string): number {
  const q = PIP_QUESTIONS.find(q => q.id === questionId);
  if (!q) return 0;

  // Answers are stored as "Descriptor X" where X is the letter
  const match = answerStr?.match(/Descriptor\s+([A-Z])/i);
  if (!match) return 0;
  const code = match[1].toUpperCase();

  const descriptor = q.descriptors.find(d => d.code === code);
  return descriptor?.points ?? 0;
}

// PIP scoring thresholds
const DAILY_LIVING_QUESTIONS = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'];
const MOBILITY_QUESTIONS = ['q11','q12'];

function getAwardLevel(points: number, type: 'daily' | 'mobility'): { label: string; color: string; bg: string; border: string } {
  if (type === 'daily') {
    if (points >= 12) return { label: 'Enhanced Daily Living', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' };
    if (points >= 8)  return { label: 'Standard Daily Living', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
    return { label: 'No award (below threshold)', color: 'text-stone-500', bg: 'bg-stone-50', border: 'border-stone-200' };
  } else {
    if (points >= 12) return { label: 'Enhanced Mobility', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' };
    if (points >= 8)  return { label: 'Standard Mobility', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
    return { label: 'No award (below threshold)', color: 'text-stone-500', bg: 'bg-stone-50', border: 'border-stone-200' };
  }
}

// Weekly PIP rates 2025/26
const RATES = {
  dailyStandard: 73.90,
  dailyEnhanced: 110.40,
  mobilityStandard: 29.20,
  mobilityEnhanced: 77.05,
};

export function PIPPointsEstimator() {
  const { savedAnswers, navigateTo, hasPaid } = useAppContext();

  const answeredIds = Object.keys(savedAnswers);
  const answeredDailyCount = answeredIds.filter(id => DAILY_LIVING_QUESTIONS.includes(id)).length;
  const answeredMobilityCount = answeredIds.filter(id => MOBILITY_QUESTIONS.includes(id)).length;
  const totalAnswered = answeredIds.length;

  // Show for paid users always, or for free users once they have at least Q1 answered
  if (!hasPaid && totalAnswered === 0) return null;

  // Empty state for paid users with no answers yet
  if (hasPaid && totalAnswered === 0) {
    return (
      <section>
        <button
          onClick={() => navigateTo('question_index')}
          className="w-full bg-white rounded-2xl border border-stone-100 shadow-sm hover:border-teal-200 hover:shadow-md transition-all active:scale-[0.98] px-4 py-4 text-left flex items-center gap-3"
        >
          <div className="w-9 h-9 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp className="w-4.5 h-4.5 text-teal-700" style={{ width: '18px', height: '18px' }} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-stone-900 text-sm">Your Points Estimate</h3>
            <p className="text-xs text-stone-500 mt-0.5">Answer your questions to see your estimated award</p>
          </div>
          <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
        </button>
      </section>
    );
  }

  const dailyPoints = DAILY_LIVING_QUESTIONS.reduce((sum, id) => {
    return sum + (savedAnswers[id] ? getPointsForAnswer(id, savedAnswers[id]) : 0);
  }, 0);

  const mobilityPoints = MOBILITY_QUESTIONS.reduce((sum, id) => {
    return sum + (savedAnswers[id] ? getPointsForAnswer(id, savedAnswers[id]) : 0);
  }, 0);

  const dailyAward = getAwardLevel(dailyPoints, 'daily');
  const mobilityAward = getAwardLevel(mobilityPoints, 'mobility');

  const isComplete = totalAnswered === 12;
  const isPartial = !isComplete;

  // Estimated weekly payment
  let weeklyEstimate = 0;
  if (dailyPoints >= 12) weeklyEstimate += RATES.dailyEnhanced;
  else if (dailyPoints >= 8) weeklyEstimate += RATES.dailyStandard;
  if (mobilityPoints >= 12) weeklyEstimate += RATES.mobilityEnhanced;
  else if (mobilityPoints >= 8) weeklyEstimate += RATES.mobilityStandard;

  const annualEstimate = weeklyEstimate * 52;
  const hasAnyAward = weeklyEstimate > 0;

  return (
    <section>
      <button
        onClick={() => navigateTo('question_index')}
        className="w-full bg-white rounded-2xl border border-stone-100 shadow-sm hover:border-teal-200 hover:shadow-md transition-all active:scale-[0.98] overflow-hidden text-left"
      >
        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
              <TrendingUp className="w-4.5 h-4.5 text-teal-700" style={{ width: '18px', height: '18px' }} />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                Your Points Estimate
                {isPartial && (
                  <span className="ml-2 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">
                    {totalAnswered}/12 answered
                  </span>
                )}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {isComplete
                  ? hasAnyAward
                    ? `~£${annualEstimate.toLocaleString('en-GB', { maximumFractionDigits: 0 })} estimated per year`
                    : 'Based on your answers — below award threshold'
                  : 'Estimate based on questions answered so far'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hasAnyAward && (
              <span className="text-sm font-bold text-teal-700">
                £{weeklyEstimate.toFixed(2)}<span className="text-xs font-medium text-stone-400">/wk</span>
              </span>
            )}
<ChevronRight className="w-4 h-4 text-stone-400" />
          </div>
        </div>

        {/* Summary bar */}
        <div className="px-4 pb-4 flex gap-3">
            <div className={`flex-1 rounded-xl px-3 py-2 border ${dailyAward.bg} ${dailyAward.border}`}>
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-0.5">Daily Living</p>
              <p className={`text-xs font-bold ${dailyAward.color}`}>{dailyPoints} pts</p>
              <p className={`text-[10px] ${dailyAward.color} opacity-80 leading-tight mt-0.5`}>{answeredDailyCount}/10 answered</p>
            </div>
            <div className={`flex-1 rounded-xl px-3 py-2 border ${mobilityAward.bg} ${mobilityAward.border}`}>
              <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-0.5">Mobility</p>
              <p className={`text-xs font-bold ${mobilityAward.color}`}>{mobilityPoints} pts</p>
              <p className={`text-[10px] ${mobilityAward.color} opacity-80 leading-tight mt-0.5`}>{answeredMobilityCount}/2 answered</p>
            </div>
          </div>
        </button>

    </section>
  );
}
