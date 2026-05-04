import React, { useState } from 'react';
import {
  ArrowLeft, RefreshCw, AlertTriangle, Phone, ChevronRight,
  MessageSquare, FileSearch, Info, Calculator, Sparkles, RotateCcw,
} from 'lucide-react';
import { useAppContext } from './AppContext';

export function ChangeOfCircumstancesScreen() {
  const { goBack, navigateTo, hasPaid, savedAnswers } = useAppContext();
  const hasAnswers = Object.keys(savedAnswers).length > 0;

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">Change of Circumstances</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-4">

        {/* Hero */}
        <div className="bg-purple-700 rounded-2xl p-5 text-white">
          <h2 className="text-xl font-bold mb-1">Your condition has changed</h2>
          <p className="text-purple-100 text-sm leading-relaxed">If your condition has got worse or you have a new diagnosis, you can ask DWP to review your award. You could get more money.</p>
        </div>

        {/* Important warning — upfront */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 text-sm mb-1">Your whole award gets reviewed</p>
            <p className="text-xs text-amber-800 leading-relaxed">Reporting a change means DWP looks at everything again — not just what's changed. Your award could go up, stay the same, or go down. <strong>88% of people</strong> who report a change keep their PIP or get more. Only report if your needs have genuinely increased.</p>
          </div>
        </div>

        {/* When to report */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <p className="font-bold text-stone-900 text-sm mb-3">When to report a change</p>
          <div className="space-y-2">
            {[
              'Your condition has got significantly worse',
              'You have been diagnosed with a new condition',
              'You now need more help day-to-day than before',
              'Your medication has changed significantly',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                <span className="text-sm text-stone-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 — get records */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <p className="font-bold text-stone-900 text-sm mb-1">Step 1 — Get your previous records</p>
          <p className="text-xs text-stone-500 leading-relaxed mb-3">Before filling in a new form, request your original PIP2 and assessor report from DWP. This lets you show exactly what has changed since your last assessment.</p>
          <div className="bg-stone-50 rounded-xl p-3 text-xs text-stone-600 leading-relaxed">
            <p className="font-semibold text-stone-700 mb-1">Make a Subject Access Request (SAR)</p>
            <p>Email <strong>dwp.sar@dwp.gov.uk</strong> with your full name, National Insurance number and date of birth. Ask for your PIP2 form and assessor report. They must respond within 1 month.</p>
          </div>
        </div>

        {/* Step 2 — call DWP */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <p className="font-bold text-stone-900 text-sm mb-1">Step 2 — Call DWP to report the change</p>
          <p className="text-xs text-stone-500 leading-relaxed mb-3">Call the PIP enquiry line for existing claims. They'll tell you what happens next — you may receive a new PIP2 form or be booked for a new assessment.</p>
          <a href="tel:08001214433" className="flex items-center justify-center gap-2 w-full bg-purple-50 text-purple-800 py-3 rounded-xl font-bold text-sm hover:bg-purple-100 transition-colors border border-purple-100">
            <Phone className="w-4 h-4" />
            0800 121 4433 — PIP Enquiry Line
          </a>
        </div>

        {/* Step 3 — update answers */}
        <div className="bg-purple-50 rounded-2xl border border-purple-100 p-4">
          <p className="font-bold text-purple-900 text-sm mb-1">Step 3 — Update your answers with PIPpal</p>
          <p className="text-xs text-purple-700 leading-relaxed mb-4">Go through all 12 questions again focused on how things have changed. PIPpal will help you describe the worsening in the language DWP scores against.</p>

          {!hasPaid ? (
            <button onClick={() => navigateTo('upsell')} className="w-full bg-purple-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-purple-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Unlock Full Access to start
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="space-y-2">
              {hasAnswers && (
                <button onClick={() => navigateTo('question_index')} className="w-full bg-purple-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-purple-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Review & update my answers
                </button>
              )}
              <button onClick={() => navigateTo('question_index')} className={`w-full py-3 rounded-xl font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${hasAnswers ? 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50' : 'bg-purple-700 text-white hover:bg-purple-800'}`}>
                <RotateCcw className="w-4 h-4" />
                Start fresh
              </button>
            </div>
          )}
        </div>

        {/* Estimate new award */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-50 rounded-full flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-stone-900 text-sm">Estimate your new award</p>
            <p className="text-xs text-stone-500">See what your updated payments could look like</p>
          </div>
          <button onClick={() => navigateTo('payment_calculator')} className="text-xs font-bold text-purple-700 hover:text-purple-800">
            Open →
          </button>
        </div>

      </div>
    </div>
  );
}
