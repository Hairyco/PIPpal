import React, { useState } from 'react';
import {
  ArrowLeft, ArrowRight, Phone, FileText, Info,
  AlertTriangle, Download, ChevronDown, Shield, FileSearch,
  MessageSquare, BookOpen,
} from 'lucide-react';
import { useAppContext } from './AppContext';
import { SAREmailGenerator } from './SAREmailGenerator';
import { DWPCallScript } from './DWPCallScript';
import { ContextualAssistantBar } from './ContextualAssistantBar';

export function ClaimProcess() {
  const { navigateTo, goBack, savedAnswers, hasPaid } = useAppContext();
  const [showTips, setShowTips] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const hasAnswers = Object.keys(savedAnswers).length > 0;
  const hasCompletedClaim = hasPaid && hasAnswers;

  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* Header */}
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">New Claim</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-5">

        {/* Intro */}
        <div className="bg-teal-700 rounded-2xl p-5 text-white">
          <h2 className="text-xl font-bold mb-2">How to start your PIP claim</h2>
          <p className="text-teal-100 text-sm leading-relaxed">
            Here's exactly what happens — step by step. PIPpal helps you prepare your answers so you're confident when the form arrives.
          </p>
          <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-white font-bold text-lg">3.9M</p>
              <p className="text-teal-200 text-[11px]">people claim PIP</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-white font-bold text-lg">6 mo</p>
              <p className="text-teal-200 text-[11px]">typical timeline</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-white font-bold text-lg">Backdated</p>
              <p className="text-teal-200 text-[11px]">to your call date</p>
            </div>
          </div>
        </div>

        {/* Steps — always visible */}
        <div className="space-y-3">

          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-stone-900 text-sm mb-1">Call DWP to open your claim</p>
                <p className="text-xs text-stone-500 leading-relaxed mb-3">
                  This is the most important step — your claim is backdated to today's call. Don't wait until you have everything ready.
                </p>
                <DWPCallScript type="new_claim" />
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-stone-900 text-sm mb-1">PIP2 form arrives by post</p>
                <p className="text-xs text-stone-500 leading-relaxed mb-3">
                  The form takes 2–4 weeks to arrive. Don't wait — start preparing your answers with PIPpal now. You have 1 month to return it.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <a
                    href="https://www.gov.uk/government/publications/personal-independence-payment-claim-form"
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-stone-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Blank PIP2 form
                  </a>
                  <button onClick={() => navigateTo('pip_diary')} className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors">
                    <BookOpen className="w-3.5 h-3.5" />
                    Start PIP Diary
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-stone-900 text-sm mb-1">Assessment — roughly 3 months later</p>
                <p className="text-xs text-stone-500 leading-relaxed mb-3">
                  A health professional asks about your daily life. Can be in person or by phone. Request a telephone assessment if attending would cause distress.
                </p>
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 space-y-2.5">
                  <p className="text-xs text-stone-600 leading-relaxed">
                    <strong>Who carries out your assessment?</strong> A private contractor (such as Capita or Maximus) — not DWP. They write a report, but a <strong>DWP case worker makes the final decision</strong>.
                  </p>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    <strong>You can record it.</strong> Both phone and face-to-face assessments can be audio recorded. Call your assessment provider in advance to arrange this.
                  </p>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    <strong>Watch what you say about your journey.</strong> If you say "I came by bus alone", they'll note you can travel independently. Always explain the effort it took and whether you could do it every day.
                  </p>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    <strong>Getting updates:</strong> After your assessment, call DWP and ask for your assessor reference number. You can also ask to speak to a case manager who can contact the case worker directly.
                  </p>
                  <a href="tel:08001214433" className="inline-flex items-center gap-1.5 bg-white text-stone-700 border border-stone-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-stone-100 transition-colors">
                    <Phone className="w-3 h-3" />
                    0800 121 4433 — DWP enquiry line
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">4</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-stone-900 text-sm mb-1">Decision — 4–8 weeks after assessment</p>
                <p className="text-xs text-stone-500 leading-relaxed mb-3">
                  DWP sends a decision letter. If awarded, payments begin and backpay is sent in one lump sum.
                </p>
                {hasAnswers && (
                  <button onClick={() => navigateTo('downloads')} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    Download assessment prep
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Anxiety / telephone tip */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Have anxiety, depression or agoraphobia?</strong> When you call, ask for a telephone assessment. It's regularly granted for psychological conditions.
          </p>
        </div>

        {/* Awaiting decision — only when claim completed */}
        {hasCompletedClaim && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
            <p className="font-bold text-stone-900 text-sm">While you wait for your decision</p>
            <div className="space-y-2">
              <p className="text-xs text-stone-600 leading-relaxed"><strong>Request your PA4 assessor's report</strong> — this shows exactly what points the contractor recommended before the DWP case worker made their final decision.</p>
              <SAREmailGenerator context="pa4" />
            </div>
            <DWPCallScript type="chasing" />
          </div>
        )}

        {/* Key tips — collapsed */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowTips(!showTips)}
            className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-stone-400" />
              <span className="font-bold text-stone-900 text-sm">Key tips for a strong claim</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${showTips ? 'rotate-180' : ''}`} />
          </button>
          {showTips && (
            <div className="px-4 pb-4 space-y-3 border-t border-stone-100 pt-3">
              {[
                ['Describe your worst days', 'DWP wants to know what you struggle with — not what you can do on a good day.'],
                ['Call as early as possible', 'Your claim is backdated to the date you call, not when you return the form.'],
                ['You have 1 month to return the form', 'Need more time? Call DWP and request an extension — usually granted.'],
                ['Keep copies of everything', 'Take a photo of your completed form before posting it.'],
                ['Supporting evidence helps but is optional', "Don't delay your claim waiting for GP letters."],
              ].map(([title, body], i) => (
                <div key={i} className="flex gap-2.5">
                  <Shield className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-stone-600 leading-relaxed"><strong>{title}</strong> — {body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contacts */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <button onClick={() => setShowContacts(!showContacts)} className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
            <span className="font-bold text-stone-900 text-sm">Useful contacts</span>
            <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${showContacts ? 'rotate-180' : ''}`} />
          </button>
          {showContacts && (
            <div className="px-4 pb-4 space-y-2 border-t border-stone-100 pt-2">
              {[
                ['PIP New Claims', '0800 917 2222', 'tel:08009172222', 'Start your claim here'],
                ['DWP Textphone', '0800 917 7777', 'tel:08009177777', 'For hearing impaired'],
                ['Citizens Advice', '0800 144 8848', 'tel:08001448848', 'Free independent help'],
              ].map(([name, num, tel, desc]) => (
                <a key={num} href={tel} className="flex justify-between items-center bg-stone-50 rounded-xl px-3 py-2.5 hover:bg-stone-100 transition-colors">
                  <div>
                    <p className="text-xs font-semibold text-stone-900">{name}</p>
                    <p className="text-[10px] text-stone-500">{desc}</p>
                  </div>
                  <span className="text-xs font-bold text-teal-600">{num}</span>
                </a>
              ))}
            </div>
          )}
        </div>

      </div>

      <ContextualAssistantBar
        label="Have a question about your claim?"
        sublabel="PIPpal can help you at any stage"
        prompt="I'm starting a new PIP claim and have questions about the process. What should I do?"
      />

      {/* Footer CTA */}
      <div className="p-5 md:px-8 bg-white border-t border-stone-100">
        <button
          onClick={() => navigateTo('descriptors_guide')}
          className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
        >
          Next: What assessors look for
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
