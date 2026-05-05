import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, CheckCircle2, Circle, Info, ChevronRight } from 'lucide-react';
import { useAppContext } from './AppContext';
import { PIP_QUESTIONS } from '../pipQuestions';

function getPointsForAnswer(questionId: string, answerStr: string): number {
  const q = PIP_QUESTIONS.find(q => q.id === questionId);
  if (!q) return 0;
  const match = answerStr?.match(/Descriptor\s+([A-Z])/i);
  if (!match) return 0;
  const code = match[1].toUpperCase();
  const descriptor = q.descriptors.find(d => d.code === code);
  return descriptor?.points ?? 0;
}

const DAILY_LIVING_QUESTIONS = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'];
const MOBILITY_QUESTIONS = ['q11','q12'];
const ALL_QUESTIONS = [...DAILY_LIVING_QUESTIONS, ...MOBILITY_QUESTIONS];

function getAwardLevel(points: number, type: 'daily' | 'mobility') {
  if (type === 'daily') {
    if (points >= 12) return { label: 'Enhanced', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' };
    if (points >= 8)  return { label: 'Standard', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
    return { label: 'Below threshold', color: 'text-stone-400', bg: 'bg-stone-50', border: 'border-stone-100' };
  } else {
    if (points >= 12) return { label: 'Enhanced', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' };
    if (points >= 8)  return { label: 'Standard', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
    return { label: 'Below threshold', color: 'text-stone-400', bg: 'bg-stone-50', border: 'border-stone-100' };
  }
}

const RATES = { dailyStandard: 73.90, dailyEnhanced: 110.40, mobilityStandard: 29.20, mobilityEnhanced: 77.05 };

function pointsColor(pts: number) {
  if (pts === 0) return 'text-stone-400';
  if (pts >= 8)  return 'text-teal-600';
  if (pts >= 4)  return 'text-blue-600';
  return 'text-amber-600';
}

export function PIPPointsEstimator() {
  const { savedAnswers, navigateTo, hasPaid, setSelectedQuestionId } = useAppContext();
  const [expanded, setExpanded] = useState(false);

  const answeredIds = Object.keys(savedAnswers);
  const totalAnswered = answeredIds.length;

  if (!hasPaid && totalAnswered === 0) return null;

  const dailyPoints = DAILY_LIVING_QUESTIONS.reduce((sum, id) =>
    sum + (savedAnswers[id] ? getPointsForAnswer(id, savedAnswers[id]) : 0), 0);
  const mobilityPoints = MOBILITY_QUESTIONS.reduce((sum, id) =>
    sum + (savedAnswers[id] ? getPointsForAnswer(id, savedAnswers[id]) : 0), 0);

  const dailyAward = getAwardLevel(dailyPoints, 'daily');
  const mobilityAward = getAwardLevel(mobilityPoints, 'mobility');

  let weeklyEstimate = 0;
  if (dailyPoints >= 12) weeklyEstimate += RATES.dailyEnhanced;
  else if (dailyPoints >= 8) weeklyEstimate += RATES.dailyStandard;
  if (mobilityPoints >= 12) weeklyEstimate += RATES.mobilityEnhanced;
  else if (mobilityPoints >= 8) weeklyEstimate += RATES.mobilityStandard;

  const annualEstimate = weeklyEstimate * 52;
  const hasAnyAward = weeklyEstimate > 0;
  const isComplete = totalAnswered === 12;
  const nextUnanswered = ALL_QUESTIONS.find(id => !savedAnswers[id]);

  if (hasPaid && totalAnswered === 0) {
    return (
      <section>
        <button onClick={() => navigateTo('question_index')}
          className="w-full bg-white rounded-2xl border border-stone-100 shadow-sm hover:border-teal-200 hover:shadow-md transition-all active:scale-[0.98] px-4 py-4 text-left flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp style={{ width: 18, height: 18 }} className="text-teal-700" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-stone-900 text-sm">Your Points Estimate</h3>
            <p className="text-xs text-stone-500 mt-0.5">Answer your questions to see your estimated award</p>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
        </button>
      </section>
    );
  }

  return (
    <section>
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">

        {/* Header */}
        <button onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-between px-4 pt-4 pb-3 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
              <TrendingUp style={{ width: 16, height: 16 }} className="text-teal-700" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Your Points Estimate</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {totalAnswered}/12 answered{hasAnyAward && ` · £${weeklyEstimate.toFixed(2)}/wk estimated`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isComplete && nextUnanswered && (
              <button onClick={(e) => { e.stopPropagation(); setSelectedQuestionId(nextUnanswered); navigateTo('q1_intro'); }}
                className="text-[11px] font-bold text-white bg-teal-700 hover:bg-teal-800 px-3 py-1.5 rounded-full transition-colors active:scale-95">
                Continue
              </button>
            )}
            {expanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </div>
        </button>

        {/* Score summary — always visible */}
        <div className="px-4 pb-4 grid grid-cols-2 gap-2">
          <div className={`rounded-xl px-3 py-2.5 border ${dailyAward.bg} ${dailyAward.border}`}>
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wide mb-0.5">Daily Living</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-black ${dailyAward.color}`}>{dailyPoints}</span>
              <span className="text-[10px] text-stone-400 font-medium">pts · need 8+</span>
            </div>
            <p className={`text-[10px] font-semibold ${dailyAward.color} mt-0.5`}>{dailyAward.label}</p>
          </div>
          <div className={`rounded-xl px-3 py-2.5 border ${mobilityAward.bg} ${mobilityAward.border}`}>
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wide mb-0.5">Mobility</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-black ${mobilityAward.color}`}>{mobilityPoints}</span>
              <span className="text-[10px] text-stone-400 font-medium">pts · need 8+</span>
            </div>
            <p className={`text-[10px] font-semibold ${mobilityAward.color} mt-0.5`}>{mobilityAward.label}</p>
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="border-t border-stone-100 px-4 pt-4 pb-4 space-y-4">

            {/* Daily Living question list */}
            <div>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Daily Living — 10 activities</p>
              <div className="space-y-0.5">
                {DAILY_LIVING_QUESTIONS.map(id => {
                  const q = PIP_QUESTIONS.find(q => q.id === id);
                  if (!q) return null;
                  const answered = !!savedAnswers[id];
                  const pts = answered ? getPointsForAnswer(id, savedAnswers[id]) : null;
                  return (
                    <button key={id}
                      onClick={() => { setSelectedQuestionId(id); navigateTo(answered ? 'q1_result' : 'q1_intro'); }}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-stone-50 active:scale-[0.98] transition-all text-left group">
                      {answered
                        ? <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                        : <Circle className="w-4 h-4 text-stone-200 shrink-0" />
                      }
                      <span className={`flex-1 text-xs leading-snug ${answered ? 'text-stone-700 font-medium' : 'text-stone-400'}`}>
                        {q.shortTitle}
                      </span>
                      {pts !== null
                        ? <span className={`text-xs font-bold shrink-0 ${pointsColor(pts)}`}>{pts}pts</span>
                        : <ChevronRight className="w-3.5 h-3.5 text-stone-200 group-hover:text-teal-400 transition-colors shrink-0" />
                      }
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobility question list */}
            <div>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Mobility — 2 activities</p>
              <div className="space-y-0.5">
                {MOBILITY_QUESTIONS.map(id => {
                  const q = PIP_QUESTIONS.find(q => q.id === id);
                  if (!q) return null;
                  const answered = !!savedAnswers[id];
                  const pts = answered ? getPointsForAnswer(id, savedAnswers[id]) : null;
                  return (
                    <button key={id}
                      onClick={() => { setSelectedQuestionId(id); navigateTo(answered ? 'q1_result' : 'q1_intro'); }}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-stone-50 active:scale-[0.98] transition-all text-left group">
                      {answered
                        ? <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                        : <Circle className="w-4 h-4 text-stone-200 shrink-0" />
                      }
                      <span className={`flex-1 text-xs leading-snug ${answered ? 'text-stone-700 font-medium' : 'text-stone-400'}`}>
                        {q.shortTitle}
                      </span>
                      {pts !== null
                        ? <span className={`text-xs font-bold shrink-0 ${pointsColor(pts)}`}>{pts}pts</span>
                        : <ChevronRight className="w-3.5 h-3.5 text-stone-200 group-hover:text-teal-400 transition-colors shrink-0" />
                      }
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment estimate */}
            {hasAnyAward && (
              <div className="bg-teal-700 rounded-xl p-4 text-white">
                <p className="text-[10px] text-teal-200 font-bold uppercase tracking-wide mb-2">Estimated payment (2025/26 rates)</p>
                <div className="flex items-baseline gap-1 mb-0.5">
                  <span className="text-2xl font-black">£{weeklyEstimate.toFixed(2)}</span>
                  <span className="text-teal-300 text-xs">per week</span>
                </div>
                <p className="text-teal-200 text-xs font-semibold">~£{annualEstimate.toLocaleString('en-GB', { maximumFractionDigits: 0 })} per year · tax-free</p>
                <div className="mt-3 pt-3 border-t border-teal-600 space-y-1">
                  {dailyPoints >= 8 && <p className="text-[11px] text-teal-200">Daily Living ({dailyPoints >= 12 ? 'Enhanced' : 'Standard'}): £{dailyPoints >= 12 ? RATES.dailyEnhanced.toFixed(2) : RATES.dailyStandard.toFixed(2)}/wk</p>}
                  {mobilityPoints >= 8 && <p className="text-[11px] text-teal-200">Mobility ({mobilityPoints >= 12 ? 'Enhanced' : 'Standard'}): £{mobilityPoints >= 12 ? RATES.mobilityEnhanced.toFixed(2) : RATES.mobilityStandard.toFixed(2)}/wk</p>}
                </div>
              </div>
            )}

            {/* Thresholds */}
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide mb-2">Scoring thresholds</p>
              <div className="space-y-1 text-xs text-stone-600">
                <div className="flex justify-between"><span>8–11 points</span><span className="font-semibold text-blue-700">Standard rate</span></div>
                <div className="flex justify-between"><span>12+ points</span><span className="font-semibold text-teal-700">Enhanced rate</span></div>
                <div className="flex justify-between"><span>Below 8</span><span className="font-semibold text-stone-400">No award</span></div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-stone-300 shrink-0 mt-0.5" />
              <p className="text-[10px] text-stone-400 leading-relaxed">Estimate only. Actual award depends on your full assessment.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
