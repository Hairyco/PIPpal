/**
 * ARCHIVED — Former Change of Circumstances **step 2** UI: choose PIP2 vs AR1.
 * The shipped flow skips this step and fixes `formType` to **pip2** only.
 * Re-enable by restoring `TOTAL_STEPS = 4`, `readStoredCocStep` migration, and the `renderStep` branch.
 *
 * DO NOT IMPORT (kept for reference only).
 */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React from 'react';
import { ArrowRight } from 'lucide-react';

type FormTypePick = 'pip2' | 'ar1';

/** Reference copy of archived step — not wired anywhere */
export function ArchivedCocFormTypePicker({
  formType,
  setFormType,
  onContinue,
}: {
  formType: FormTypePick | null;
  setFormType: (t: FormTypePick) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-4 px-5 pt-5 pb-32">
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setFormType('pip2')}
          className={`w-full text-left rounded-xl border p-3.5 transition-all active:scale-[0.99] ${
            formType === 'pip2'
              ? 'border-teal-500 bg-teal-50/90 shadow-[0_0_0_1px_rgba(20,184,166,0.15)]'
              : 'border-stone-200/90 bg-white hover:border-stone-300 hover:bg-stone-50/80'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-4 h-4 rounded-full border-[1.5px] shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                formType === 'pip2' ? 'border-teal-500 bg-teal-500' : 'border-stone-300 bg-white'
              }`}
            >
              {formType === 'pip2' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-stone-900 text-sm">PIP2 form</span>
                <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800">
                  Full reassessment
                </span>
              </div>
              <p className="text-[13px] text-stone-600 leading-snug">
                The main form covering all activities — including after you&apos;ve told DWP your circumstances changed.
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFormType('ar1')}
          className={`w-full text-left rounded-xl border p-3.5 transition-all active:scale-[0.99] ${
            formType === 'ar1'
              ? 'border-teal-500 bg-teal-50/90 shadow-[0_0_0_1px_rgba(20,184,166,0.15)]'
              : 'border-stone-200/90 bg-white hover:border-stone-300 hover:bg-stone-50/80'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-4 h-4 rounded-full border-[1.5px] shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                formType === 'ar1' ? 'border-teal-500 bg-teal-500' : 'border-stone-300 bg-white'
              }`}
            >
              {formType === 'ar1' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-stone-900 text-sm">AR1 review form</span>
                <span className="text-[9px] font-semibold leading-tight px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800">
                  Change of circumstances
                </span>
              </div>
              <p className="text-[13px] text-stone-600 leading-snug">
                Shorter mid-award review — focus on what&apos;s <span className="font-medium text-stone-800">changed</span>, not your whole story again.
              </p>
            </div>
          </div>
        </button>
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!formType}
        className="w-full py-3.5 rounded-xl font-bold text-sm bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-40"
      >
        Continue <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
