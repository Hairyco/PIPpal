import React from 'react';
import { PoundSterling, ShieldCheck, HelpCircle, Clock, CheckCircle2, XCircle, Search } from 'lucide-react';

interface WhatIsPIPProps {
  onEligibility?: () => void;
}

const conditions = [
  { emoji: '😰', label: 'Anxiety' },
  { emoji: '🧠', label: 'ADHD' },
  { emoji: '💙', label: 'Depression' },
  { emoji: '🦴', label: 'Chronic pain' },
  { emoji: '🧩', label: 'Autism' },
  { emoji: '💊', label: 'Epilepsy' },
  { emoji: '🫀', label: 'Fibromyalgia' },
  { emoji: '🔇', label: 'PTSD' },
];

const myths = [
  { myth: 'I work full time', truth: 'PIP is not means-tested — your income and employment don\'t affect eligibility.' },
  { myth: 'I look fine', truth: 'PIP is about how your condition affects daily life — not how you look.' },
  { myth: 'I\'m already on Universal Credit', truth: 'PIP and UC are separate. You can receive both at the same time.' },
  { myth: 'I\'ve had it for years so I already missed out', truth: 'You can claim PIP at any time — there\'s no cut-off based on how long you\'ve had a condition.' },
];

const points = [
  {
    icon: HelpCircle,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    title: "Don't know what to write?",
    body: "We ask simple questions and translate your answers into what DWP assessors are trained to look for. No guesswork.",
  },
  {
    icon: ShieldCheck,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    title: 'Worried about being rejected?',
    body: "Most rejections happen because of how a condition is described — not whether it qualifies. We structure every answer to maximise your score.",
  },
  {
    icon: Clock,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    title: 'Want to do it quickly?',
    body: 'Most people finish in 15–30 minutes. Answer in your own words, we do the rest.',
  },
];

export function WhatIsPIP({ onEligibility }: WhatIsPIPProps) {
  return (
    <section className="px-5 md:px-8 py-6 space-y-4">

      {/* What is PIP + qualifying rules */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center">
            <PoundSterling className="w-4 h-4 text-teal-700" />
          </div>
          <h2 className="font-bold text-stone-900 text-base">What is PIP?</h2>
        </div>
        <p className="text-sm text-stone-600 leading-relaxed mb-4">
          Personal Independence Payment (PIP) is a movement benefit that can help with extra living costs if you have a long-term physical or mental health condition or disability or difficulty doing certain everyday tasks or getting around because of your condition. You can get PIP even if you're working, have savings or are getting most other benefits and you don't need a formal diagnosis. Just that you expect your condition to last for up to 9 months.
        </p>
        <p className="text-sm text-stone-600 leading-relaxed mb-4">
          You can get PIP even if you're working, have savings or are receiving most other benefits. <strong>You don't need a formal diagnosis</strong> — just that you expect your condition to last for at least 9 months. It's worth up to <strong className="text-stone-900">£10,246 a year</strong>.
        </p>

        {/* Qualifying rules — prominent */}
        <div className="bg-teal-50 rounded-xl p-4 mb-4 border border-teal-100">
          <p className="text-xs font-bold text-teal-900 mb-2">Basic qualifying rules</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
              <p className="text-xs text-teal-800">Your condition has <strong>affected you for at least 3 months</strong> and is expected to continue for at least <strong>9 more months</strong></p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
              <p className="text-xs text-teal-800">You are aged <strong>16 to 64</strong> (State Pension age for new claims)</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
              <p className="text-xs text-teal-800">You normally live in England, Wales or Scotland</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
              <p className="text-xs text-teal-800"><strong>Income and savings don't matter</strong> — PIP is not means-tested</p>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-stone-50 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-stone-500 mb-2">Conditions that often qualify</p>
          <div className="flex flex-wrap gap-2">
            {conditions.map(c => (
              <span key={c.label} className="text-xs bg-white border border-stone-200 px-2.5 py-1 rounded-full text-stone-700">
                {c.emoji} {c.label}
              </span>
            ))}
            <span className="text-xs bg-white border border-stone-200 px-2.5 py-1 rounded-full text-stone-500">+ many more</span>
          </div>
        </div>
      </div>

      {/* Free eligibility check CTA */}
      <button
        onClick={onEligibility}
        className="w-full bg-stone-900 text-white rounded-2xl p-4 flex items-center gap-3 hover:bg-stone-800 active:scale-[0.98] transition-all text-left shadow-sm"
      >
        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
          <Search className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-white text-sm">Not sure if you qualify?</p>
          <p className="text-stone-400 text-xs mt-0.5">Check your eligibility in 2 minutes — completely free, no sign-up</p>
        </div>
        <div className="text-xs font-bold text-teal-400 shrink-0">Free →</div>
      </button>

      {/* Myths busted */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        <h2 className="font-bold text-stone-900 text-base mb-3">Common reasons people don't apply</h2>
        <div className="space-y-3">
          {myths.map((m, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                <XCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-700 line-through decoration-rose-300">"{m.myth}"</p>
                <p className="text-xs text-stone-500 leading-relaxed mt-0.5">{m.truth}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Problem */}
      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
        <h2 className="font-bold text-stone-900 text-lg mb-2">Sound familiar?</h2>
        <p className="text-sm text-stone-600 leading-relaxed mb-4">
          The PIP application is notoriously difficult — 40+ pages long, emotionally draining, and full of technical language. Many deserving people are rejected simply because they don't know how to translate their daily struggles into the specific points-based language DWP requires.
        </p>
        <div className="space-y-2">
          {points.map((p, i) => (
            <div key={i} className="bg-white rounded-xl p-3.5 flex gap-3 border border-rose-100">
              <div className={`w-8 h-8 ${p.bg} rounded-lg flex items-center justify-center shrink-0`}>
                <p.icon className={`w-4 h-4 ${p.color}`} />
              </div>
              <div>
                <p className="font-semibold text-stone-900 text-sm mb-0.5">{p.title}</p>
                <p className="text-stone-500 text-xs leading-relaxed">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Solution */}
      <div className="bg-teal-700 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">✨</span>
          <h2 className="font-bold text-xl">The solution</h2>
        </div>
        <p className="text-teal-100 text-sm leading-relaxed mb-4">
          PIPpal takes your plain English descriptions and creates professionally structured, evidence-aligned answers for your claim form — in the exact language DWP assessors are trained to look for.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['⚡', 'Under 15 minutes', 'Most people complete their full claim in one session'],
            ['🎯', 'Points optimised', 'Answers built around the DWP scoring criteria'],
            ['🔒', 'Private & secure', 'Zero data sharing. Encrypted end to end'],
            ['👤', 'Unique to you', 'Tailored to your specific conditions and circumstances'],
          ].map(([emoji, title, desc]) => (
            <div key={title} className="bg-white/10 rounded-xl p-3">
              <p className="text-lg mb-1">{emoji}</p>
              <p className="font-bold text-white text-xs mb-0.5">{title}</p>
              <p className="text-teal-200 text-[10px] leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
