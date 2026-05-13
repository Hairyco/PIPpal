import React from 'react';
import { MessageSquareText, ClipboardCheck, Send } from 'lucide-react';

const steps = [
  {
    num: '1',
    icon: MessageSquareText,
    title: 'Your day-to-day',
    desc: "Describe how your condition affects you day-to-day. Simple questions, your own words — no medical knowledge needed.",
  },
  {
    num: '2',
    icon: ClipboardCheck,
    title: 'We write your answers',
    desc: 'PIPpal shapes your responses into clear, detailed answers built around the DWP scoring criteria — maximising your points.',
  },
  {
    num: '3',
    icon: Send,
    title: 'Submit with confidence',
    desc: 'Download your completed answers, ready to copy onto your PIP2 form. Every question covered.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 md:px-8 py-6">
      <h2 className="text-lg font-bold text-stone-900 mb-1">How it works</h2>
      <p className="text-stone-500 text-sm mb-5">Three simple steps. No stress.</p>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex gap-4 items-start">
            <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{step.num}</span>
            </div>
            <div>
              <p className="font-semibold text-stone-900 text-sm mb-0.5">{step.title}</p>
              <p className="text-stone-500 text-xs leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
