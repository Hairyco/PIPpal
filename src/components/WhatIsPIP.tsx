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
export function WhatIsPIP() {
  const [expanded, setExpanded] = useState(false);
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
            PIP is a tax-free benefit for people aged 16–66 with a long-term
            health condition or disability that affects daily life. It's{' '}
            <strong className="text-stone-800">not means-tested</strong> — you
            can claim whether you're employed, self-employed, or not working.
            Your income and savings don't affect it.
          </p>

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
                  <div className="flex items-center justify-between py-2 border-b border-stone-100">
                    <span className="text-xs text-stone-500">Component</span>
                    <div className="flex gap-8 text-xs text-stone-500">
                      <span>Standard</span>
                      <span>Enhanced</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-sm text-stone-700">
                        Daily Living
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-stone-600 w-16 text-right">
                        £336
                      </span>
                      <span className="font-semibold text-teal-700 w-16 text-right">
                        £503
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <Footprints className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-sm text-stone-700">Mobility</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-stone-600 w-16 text-right">
                        £133
                      </span>
                      <span className="font-semibold text-teal-700 w-16 text-right">
                        £351
                      </span>
                    </div>
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