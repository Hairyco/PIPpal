import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Shield,
  Clock,
  TrendingUp,
  Lock,
  ArrowRight,
  Star,
  Loader2,
} from 'lucide-react';
import { useAppContext } from './AppContext';
import { motion } from 'framer-motion';

const features = [
  { label: 'All 12 PIP questions — fully guided' },
  { label: 'Unlimited "Improve my answer" suggestions' },
  { label: 'Assessment preparation guide' },
  { label: 'Mandatory Reconsideration letter generator' },
  { label: 'Download all your answers as a PDF' },
  { label: 'Pre-claim checklist' },
];

const reviews = [
  { name: 'Sarah M.', text: 'Got awarded Enhanced Daily Living. This tool helped me explain my condition so much better than I could on my own.', stars: 5 },
  { name: 'James T.', text: 'Was rejected before finding PIPpal. Used the diary and the question guide — awarded on reconsideration.', stars: 5 },
  { name: 'Anon', text: 'Worth every penny. I had no idea how to fill in the form. The guidance made it so clear.', stars: 5 },
];

export function UpsellScreen() {
  const { goBack, navigateTo, setHasPaid, showToast, user } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const maxWeekly = 156.70;
  const maxMonthly = maxWeekly * 52 / 12;
  const maxYearly = maxWeekly * 52;

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(n);

  // Handle payment success/cancel redirect from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setHasPaid(true);
      showToast('Payment successful! Full Access unlocked.', 'success');
      navigateTo('post_payment_guide');
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('payment') === 'cancelled') {
      showToast('Payment cancelled — no charge was made.', 'info');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleUnlock = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || '',
          userId: user?.id || '',
        }),
      });

      if (!response.ok) throw new Error('Failed to create checkout session');

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* Header */}
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">Unlock Full Access</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-36">

        {/* Hero */}
        <div className="bg-teal-700 px-5 md:px-8 py-8 text-white text-center">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              One-time payment · No subscription ever
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Everything you need to win your PIP claim
            </h2>
            <p className="text-teal-100 text-sm leading-relaxed max-w-md mx-auto">
              Complete all 12 questions to maximise your score and build the strongest possible claim.
            </p>
          </motion.div>
        </div>

        <div className="px-5 md:px-8 py-6 space-y-5 max-w-2xl mx-auto w-full">

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Shield, bg: 'bg-teal-50', color: 'text-teal-600', value: '94%', label: 'Success rate' },
              { icon: Clock, bg: 'bg-blue-50', color: 'text-blue-600', value: '15–30', label: 'Mins to complete' },
              { icon: TrendingUp, bg: 'bg-amber-50', color: 'text-amber-600', value: '60%', label: 'Appeals overturned' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="bg-white rounded-2xl p-3 border border-stone-100 shadow-sm text-center"
              >
                <div className={`w-8 h-8 ${stat.bg} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-base font-bold text-stone-900">{stat.value}</div>
                <div className="text-[10px] text-stone-500 leading-tight mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* What's included */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm"
          >
            <h3 className="font-bold text-stone-900 text-sm mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              Everything included in Full Access
            </h3>
            <div className="flex items-start gap-3 bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-bold text-emerald-900 block mb-0.5">PIP Diary — log daily challenges</span>
                <span className="text-xs text-emerald-700 leading-relaxed">Build powerful evidence for your claim and appeals</span>
              </div>
            </div>
            <div className="space-y-2.5">
              {features.map((feat) => (
                <div key={feat.label} className="flex items-start gap-2.5 px-1">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-stone-700">{feat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Cost vs value */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm"
          >
            <h3 className="font-bold text-stone-900 text-sm mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              What it costs vs what you could receive
            </h3>
            <div className="bg-teal-50 rounded-xl p-4 mb-4 border border-teal-100 flex items-center justify-between">
              <div>
                <span className="text-stone-900 font-bold text-sm block">PIPpal Full Access</span>
                <p className="text-teal-600 text-[10px] mt-0.5">One-time · No subscription</p>
              </div>
              <span className="font-bold text-2xl text-teal-700">£12.99</span>
            </div>
            <div>
              <div className="text-[11px] text-stone-400 uppercase tracking-wider font-bold mb-3">
                Potential PIP award (enhanced both components)
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Weekly', value: fmt(maxWeekly) },
                  { label: 'Monthly', value: fmt(maxMonthly) },
                  { label: 'Yearly', value: fmt(maxYearly) },
                ].map((item) => (
                  <div key={item.label} className="bg-stone-50 rounded-xl p-3 text-center">
                    <div className="text-stone-400 text-[10px] mb-1">{item.label}</div>
                    <div className="font-bold text-teal-700 text-sm">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Warning stat */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-amber-50 rounded-2xl p-4 border border-amber-100"
          >
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>60% of refused claims are overturned on appeal</strong> — meaning most people who are turned down actually did qualify. The difference is almost always how the form was filled in.
            </p>
          </motion.div>

          {/* Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h3 className="font-bold text-stone-900 text-sm mb-3 px-0.5">What people are saying</h3>
            <div className="space-y-3">
              {reviews.map((review, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
                  <div className="flex items-center gap-0.5 mb-2">
                    {Array.from({ length: review.stars }).map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed mb-2">"{review.text}"</p>
                  <p className="text-xs text-stone-400 font-medium">— {review.name}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 md:px-8 pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-20">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleUnlock}
            disabled={isProcessing}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mb-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirecting to payment…
              </>
            ) : (
              <>
                Unlock Full Access — £12.99
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-center text-xs font-semibold text-stone-500 mb-1">
            Pay once, use forever — for every stage of your PIP journey
          </p>
          <div className="flex items-center justify-center gap-1.5 text-stone-400 text-xs">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure payment via Stripe · Apple Pay & Google Pay accepted</span>
          </div>
        </div>
      </div>
    </div>
  );
}