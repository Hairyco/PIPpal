import React from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useAppContext } from './AppContext';

export function DescriptorsGuide() {
  const { goBack } = useAppContext();

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">What are Descriptors?</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 md:px-8 py-6 space-y-5 pb-10">

        <div className="bg-teal-700 rounded-2xl p-5 text-white">
          <h2 className="font-bold text-lg mb-2">How DWP scores your PIP claim</h2>
          <p className="text-teal-100 text-sm leading-relaxed">Descriptors are the official statements DWP uses to decide how many points you score on each activity. Your total points determine whether you get PIP and at which rate.</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm space-y-3">
          <h3 className="font-bold text-stone-900">How it works</h3>
          <p className="text-sm text-stone-600 leading-relaxed">Each of the 12 PIP activities has a set of descriptors — statements describing different levels of difficulty. Each descriptor carries a points value. DWP picks the descriptor that best matches your ability and awards those points.</p>
          <p className="text-sm text-stone-600 leading-relaxed">Points from all 12 activities are totalled separately for Daily Living (activities 1–10) and Mobility (activities 11–12).</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-900 mb-4">Scoring thresholds</h3>
          <div className="space-y-2">
            {[
              { range: '0–7 points', label: 'No award', bg: 'bg-stone-50', text: 'text-stone-500', border: 'border-stone-200' },
              { range: '8–11 points', label: 'Standard rate', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
              { range: '12+ points', label: 'Enhanced rate', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
            ].map(t => (
              <div key={t.range} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${t.bg} ${t.border}`}>
                <span className={`text-sm font-semibold ${t.text}`}>{t.range}</span>
                <span className={`text-sm font-bold ${t.text}`}>{t.label}</span>
              </div>
            ))}
            <p className="text-xs text-stone-400 pt-1">Thresholds apply separately to Daily Living and Mobility.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-900 mb-4">2025/26 weekly rates</h3>
          <div className="space-y-2">
            {[
              { label: 'Daily Living — Standard', amount: '£73.90' },
              { label: 'Daily Living — Enhanced', amount: '£110.40' },
              { label: 'Mobility — Standard', amount: '£29.20' },
              { label: 'Mobility — Enhanced', amount: '£77.05' },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                <span className="text-sm text-stone-600">{r.label}</span>
                <span className="font-bold text-stone-900 text-sm">{r.amount}/wk</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <h3 className="font-bold text-amber-900 mb-2">The SAFES rule</h3>
          <p className="text-sm text-amber-800 leading-relaxed mb-2">DWP must consider whether you can complete each activity <strong>Safely, to an Acceptable standard, Frequently enough, in Enough time, and Sustainably</strong>. Fail any one of these and you cannot be scored as reliably able to do it.</p>
          <p className="text-xs text-amber-700 font-semibold">Always think about your worst days, not your best.</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-900 mb-3">Tips for choosing the right descriptor</h3>
          <ul className="space-y-2.5 text-sm text-stone-600 leading-relaxed">
            {[
              'Think about your worst days — PIP is assessed on how you are on the majority of days, not just good ones.',
              'Aids and adaptations count — walking sticks, grab rails, special equipment all affect which descriptor applies.',
              'Supervision and prompting counts — if someone needs to watch you or remind you, that is scored.',
              'Time matters — taking significantly longer than someone without your condition is relevant.',
              'Pain and fatigue count — completing an activity causing significant pain means you cannot do it reliably.',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{i + 1}</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <a href="https://www.gov.uk/pip/how-youre-assessed" target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-between bg-white rounded-2xl px-4 py-3.5 border border-stone-100 shadow-sm hover:border-teal-200 active:scale-[0.98] transition-all">
          <span className="text-sm font-semibold text-stone-700">Official GOV.UK PIP assessment guide</span>
          <ExternalLink className="w-4 h-4 text-stone-400 shrink-0" />
        </a>

      </div>
    </div>
  );
}
