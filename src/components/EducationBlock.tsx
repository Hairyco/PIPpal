import React from 'react';
import { Info, ArrowRight } from 'lucide-react';
interface EducationBlockProps {
  onCheckEligibility?: () => void;
}
export function EducationBlock({ onCheckEligibility }: EducationBlockProps) {
  return (
    <section className="px-5 md:px-8 py-4">
      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-100 rounded-full opacity-50" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-amber-700" />
            <h2 className="font-bold text-amber-900">Did You Know?</h2>
          </div>

          <p className="text-sm text-amber-800 leading-relaxed mb-3">
            Over <strong>30,000 people</strong> apply for PIP every month — but
            many more are eligible and don't even know it.
          </p>

          <p className="text-sm text-amber-800/90 leading-relaxed mb-4">
            PIP is available for anyone with a long-term health condition or
            disability that affects daily life.
          </p>

          <button
            onClick={onCheckEligibility}
            className="text-amber-700 font-semibold text-sm flex items-center gap-1 hover:text-amber-900 transition-colors">
            
            Check if you're eligible
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>);

}