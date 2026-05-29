import React, { useState } from 'react';
import { PIP_ENHANCED_MONTHLY_GBP } from '../constants/pipDisplayRates';
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
  Users } from
'lucide-react';
import { useAppContext } from './AppContext';
import { ProgressBar } from './ProgressBar';
export function NewClaimIntro() {
  const { navigateTo, goBack, hasCompletedEligibility } = useAppContext();
  const [showTips, setShowTips] = useState(false);
  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
          
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">New PIP Claim</h1>
      </div>
      <ProgressBar
        currentStep={1}
        totalSteps={4}
        label="Step 1 of 4 — Overview" />
      

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-6">
        {/* What is PIP - only shown if user hasn't done eligibility check */}
        {!hasCompletedEligibility &&
        <>
            <div className="bg-teal-700 rounded-2xl p-6 text-white">
              <h2 className="text-xl font-bold mb-3">What is PIP?</h2>
              <p className="text-teal-50 text-sm leading-relaxed mb-3">
                Personal Independence Payment (PIP) is a tax-free benefit for
                people aged 16–66 with a long-term health condition or
                disability that affects daily life. It's{' '}
                <strong className="text-white">not means-tested</strong> — you
                can claim whether you're employed, self-employed, or not
                working.
              </p>
              <p className="text-teal-50 text-sm leading-relaxed">
                PIP has two parts:{' '}
                <strong className="text-white">Daily Living</strong> (help with
                everyday tasks) and{' '}
                <strong className="text-white">Mobility</strong> (help getting
                around). You can claim one or both.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
              <h3 className="font-bold text-stone-900 text-sm mb-3">
                How much can I get per month?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-50 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider font-medium mb-1">
                    Standard rate
                  </div>
                  <div className="text-lg font-bold text-stone-900">£469</div>
                  <div className="text-[10px] text-stone-500">per month</div>
                </div>
                <div className="bg-teal-50 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-teal-600 uppercase tracking-wider font-medium mb-1">
                    Enhanced rate
                  </div>
                  <div className="text-lg font-bold text-teal-700">£{PIP_ENHANCED_MONTHLY_GBP}</div>
                  <div className="text-[10px] text-teal-600">per month</div>
                </div>
              </div>
              <p className="text-[10px] text-stone-400 mt-2 text-center">
                Combined Daily Living + Mobility (2025/26 rates)
              </p>
            </div>
          </>
        }
        {/* Hero - shown when user already did eligibility */}
        {hasCompletedEligibility &&
        <div className="bg-teal-700 rounded-2xl p-6 text-white">
            <h2 className="text-xl font-bold mb-3">How to start your claim</h2>
            <p className="text-teal-50 text-sm leading-relaxed">
              Here's exactly what happens when you apply for PIP — step by step.
              We'll help you prepare your answers so you're ready when the form
              arrives.
            </p>
          </div>
        }
        {/* Join Our Community */}
        <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                Join our community
              </h3>
              <p className="text-[10px] text-stone-500">
                Connect with others going through the PIP process
              </p>
            </div>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed mb-3">
            Share experiences, get tips, and find support from people who
            understand what you're going through.
          </p>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-teal-800 active:scale-[0.98] transition-all">
            
            <Users className="w-3.5 h-3.5" />
            Join the Community
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="p-5 md:px-8 bg-white border-t border-stone-100">
        <button
          onClick={() => navigateTo('claim_process')}
          className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
          
          Next: How it works
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>);

}