import React from 'react';
import { ClipboardCheck, ArrowRight, Sparkles, Info, Share2 } from 'lucide-react';

interface EligibilityBannerProps {
  onStart: () => void;
}

export function EligibilityBanner({ onStart }: EligibilityBannerProps) {
  const handleShare = async () => {
    const shareData = {
      title: 'Am I eligible for PIP?',
      text: 'Check if you might qualify for PIP — the free disability benefit worth up to £843/month. Takes 2 minutes.',
      url: 'https://www.pippal.uk',
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText('Check if you qualify for PIP — free tool at https://www.pippal.uk');
        alert('Link copied to clipboard!');
      }
    } catch { /* dismissed */ }
  };

  return (
    <section id="eligibility-banner" className="px-5 md:px-8 py-6">
      <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-teal-100 rounded-full opacity-40" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h2 className="font-bold text-teal-900 text-base">Am I eligible for PIP?</h2>
                <p className="text-xs text-teal-700">Free · 2 minutes · No sign-up</p>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs text-teal-600 font-semibold bg-white border border-teal-200 px-3 py-1.5 rounded-full hover:bg-teal-50 active:scale-95 transition-all shrink-0"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>

          <div className="bg-teal-100/60 rounded-lg px-3 py-2 mb-3 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
            <p className="text-xs text-teal-800 leading-relaxed">
              Over <strong>64,000 people</strong> apply for PIP every month — many more are eligible and don't know it.
            </p>
          </div>

          <p className="text-sm text-teal-800 leading-relaxed mb-4">
            Answer 8 simple questions and we'll tell you whether you're likely to qualify. <strong>Over 3.9 million people</strong> currently claim PIP — many more are eligible and don't realise.
          </p>

          <button
            onClick={onStart}
            className="w-full bg-teal-700 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Take the Quick Assessment
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
