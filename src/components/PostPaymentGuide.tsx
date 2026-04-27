import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  FileText,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Shield } from
'lucide-react';
import { useAppContext } from './AppContext';
export function PostPaymentGuide() {
  const { navigateTo, goBack } = useAppContext();
  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
          
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">Your Claim Journey</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-6">
        {/* Hero */}
        <div className="bg-teal-700 rounded-2xl p-6 text-white shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-6 h-6 text-teal-200" />
            <h2 className="text-xl font-bold">You're all set!</h2>
          </div>
          <p className="text-teal-50 text-sm leading-relaxed">
            Here's your personalised roadmap to completing your PIP claim. We'll
            be with you every step of the way.
          </p>
        </div>

        {/* The Process - Step by Step */}
        <div>
          <div className="space-y-0 relative">
            <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-teal-100" />

            {/* Step 1 */}
            <div className="flex gap-4 items-start relative pb-6">
              <div className="shrink-0 w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center z-10 shadow-sm">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div className="pt-1 flex-1">
                <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">
                  Step 1
                </div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">
                  Call DWP to register your claim
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed mb-2">
                  Call the PIP new claims line to get started. They'll take your
                  basic details and send you the PIP2 form.
                </p>
                <a
                  href="tel:08009172222"
                  className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-teal-100 transition-colors mb-3">
                  
                  <Phone className="w-3.5 h-3.5" />
                  0800 917 2222 — Tap to call
                </a>

                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 mb-3">
                  <p className="text-xs text-blue-800 leading-relaxed">
                    After submitting your form, you'll be invited to an
                    assessment — this can be <strong>in person</strong> or by{' '}
                    <strong>telephone</strong>.
                  </p>
                </div>

                <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-800 leading-relaxed">
                      <strong>Do you have anxiety, PTSD, or similar?</strong>{' '}
                      Ask for a telephone assessment during this call if
                      attending in person would cause you severe distress. This
                      is regularly granted for psychological conditions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start relative pb-6">
              <div className="shrink-0 w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center z-10 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div className="pt-1 flex-1">
                <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">
                  Step 2
                </div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">
                  Complete your PIP questions with PIPpal
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed mb-3">
                  You now have full access to all 12 questions. Work through
                  them at your own pace to build your strongest possible claim.
                </p>
                <button
                  onClick={() => navigateTo('question_index')}
                  className="inline-flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors">
                  
                  Go to Questions
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start relative pb-6">
              <div className="shrink-0 w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center z-10 shadow-sm">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="pt-1 flex-1">
                <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">
                  Step 3
                </div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">
                  When your PIP2 form arrives
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed mb-2">
                  The form takes <strong>2–4 weeks</strong> to arrive by post.
                  Once it does, simply copy your completed PIPpal answers onto
                  the paper form.
                </p>
                <a
                  href="https://www.gov.uk/government/publications/personal-independence-payment-claim-form"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 text-xs font-medium hover:underline">
                  
                  Download a blank PIP2 to practice
                </a>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 items-start relative">
              <div className="shrink-0 w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center z-10 shadow-sm">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div className="pt-1 flex-1">
                <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">
                  Step 4
                </div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">
                  Prepare for your assessment
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Once you've submitted your form, use our Assessment Prep
                  feature to review your answers and feel confident before your
                  consultation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Tip */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-start gap-3">
          <Shield className="w-5 h-5 text-teal-600 shrink-0" />
          <div>
            <h4 className="font-bold text-stone-900 text-sm mb-1">
              Don't delay your call
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Your claim is <strong>backdated to the day you call</strong> — not
              when you return the form. Call as soon as possible to maximize
              your potential backpay.
            </p>
          </div>
        </div>

        {/* Start Your PIP Diary Now */}
        <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 shadow-sm flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <h4 className="font-bold text-indigo-900 text-sm mb-1">
              Insider Tip: Start Your PIP Diary Now
            </h4>
            <p className="text-xs text-indigo-800 leading-relaxed">
              Even before your form arrives, start logging daily challenges.
              Note what you struggled with, what help you needed, and how you
              felt. This becomes powerful evidence for your form AND your
              assessment.
            </p>
          </div>
        </div>

        {/* What to Say on the Call */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-start gap-3">
          <Phone className="w-5 h-5 text-stone-600 shrink-0" />
          <div>
            <h4 className="font-bold text-stone-900 text-sm mb-1">
              What to Say on the Call
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              They'll ask for your NI number, conditions, GP details, and bank
              details. Keep it factual. Don't minimize your conditions. If asked
              "how does it affect you?", describe your worst days.
            </p>
          </div>
        </div>

        {/* Evidence Gathering */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-start gap-3">
          <FileText className="w-5 h-5 text-stone-600 shrink-0" />
          <div>
            <h4 className="font-bold text-stone-900 text-sm mb-1">
              Evidence Gathering
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              While waiting for your form, gather any evidence you already have
              — GP letters, specialist reports, or prescription lists. All
              evidence is optional, so don't delay if you don't have any.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 md:px-8 bg-white border-t border-stone-100 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => navigateTo('question_index')}
          className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
          
          Start Answering Questions
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>);

}