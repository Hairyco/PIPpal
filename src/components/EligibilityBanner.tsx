import React from 'react';
import { ClipboardCheck, ArrowRight, Sparkles, Info } from 'lucide-react';
interface EligibilityBannerProps {
  onStart: () => void;
}
export function EligibilityBanner({ onStart }: EligibilityBannerProps) {
  return (
    <section id="eligibility-banner" className="px-5 md:px-8 py-6">
      <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-teal-100 rounded-full opacity-40" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h2 className="font-bold text-teal-900 text-base">
                Am I eligible for PIP?
              </h2>
              <p className="text-xs text-teal-700">
                Free · 2 minutes · No sign-up
              </p>
            </div>
          </div>

          <div className="bg-teal-100/60 rounded-lg px-3 py-2 mb-3 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
            <p className="text-xs text-teal-800 leading-relaxed">
              Over <strong>30,000 people</strong> apply for PIP every month —
              many more are eligible and don't know it.
            </p>
          </div>

          <p className="text-sm text-teal-800 leading-relaxed mb-4">
            Answer 8 simple questions and we'll tell you whether you're likely
            to qualify. <strong>Over 3.9 million people</strong> currently claim
            PIP — many more are eligible and don't realise.
          </p>

          <button
            onClick={onStart}
            className="w-full bg-teal-700 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm">
            
            <Sparkles className="w-4 h-4" />
            Take the Quick Assessment
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>);

}