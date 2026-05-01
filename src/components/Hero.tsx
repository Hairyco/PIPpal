import React, { useEffect, useState } from 'react';
import { Trophy, CheckCircle2, Star, ArrowRight, ChevronDown, AlertTriangle } from 'lucide-react';

interface HeroProps {
  onStart?: () => void;
}

export function Hero({ onStart }: HeroProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const stats = [
    { value: '94%', label: 'success rate' },
    { value: '15–30', label: 'mins to complete' },
    { value: '£12.99', label: 'one-time only' },
  ];

  const checks = [
    { text: 'Complete in 15–30 minutes' },
    { text: 'Unique answers to your specific conditions' },
    { text: 'Guides you through all 12 PIP questions' },
    { text: 'Assessment prep & appeal letter generator' },
  ];

  return (
    <section className="px-5 md:px-8 pt-10 md:pt-20 pb-8 md:pb-14 flex flex-col items-center text-center max-w-4xl mx-auto">

      {/* Urgency banner */}
      <div className="w-full md:max-w-2xl bg-amber-500 rounded-2xl px-5 py-4 mb-7 flex items-start gap-3 text-left shadow-md">
        <AlertTriangle className="w-5 h-5 text-white shrink-0 mt-0.5" />
        <div>
          <p className="text-white font-bold text-sm leading-snug">PIP rules are changing in late 2026</p>
          <p className="text-amber-100 text-xs leading-relaxed mt-0.5">The government is tightening eligibility thresholds. If you think you qualify, applying now could protect your entitlement. Do not wait.</p>
        </div>
      </div>

      {/* Badge */}
      <div
        className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
        style={{ transitionDelay: '0ms' }}
      >
        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full text-xs font-semibold mb-6">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          UK's #1 PIP Guidance Tool
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
        <p className="text-stone-600 text-base md:text-lg leading-relaxed mb-8 max-w-2xl mx-auto px-2">
          We guide you through every question, tailored to your condition. No jargon, no stress, no expensive advisers.
        </p>
      </div>

      {/* Main card */}
      <div
        className={`w-full md:max-w-xl transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: '160ms' }}
      >
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-md border border-stone-100 mb-5">
          <div className="space-y-3 mb-5 text-left">
            {checks.map((check, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-sm text-stone-700">{check.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onStart}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm"
          >
            Start Now — It's Free
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-center text-xs text-stone-400 mt-3">
            Free tools available · Full access from £12.99 one-time
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div
        className={`w-full md:max-w-xl transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: '240ms' }}
      >
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-stone-100 shadow-sm text-center">
              <div className="font-bold text-teal-700 text-lg leading-none mb-1">{stat.value}</div>
              <div className="text-[10px] text-stone-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Star rating */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
          <span className="text-xs text-stone-500 ml-1 font-medium">Trusted by thousands of claimants</span>
        </div>
      </div>

      {/* Scroll hint */}
      <button
        onClick={() => document.getElementById('free-tools')?.scrollIntoView({ behavior: 'smooth' })}
        className="text-sm text-teal-700 font-medium hover:text-teal-800 transition-colors flex items-center gap-1.5 group"
      >
        Try our free calculators
        <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
      </button>
    </section>
  );
}