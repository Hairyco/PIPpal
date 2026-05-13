import React from 'react';
import { BarChart3 } from 'lucide-react';

/** DWP outcome context — kept off the hero; sits lower on the landing page */
export function LandingDwpContext() {
  return (
    <section className="px-5 md:px-8 py-6 max-w-4xl mx-auto">
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 md:p-6 text-left shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4 text-teal-700" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider mb-1.5">Why strong applications matter</p>
            <p className="text-sm text-stone-700 leading-relaxed">
              DWP statistics indicate that <span className="font-semibold text-stone-900">over half</span> of PIP applications are
              rejected. For the quarter ending January 2026, only <span className="font-semibold text-stone-900">35%</span> of new
              claims received an award — a decrease from <span className="font-semibold text-stone-900">43%</span> a year earlier.
              That high rate of unsuccessful outcomes shows why clear application support matters — and why we built PIPpal to help
              you put your case clearly.
            </p>
            <p className="text-[11px] text-stone-500 mt-2.5 leading-relaxed">
              Official figures change each quarter; see the latest DWP statistical summaries on{' '}
              <a
                href="https://www.gov.uk/government/collections/personal-independence-payment-statistics"
                className="text-teal-700 font-semibold hover:text-teal-800 underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                gov.uk
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
