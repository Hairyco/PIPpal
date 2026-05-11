import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight, Star, AlertTriangle } from 'lucide-react';

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

  return (
    <section className="px-5 md:px-8 pt-10 md:pt-16 pb-10 flex flex-col items-center text-center max-w-3xl mx-auto">

      {/* Urgency banner */}
      <div className="w-full bg-amber-500 rounded-2xl px-4 py-3.5 mb-8 flex items-start gap-3 text-left shadow-sm">
        <AlertTriangle className="w-4 h-4 text-white shrink-0 mt-0.5" />
        <div>
          <p className="text-white font-bold text-sm">PIP rules are changing in late 2026</p>
          <p className="text-amber-100 text-xs leading-relaxed mt-0.5">The government is tightening eligibility. If you think you qualify, applying now protects your entitlement.</p>
        </div>
      </div>

      {/* Headline */}
      <div className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h1 className="text-3xl md:text-5xl font-bold text-stone-900 leading-tight mb-4">
          Get your PIP application right —{' '}
          <span className="text-teal-700">first time</span>
        </h1>
        <p className="text-stone-500 text-base md:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
          PIP claims, made simple. We turn your answers into what DWP need to see. No jargon, no stress.
        </p>
      </div>

      {/* CTA card */}
      <div className={`w-full max-w-xl transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
        <div className="bg-white rounded-2xl p-5 shadow-md border border-stone-100 mb-5">
          <div className="space-y-2.5 mb-5 text-left">
            {[
              ['100%', ' success rate'],
              ['Receive your PIP decision', ' 3–6 weeks earlier'],
              ['Unique answers', ' tailored to your condition'],
              ['Zero data sharing', ' — encrypted & private'],
            ].map(([bold, rest], i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-sm text-stone-700"><strong>{bold}</strong>{rest}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onStart}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm"
          >
            Start Now — It's Free
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-center text-xs text-stone-400 mt-3">Free tools available · Full access £8.99 — limited time</p>
        </div>

        {/* Free calculators link */}
        <div className="flex items-center justify-center">
          <a
            href="#free-tools"
            className="text-xs text-teal-700 font-semibold hover:text-teal-800 transition-colors"
          >
            Try our free PIP calculators →
          </a>
        </div>
      </div>

    </section>
  );
}
