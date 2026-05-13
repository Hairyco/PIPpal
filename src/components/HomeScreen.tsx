import React, { useState, useEffect, useRef } from 'react';
import { PIPPointsEstimator } from './PIPPointsEstimator';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  PlusCircle,
  RefreshCw,
  Scale,
  FileText,
  BookOpen,
  Calendar,
  HelpCircle,
  CheckSquare,
  Download,
  Shield,
  TrendingUp,
  ChevronRight,
  Calculator,
  Clock,
  Coins,
  X,
  Sparkles,
  Settings,
  Newspaper,
  Hourglass,
  PlayCircle,
} from 'lucide-react';
import { useAppContext, Screen } from './AppContext';

interface NavCardProps {
  title: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  target: Screen;
  locked?: boolean;
}

function NavCard({ title, desc, icon: Icon, color, bg, target, locked }: NavCardProps) {
  const { navigateTo } = useAppContext();
  return (
    <button
      onClick={() => navigateTo(target)}
      className={`flex flex-col text-left bg-white p-4 rounded-2xl border shadow-sm transition-all active:scale-95 group relative overflow-hidden
        ${locked
          ? 'border-stone-100 opacity-70 hover:border-stone-200'
          : 'border-stone-100 hover:border-teal-200 hover:shadow-md'
        }`}
    >
      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <h3 className="font-semibold text-stone-900 text-sm mb-1 whitespace-pre-line leading-snug">
        {title}
      </h3>
      <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
      {locked && (
        <div className="absolute top-3 right-3 bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
          PRO
        </div>
      )}
    </button>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
      <div
        className="bg-teal-500 h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function HomeScreen() {
  const { medProfile, navigateTo, user, hasPaid, savedAnswers, setSelectedQuestionId } = useAppContext();
  const [newsHeadlines, setNewsHeadlines] = useState<string[]>([]);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [urgencyDismissed, setUrgencyDismissed] = useState(
    () => sessionStorage.getItem('urgency_dismissed') === 'true'
  );
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(d => {
        if (d.articles?.length > 0) {
          setNewsHeadlines(d.articles.slice(0, 8).map((a: any) => a.title));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (newsHeadlines.length === 0) return;
    tickerRef.current = setInterval(() => {
      setTickerIndex(i => (i + 1) % newsHeadlines.length);
    }, 4000);
    return () => { if (tickerRef.current) clearInterval(tickerRef.current); };
  }, [newsHeadlines]);

  const hasConditions = medProfile.conditions.length > 0;
  const firstName = user?.name ? user.name.split(' ')[0] : '';

  // Resume state — set when user navigates to dashboard mid-question
  const [resumeData, setResumeData] = useState<{ questionId: string; step: number | string; title: string } | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('pippal_resume') || 'null'); } catch { return null; }
  });

  const handleResume = () => {
    if (!resumeData) return;
    sessionStorage.removeItem('pippal_resume');
    setResumeData(null);
    setSelectedQuestionId(resumeData.questionId);
    // If they left from the result screen, go back to result; otherwise go to intro
    if (resumeData.step === 'result') {
      navigateTo('q1_result');
    } else {
      navigateTo('personalising');
    }
  };

  const dismissResume = () => {
    sessionStorage.removeItem('pippal_resume');
    setResumeData(null);
  };

  const dismissUrgency = () => {
    sessionStorage.setItem('urgency_dismissed', 'true');
    setUrgencyDismissed(true);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-24">

      {/* News ticker */}
      {newsHeadlines.length > 0 && (
        <button
          onClick={() => navigateTo('news')}
          className="bg-teal-700 px-4 py-2.5 flex items-center gap-3 hover:bg-teal-800 transition-colors shrink-0 w-full text-left"
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <Newspaper className="w-3.5 h-3.5 text-teal-200" />
            <span className="text-[10px] font-black text-teal-200 uppercase tracking-widest">News</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs text-white font-medium truncate">
              {newsHeadlines[tickerIndex]}
            </p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-teal-300 shrink-0" />
        </button>
      )}

      {/* Header */}
      <div className="px-5 md:px-8 py-6 bg-teal-700 text-white rounded-b-3xl shadow-sm mb-5 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {firstName ? `Welcome back, ${firstName}` : 'Welcome to PIPpal'}
          </h1>
          <p className="text-teal-100 text-sm">PIP claims. Made easy.</p>
        </div>
        {user && (
          <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center font-bold text-lg border-2 border-teal-500 shadow-sm shrink-0">
            {firstName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="px-5 md:px-8 space-y-6">

        {/* Urgency banner — dismissible */}
        {!urgencyDismissed && (
          <div className="bg-amber-500 rounded-2xl px-4 py-3 flex items-start gap-2.5 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-white font-bold text-xs leading-snug">PIP rules are changing in late 2026</p>
              <p className="text-amber-100 text-[11px] leading-relaxed mt-0.5">Eligibility thresholds are tightening. Applying now could protect your entitlement.</p>
              <button
                onClick={() => navigateTo('news')}
                className="text-white underline text-[11px] font-semibold mt-1 hover:text-amber-100"
              >
                Read latest news →
              </button>
            </div>
            <button onClick={dismissUrgency} className="shrink-0 text-amber-200 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Resume banner — shown when user navigated away mid-question */}
        {resumeData && (
          <div className="bg-teal-700 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm">
            <PlayCircle className="w-8 h-8 text-teal-200 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-snug">Continue where you left off</p>
              <p className="text-teal-200 text-xs mt-0.5 truncate">{resumeData.title}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={dismissResume}
                className="text-teal-300 hover:text-white text-xs font-semibold transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={handleResume}
                className="bg-white text-teal-700 text-xs font-bold px-3 py-2 rounded-xl hover:bg-teal-50 active:scale-95 transition-all"
              >
                Resume →
              </button>
            </div>
          </div>
        )}

        {/* Points Estimator — shows when any answers saved */}
        <PIPPointsEstimator />

        {/* Medical profile */}
        <section>
          <button
            onClick={() => navigateTo('medical_profile')}
            className="w-full bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all hover:border-teal-200 hover:shadow-md"
          >
            <div className="text-left flex-1 min-w-0">
              <h2 className="font-bold text-stone-900 text-sm mb-1">
                My conditions
                {hasConditions ? ` · ${medProfile.conditions.length} added` : ''}
              </h2>
              {hasConditions ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {medProfile.conditions.slice(0, 4).map((c, i) => (
                    <span key={i} className="bg-teal-50 text-teal-700 text-[10px] px-2 py-1 rounded-full font-medium">
                      {c.name}
                    </span>
                  ))}
                  {medProfile.conditions.length > 4 && (
                    <span className="bg-stone-100 text-stone-500 text-[10px] px-2 py-1 rounded-full font-medium">
                      +{medProfile.conditions.length - 4} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-stone-500">Add your conditions so PIPpal can tailor your answers</p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400 shrink-0 ml-3" />
          </button>
        </section>

        {/* Claim actions */}
        <section>
          <h2 className="text-sm font-bold text-stone-900 mb-3">Your claim</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <NavCard
              title="New Claim"
              desc="Start a fresh PIP application"
              icon={PlusCircle}
              color="text-teal-600"
              bg="bg-teal-50"
              target="claim_flow"
            />
            <NavCard
              title={'Change of\nCircumstances'}
              desc="Update an existing award"
              icon={RefreshCw}
              color="text-purple-600"
              bg="bg-purple-50"
              target="change_of_circumstances"
              locked={!hasPaid}
            />
            <NavCard
              title={'Mandatory\nReconsideration'}
              desc="Challenge a recent decision"
              icon={FileText}
              color="text-amber-600"
              bg="bg-amber-50"
              target="mandatory_reconsideration"
              locked={!hasPaid}
            />
            <NavCard
              title="Appeal"
              desc="Take your case to tribunal"
              icon={Scale}
              color="text-rose-600"
              bg="bg-rose-50"
              target="appeal"
              locked={!hasPaid}
            />
          </div>
        </section>

        {/* Tools & Resources */}
        <section>
          <h2 className="text-sm font-bold text-stone-900 mb-3">Tools & resources</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <NavCard
              title="Am I Eligible?"
              desc="Check if you should apply"
              icon={HelpCircle}
              color="text-indigo-600"
              bg="bg-indigo-50"
              target="eligibility"
            />
            <NavCard
              title="Timeline"
              desc="How long will your claim take?"
              icon={Clock}
              color="text-blue-600"
              bg="bg-blue-50"
              target="timeline_calculator"
            />
            <NavCard
              title="PIP Award"
              desc="Calculate your weekly payments"
              icon={Coins}
              color="text-amber-600"
              bg="bg-amber-50"
              target="payment_calculator"
            />
            <NavCard
              title="Backpay"
              desc="Estimate backdated payments"
              icon={Calculator}
              color="text-emerald-600"
              bg="bg-emerald-50"
              target="backpay_calculator"
            />
            <NavCard
              title="Assessment Prep"
              desc="Get ready for your assessment"
              icon={BookOpen}
              color="text-blue-600"
              bg="bg-blue-50"
              target="assessment_prep"
              locked={!hasPaid}
            />
            <NavCard
              title="PIP Diary"
              desc="Log your daily challenges"
              icon={Calendar}
              color="text-emerald-600"
              bg="bg-emerald-50"
              target="pip_diary"
              locked={!hasPaid}
            />
            <NavCard
              title="Pre-Claim Checklist"
              desc="Everything you need before applying"
              icon={CheckSquare}
              color="text-cyan-600"
              bg="bg-cyan-50"
              target="pre_claim_checklist"
              locked={!hasPaid}
            />
            <NavCard
              title="Awaiting Decision"
              desc="What to do while you wait after assessment"
              icon={Hourglass}
              color="text-teal-600"
              bg="bg-teal-50"
              target="awaiting_decision"
              locked={!hasPaid}
            />
            <NavCard
              title="Decision Received"
              desc="What to do after your decision"
              icon={HelpCircle}
              color="text-stone-600"
              bg="bg-stone-100"
              target="decision_received"
              locked={!hasPaid}
            />
            <NavCard
              title="PIP Benefits"
              desc="Motability, Blue Badge, Railcard & more"
              icon={Sparkles}
              color="text-amber-600"
              bg="bg-amber-50"
              target="pip_benefits"
            />
            <NavCard
              title="How Scoring Works"
              desc="Descriptors, points and what DWP look for"
              icon={BookOpen}
              color="text-teal-600"
              bg="bg-teal-50"
              target="descriptors_guide"
            />
            <NavCard
              title="Points Estimator"
              desc="Upload your decision letter to estimate your score"
              icon={TrendingUp}
              color="text-purple-600"
              bg="bg-purple-50"
              target="points_estimator"
            />
            <NavCard
              title="Export Answers"
              desc="Download your completed form"
              icon={Download}
              color="text-teal-600"
              bg="bg-teal-50"
              target="downloads"
              locked={!hasPaid}
            />
          </div>
        </section>

        {/* PIP News */}
        <section>
          <h2 className="text-sm font-bold text-stone-900 mb-3">Latest PIP news</h2>
          <button
            onClick={() => navigateTo('news')}
            className="w-full bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex items-center gap-3 hover:border-teal-200 active:scale-[0.98] transition-all text-left"
          >
            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
              <Newspaper className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-stone-900 text-sm">PIP News</p>
              <p className="text-xs text-stone-500 mt-0.5">
                {newsHeadlines.length > 0 ? newsHeadlines[0] : 'Latest PIP updates, rule changes and tips'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-300 shrink-0" />
          </button>
        </section>

        {/* Upgrade banner — free users only */}
        {!hasPaid && (
          <section>
            <button
              onClick={() => navigateTo('upsell')}
              className="w-full bg-gradient-to-r from-teal-700 to-teal-600 text-white rounded-2xl p-5 text-left hover:from-teal-800 hover:to-teal-700 transition-all active:scale-[0.98] shadow-md"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="text-sm font-bold">Unlock Full Access</span>
                </div>
                <span className="text-[10px] font-black text-amber-300 bg-amber-300/20 border border-amber-300/30 px-2 py-0.5 rounded-full uppercase tracking-wide">Limited time</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-2xl font-black text-white">£8.99</span>
                <span className="text-teal-300 text-xs line-through">£12.99</span>
                <span className="text-teal-200 text-xs">one-time</span>
              </div>
              <p className="text-teal-100 text-xs leading-relaxed">
                All 12 PIP questions, PIP Diary, Assessment Prep, Export & more. No subscription.
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-amber-300">
                See what's included <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </section>
        )}

        {/* Footer */}
        <section className="pt-2 border-t border-stone-200 pb-6">
          <div className="flex justify-center gap-6">
            <button
              onClick={() => navigateTo('accessibility')}
              className="flex flex-col items-center gap-1.5 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Accessibility</span>
            </button>
            <button
              onClick={() => navigateTo('privacy')}
              className="flex flex-col items-center gap-1.5 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <Shield className="w-5 h-5" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Privacy</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
