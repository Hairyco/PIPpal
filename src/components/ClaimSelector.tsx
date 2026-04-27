import React from 'react';
import {
  PlusCircle,
  FileText,
  Scale,
  RefreshCw,
  ArrowRight,
  ChevronRight } from
'lucide-react';
import { Screen } from './AppContext';
interface ClaimSelectorProps {
  onSelect?: (screen: Screen) => void;
}
export function ClaimSelector({ onSelect }: ClaimSelectorProps) {
  return (
    <section className="px-5 md:px-8 py-6">
      <h2 className="text-lg font-bold text-stone-900 mb-1">
        Where are you in your PIP journey?
      </h2>
      <p className="text-sm text-stone-500 mb-5">
        Whether you're starting fresh or already claiming, we've got you
        covered.
      </p>

      {/* New to PIP */}
      <div className="mb-5">
        <div className="text-[11px] font-bold text-teal-700 uppercase tracking-wider mb-2 px-1">
          New to PIP
        </div>
        <button
          onClick={() => onSelect?.('new_claim_intro')}
          className="w-full flex items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm hover:border-teal-200 hover:shadow-md transition-all active:scale-[0.98]">
          
          <div className="w-11 h-11 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
            <PlusCircle className="w-5 h-5 text-teal-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-stone-900 text-sm">New Claim</h3>
            <p className="text-xs text-stone-500">
              Apply for PIP for the first time
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-300 shrink-0" />
        </button>
      </div>

      {/* Already claiming */}
      <div>
        <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2 px-1">
          Already claiming PIP?
        </div>
        <div className="space-y-2.5 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
          <button
            onClick={() => onSelect?.('home')}
            className="w-full flex items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all active:scale-[0.98]">
            
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
            className="w-full flex items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm hover:border-amber-200 hover:shadow-md transition-all active:scale-[0.98]">
            
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
            className="w-full flex items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm hover:border-purple-200 hover:shadow-md transition-all active:scale-[0.98]">
            
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
      </div>
    </section>);

}