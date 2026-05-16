import React, { useState } from 'react';
import { ArrowLeft, Check, Copy, Share2, Star, ChevronRight } from 'lucide-react';
import { useAppContext } from './AppContext';

type Rating = string | null;

interface SurveyData {
  easeOfUse: Rating;
  helpfulness: Rating;
  recommend: Rating;
  openFeedback: string;
  /** 1–5 stars, overall satisfaction */
  overallRating: number | null;
}

const EASE_OPTIONS = [
  { id: 'easy',       label: 'Easy',       sub: 'Straightforward throughout',   color: 'bg-emerald-600 border-emerald-600 text-white', inactive: 'bg-white border-stone-200 text-stone-700 hover:border-emerald-200' },
  { id: 'ok',         label: 'OK',         sub: 'A few confusing moments',       color: 'bg-amber-500 border-amber-500 text-white',    inactive: 'bg-white border-stone-200 text-stone-700 hover:border-amber-200' },
  { id: 'difficult',  label: 'Difficult',  sub: 'Found it hard to follow',       color: 'bg-rose-500 border-rose-500 text-white',      inactive: 'bg-white border-stone-200 text-stone-700 hover:border-rose-200' },
];

const HELPFULNESS_OPTIONS = [
  { id: 'a_lot',      label: 'A lot',       color: 'bg-teal-700 border-teal-700 text-white', inactive: 'bg-white border-stone-200 text-stone-700 hover:border-teal-200' },
  { id: 'somewhat',   label: 'Somewhat',    color: 'bg-teal-400 border-teal-400 text-white', inactive: 'bg-white border-stone-200 text-stone-700 hover:border-teal-200' },
  { id: 'not_really', label: 'Not really',  color: 'bg-stone-400 border-stone-400 text-white', inactive: 'bg-white border-stone-200 text-stone-700 hover:border-stone-300' },
];

const RECOMMEND_OPTIONS = [
  { id: 'yes',        label: 'Definitely',  color: 'bg-teal-700 border-teal-700 text-white', inactive: 'bg-white border-stone-200 text-stone-700 hover:border-teal-200' },
  { id: 'maybe',      label: 'Maybe',       color: 'bg-amber-500 border-amber-500 text-white', inactive: 'bg-white border-stone-200 text-stone-700 hover:border-amber-200' },
  { id: 'no',         label: 'No',          color: 'bg-stone-400 border-stone-400 text-white', inactive: 'bg-white border-stone-200 text-stone-700 hover:border-stone-300' },
];

const SHARE_URL = 'https://pippal.uk';
const SHARE_TEXT = 'I used PIPpal to prepare my PIP claim answers — it helps you write what to say for each question. Really useful if you\'re going through the process.';

function OptionButton({
  option,
  selected,
  onSelect,
}: {
  option: { id: string; label: string; sub?: string; color: string; inactive: string };
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex-1 flex flex-col items-center gap-1 px-3 py-3 rounded-2xl border-2 font-semibold text-sm transition-all active:scale-[0.97] ${selected ? option.color : option.inactive}`}
    >
      <span className="flex items-center gap-1.5">
        {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
        {option.label}
      </span>
      {option.sub && (
        <span className={`text-[10px] font-normal leading-tight text-center ${selected ? 'text-white/80' : 'text-stone-400'}`}>
          {option.sub}
        </span>
      )}
    </button>
  );
}

function OverallStarRating({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-center gap-1 flex-nowrap" role="group" aria-label="Overall rating out of 5 stars">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = value != null && n <= value;
          return (
            <button
              key={n}
              type="button"
              aria-label={`Rate ${n} out of 5 stars`}
              onClick={() => onChange(n)}
              className="p-1.5 rounded-xl hover:bg-amber-50 transition-colors active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <Star
                className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                  filled ? 'text-amber-400 fill-amber-400' : 'text-stone-300 fill-transparent'
                }`}
                strokeWidth={filled ? 0 : 1.75}
              />
            </button>
          );
        })}
      </div>
      <p className="text-xs text-stone-400 tabular-nums min-h-[1rem]">
        {value != null ? `${value} / 5` : 'Tap to rate'}
      </p>
    </div>
  );
}

