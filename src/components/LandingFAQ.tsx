import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useAppContext } from './AppContext';
import { formatFullAccessPrice } from '../constants/pricing';

const FAQ_ITEMS: { question: string; answer: React.ReactNode }[] = [
  {
    question: 'Is this guidance really personalised to my condition?',
    answer: (
      <>
        Yes. You add your conditions, medications and notes in your medical profile. PIPpal uses that
        context to tailor each activity — explainers, difficulty options and draft answers — so you are not
        working from generic templates.
      </>
    ),
  },
  {
    question: 'I’ve already been refused PIP. Can PIPpal still help me?',
    answer: (
      <>
        Many people use PIPpal after a refusal. Full Access includes tools for{' '}
        <strong className="font-semibold text-stone-800">Mandatory Reconsideration</strong> and{' '}
        <strong className="font-semibold text-stone-800">appeals</strong>, plus change-of-circumstances
        support if things have got worse. We cannot overturn a decision for you, but we help you describe
        your situation more clearly for the next step.
      </>
    ),
  },
  {
    question: 'Is my personal information safe?',
    answer: (
      <>
        Your account data is stored securely. Payments are handled by Stripe — we never see your card
        details.         Read our{' '}
        <button
          type="button"
          onClick={() => navigateTo('privacy')}
          className="text-teal-700 font-semibold underline underline-offset-2 hover:text-teal-800"
        >
          privacy policy
        </button>{' '}
        for full detail. PIPpal is not affiliated with DWP.
      </>
    ),
  },
  {
    question: 'How is this different from free information on GOV.UK?',
    answer: (
      <>
        GOV.UK tells you what each question means. PIPpal walks you through all 12 activities, matches your
        answers to <strong className="font-semibold text-stone-800">PIP descriptors</strong>, applies reliability
        wording (safely, repeatedly, in reasonable time), and drafts copy-ready answers you can paste into
        your PIP2 — based on what you tell us about your day-to-day life.
      </>
    ),
  },
  {
    question: 'I need help or have a question about my claim',
    answer: (
      <>
        Email us at{' '}
        <a
          href="mailto:support@pippal.uk"
          className="text-teal-700 font-semibold underline underline-offset-2"
        >
          support@pippal.uk
        </a>
        . We cannot give legal or medical advice, but we can help with using the app, downloads and account
        issues. For complex cases, Citizens Advice or a welfare rights service may also be worth contacting.
      </>
    ),
  },
  {
    question: 'What’s included in Full Access vs the free tools?',
    answer: (
      <>
        <strong className="font-semibold text-stone-800">Free:</strong> eligibility checker, payment and
        backpay calculators, and trying the guided flow before you pay.{' '}
        <strong className="font-semibold text-stone-800">Full Access ({formatFullAccessPrice()} one-off):</strong> all 12
        questions, unlimited answer improvements, PIP diary, assessment prep, MR and appeal letter helpers,
        PDF export, and change-of-circumstances walkthrough — no subscription.
      </>
    ),
  },
  {
    question: 'How quickly can I build my answers?',
    answer: (
      <>
        Most people complete the guided questions in <strong className="font-semibold text-stone-800">15–30
        minutes</strong> per session. Draft answers are generated as you go — you can edit, shorten or
        expand them before copying into your PIP2.
      </>
    ),
  },
  {
    question: 'Does this work for PIP reviews and renewals?',
    answer: (
      <>
        Yes. Use PIPpal for a new claim, a renewal, or a{' '}
        <strong className="font-semibold text-stone-800">change of circumstances</strong> if your needs have
        increased. You can upload previous PIP2 or PA4 wording so your new answers show what has changed since
        DWP last assessed you.
      </>
    ),
  },
  {
    question: 'Can you guarantee I’ll get PIP?',
    answer: (
      <>
        No. PIPpal is independent guidance — not DWP, not a law firm, and not a medical assessor. Awards
        depend on how your conditions affect you and how DWP applies the rules. We help you present your
        situation clearly and accurately; the decision remains with DWP.
      </>
    ),
  },
];

export function LandingFAQ() {
  const { navigateTo } = useAppContext();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section id="faq" className="px-5 md:px-8 py-10 md:py-14 bg-stone-50 scroll-mt-20">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 leading-snug">
            Frequently asked questions
          </h2>
          <p className="text-stone-500 text-sm md:text-base mt-2">
            Everything you need to know before you start.
          </p>
        </div>

        <ul className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <li key={item.question}>
                <div
                  className={`bg-white rounded-2xl border shadow-sm transition-colors ${
                    isOpen ? 'border-teal-200 ring-1 ring-teal-100' : 'border-stone-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    className="w-full flex items-start gap-3 text-left px-4 py-4 md:px-5 md:py-4"
                  >
                    <span className="flex-1 text-sm md:text-base font-semibold text-stone-900 leading-snug pr-2">
                      {item.question}
                    </span>
                    <span
                      className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                        isOpen ? 'bg-teal-100 text-teal-700' : 'bg-orange-50 text-orange-500'
                      }`}
                      aria-hidden
                    >
                      {isOpen ? <Minus className="h-4 w-4" strokeWidth={2.5} /> : <Plus className="h-4 w-4" strokeWidth={2.5} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 md:px-5 md:pb-5 -mt-1 text-sm text-stone-600 leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
