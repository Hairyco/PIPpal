import React from 'react';
import { MessageSquareText, ClipboardCheck, Send } from 'lucide-react';
const steps = [
{
  num: '1',
  title: 'Tell us about your condition',
  desc: "Just describe your daily life in your own words. We ask the right questions so you don't have to figure out what matters.",
  icon: MessageSquareText
},
{
  num: '2',
  title: 'We tailor your answers',
  desc: 'Your responses are shaped into clear, detailed answers using the exact DWP scoring criteria — written to maximise your points.',
  icon: ClipboardCheck
},
{
  num: '3',
  title: 'Submit with confidence',
  desc: 'Download your completed answers, ready to copy onto your PIP2 form. Every question covered, fully prepared.',
  icon: Send
}];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 md:px-8 py-8">
      <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-2">
        How it works
      </h2>
      <p className="text-stone-500 text-sm mb-6">
        Three simple steps. No stress.
      </p>

      <div className="relative flex flex-col md:flex-row md:gap-8 gap-0">
        {/* Vertical connector line */}
        <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-teal-100 md:hidden" />

        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="flex md:flex-col md:flex-1 gap-4 items-start relative pb-8 md:pb-0 last:pb-0">
              
              <div className="shrink-0 w-12 h-12 rounded-full bg-teal-700 flex items-center justify-center z-10 shadow-sm">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="pt-1">
                <div className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">
                  Step {step.num}
                </div>
                <h3 className="font-semibold text-stone-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>);

        })}
      </div>
    </section>);

}