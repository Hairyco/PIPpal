import React, { Component } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Menu,
  Info,
  Award,
  TrendingUp } from
'lucide-react';
import { useAppContext } from './AppContext';
const dailyLivingDescriptors = [
{
  activity: 'Preparing food',
  maxPts: 8
},
{
  activity: 'Eating and drinking',
  maxPts: 10
},
{
  activity: 'Managing treatments',
  maxPts: 8
},
{
  activity: 'Washing and bathing',
  maxPts: 8
},
{
  activity: 'Managing toilet needs',
  maxPts: 8
},
{
  activity: 'Dressing and undressing',
  maxPts: 8
},
{
  activity: 'Communicating',
  maxPts: 12
},
{
  activity: 'Reading and understanding',
  maxPts: 8
},
{
  activity: 'Mixing with other people',
  maxPts: 8
},
{
  activity: 'Managing money',
  maxPts: 6
}];

const mobilityDescriptors = [
{
  activity: 'Planning and following journeys',
  maxPts: 12
},
{
  activity: 'Moving around',
  maxPts: 12
}];

export function ScoringCriteria() {
  const { navigateTo, goBack } = useAppContext();
  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
          
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">Scoring Criteria</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {/* Intro */}
        <div>
          <h2 className="text-xl font-bold text-stone-900 leading-tight mb-2">
            How PIP points add up
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Your PIP award depends on how many points you score across two
            components: <strong>Daily Living</strong> and{' '}
            <strong>Mobility</strong>. Each is scored separately, so you could
            qualify for one, both, or neither.
          </p>
        </div>

        {/* Thresholds */}
        <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-teal-700" />
            <h3 className="font-bold text-teal-900 text-sm">
              Point thresholds
            </h3>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4">
              <div className="text-[10px] text-stone-500 uppercase tracking-wider font-medium mb-2">
                Daily Living Component
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">No award</span>
                  <span className="font-bold text-stone-400">0–7 points</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-800 font-medium">
                      Standard rate
                    </span>
                    <span className="text-stone-500 ml-1.5">£77.65/week</span>
                  </div>
                  <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    8–11 points
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-800 font-medium">
                      Enhanced rate
                    </span>
                    <span className="text-stone-500 ml-1.5">£116.05/week</span>
                  </div>
                  <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    12+ points
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4">
              <div className="text-[10px] text-stone-500 uppercase tracking-wider font-medium mb-2">
                Mobility Component
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">No award</span>
                  <span className="font-bold text-stone-400">0–7 points</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-800 font-medium">
                      Standard rate
                    </span>
                    <span className="text-stone-500 ml-1.5">£30.70/week</span>
                  </div>
                  <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    8–11 points
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-800 font-medium">
                      Enhanced rate
                    </span>
                    <span className="text-stone-500 ml-1.5">£81.00/week</span>
                  </div>
                  <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    12+ points
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Max points per activity */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-stone-600" />
              <h3 className="font-bold text-stone-900 text-sm">
                Maximum points per activity
              </h3>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">
              Only the highest-scoring descriptor from each activity counts
            </p>
          </div>

          <div className="divide-y divide-stone-50">
            <div className="px-4 py-2 bg-stone-50">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Daily Living
              </span>
            </div>
            {dailyLivingDescriptors.map((d, i) =>
            <div
              key={i}
              className="px-4 py-2.5 flex items-center justify-between">
              
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 bg-teal-50 rounded-full flex items-center justify-center text-[9px] font-bold text-teal-700">
                    {i + 1}
                  </span>
                  <span className="text-xs text-stone-700">{d.activity}</span>
                </div>
                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
                  max {d.maxPts}pts
                </span>
              </div>
            )}

            <div className="px-4 py-2 bg-stone-50">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Mobility
              </span>
            </div>
            {mobilityDescriptors.map((d, i) =>
            <div
              key={i}
              className="px-4 py-2.5 flex items-center justify-between">
              
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 bg-teal-50 rounded-full flex items-center justify-center text-[9px] font-bold text-teal-700">
                    {i + 11}
                  </span>
                  <span className="text-xs text-stone-700">{d.activity}</span>
                </div>
                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
                  max {d.maxPts}pts
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Reminder callout */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-1.5 rounded-lg shrink-0 mt-0.5">
              <Menu className="w-3.5 h-3.5 text-blue-700" />
            </div>
            <div>
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>You can always come back to this.</strong> Tap the menu
                icon in the top right corner of the chatbot at any time to
                review the scoring criteria while you're answering questions.
              </p>
            </div>
          </div>
        </div>

        {/* Key reminder */}
        <div className="bg-stone-100 rounded-2xl p-4">
          <p className="text-xs text-stone-700 leading-relaxed text-center">
            <strong>Remember:</strong> You don't need to score on every
            activity. Just enough points in either component to reach the
            threshold. PIPpal will help you identify where your strongest
            scoring areas are.
          </p>
        </div>
      </div>

      <div className="p-5 bg-white border-t border-stone-100">
        <button
          onClick={() => navigateTo('medical_profile')}
          className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
          
          Next: Your Medical Profile
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>);

}