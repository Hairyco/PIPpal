import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, AlertCircle, CheckCircle, Info } from 'lucide-react';
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
  const { savedAnswers, navigateTo } = useAppContext();

  const answeredIds = Object.keys(savedAnswers);
  const answeredDailyCount = answeredIds.filter(id => DAILY_LIVING_QUESTIONS.includes(id)).length;
  const answeredMobilityCount = answeredIds.filter(id => MOBILITY_QUESTIONS.includes(id)).length;
  const totalAnswered = answeredIds.length;

  // Only show if at least one question answered
  if (totalAnswered === 0) return null;

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
            <ChevronDown className="w-4 h-4 text-stone-400" />
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

      {/* Expanded detail — now on question_index page */}
      {false && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm mt-0 -mt-2 pt-2 pb-4 px-4 rounded-t-none border-t-0">

          {/* Score breakdown */}
          <div className="grid grid-cols-2 gap-3 mb-4 pt-2">
            {/* Daily Living */}
            <div className={`rounded-xl p-3 border ${dailyAward.bg} ${dailyAward.border}`}>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wide mb-2">Daily Living</p>
              <div className="flex items-end gap-1 mb-1">
                <span className={`text-2xl font-black ${dailyAward.color}`}>{dailyPoints}</span>
                <span className="text-xs text-stone-400 mb-1 font-medium">/ need 8+</span>
              </div>
              <p className={`text-[11px] font-semibold ${dailyAward.color} leading-tight`}>{dailyAward.label}</p>
              <p className="text-[10px] text-stone-400 mt-1">{answeredDailyCount} of 10 questions answered</p>
              {/* Mini progress bar */}
              <div className="mt-2 bg-white/60 rounded-full h-1.5 overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full transition-all" style={{ width: `${Math.min((dailyPoints / 20) * 100, 100)}%` }} />
              </div>
            </div>

            {/* Mobility */}
            <div className={`rounded-xl p-3 border ${mobilityAward.bg} ${mobilityAward.border}`}>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wide mb-2">Mobility</p>
              <div className="flex items-end gap-1 mb-1">
                <span className={`text-2xl font-black ${mobilityAward.color}`}>{mobilityPoints}</span>
                <span className="text-xs text-stone-400 mb-1 font-medium">/ need 8+</span>
              </div>
              <p className={`text-[11px] font-semibold ${mobilityAward.color} leading-tight`}>{mobilityAward.label}</p>
              <p className="text-[10px] text-stone-400 mt-1">{answeredMobilityCount} of 2 questions answered</p>
              <div className="mt-2 bg-white/60 rounded-full h-1.5 overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full transition-all" style={{ width: `${Math.min((mobilityPoints / 12) * 100, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Payment estimate */}
          {hasAnyAward && (
            <div className="bg-teal-700 rounded-xl p-4 mb-3 text-white">
              <p className="text-xs text-teal-200 font-semibold uppercase tracking-wide mb-2">Estimated payment (2025/26 rates)</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-black">£{weeklyEstimate.toFixed(2)}</span>
                <span className="text-teal-300 text-sm">per week</span>
              </div>
              <p className="text-teal-200 text-sm font-semibold">
                ~£{annualEstimate.toLocaleString('en-GB', { maximumFractionDigits: 0 })} per year · tax-free
              </p>
              <div className="mt-3 pt-3 border-t border-teal-600 space-y-1">
                {dailyPoints >= 8 && (
                  <p className="text-xs text-teal-200">
                    Daily Living ({dailyPoints >= 12 ? 'Enhanced' : 'Standard'}): £{dailyPoints >= 12 ? RATES.dailyEnhanced.toFixed(2) : RATES.dailyStandard.toFixed(2)}/wk
                  </p>
                )}
                {mobilityPoints >= 8 && (
                  <p className="text-xs text-teal-200">
                    Mobility ({mobilityPoints >= 12 ? 'Enhanced' : 'Standard'}): £{mobilityPoints >= 12 ? RATES.mobilityEnhanced.toFixed(2) : RATES.mobilityStandard.toFixed(2)}/wk
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Threshold guide */}
          <div className="bg-stone-50 rounded-xl p-3 mb-3 border border-stone-100">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wide mb-2">Scoring thresholds</p>
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between"><span>8–11 points</span><span className="font-semibold text-blue-700">Standard rate</span></div>
              <div className="flex justify-between"><span>12+ points</span><span className="font-semibold text-teal-700">Enhanced rate</span></div>
              <div className="flex justify-between"><span>Below 8</span><span className="font-semibold text-stone-400">No award</span></div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 mb-3">
            <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-stone-400 leading-relaxed">
              This is an estimate only. Your actual award depends on your full assessment. {isPartial && `You have ${12 - totalAnswered} questions still to answer.`}
            </p>
          </div>

          {/* CTA */}
          {isPartial && (
            <button
              onClick={() => navigateTo('question_index')}
              className="w-full bg-teal-700 text-white py-3 rounded-xl font-semibold text-sm hover:bg-teal-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Complete all 12 questions for full estimate
            </button>
          )}

          <button
            onClick={() => setExpanded(false)}
            className="w-full mt-2 bg-stone-100 text-stone-600 py-2.5 rounded-xl font-medium text-sm hover:bg-stone-200 active:scale-[0.98] transition-all"
          >
            Close
          </button>
        </div>
      )}
    </section>
  );
}
