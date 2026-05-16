import React from 'react';
import { PoundSterling, ShieldCheck, HelpCircle, Clock } from 'lucide-react';

const conditions = [
  { emoji: '😰', label: 'Anxiety' },
  { emoji: '🧠', label: 'ADHD' },
  { emoji: '💙', label: 'Depression' },
  { emoji: '🦴', label: 'Chronic pain' },
  { emoji: '🧩', label: 'Autism' },
  { emoji: '💊', label: 'Epilepsy' },
];

const points = [
  {
    icon: HelpCircle,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    title: "Don't know what to write?",
    body: "We ask simple questions and translate your answers into the language PIP assessors are trained to look for. No guesswork.",
  },
  {
    icon: ShieldCheck,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    title: 'Worried about being rejected?',
    body: "Most rejections happen because of how a condition is described — not whether it qualifies. We structure every answer to meet DWP's criteria.",
  },
  {
    icon: Clock,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    title: 'Want to do it quickly?',
    body: 'Most people finish in 15–30 minutes. Answer in your own words, we do the rest.',
  },
];

export function WhatIsPIP(_props?: { onEligibility?: () => void }) {
  return (
    <section id="what-is-pip" className="px-5 md:px-8 py-8">

      {/* What is PIP */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center">
            <PoundSterling className="w-4 h-4 text-teal-700" />
          </div>
          <h2 className="font-bold text-stone-900 text-base">What is PIP?</h2>
        </div>
        <p className="text-sm text-stone-600 leading-relaxed mb-3">
          <strong className="text-stone-900">Personal Independence Payment (PIP)</strong> helps with extra costs if a health condition or disability makes everyday tasks or getting about harder long term. You can receive up to <strong className="text-stone-900">£843 a month</strong>, and it is <strong className="text-stone-900">not means-tested</strong> — you can claim if you are employed or unemployed.
        </p>
        <p className="text-sm text-stone-600 leading-relaxed mb-4">
          <p className="text-sm text-stone-600 leading-relaxed">You don't need a formal diagnosis — PIP looks at <strong className="text-stone-900">how your condition affects you</strong> day to day.</p>
          <p className="text-sm text-stone-600 leading-relaxed mt-3">Official figures show roughly <strong className="text-stone-900">65% of claims fail</strong>, and the average decision takes <strong className="text-stone-900">6 months</strong>.</p>
          <p className="text-sm text-stone-600 leading-relaxed mt-3">We help you explain your typical difficult days clearly and honestly so the DWP fully understands your needs.</p>
        </p>
        <p className="text-[11px] text-stone-500 leading-relaxed mb-4">
          Numbers change each quarter. See DWP{' '}
          <a
            href="https://www.gov.uk/government/collections/personal-independence-payment-statistics"
            className="text-teal-700 font-semibold hover:text-teal-800 underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Personal Independence Payment statistics
          </a>{' '}
          on GOV.UK.
        </p>
        <div className="bg-stone-50 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-stone-500 mb-2">Conditions that often qualify</p>
          <div className="flex flex-wrap gap-2">
            {conditions.map(c => (
              <span key={c.label} className="text-xs bg-white border border-stone-200 px-2.5 py-1 rounded-full text-stone-700">
                {c.label}
              </span>
            ))}
            <span className="text-xs bg-white border border-stone-200 px-2.5 py-1 rounded-full text-stone-500">+ many more</span>
          </div>
        </div>
      </div>

      {/* Why PIPpal */}
      <h2 className="font-bold text-stone-900 text-lg mb-1">Built for first-time applicants</h2>
      <p className="text-stone-500 text-sm mb-4">Focused on what people find hardest.</p>
      <div className="space-y-3">
        {points.map((p, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex gap-3">
            <div className={`w-9 h-9 ${p.bg} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
              <p.icon className={`w-4.5 h-4.5 ${p.color}`} />
            </div>
            <div>
              <p className="font-semibold text-stone-900 text-sm mb-0.5">{p.title}</p>
              <p className="text-stone-500 text-xs leading-relaxed">{p.body}</p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
