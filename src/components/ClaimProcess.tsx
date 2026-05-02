import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  FileText,
  Clock,
  Calendar,
  AlertTriangle,
  Download,
  ChevronDown,
  ChevronUp,
  Info,
  Shield,
  FileSearch,
  Upload,
  MessageSquare,
  Calculator,
  Coins,
  BookOpen,
  TrendingUp,
  Users } from
'lucide-react';
import { useAppContext } from './AppContext';
export function ClaimProcess() {
  const { navigateTo, goBack, savedAnswers, hasPaid } = useAppContext();
  const [showProcess, setShowProcess] = React.useState(false);
  const [showContacts, setShowContacts] = React.useState(false);
  const [showTips, setShowTips] = useState(false);
  const hasAnswers = Object.keys(savedAnswers).length > 0;
  const hasCompletedClaim = hasPaid && hasAnswers;
  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
          
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">How It Works</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-6">
        {/* Hero */}
        <div className="bg-teal-700 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-3">How to start your claim</h2>
          <p className="text-teal-50 text-sm leading-relaxed">
            Here's exactly what happens when you apply for PIP — step by step.
            We'll help you prepare your answers so you're ready when the form
            arrives.
          </p>
        </div>



        {/* Stats Banner */}
        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
              Key Facts
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
              <p className="text-xs text-indigo-800 leading-relaxed">
                <strong>3.9M</strong> people currently claim PIP in the UK
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
              <p className="text-xs text-indigo-800 leading-relaxed">
                Well-prepared claims are{' '}
                <strong>significantly more likely</strong> to succeed
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
              <p className="text-xs text-indigo-800 leading-relaxed">
                Claims are <strong>backdated</strong> to your call date — some people receive £3,000–£10,000+ in one go
              </p>
            </div>
          </div>
        </div>

        {/* The Process - Step by Step */}
        <div>
          <button onClick={() => setShowProcess(!showProcess)} className="w-full flex items-center justify-between py-3 px-4 bg-white rounded-2xl border border-stone-100 shadow-sm hover:border-teal-200 transition-colors mb-3">
            <h3 className="font-bold text-stone-900 text-sm">How the process works</h3>
            <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${showProcess ? 'rotate-180' : ''}`} />
          </button>
          {showProcess && (
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
                  Call DWP to start your claim
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed mb-2">
                  Call the PIP new claims line. They'll take your details and
                  send you a <strong>PIP2 form</strong> by post — this is the
                  main paper-based form where you describe how your condition
                  affects you. It <strong>must be completed by hand</strong>.
                </p>
                <a
                  href="tel:08009172222"
                  className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-teal-100 transition-colors">
                  
                  <Phone className="w-3.5 h-3.5" />
                  0800 917 2222 — Tap to call
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start relative pb-6">
              <div className="shrink-0 w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center z-10 shadow-sm">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="pt-1 flex-1">
                <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">
                  Step 2
                </div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">
                  Receive & complete your PIP2 form
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed mb-2">
                  The form takes <strong>2–4 weeks</strong> to arrive by post.
                  But don't wait —{' '}
                  <strong>start preparing your answers now</strong> with PIPpal.
                  When the form arrives, you'll be ready to fill it in straight
                  away and send it back.
                </p>
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <div className="flex items-start gap-2">
                    <Download className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <strong>We provide your answers ready to copy</strong>{' '}
                      onto the handwritten form. You can also download a blank
                      PIP2 to practise with.
                    </p>
                  </div>
                  <a
                    href="https://www.gov.uk/government/publications/personal-independence-payment-claim-form"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 bg-amber-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-amber-700 active:scale-95 transition-all">
                    
                    <Download className="w-3.5 h-3.5" />
                    Download blank PIP2 form
                  </a>
                </div>

                <div className="mt-3 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      <strong>Start your PIP Diary now</strong> — log how your
                      condition affects you each day. Daily entries provide
                      powerful evidence for your claim and are invaluable if you
                      need to appeal.
                    </p>
                  </div>
                  <button
                    onClick={() => navigateTo('pip_diary')}
                    className="mt-3 inline-flex items-center gap-2 bg-emerald-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-700 active:scale-95 transition-all">
                    
                    <BookOpen className="w-3.5 h-3.5" />
                    Open PIP Diary
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start relative pb-6">
              <div className="shrink-0 w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center z-10 shadow-sm">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div className="pt-1 flex-1">
                <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">
                  Step 3
                </div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">
                  Wait for your assessment date
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Once DWP receives your completed form, they'll arrange an
                  assessment. This is usually <strong>around 3 months</strong>{' '}
                  from the date they receive it. The assessment can be{' '}
                  <strong>in person</strong> or by <strong>telephone</strong>.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 items-start relative">
              <div className="shrink-0 w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center z-10 shadow-sm">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="pt-1 flex-1">
                <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">
                  Step 4
                </div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">
                  Attend your assessment
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed mb-2">
                  A health professional will ask about how your condition
                  affects you day-to-day. After the assessment, DWP will make a
                  decision — usually within <strong>4–8 weeks</strong>.
                </p>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Once you've completed your answers in PIPpal, you'll be
                      able to{' '}
                      <strong>download your Assessment Prep document</strong> —
                      a question-by-question summary of all your answers, ready
                      to review before your assessment so you feel confident and
                      prepared.
                    </p>
                  </div>
                  {hasAnswers &&
                  <button
                    onClick={() => navigateTo('downloads')}
                    className="mt-3 inline-flex items-center gap-2 bg-blue-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all">
                    
                      <Download className="w-3.5 h-3.5" />
                      Download Assessment Prep
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Telephone Assessment Note */}
        <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h4 className="font-bold text-rose-900 text-sm mb-1">
                Have anxiety, depression, or agoraphobia or similar?
              </h4>
              <p className="text-xs text-rose-800 leading-relaxed">
                When you make the initial call,{' '}
                <strong>ask for a telephone assessment</strong>. If attending in
                person would cause you severe distress, you have the right to
                request this. It's at the assessor's discretion but is{' '}
                <strong>regularly granted</strong> for psychological conditions.
                You can also optionally ask your GP to write a supporting
                letter.
              </p>
            </div>
          </div>
        </div>

        {/* Awaiting Your Decision - only shows when claim is completed */}
        {hasCompletedClaim &&
        <div className="space-y-4">
            <div className="bg-indigo-700 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-lg">Awaiting your decision</h3>
              </div>
              <p className="text-indigo-100 text-sm leading-relaxed">
                Had your assessment? Here's what you can do while you wait for
                DWP's decision.
              </p>
            </div>

            {/* Request Assessor's Report */}
            <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
                  <FileSearch className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm mb-1">
                    Request your assessor's report
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    As soon as your assessment is finished, you can make a{' '}
                    <strong>Subject Access Request (SAR)</strong> to get a copy
                    of the assessor's report. This shows exactly what the
                    assessor recorded and the points they recommended for each
                    activity.
                  </p>
                </div>
              </div>
              <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                <p className="text-xs text-indigo-800 leading-relaxed">
                  <strong>How to request it:</strong> Call the PIP enquiry line
                  and ask for a copy of your assessment report under a Subject
                  Access Request. They must provide it within{' '}
                  <strong>1 month</strong> by law. You can also write to them —
                  search "DWP Subject Access Request" on GOV.UK for the address.
                </p>
              </div>
            </div>

            {/* Estimate Your Points */}
            <div className="bg-white rounded-2xl p-4 border border-indigo-200 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm mb-1">
                    Estimate your points from the report
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Once you have your assessor's report, you can input the
                    descriptors they've recommended — or upload screenshots of
                    the report — and we'll calculate your estimated points score
                    and likely award.
                  </p>
                </div>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>This helps you prepare.</strong> If the assessor's
                    recommended points are lower than expected, you'll know
                    early and can start gathering evidence for a Mandatory
                    Reconsideration before the decision letter even arrives.
                  </p>
                </div>
              </div>
              <button
              onClick={() => navigateTo('home')}
              className="mt-3 w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              
                <Upload className="w-4 h-4" />
                Estimate My Points
              </button>
            </div>

            {/* Call DWP Tip */}
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 text-sm mb-1">
                    Eager to find out sooner?
                  </h4>
                  <p className="text-xs text-blue-800 leading-relaxed mb-2">
                    You can call the PIP enquiry line and ask the phone handler
                    to <strong>put you through to a case manager</strong>. The
                    case manager can then send an email to the caseworker who
                    manages your claim, which may speed things up.
                  </p>
                  <div className="bg-blue-100/60 rounded-lg p-2.5 border border-blue-200">
                    <p className="text-[11px] text-blue-700 leading-relaxed">
                      <strong>Note:</strong> This is discretionary — the phone
                      handler is not obliged to transfer you, and the caseworker
                      may not be able to prioritise your claim. But it's worth
                      asking politely, especially if you've been waiting longer
                      than 8 weeks.
                    </p>
                  </div>
                  <a
                  href="tel:08001214433"
                  className="mt-3 inline-flex items-center gap-2 bg-blue-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all">
                  
                    <Phone className="w-3.5 h-3.5" />
                    0800 121 4433 — PIP Enquiry Line
                  </a>
                </div>
              </div>
            </div>
          </div>
        }

        {/* Important things to know */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowTips(!showTips)}
            className="w-full p-4 flex items-center justify-between bg-stone-50 hover:bg-stone-100 transition-colors">
            
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-stone-500" />
              <span className="font-bold text-stone-900 text-sm">
                Important things to know
              </span>
            </div>
            {showTips ?
            <ChevronUp className="w-5 h-5 text-stone-500" /> :

            <ChevronDown className="w-5 h-5 text-stone-500" />
            }
          </button>

          {showTips &&
          <div className="p-4 space-y-4 border-t border-stone-100">
              <div className="flex gap-3 items-start">
                <Shield className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700 leading-relaxed">
                  <strong>Your claim is backdated</strong> to the day you call —
                  not when you return the form. This means if your claim is
                  successful, you'll be{' '}
                  <strong>
                    paid at the awarded rate backdated to your initial call date
                  </strong>
                  . The whole process typically takes around{' '}
                  <strong>6 months</strong>, so your backpay lump sum could be
                  significant. Call as soon as possible, even if you're not
                  ready to fill in the form yet.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <Shield className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700 leading-relaxed">
                  <strong>You have 1 month</strong> to return the PIP2 form once
                  you receive it. If you need more time, call DWP and ask for an
                  extension — they usually grant 2 extra weeks.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <Shield className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700 leading-relaxed">
                  <strong>Describe your worst days</strong>, not your best. The
                  DWP wants to know what you struggle with, not what you can
                  manage on a good day.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <Shield className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700 leading-relaxed">
                  <strong>Supporting evidence is optional</strong> but can
                  strengthen your claim. If you have GP letters, prescriptions,
                  or a letter from someone who helps you — include them. But
                  don't delay your claim waiting for evidence.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <Shield className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700 leading-relaxed">
                  <strong>Keep copies of everything</strong> you send.
                  Take a photo of your completed form before posting it.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <BookOpen className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700 leading-relaxed">
                  <strong>Keep a PIP Diary from day one.</strong> Recording your
                  worst days, symptoms, and how tasks affect you builds a
                  detailed evidence trail. Assessors and tribunals find diary
                  entries highly persuasive.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <FileSearch className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700 leading-relaxed">
                  <strong>Request your assessor's report</strong> as soon as
                  your assessment is done. Make a Subject Access Request (SAR)
                  to DWP — they must provide it within 1 month by law. This
                  shows exactly what the assessor recorded and the points they
                  recommended, so you can prepare for the outcome.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700 leading-relaxed">
                  <strong>Want your decision sooner?</strong> Call the PIP
                  enquiry line (0800 121 4433) and ask the phone handler to put
                  you through to a case manager, who can email the caseworker
                  managing your claim. This is discretionary but worth asking
                  politely, especially if you've been waiting longer than 8
                  weeks.
                </p>
              </div>
            </div>
          }
          )}
        </div>

        {/* Useful contacts */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <button onClick={() => setShowContacts(!showContacts)} className="w-full flex items-center justify-between py-3 px-4 hover:bg-stone-50 transition-colors">
            <h3 className="font-bold text-stone-900 text-sm">Useful contacts</h3>
            <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${showContacts ? 'rotate-180' : ''}`} />
          </button>
          {showContacts && (
          <div className="px-4 pb-4 space-y-2">
            <a
              href="tel:08009172222"
              className="flex justify-between items-center bg-stone-50 rounded-lg px-3 py-2.5 hover:bg-stone-100 transition-colors">
              
              <div>
                <div className="text-xs font-semibold text-stone-900">
                  PIP New Claims
                </div>
                <div className="text-[10px] text-stone-500">DWP helpline</div>
              </div>
              <span className="text-xs font-bold text-teal-600">
                0800 917 2222
              </span>
            </a>
            <a
              href="tel:08009177777"
              className="flex justify-between items-center bg-stone-50 rounded-lg px-3 py-2.5 hover:bg-stone-100 transition-colors">
              
              <div>
                <div className="text-xs font-semibold text-stone-900">
                  DWP Textphone
                </div>
                <div className="text-[10px] text-stone-500">
                  For hearing impaired
                </div>
              </div>
              <span className="text-xs font-bold text-teal-600">
                0800 917 7777
              </span>
            </a>
            <a
              href="tel:08001448848"
              className="flex justify-between items-center bg-stone-50 rounded-lg px-3 py-2.5 hover:bg-stone-100 transition-colors">
              
              <div>
                <div className="text-xs font-semibold text-stone-900">
                  Citizens Advice
                </div>
                <div className="text-[10px] text-stone-500">
                  Free independent help
                </div>
              </div>
              <span className="text-xs font-bold text-teal-600">
                0800 144 8848
              </span>
            </a>
          </div>
          )}
        </div>
      </div>

      <div className="p-5 md:px-8 bg-white border-t border-stone-100">
        <button
          onClick={() => navigateTo('descriptors_guide')}
          className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
          
          Next: What assessors look for
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>);

}