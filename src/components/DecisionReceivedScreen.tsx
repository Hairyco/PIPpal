import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Calculator,
  ArrowRight,
  Calendar,
  BookOpen,
  Car,
  FileSearch,
  ShieldAlert,
  HeartHandshake,
  Download,
  ExternalLink } from
'lucide-react';
import { useAppContext } from './AppContext';
import { motion, AnimatePresence } from 'framer-motion';
export function DecisionReceivedScreen() {
  const { goBack, navigateTo, setAssistantQuestion, setAssistantContext } = useAppContext();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const openAssistantWithContext = (outcome: string, context: string) => {
    setAssistantContext(context);
    setAssistantQuestion(`My PIP decision outcome: ${outcome}. ${context}`);
    navigateTo('home');
  };
  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95">
          
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">Decision Received</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-6">
        <div className="bg-teal-700 rounded-2xl p-5 text-white">
          <h2 className="text-xl font-bold mb-1">What was your outcome?</h2>
          <p className="text-teal-100 text-sm leading-relaxed">Select the outcome of your decision letter. We'll show you exactly what to do next.</p>
        </div>

        <div className="space-y-4">
          {/* AWARDED */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('awarded')}
              className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Awarded</h3>
                  <p className="text-xs text-stone-500">
                    You received the award you expected
                  </p>
                </div>
              </div>
              {expandedSection === 'awarded' ?
              <ChevronUp className="w-5 h-5 text-stone-400" /> :

              <ChevronDown className="w-5 h-5 text-stone-400" />
              }
            </button>

            <AnimatePresence>
              {expandedSection === 'awarded' &&
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0
                }}
                animate={{
                  height: 'auto',
                  opacity: 1
                }}
                exit={{
                  height: 0,
                  opacity: 0
                }}
                className="overflow-hidden">
                
                  <div className="p-5 border-t border-stone-100 bg-stone-50 space-y-4">
                    <div className="bg-emerald-100 text-emerald-800 px-3 py-2 rounded-lg text-sm font-medium inline-block mb-2">
                      Congratulations! 🎉
                    </div>
                    <p className="text-sm text-stone-700 leading-relaxed">
                      Your payments will usually start within 2 weeks of the
                      decision. You'll be paid every 4 weeks in arrears.
                    </p>

                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-teal-600 shrink-0" />
                        <p className="text-sm font-bold text-teal-900">Download proof of your benefits</p>
                      </div>
                      <p className="text-xs text-teal-700 leading-relaxed">
                        You can download an official letter from GOV.UK confirming your PIP award. This is accepted as proof when applying for a Blue Badge, Motability scheme, Council Tax reduction, and a disabled person's railcard.
                      </p>
                      <a
                        href="https://www.gov.uk/get-proof-benefits"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors mt-1">
                        Get proof of benefits on GOV.UK
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm space-y-3">
                      <h4 className="font-bold text-stone-900 text-sm">
                        Important Next Steps:
                      </h4>

                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-stone-600 leading-relaxed">
                          <strong>Note your review date:</strong> Your award
                          letter will state when your award is reviewed. Put
                          this in your calendar.
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-stone-600 leading-relaxed">
                          <strong>Set up a PIP diary:</strong> Track any changes
                          in your condition. If things get worse, you can report
                          a change of circumstances to get a higher rate.
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <Car className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-stone-600 leading-relaxed">
                          <strong>Claim other benefits:</strong> You may now
                          qualify for the Motability scheme (if you get Enhanced
                          Mobility), a Blue Badge, Council Tax reduction, or a
                          disabled person's railcard.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button onClick={() => navigateTo('payment_calculator')}
                        className="flex-1 bg-white border border-stone-200 text-stone-700 py-3 rounded-xl font-semibold text-sm hover:bg-stone-50 transition-all flex items-center justify-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Calculate payments
                      </button>
                      <button onClick={() => navigateTo('pip_benefits')}
                        className="flex-1 bg-teal-700 text-white py-3 rounded-xl font-semibold text-sm hover:bg-teal-800 transition-all flex items-center justify-center gap-2">
                        What else do I get? →
                      </button>
                    </div>
                  </div>
                </motion.div>
              }
            </AnimatePresence>
          </div>

          {/* PARTIALLY AWARDED */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('partial')}
              className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    Partially Awarded
                  </h3>
                  <p className="text-xs text-stone-500">
                    You got an award, but think it should be higher
                  </p>
                </div>
              </div>
              {expandedSection === 'partial' ?
              <ChevronUp className="w-5 h-5 text-stone-400" /> :

              <ChevronDown className="w-5 h-5 text-stone-400" />
              }
            </button>

            <AnimatePresence>
              {expandedSection === 'partial' &&
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0
                }}
                animate={{
                  height: 'auto',
                  opacity: 1
                }}
                exit={{
                  height: 0,
                  opacity: 0
                }}
                className="overflow-hidden">
                
                  <div className="p-5 border-t border-stone-100 bg-stone-50 space-y-4">
                    <p className="text-sm text-stone-700 leading-relaxed">
                      If you believe you should have scored higher, you can
                      challenge the decision through a Mandatory Reconsideration
                      (MR).
                    </p>

                    <div className="bg-amber-100/50 border border-amber-200 rounded-xl p-3">
                      <p className="text-xs text-amber-800 font-medium">
                        ⚠️ Deadline: You have 1 month from the date on your
                        decision letter to request an MR.
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm space-y-3">
                      <div className="flex items-start gap-2">
                        <FileSearch className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-stone-600 leading-relaxed">
                          <strong>Get the PA4 Report:</strong> Before doing
                          anything, call DWP and request your Assessment Report
                          (PA4). Compare your expected points vs awarded points
                          for each activity.
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-stone-600 leading-relaxed">
                          <strong>Use the SAFES rule:</strong> To argue for more
                          points, you must prove you cannot do the activity
                          Safely, to an Acceptable standard, Frequently, in
                          Enough time, or Sustainably.
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-stone-500 leading-relaxed bg-stone-100 p-3 rounded-lg">
                      <strong>Warning:</strong> Requesting an MR means they will
                      look at your WHOLE claim again. Your award could go up,
                      stay the same, or go down.
                    </p>

                    <div className="flex gap-2 mt-2">
                      <button onClick={() => navigateTo('mandatory_reconsideration')}
                        className="flex-1 bg-amber-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-amber-700 transition-all flex items-center justify-center gap-2">
                        Challenge this →
                      </button>
                      <button onClick={() => openAssistantWithContext('Partially awarded', 'I received a partial PIP award but believe I should score higher. Help me understand what to do and how to challenge specific activities.')}
                        className="flex-1 bg-teal-700 text-white py-3 rounded-xl font-semibold text-sm hover:bg-teal-800 transition-all flex items-center justify-center gap-2">
                        Ask PIPpal →
                      </button>
                    </div>
                  </div>
                </motion.div>
              }
            </AnimatePresence>
          </div>

          {/* REFUSED */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('refused')}
              className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Refused</h3>
                  <p className="text-xs text-stone-500">
                    You were not awarded PIP
                  </p>
                </div>
              </div>
              {expandedSection === 'refused' ?
              <ChevronUp className="w-5 h-5 text-stone-400" /> :

              <ChevronDown className="w-5 h-5 text-stone-400" />
              }
            </button>

            <AnimatePresence>
              {expandedSection === 'refused' &&
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0
                }}
                animate={{
                  height: 'auto',
                  opacity: 1
                }}
                exit={{
                  height: 0,
                  opacity: 0
                }}
                className="overflow-hidden">
                
                  <div className="p-5 border-t border-stone-100 bg-stone-50 space-y-4">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                      <p className="text-sm text-indigo-900 leading-relaxed font-bold mb-1">
                        Don't panic. This is extremely common.
                      </p>
                      <p className="text-xs text-indigo-800 leading-relaxed">
                        Many people who are initially refused go on to get an
                        award. The system is flawed, but you can fight it.
                      </p>
                    </div>

                    <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
                      <div className="text-3xl font-black text-rose-600">
                        60%
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        of PIP appeals are successful at tribunal. The initial
                        refusal is often overturned.
                      </p>
                    </div>

                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                      <p className="text-xs text-rose-800 font-medium">
                        ⚠️ Deadline: You must request a Mandatory
                        Reconsideration within 1 month of the date on your
                        decision letter.
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm space-y-3">
                      <div className="flex items-start gap-2">
                        <FileSearch className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-stone-600 leading-relaxed">
                          <strong>Get the PA4 Report immediately:</strong> Call
                          DWP and request your Assessment Report (PA4) so you
                          can see exactly why you were refused.
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-stone-600 leading-relaxed">
                          <strong>Learn the SAFES rule:</strong> You'll need to
                          prove you can't do activities Safely, to an Acceptable
                          standard, Frequently, in Enough time, or Sustainably.
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <HeartHandshake className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-stone-600 leading-relaxed">
                          <strong>Get free help:</strong> Contact Citizens
                          Advice or local welfare rights for support with your
                          MR.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button onClick={() => navigateTo('mandatory_reconsideration')}
                        className="flex-1 bg-stone-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-stone-800 transition-all flex items-center justify-center gap-2">
                        Start challenge →
                      </button>
                      <button onClick={() => openAssistantWithContext('Refused', 'I was refused PIP. I want to challenge this decision with a Mandatory Reconsideration. Help me understand what went wrong and what to do next.')}
                        className="flex-1 bg-teal-700 text-white py-3 rounded-xl font-semibold text-sm hover:bg-teal-800 transition-all flex items-center justify-center gap-2">
                        Ask PIPpal →
                      </button>
                    </div>
                  </div>
                </motion.div>
              }
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>);

}