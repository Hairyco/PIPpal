import React from 'react';
import {
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  Search,
  Clock,
} from 'lucide-react';

const painPoints = [
  {
    pain: "Don't know how to describe your condition?",
    solution:
      'We ask simple, plain-English questions and translate your answers into the precise language PIP assessors are trained to look for. No jargon, no guesswork.',
    icon: HelpCircle,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    pain: 'Worried about being rejected?',
    solution:
      "You're far more likely to be refused for how you describe your condition than whether you actually qualify. PIPpal structures every answer to meet the DWP's criteria, so your claim reflects the real impact on your life.",
    icon: ShieldCheck,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    pain: 'Want to maximise your chances?',
    solution:
      'Every answer is tailored to score the maximum points for your specific condition. We cover all 12 activities across Daily Living and Mobility — the same ones assessors use to decide your award.',
    icon: TrendingUp,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    pain: "Not sure what assessors look for?",
    solution:
      "We've studied every PIP descriptor and built our questions around exactly what scores points. You'll see the scoring criteria as you go, so you understand why each question matters.",
    icon: Search,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
];

export function WhyPIPpal() {
  return (
    <section className="px-5 md:px-8 py-8">
      <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-1">
        Built for first-time applicants
      </h2>
      <p className="text-stone-500 text-sm mb-4">
        We know what you're going through — here's how we help.
      </p>

      <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-5">
        <p className="text-sm text-teal-900 leading-relaxed"><strong>You don't need to be physically disabled or severely ill to qualify.</strong> PIP is based on how your condition affects your daily life — not your diagnosis. Mental health conditions, chronic pain, fatigue, anxiety and many hidden conditions all count. If your condition limits what you can do reliably, safely and consistently, you may well be entitled.</p>
      </div>

      {/* Time saving banner */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 mb-6 flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Clock className="w-5 h-5 text-amber-700" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-900 text-sm mb-1">
            PIP forms are stressful and time-consuming
          </h3>
          <p className="text-xs text-amber-800 leading-relaxed">
            Most people spend <strong>2–3 weeks</strong> completing their PIP2
            form — struggling to find the right words, collecting evidence, and
            worrying they'll say the wrong thing. PIPpal cuts that to{' '}
            <strong>15–30 minutes</strong> by guiding you through every question
            with ready-to-use answers.
          </p>
        </div>
      </div>

      {/* Pain point cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {painPoints.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.pain}
              className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm hover:border-teal-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`shrink-0 w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center transition-transform group-hover:scale-110`}
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 text-sm mb-1.5">
                    {item.pain}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {item.solution}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}