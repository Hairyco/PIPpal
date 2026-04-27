import React, { useState, createElement } from 'react';
import {
  ArrowLeft,
  Download,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Star,
  Users,
  Mail } from
'lucide-react';
import { useAppContext } from './AppContext';
import { motion, AnimatePresence } from 'framer-motion';
const questionsList = [
{
  id: 'q1',
  num: 1,
  title: 'Preparing food',
  category: 'Daily Living'
},
{
  id: 'q2',
  num: 2,
  title: 'Taking nutrition',
  category: 'Daily Living'
},
{
  id: 'q3',
  num: 3,
  title: 'Managing therapy or monitoring a health condition',
  category: 'Daily Living'
},
{
  id: 'q4',
  num: 4,
  title: 'Washing and bathing',
  category: 'Daily Living'
},
{
  id: 'q5',
  num: 5,
  title: 'Managing toilet needs or incontinence',
  category: 'Daily Living'
},
{
  id: 'q6',
  num: 6,
  title: 'Dressing and undressing',
  category: 'Daily Living'
},
{
  id: 'q7',
  num: 7,
  title: 'Communicating verbally',
  category: 'Daily Living'
},
{
  id: 'q8',
  num: 8,
  title: 'Reading and understanding signs, symbols and words',
  category: 'Daily Living'
},
{
  id: 'q9',
  num: 9,
  title: 'Engaging with other people face to face',
  category: 'Daily Living'
},
{
  id: 'q10',
  num: 10,
  title: 'Making budgeting decisions',
  category: 'Daily Living'
},
{
  id: 'q11',
  num: 11,
  title: 'Planning and following journeys',
  category: 'Mobility'
},
{
  id: 'q12',
  num: 12,
  title: 'Moving around',
  category: 'Mobility'
}];

