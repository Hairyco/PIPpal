import React from 'react';
import { AlertCircle, ArrowRight, FileText, Scale } from 'lucide-react';
import { Screen } from './AppContext';

interface LandingDeclinedSectionProps {
  onSelect?: (screen: Screen) => void;
}

export function LandingDeclinedSection({ onSelect }: LandingDeclinedSectionProps) {
  return (
    <section id="got-declined" className="px-5 md:px-8 py-8 scroll-mt-20">
      <div className="max-w-3xl mx-auto">
        <div className="bg-amber-50 rounded-3xl border border-amber-100 p-5 md:p-7 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 leading-tight mb-1.5">
                Got declined?
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                A refusal doesn&apos;t always mean you don&apos;t qualify. Many people are turned down
                because of how their form was worded — not because they aren&apos;t eligible.
              </p>
            </div>
          </div>

          <p className="text-sm text-amber-900/90 leading-relaxed bg-white/70 rounded-2xl border border-amber-100/80 px-4 py-3 mb-5">
            <strong className="font-semibold text-amber-950">Around 60% of refused claims are overturned on appeal.</strong>{' '}
            You can ask DWP to look again, or take your case to an independent tribunal — and PIPpal
            helps you build the evidence and wording you need at each step.
          </p>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onSelect?.('home')}
              className="w-full flex items-center gap-3 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all active:scale-[0.98] text-left"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-900 text-sm">Mandatory Reconsideration</h3>
                <p className="text-xs text-stone-500 leading-relaxed mt-0.5">
                  Ask DWP to review their decision first
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-300 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onSelect?.('appeal')}
              className="w-full flex items-center gap-3 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm hover:border-amber-200 hover:shadow-md transition-all active:scale-[0.98] text-left"
            >
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-900 text-sm">Appeal to tribunal</h3>
                <p className="text-xs text-stone-500 leading-relaxed mt-0.5">
                  Take your case to an independent panel
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-300 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
