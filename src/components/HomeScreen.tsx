import React, { useState } from 'react';
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
  ChevronRight,
  Calculator,
  Users,
  Clock,
  Coins,
  X,
  Sparkles,
  TrendingUp,
  BookOpen as BookOpenIcon,
  Settings,
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
  const { medProfile, navigateTo, user, hasPaid, savedAnswers } = useAppContext();
  const [showWelcomePopup, setShowWelcomePopup] = useState(!hasPaid);
  const [popupDismissed, setPopupDismissed] = useState(false);

  const hasConditions = medProfile.conditions.length > 0;
  const hasStartedApplication = hasPaid && Object.keys(savedAnswers).length > 0;
  const answersCount = Object.keys(savedAnswers).length;
  const firstName = user?.name ? user.name.split(' ')[0] : '';
  const showPopup = false;

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide pb-24">

      {/* Hero header */}
      <div className="px-5 md:px-8 py-6 bg-teal-700 text-white rounded-b-3xl shadow-sm mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {firstName ? `Welcome back, ${firstName}` : 'Welcome to PIPpal'}
          </h1>
          <p className="text-teal-100 text-sm">PIP claims, made simple</p>
        </div>
        {user && (
          <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center font-bold text-lg border-2 border-teal-500 shadow-sm shrink-0">
            {firstName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Urgency banner */}
      <div className="mx-5 md:mx-8 -mt-3 mb-2">
        <div className="bg-amber-500 rounded-2xl px-4 py-3 flex items-start gap-2.5 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-white shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-bold text-xs leading-snug">PIP rules are changing in late 2026</p>
            <p className="text-amber-100 text-[11px] leading-relaxed mt-0.5">Eligibility thresholds are tightening. Applying now could protect your entitlement. Do not wait.</p>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-8 space-y-8">

        {/* Progress banner — only when they've started */}
        {hasStartedApplication && (
          <section className="bg-teal-700 text-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-200" />
                <span className="text-sm font-semibold">Your progress</span>
              </div>
              <span className="text-xs text-teal-200">{answersCount} / 12 questions</span>
            </div>
            <ProgressBar value={answersCount} max={12} />
            <button
              onClick={() => navigateTo('question_index')}
              className="mt-3 w-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-2 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <BookOpenIcon className="w-4 h-4" />
              Continue my questions
              <ChevronRight className="w-4 h-4" />
            </button>
          </section>
        )}

        {/* Medical history card */}
        <section>
          <button
            onClick={() => navigateTo('medical_profile')}
            className="w-full bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all hover:border-teal-200 hover:shadow-md"
          >
            <div className="text-left flex-1 min-w-0">
              <h2 className="font-bold text-stone-900 text-sm mb-1">
                Medical history
                {hasConditions ? ` · ${medProfile.conditions.length} condition${medProfile.conditions.length > 1 ? 's' : ''}` : ''}
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
                <p className="text-xs text-stone-500">Tap to add your conditions and medications</p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400 shrink-0 ml-3" />
          </button>
        </section>

        {/* Manage Claim */}
        <section>
          <h2 className="text-sm font-bold text-stone-900 mb-3 px-0.5">Manage Claim</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <NavCard
              title="New Claim"
              desc="Start a fresh PIP application"
              icon={PlusCircle}
              color="text-teal-600"
              bg="bg-teal-50"
              target="claim_process"
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

        {/* Free Calculators */}
        <section>
          <div className="flex items-center justify-between mb-1 px-0.5">
            <h2 className="text-sm font-bold text-stone-900">Free Calculators</h2>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">No sign-up needed</span>
          </div>
          <p className="text-xs text-stone-500 mb-4 px-0.5">Estimate your timeline, payments & backpay</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <NavCard
              title="Timeline Tracker"
              desc="How long will your claim take?"
              icon={Clock}
              color="text-blue-600"
              bg="bg-blue-50"
              target="timeline_calculator"
            />
            <NavCard
              title="PIP Award"
              desc="Calculate your weekly & annual payments"
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
          </div>
        </section>

        {/* Resources & Prep */}
        <section>
          <h2 className="text-sm font-bold text-stone-900 mb-3 px-0.5">Resources & Prep</h2>
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
              title="Decision Received"
              desc="What to do next"
              icon={HelpCircle}
              color="text-stone-600"
              bg="bg-stone-100"
              target="decision_received"
              locked={!hasPaid}
            />
            <NavCard
              title="Downloads"
              desc="Forms and exported data"
              icon={Download}
              color="text-teal-600"
              bg="bg-teal-50"
              target="downloads"
              locked={!hasPaid}
            />
          </div>
        </section>

        {/* Upgrade banner — only for free users */}
        {!hasPaid && (
          <section>
            <button
              onClick={() => navigateTo('upsell')}
              className="w-full bg-gradient-to-r from-teal-700 to-teal-600 text-white rounded-2xl p-5 text-left hover:from-teal-800 hover:to-teal-700 transition-all active:scale-[0.98] shadow-md"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-bold">Unlock Full Access — £12.99</span>
              </div>
              <p className="text-teal-100 text-xs leading-relaxed">
                All 12 PIP questions, PIP Diary, Assessment Prep, Downloads & more — one-time payment, no subscription.
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-amber-300">
                See what's included <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </section>
        )}

        {/* Community */}
        <section>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-teal-50 rounded-2xl p-4 border border-teal-100 hover:border-teal-200 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-teal-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-stone-900 text-sm">Join our community</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Connect with others going through the PIP process.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-teal-600 shrink-0" />
            </div>
          </a>
        </section>

        {/* Footer links */}
        <section className="pt-4 border-t border-stone-200 pb-6">
          <div className="flex justify-center gap-6">
            <button
              onClick={() => navigateTo('accessibility')}
              className="flex flex-col items-center gap-1.5 text-stone-500 hover:text-stone-900 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Accessibility</span>
            </button>
            <button
              onClick={() => navigateTo('privacy')}
              className="flex flex-col items-center gap-1.5 text-stone-500 hover:text-stone-900 transition-colors"
            >
              <Shield className="w-5 h-5" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Privacy</span>
            </button>
          </div>
        </section>
      </div>

      {/* Welcome popup — shown once to free users */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => { setPopupDismissed(true); setPopupDismissed(true); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden"
            >
              <div className="bg-teal-700 px-5 py-4 text-white flex items-center justify-between">
                <h3 className="font-bold text-lg">Welcome to PIPpal! 👋</h3>
                <button
                  onClick={() => { setPopupDismissed(true); setPopupDismissed(true); }}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-teal-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                <p className="text-sm text-stone-600 leading-relaxed mb-4">
                  You can explore freely and use our free tools like the eligibility checker and calculators.
                </p>
                <p className="text-sm text-stone-600 leading-relaxed mb-6">
                  The full 12-question walkthrough, PIP Diary, and Assessment Prep are available with{' '}
                  <strong className="text-stone-900">Full Access (£12.99)</strong>.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { setPopupDismissed(true); setPopupDismissed(true); navigateTo('upsell'); }}
                    className="w-full bg-teal-700 text-white py-3 rounded-xl font-semibold text-sm hover:bg-teal-800 active:scale-[0.98] transition-all"
                  >
                    Learn more about Full Access
                  </button>
                  <button
                    onClick={() => { setPopupDismissed(true); setPopupDismissed(true); }}
                    className="w-full bg-stone-100 text-stone-700 py-3 rounded-xl font-semibold text-sm hover:bg-stone-200 active:scale-[0.98] transition-all"
                  >
                    Got it, thanks
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}