export function AssessmentPrepScreen() {
  const { goBack, navigateTo, savedAnswers, medProfile } = useAppContext();
  const [showInstructions, setShowInstructions] = useState(false);
  const hasAnswers = Object.keys(savedAnswers).length > 0;
  const handleDownload = () => {
    const css = [
    'body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 2rem; }',
    'h1 { color: #0f766e; margin-bottom: 0.5rem; border-bottom: 2px solid #ccfbf1; padding-bottom: 0.5rem; }',
    'h2 { color: #115e59; margin-top: 2rem; margin-bottom: 1rem; }',
    '.intro { margin-bottom: 2rem; color: #666; font-size: 0.95rem; }',
    '.medical-profile { background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; }',
    '.condition-tag { display: inline-block; background: #115e59; color: white; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.85rem; margin-right: 0.5rem; margin-bottom: 0.5rem; }',
    '.q-block { border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; page-break-inside: avoid; background: #fff; }',
    '.q-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; border-bottom: 1px solid #f3f4f6; padding-bottom: 0.75rem; }',
    '.q-num { background: #0f766e; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }',
    '.q-title { font-weight: bold; font-size: 1.1rem; color: #1f2937; margin: 0; }',
    '.q-answer { padding: 1rem; background: #f9fafb; border-radius: 6px; border: 1px solid #f3f4f6; white-space: pre-wrap; font-size: 0.95rem; }',
    '.tip-box { margin-top: 1rem; padding: 0.75rem; background: #fffbeb; border-left: 4px solid #f59e0b; font-size: 0.85rem; color: #92400e; }',
    '@media print { body { padding: 0; background: white; } .q-block { border: 1px solid #d1d5db; } }'].
    join('\n');
    const conditionsHtml =
    medProfile.conditions.length > 0 ?
    `<div class="medical-profile">
          <h3 style="margin-top: 0; color: #0f766e;">My Conditions</h3>
          <div>${medProfile.conditions.map((c) => `<span class="condition-tag">${c.name}</span>`).join('')}</div>
          ${medProfile.medications ? `<div style="margin-top: 1rem;"><strong>Medications:</strong><br/>${medProfile.medications}</div>` : ''}
        </div>` :
    '';
    const answersHtml = questionsList.
    filter((q) => savedAnswers[q.id]).
    map((q) => {
      // Strip HTML tags from the saved answer for a clean document
      const cleanAnswer = savedAnswers[q.id].replace(/<[^>]*>?/gm, '');
      return `
        <div class="q-block">
          <div class="q-header">
            <div class="q-num">${q.num}</div>
            <h3 class="q-title">${q.title}</h3>
          </div>
          <div class="q-answer">${cleanAnswer}</div>
          <div class="tip-box">
            <strong>Assessment Tip:</strong> Remember to describe your worst days, not your best. If you can only do this sometimes, or it causes pain or exhaustion, make sure to mention that to the assessor.
          </div>
        </div>
      `;
    }).
    join('');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PIP Assessment Preparation</title>
        <style>{`;
    $;
    {
      css;
    }
    ;`}</style>
      </head>
      <body>
        <h1>PIP Assessment Preparation</h1>
        <p class="intro">This document contains a summary of my difficulties for each PIP activity. I am using this as a reference during my assessment to ensure I accurately describe how my condition affects me on the majority of days.</p>
        
        ${conditionsHtml}
        
        <h2>My Answers</h2>
        ${answersHtml || '<p>No answers recorded yet.</p>'}
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], {
      type: 'text/html'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PIP-Assessment-Prep-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        newWindow.onload = () => newWindow.print();
      }
    }, 100);
  };
  if (!hasAnswers) {
    return (
      <div className="flex flex-col h-full bg-stone-50">
        <div className="px-5 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
          <button
            onClick={goBack}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
            
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-stone-900 text-lg">Assessment Prep</h1>
        </div>

        <div className="flex-1 px-5 py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">
            Complete your questions first
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed max-w-[280px] mb-6">
            You need to save answers to your PIP questions before we can
            generate your assessment preparation document.
          </p>
          <button
            onClick={() => navigateTo('question_index')}
            className="bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-teal-800 active:scale-95 transition-all shadow-sm">
            
            Go to Questions
          </button>
        </div>
      </div>);

  }
  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
          
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">Assessment Prep</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {/* Hero */}
        <div className="bg-blue-700 rounded-2xl p-6 text-white shadow-sm">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">Your Assessment Guide</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Review your answers before your assessment. Download this document
            to have it in front of you during a telephone assessment, or take it
            with you in person.
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-base hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
          
          <Download className="w-5 h-5" />
          Download Prep Document
        </button>

        {/* What to expect */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-900 text-sm mb-4">
            What to expect at your assessment
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-stone-700 leading-relaxed">
                <strong>They will ask about your daily life:</strong> The
                assessor wants to know how you manage the 12 activities. Keep
                your answers focused on these.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-stone-700 leading-relaxed">
                <strong>Describe your worst days:</strong> Don't minimize your
                struggles. If you can only do something sometimes, or it causes
                pain, tell them.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <FileText className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-stone-700 leading-relaxed">
                <strong>Bring your evidence:</strong> Have your PIP Diary,
                medical evidence, and this prep document with you.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <User className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-stone-700 leading-relaxed">
                <strong>You can bring support:</strong> You are allowed to have
                someone with you during the assessment for support.
              </p>
            </div>
          </div>
        </div>

        {/* Medical Profile Summary */}
        {medProfile.conditions.length > 0 &&
        <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100 shadow-sm">
            <h3 className="font-bold text-teal-900 text-sm mb-3">
              Your Conditions
            </h3>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {medProfile.conditions.map((c, i) =>
            <span
              key={i}
              className="bg-teal-600 text-white text-xs px-2.5 py-1 rounded-full font-medium">
              
                  {c.name}
                </span>
            )}
            </div>
            {medProfile.medications &&
          <div>
                <h4 className="font-bold text-teal-900 text-xs mb-1">
                  Medications
                </h4>
                <p className="text-sm text-teal-800 leading-relaxed">
                  {medProfile.medications}
                </p>
              </div>
          }
          </div>
        }

        {/* Answers Preview */}
        <div>
          <h3 className="font-bold text-stone-900 text-sm mb-3 px-1">
            Your Answers Summary
          </h3>
          <div className="space-y-4">
            {questionsList.
            filter((q) => savedAnswers[q.id]).
            map((q) =>
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              
                  <div className="bg-stone-50 px-4 py-3 border-b border-stone-200 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {q.num}
                    </div>
                    <h4 className="font-bold text-stone-900 text-sm">
                      {q.title}
                    </h4>
                  </div>
                  <div className="p-4">
                    <p
                  className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: savedAnswers[q.id]
                  }}>
                </p>
                    <div className="mt-4 bg-amber-50 rounded-xl p-3 border border-amber-100 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 leading-relaxed">
                        <strong>Tip:</strong> Remember to mention any aids you
                        use and if you need prompting or supervision for this
                        activity.
                      </p>
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>

        {/* Printing Instructions */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-6">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full p-4 flex items-center justify-between bg-stone-50 hover:bg-stone-100 transition-colors">
            
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-stone-500" />
              <span className="font-bold text-stone-900 text-sm">
                How to print or save to your phone
              </span>
            </div>
            {showInstructions ?
            <ChevronUp className="w-5 h-5 text-stone-500" /> :

            <ChevronDown className="w-5 h-5 text-stone-500" />
            }
          </button>

          <AnimatePresence>
            {showInstructions &&
            <motion.div
              initial={{
                height: 0
              }}
              animate={{
                height: 'auto'
              }}
              exit={{
                height: 0
              }}
              className="overflow-hidden">
              
                <div className="p-4 space-y-4 border-t border-stone-100 bg-white">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm mb-2 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-stone-100 flex items-center justify-center text-[10px]">
                        🍎
                      </span>
                      iPhone / iPad
                    </h4>
                    <ol className="text-xs text-stone-600 space-y-1.5 list-decimal list-inside pl-1">
                      <li>
                        Tap <strong>Download Prep Document</strong> above
                      </li>
                      <li>
                        When the file opens, tap the <strong>Share</strong> icon
                        (square with up arrow) at the bottom
                      </li>
                      <li>
                        To print: Scroll down and tap <strong>Print</strong>
                      </li>
                      <li>
                        To save: Tap <strong>Save to Files</strong> or email it
                        to yourself
                      </li>
                    </ol>
                  </div>

                  <div className="pt-3 border-t border-stone-100">
                    <h4 className="font-bold text-stone-900 text-sm mb-2 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-stone-100 flex items-center justify-center text-[10px]">
                        🤖
                      </span>
                      Android
                    </h4>
                    <ol className="text-xs text-stone-600 space-y-1.5 list-decimal list-inside pl-1">
                      <li>
                        Tap <strong>Download Prep Document</strong> above
                      </li>
                      <li>The file will download to your device</li>
                      <li>
                        Open your <strong>Downloads</strong> or{' '}
                        <strong>Files</strong> app to find it
                      </li>
                      <li>
                        Tap the file, then tap the menu (three dots) to{' '}
                        <strong>Print</strong> or <strong>Share</strong> via
                        email
                      </li>
                    </ol>
                  </div>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>

        {/* Post-Completion Actions */}
        <div className="space-y-4 pt-2">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-2xl p-4 border border-stone-200 shadow-sm hover:border-teal-300 transition-all active:scale-[0.98]">
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-green-600 fill-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm mb-1">
                  Help others find PIPpal
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Leave a Trustpilot review. Your experience could encourage
                  someone else to claim what they deserve.
                </p>
              </div>
            </div>
          </a>

          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-teal-50 rounded-2xl p-4 border border-teal-100 shadow-sm hover:border-teal-200 transition-all active:scale-[0.98]">
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h4 className="font-bold text-teal-900 text-sm mb-1">
                  Join our community
                </h4>
                <p className="text-xs text-teal-800 leading-relaxed">
                  Connect with others going through the PIP process. Share tips
                  & find support.
                </p>
              </div>
            </div>
          </a>

          <a
            href="mailto:support@pippal.co.uk"
            className="block bg-white rounded-2xl p-4 border border-stone-200 shadow-sm hover:border-stone-300 transition-all active:scale-[0.98]">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-stone-600" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Need help?</h4>
                <p className="text-xs text-stone-500">
                  Contact us at support@pippal.co.uk
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>);

}