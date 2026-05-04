import React, { useState, Component } from 'react';
import {
  HelpCircle,
  Heart,
  Footprints,
  ChevronDown,
  PoundSterling,
  Users } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const CASE_STUDIES = [
  {
    name: 'John',
    condition: 'Anxiety',
    emoji: '😰',
    story: 'John feels anxious in public. He avoids busy places, finds social situations overwhelming, and sometimes struggles to leave the house.',
    qualifies: ['Daily Living – Finds it hard to deal with people and everyday situations', 'Mobility – Struggles with going out and travelling'],
  },
  {
    name: 'Aisha',
    condition: 'ADHD',
    emoji: '🧠',
    story: 'Aisha struggles to stay focused and organised. She forgets things, gets overwhelmed easily, and finds it hard to keep on top of daily tasks.',
    qualifies: ['Daily Living – Difficulty managing routines and staying organised', 'Mobility – Can struggle planning and following journeys'],
  },
  {
    name: 'Sarah',
    condition: 'Depression',
    emoji: '💙',
    story: 'Sarah often feels low and unmotivated. Some days she struggles to get out of bed, look after herself, or face going outside.',
    qualifies: ['Daily Living – Struggles with basic tasks and daily routines', 'Mobility – Finds it hard to leave the house'],
  },
];

export function WhatIsPIP() {
  const [expanded, setExpanded] = useState(false);
  const [showCaseStudies, setShowCaseStudies] = useState(false);
  return (
    <section className="px-5 md:px-8 py-6">
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-teal-50 p-2 rounded-xl shrink-0">
              <HelpCircle className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-lg leading-tight">
                What is PIP?
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Personal Independence Payment
              </p>
            </div>
          </div>

          <div className="bg-teal-50 rounded-xl p-4 mb-4 border border-teal-100 flex items-center gap-3">
            <div className="shrink-0 w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <div className="text-2xl font-bold text-teal-800 leading-tight">
                3.9 million
              </div>
              <p className="text-xs text-teal-700 leading-relaxed">
                people in the UK currently claim PIP. You're not alone — and
                you're not unusual for considering it.
              </p>
            </div>
          </div>

          <p className="text-sm text-stone-600 leading-relaxed mb-3">
            Personal Independence Payment (PIP) is a movement benefit that can help with extra living costs if you have a long-term physical or mental health condition or disability or difficulty doing certain everyday tasks or getting around because of your condition. You can get PIP even if you're working, have savings or are getting most other benefits and you don't need a formal diagnosis. Just that you expect your condition to last for up to 9 months.
          </p>
          <p className="text-sm text-stone-600 leading-relaxed mb-3">
            It is <strong className="text-stone-800">not means-tested</strong> — <strong className="text-stone-800">whether you're working, self-employed, or not working — your income and savings do not matter.</strong>
          </p>
          <p className="text-sm text-stone-600 leading-relaxed mb-3">
            Many people do not realise they could be eligible. Even if your condition feels manageable or you have just learned to cope with it, you might still qualify depending on how it affects your everyday life.
          </p>

          {/* Condition pills */}
          <div className="flex flex-wrap gap-2 mb-3">
            {['Anxiety', 'Depression', 'ADHD', 'Chronic pain', 'Autism', 'Fibromyalgia', 'MS', 'Arthritis', 'PTSD', '+ more'].map((c) => (
              <span key={c} className="text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded-full">{c}</span>
            ))}
          </div>
          <button
            onClick={() => setShowCaseStudies(true)}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 underline underline-offset-2 mb-4 block"
          >
            See example cases →
          </button>

          {/* Case studies modal */}
          {showCaseStudies && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setShowCaseStudies(false)}>
              <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 sticky top-0 bg-white">
                  <h3 className="font-bold text-stone-900 text-base">Who can claim PIP?</h3>
                  <button onClick={() => setShowCaseStudies(false)} className="text-stone-400 hover:text-stone-700 text-sm font-medium">Close</button>
                </div>
                <div className="p-5 space-y-5">
                  {CASE_STUDIES.map(cs => (
                    <div key={cs.name} className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{cs.emoji}</span>
                        <div>
                          <p className="font-bold text-stone-900 text-sm">{cs.name} — {cs.condition}</p>
                        </div>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed mb-3">{cs.story}</p>
                      <div className="space-y-1.5">
                        {cs.qualifies.map((q, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-emerald-600 text-xs shrink-0">✔</span>
                            <p className="text-xs text-stone-700 leading-relaxed">{q}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-stone-400 text-center leading-relaxed">These are illustrative examples. PIP is assessed individually — everyone's situation is different.</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-50 rounded-xl p-3 mb-4 border border-amber-100 flex items-start gap-2.5">
            <span className="text-base mt-0.5">⏳</span>
            <p className="text-xs text-amber-800 leading-relaxed">
              Decisions can take <strong>up to 6 months</strong> — and if your
              claim is turned down, starting again means another long wait.
              Getting it right first time matters.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-100">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-semibold text-stone-800">
                  Daily Living
                </span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Help with everyday tasks like cooking, washing, dressing &
                managing medication
              </p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-100">
              <div className="flex items-center gap-2 mb-2">
                <Footprints className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-stone-800">
                  Mobility
                </span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Help with getting around, planning journeys & moving safely
                outdoors
              </p>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between py-2.5 px-3 bg-stone-50 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors">
            
            <span>{expanded ? 'Show less' : 'How much could I get?'}</span>
            <motion.div
              animate={{
                rotate: expanded ? 180 : 0
              }}
              transition={{
                duration: 0.2
              }}>
              
              <ChevronDown className="w-4 h-4 text-stone-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {expanded &&
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
              transition={{
                duration: 0.25
              }}
              className="overflow-hidden">
              
                <div className="pt-4 space-y-3">
                  {/* Header row */}
                  <div className="grid grid-cols-3 gap-2 pb-2 border-b border-stone-100">
                    <span className="text-xs text-stone-400">Component</span>
                    <span className="text-xs text-stone-400 text-right">Standard/pw</span>
                    <span className="text-xs text-stone-400 text-right">Enhanced/pw</span>
                  </div>
                  {/* Daily Living row */}
                  <div className="grid grid-cols-3 gap-2 items-center py-1.5 border-b border-stone-50">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="text-xs text-stone-700">Daily Living</span>
                    </div>
                    <span className="text-sm text-stone-600 text-right font-medium">£336</span>
                    <span className="text-sm font-bold text-teal-700 text-right">£503</span>
                  </div>
                  {/* Mobility row */}
                  <div className="grid grid-cols-3 gap-2 items-center py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Footprints className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="text-xs text-stone-700">Mobility</span>
                    </div>
                    <span className="text-sm text-stone-600 text-right font-medium">£133</span>
                    <span className="text-sm font-bold text-teal-700 text-right">£351</span>
                  </div>
                  <div className="bg-teal-50 rounded-xl p-3 mt-2 border border-teal-100">
                    <div className="flex items-center gap-2 mb-1">
                      <PoundSterling className="w-4 h-4 text-teal-600" />
                      <span className="text-sm font-semibold text-teal-800">
                        Up to £854/month
                      </span>
                    </div>
                    <p className="text-[11px] text-teal-600 leading-relaxed">
                      That's up to £10,247/year if you qualify for both enhanced
                      rates. Paid every 4 weeks directly into your bank account.
                    </p>
                  </div>
                  <p className="text-[10px] text-stone-400 text-center">
                    Rates shown are for 2025/26 tax year
                  </p>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>
    </section>);

}