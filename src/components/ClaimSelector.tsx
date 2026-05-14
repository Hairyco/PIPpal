import React from 'react';
import { FileText, Scale, RefreshCw, ChevronRight } from 'lucide-react';
import { Screen } from './AppContext';

interface ClaimSelectorProps {
  onSelect?: (screen: Screen) => void;
}

export function ClaimSelector({ onSelect }: ClaimSelectorProps) {
  return (
    <section className="px-5 md:px-8 py-6">
      <h2 className="text-lg font-bold text-stone-900 mb-1">
        We help existing claimants to
      </h2>
      <p className="text-sm text-stone-500 mb-5">
        Challenge a decision, appeal to tribunal, or update your award — all in one place.
      </p>

      <div className="space-y-2.5 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
        <button
          onClick={() => onSelect?.('home')}
          className="w-full flex items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-stone-900 text-sm">
              Mandatory Reconsideration
            </h3>
            <p className="text-xs text-stone-500">
              Challenge a recent PIP decision
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-300 shrink-0" />
        </button>

        <button
          onClick={() => onSelect?.('appeal')}
          className="w-full flex items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm hover:border-amber-200 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-stone-900 text-sm">
              Appeal a Decision
            </h3>
            <p className="text-xs text-stone-500">
              Take your case to tribunal
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-300 shrink-0" />
        </button>

        <button
          onClick={() => onSelect?.('change_of_circumstances')}
          className="w-full flex items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm hover:border-purple-200 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-stone-900 text-sm">
              Change of Circumstances
            </h3>
            <p className="text-xs text-stone-500">
              Update your existing PIP award
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-300 shrink-0" />
        </button>
      </div>
    </section>
  );
}