export function SurveyScreen() {
  const { goBack, navigateTo } = useAppContext();
  const [survey, setSurvey] = useState<SurveyData>({
    easeOfUse: null,
    helpfulness: null,
    recommend: null,
    openFeedback: '',
    overallRating: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = (key: keyof SurveyData, val: string) =>
    setSurvey(prev => ({ ...prev, [key]: val }));

  const anyAnswered =
    survey.easeOfUse ||
    survey.helpfulness ||
    survey.recommend ||
    survey.openFeedback.trim() ||
    survey.overallRating != null;

  async function handleSubmit() {
    // Fire and forget — we don't want this to block anything
    try {
      await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          easeOfUse: survey.easeOfUse,
          helpfulness: survey.helpfulness,
          recommend: survey.recommend,
          overallRating: survey.overallRating,
          feedback: survey.openFeedback.trim() || null,
          submittedAt: new Date().toISOString(),
        }),
      });
    } catch {
      // Silently ignore — survey submission is non-critical
    }
    setSubmitted(true);
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'PIPpal', text: SHARE_TEXT, url: SHARE_URL });
        return;
      } catch { /* user cancelled or not supported */ }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${SHARE_TEXT} ${SHARE_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* silently fail */ }
  }

  // ─── POST-SUBMIT SCREEN ─────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col h-full bg-stone-50">
        <div className="px-5 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
          <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-stone-900 text-lg">Feedback</h1>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
          <div className="px-5 py-10 flex flex-col items-center text-center gap-6 max-w-sm mx-auto">
            <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Check className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-xl mb-2">Thank you</h2>
              <p className="text-sm text-stone-500 leading-relaxed">Your feedback helps us improve PIPpal for everyone going through the PIP process.</p>
            </div>
            <ShareSection onShare={handleShare} copied={copied} navigateTo={navigateTo} />
          </div>
        </div>
      </div>
    );
  }

  // ─── SURVEY ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-stone-900 text-lg">Quick feedback</h1>
          <p className="text-xs text-stone-400">Takes 30 seconds — skip any question</p>
        </div>
        <button
          onClick={() => navigateTo('question_index')}
          className="text-xs font-semibold text-stone-400 hover:text-stone-600 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
        >
          Skip all
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
        <div className="bg-teal-700 px-5 py-5 text-white">
          <p className="text-teal-300 text-[10px] font-bold uppercase tracking-widest mb-1">Well done</p>
          <h2 className="font-bold text-xl mb-1">You've completed your questions</h2>
          <p className="text-teal-100 text-sm leading-relaxed">We'd love to know how it went — this helps us make PIPpal better for everyone.</p>
        </div>

        <div className="px-5 py-5 space-y-6 max-w-2xl mx-auto">

          {/* Q1: Ease of use */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="font-bold text-stone-900 text-sm mb-1">How easy was PIPpal to use?</p>
            <p className="text-xs text-stone-400 mb-4">Think about the overall experience from start to finish.</p>
            <div className="flex gap-2">
              {EASE_OPTIONS.map(opt => (
                <OptionButton
                  key={opt.id}
                  option={opt}
                  selected={survey.easeOfUse === opt.id}
                  onSelect={() => set('easeOfUse', opt.id)}
                />
              ))}
            </div>
          </div>

          {/* Q2: Helpfulness */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="font-bold text-stone-900 text-sm mb-1">Did PIPpal help you understand your claim better?</p>
            <p className="text-xs text-stone-400 mb-4">Did you feel more confident about what to write on your form?</p>
            <div className="flex gap-2">
              {HELPFULNESS_OPTIONS.map(opt => (
                <OptionButton
                  key={opt.id}
                  option={opt}
                  selected={survey.helpfulness === opt.id}
                  onSelect={() => set('helpfulness', opt.id)}
                />
              ))}
            </div>
          </div>

          {/* Q3: Recommend */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="font-bold text-stone-900 text-sm mb-1">Would you recommend PIPpal to someone else going through the PIP process?</p>
            <p className="text-xs text-stone-400 mb-4">Friends, family, or people in support groups.</p>
            <div className="flex gap-2">
              {RECOMMEND_OPTIONS.map(opt => (
                <OptionButton
                  key={opt.id}
                  option={opt}
                  selected={survey.recommend === opt.id}
                  onSelect={() => set('recommend', opt.id)}
                />
              ))}
            </div>
          </div>

          {/* Q4: Open text */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="font-bold text-stone-900 text-sm mb-1">Anything else you'd like to tell us? <span className="font-normal text-stone-400">(optional)</span></p>
            <p className="text-xs text-stone-400 mb-3">What worked well, what could be improved, or anything we missed.</p>
            <textarea
              value={survey.openFeedback}
              onChange={e => setSurvey(prev => ({ ...prev, openFeedback: e.target.value.slice(0, 500) }))}
              placeholder="Your thoughts here..."
              rows={3}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-teal-400 focus:border-teal-400 resize-none"
            />
            <p className="text-right text-xs text-stone-400 mt-1">{survey.openFeedback.length}/500</p>
          </div>

          {/* Overall star rating */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="font-bold text-stone-900 text-sm mb-1 text-center">Overall, how would you rate PIPpal?</p>
            <p className="text-xs text-stone-400 mb-5 text-center">1 star = poor · 5 stars = excellent</p>
            <OverallStarRating
              value={survey.overallRating}
              onChange={(n) => setSurvey((prev) => ({ ...prev, overallRating: n }))}
            />
          </div>

          {/* Submit */}
          {anyAnswered && (
            <button
              onClick={handleSubmit}
              className="w-full bg-teal-700 text-white py-4 rounded-2xl font-bold text-base hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
            >
              Send feedback <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Share section — always visible at the bottom */}
          <ShareSection onShare={handleShare} copied={copied} navigateTo={navigateTo} />
        </div>
      </div>
    </div>
  );
}

// ─── SHARE SECTION ────────────────────────────────────────────────────────────

function ShareSection({
  onShare,
  copied,
  navigateTo,
}: {
  onShare: () => void;
  copied: boolean;
  navigateTo: (s: any) => void;
}) {
  return (
    <div className="w-full space-y-3">
      <div className="bg-teal-700 rounded-2xl p-5 text-white">
        <p className="text-teal-300 text-[10px] font-bold uppercase tracking-widest mb-1">Help someone else</p>
        <h3 className="font-bold text-base mb-1.5">Know someone going through PIP?</h3>
        <p className="text-teal-100 text-sm leading-relaxed mb-4">
          PIPpal is free to try — sharing it could make a real difference to someone navigating the same process.
        </p>
        <button
          onClick={onShare}
          className="w-full flex items-center justify-center gap-2 bg-white text-teal-700 py-3 rounded-xl font-bold text-sm hover:bg-teal-50 active:scale-[0.98] transition-all"
        >
          {copied ? (
            <><Check className="w-4 h-4" />Link copied to clipboard</>
          ) : (
            <><Share2 className="w-4 h-4" />Share PIPpal with a friend</>
          )}
        </button>
      </div>

      <a
        href="https://uk.trustpilot.com/review/pippal.uk"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center gap-3 bg-white border border-stone-100 rounded-2xl p-4 hover:border-amber-200 hover:bg-amber-50/30 active:scale-[0.98] transition-all"
      >
        <div className="flex gap-0.5 shrink-0">
          {[0,1,2,3,4].map(i => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-stone-900 text-sm">Leave a review on Trustpilot</p>
          <p className="text-xs text-stone-400">Takes 2 minutes — really helps us grow</p>
        </div>
        <ChevronRight className="w-4 h-4 text-stone-300 shrink-0" />
      </a>

      <button
        onClick={() => navigateTo('question_index')}
        className="w-full text-sm font-medium text-stone-400 hover:text-stone-600 py-2 transition-colors"
      >
        Back to my questions
      </button>
    </div>
  );
}
