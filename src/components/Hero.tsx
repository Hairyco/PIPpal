import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight, Star, AlertTriangle, Search } from 'lucide-react';

interface HeroProps {
  onStart?: () => void;
  onEligibility?: () => void;
}

export function Hero({ onStart, onEligibility }: HeroProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="px-5 md:px-8 pt-10 md:pt-16 pb-8 flex flex-col items-center text-center max-w-3xl mx-auto">

      {/* Social proof — 65k stat */}
      <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-2 mb-6 text-sm text-teal-800 font-medium">
        <span className="font-black text-teal-700">65,000</span> people apply for PIP every month in the UK
      </div>

      {/* Headline */}
      <div className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h1 className="text-3xl md:text-5xl font-bold text-stone-900 leading-tight mb-4">
          Get your PIP application right —{' '}
          <span className="text-teal-700">first time</span>
        </h1>
        <p className="text-stone-500 text-base md:text-lg leading-relaxed mb-6 max-w-xl mx-auto">
          The easiest way to get your first PIP application right. We create the answers the DWP needs to see. No jargon, no stress. In under 15 minutes.
        </p>
      </div>

      {/* CTA card */}
      <div className={`w-full max-w-xl transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
        <div className="bg-white rounded-2xl p-5 shadow-md border border-stone-100 mb-4">
          <div className="space-y-2.5 mb-5 text-left">
            {[
              ['100%', ' success rate'],
              ['Up to £10,246', ' a year, tax-free'],
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
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm mb-3"
          >
            Start My Claim — It's Free
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onEligibility}
            className="w-full bg-stone-50 hover:bg-stone-100 text-stone-700 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-stone-200"
          >
            <Search className="w-4 h-4" />
            Check if I qualify first — free
          </button>
        </div>

        {/* Stars */}
        <div className="flex items-center justify-center gap-1 mb-4">
          {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
          <span className="text-xs text-stone-500 ml-1.5">Trusted by thousands of claimants</span>
        </div>

        {/* Urgency banner */}
        <div className="w-full bg-amber-500 rounded-2xl px-4 py-3 flex items-start gap-3 text-left shadow-sm">
          <AlertTriangle className="w-4 h-4 text-white shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-bold text-xs">PIP eligibility rules are tightening in 2026</p>
            <p className="text-amber-100 text-[11px] leading-relaxed mt-0.5">If you think you qualify, applying now locks in your entitlement. Every day you wait costs money — payments are backdated only to your first call.</p>
          </div>
        </div>
      </div>

    </section>
  );
}
