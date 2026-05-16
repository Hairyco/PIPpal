import React, { useEffect, useState } from 'react';
import { Trophy, CheckCircle2, ArrowRight, ChevronDown } from 'lucide-react';

interface HeroProps {
  onStart?: () => void;
  onEligibility?: () => void;
}

export function Hero({ onStart }: HeroProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const checks = [
    { text: '65% of claims fail — we help you succeed' },
    { text: '100% personalised. No templates' },
    { text: 'Finish in just 15 minutes' },
    { text: 'Get a faster decision' },
    { text: 'Handwritten form service available' },
  ];

  return (
    <section className="px-5 md:px-8 pt-10 md:pt-20 pb-8 md:pb-14 flex flex-col items-center text-center max-w-4xl mx-auto">

      {/* Badge */}
      <div
        className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
        style={{ transitionDelay: '0ms' }}
      >
        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full text-xs font-semibold mb-6">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          UK's #1 PIP Application Assistant
        </div>
      </div>

      {/* Headline */}
      <div
        className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: '80ms' }}
      >
        <h1 className="text-3xl md:text-5xl font-bold text-stone-900 leading-tight mb-4">
          Get your PIP application right —{' '}
          <span className="text-teal-700">first time</span>
        </h1>
        <p className="text-stone-600 text-base md:text-lg leading-relaxed mb-4 max-w-2xl mx-auto px-2">
          We guide you to describe your real daily challenges clearly and accurately so the DWP fully understands your needs.
        </p>
      </div>

      {/* Main card */}
      <div
        className={`w-full md:max-w-xl transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: '160ms' }}
      >
        <div className="bg-white rounded-2xl shadow-md border border-stone-100 mb-5 overflow-hidden">
          {/* Full-width teal header — rounded top matches card (flush sides, no inset pill) */}
          <div className="bg-teal-700 px-4 py-3 text-center">
            <p className="text-white text-[11px] sm:text-xs font-medium leading-relaxed">
              Built on 1,000s of successful claims
            </p>
          </div>

          <div className="p-5 md:p-6">
          {/* Avatar row below strip */}
          <div className="flex items-center justify-start gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[
                  { bg: 'bg-teal-400', initials: 'SK' },
                  { bg: 'bg-purple-400', initials: 'LM' },
                  { bg: 'bg-amber-400', initials: 'AJ' },
                  { bg: 'bg-rose-400', initials: 'RK' },
                  { bg: 'bg-blue-400', initials: 'TH' },
                ].map((a,i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${a.bg} border-2 border-white flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>
                    {a.initials}
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone-500 font-medium whitespace-nowrap">1,200+ applicants</p>
            </div>
            <div className="flex">{'★★★★★'.split('').map((s,i) => <span key={i} className="text-amber-400 text-sm">{s}</span>)}</div>
          </div>

          <div className="space-y-3 mb-5 text-left">
            {checks.map((check, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-sm text-stone-700">{check.text}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onStart}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm"
          >
            Start Now — It&apos;s Free
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-center text-xs text-stone-400 mt-3">
            🔒 100% Secure &amp; Confidential
          </p>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <button
        type="button"
        onClick={() => document.getElementById('free-tools')?.scrollIntoView({ behavior: 'smooth' })}
        className="mt-2 text-sm text-teal-700 font-medium hover:text-teal-800 transition-colors flex items-center gap-1.5 group"
      >
        Try our free calculators
        <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
      </button>
    </section>
  );
}
