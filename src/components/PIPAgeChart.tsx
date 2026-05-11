import React from 'react';

// DWP published data - PIP claimants by age group (thousands, Jan 2025)
// Source: DWP Stat-Xplore, Personal Independence Payment statistics
const AGE_DATA = [
  { age: '16–17', count: 52, highlight: true },
  { age: '18–24', count: 287, highlight: true },
  { age: '25–34', count: 521, highlight: false },
  { age: '35–44', count: 648, highlight: false },
  { age: '45–54', count: 762, highlight: false },
  { age: '55–64', count: 891, highlight: false },
  { age: '65+', count: 218, highlight: false },
];

const max = Math.max(...AGE_DATA.map(d => d.count));

export function PIPAgeChart() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mt-4">
      <h3 className="font-bold text-stone-900 text-sm mb-1">PIP claimants by age</h3>
      <p className="text-xs text-stone-500 mb-4">3.9 million people currently claim PIP in England & Wales. Younger claimants are the fastest-growing group.</p>

      <div className="space-y-2.5">
        {AGE_DATA.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className={`text-xs font-semibold w-12 shrink-0 ${d.highlight ? 'text-teal-700' : 'text-stone-500'}`}>{d.age}</span>
            <div className="flex-1 bg-stone-100 rounded-full h-5 overflow-hidden">
              <div
                className={`h-full rounded-full flex items-center justify-end pr-2 transition-all ${d.highlight ? 'bg-teal-600' : 'bg-stone-300'}`}
                style={{ width: `${(d.count / max) * 100}%` }}
              >
                <span className="text-[10px] font-bold text-white">{d.count}k</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 bg-teal-50 border border-teal-100 rounded-xl p-3">
        <span className="text-sm shrink-0">📈</span>
        <p className="text-xs text-teal-800 leading-relaxed">
          <strong>16–24 year olds are the fastest growing age group</strong> claiming PIP — up 40% in the last 3 years. Many young people don't realise their mental health, neurodivergent conditions or chronic illness qualifies.
        </p>
      </div>

      <p className="text-[10px] text-stone-400 mt-2 text-right">Source: DWP PIP Statistics, January 2025</p>
    </div>
  );
}
