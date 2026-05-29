import React, { useState } from 'react';
import { Copy, Check, Search } from 'lucide-react';

const SAMPLE_ANSWER =
  'Most days I cannot prepare a simple meal on my own. My ADHD means I forget what I am doing mid-cook — I have left the hob on and only noticed when my partner smelled burning. Anxiety makes the kitchen feel overwhelming: noise, timing several steps, and fear of getting it wrong. On a typical week this happens 4–5 days out of 7. When I do try, it takes me over an hour and I still cannot do it safely or to an acceptable standard without someone checking I have switched everything off. I rely on ready meals or my partner cooking proper food for me.';

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <mark className="bg-amber-200/90 text-stone-900 rounded px-0.5 not-italic font-medium">
      {children}
    </mark>
  );
}

export function LandingReportPreview() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SAMPLE_ANSWER);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* demo only */
    }
  };

  return (
    <section className="px-5 md:px-8 pt-2 md:pt-4 pb-10 md:pb-14 bg-stone-50">
      <div className="max-w-3xl mx-auto">
        <p className="text-[11px] font-bold uppercase tracking-widest text-teal-600 text-center mb-2">
          This is your report
        </p>
        <h2 className="text-2xl md:text-4xl font-bold text-stone-900 text-center leading-tight mb-3">
          Every activity.{' '}
          <span className="text-teal-700">A ready-to-copy answer.</span>
        </h2>
        <p className="text-stone-500 text-sm md:text-base text-center max-w-xl mx-auto mb-8 leading-relaxed">
          Analysis based on your conditions, plus a complete PIP2 answer you can copy straight onto the form — for
          all 12 PIP activities.
        </p>

        {/* Browser frame */}
        <div className="rounded-2xl border border-stone-200 bg-white shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 border-b border-stone-200">
            <div className="flex gap-1.5 shrink-0" aria-hidden>
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 min-w-0 rounded-md bg-white border border-stone-200 px-3 py-1 text-[11px] text-stone-400 truncate text-center">
              pippal.uk/report/activity-1
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Activity 1 of 12</p>
              <h3 className="text-xl md:text-2xl font-bold text-stone-900 mb-2">Preparing food</h3>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-100">
                  Daily living
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                  8 points possible
                </span>
              </div>
            </div>

            {/* Personalised analysis */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-teal-600 shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-700">
                  Personalised analysis
                </p>
              </div>
              <div className="rounded-xl border border-teal-100 bg-teal-50/60 border-l-4 border-l-teal-600 px-4 py-3.5">
                <p className="text-sm text-stone-700 leading-relaxed">
                  Your{' '}
                  <strong className="font-semibold text-stone-900">anxiety and ADHD</strong> make it hard to plan,
                  start and finish cooking safely. You forget steps, avoid the kitchen when overwhelmed, and need
                  someone to check appliances are off. On most days this places you under descriptor{' '}
                  <strong className="font-semibold text-teal-800">1F — cannot prepare and cook a simple meal (8 points)</strong>,
                  because the reliability criteria (safely, repeatedly, to an acceptable standard) fail on the majority
                  of days.
                </p>
              </div>
            </div>

            {/* Ready to copy */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-700">
                  Ready to copy to PIP2 form
                </p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold px-3 py-1.5 transition-colors active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="rounded-xl bg-stone-900 text-stone-100 p-4 md:p-5">
                <p className="text-sm md:text-[15px] leading-relaxed italic">
                  Most days I cannot prepare a simple meal on my own. My ADHD means I forget what I am doing
                  mid-cook — I have left the hob on and only noticed when my partner smelled burning. Anxiety makes
                  the kitchen feel overwhelming: noise, timing several steps, and fear of getting it wrong. On a
                  typical week this happens{' '}
                  <Highlight>4–5 days out of 7</Highlight>. When I do try, it takes me{' '}
                  <Highlight>over an hour</Highlight> and I still cannot do it{' '}
                  <Highlight>safely or to an acceptable standard</Highlight> without someone checking I have switched
                  everything off. I rely on ready meals or my partner cooking proper food for me.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
              <span className="text-teal-700 font-semibold">Next: Activity 2 — Taking nutrition →</span>
              <span className="text-stone-400 font-medium tabular-nums">1 / 12</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
