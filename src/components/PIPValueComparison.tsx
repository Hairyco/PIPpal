import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAppContext } from './AppContext';
import { startStripeCheckout } from '../utils/startStripeCheckout';

import { PIP_ENHANCED_YEARLY_GBP } from '../constants/pipDisplayRates';

const FULL_ACCESS_PRICE_GBP = 8.99;
const SIX_YEAR_TOTAL_GBP = PIP_ENHANCED_YEARLY_GBP * 6;
const ROI_MULTIPLIER = Math.round(SIX_YEAR_TOTAL_GBP / FULL_ACCESS_PRICE_GBP);

const fmtWhole = (n: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const fmtPrice = (n: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

export function PIPValueComparison() {
  const { user, showToast, hasPaid, navigateTo } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStart = async () => {
    if (hasPaid) {
      navigateTo('home');
      return;
    }
    setIsProcessing(true);
    try {
      await startStripeCheckout({
        email: user?.email,
        userId: user?.id,
      });
    } catch (err) {
      console.error('Payment error:', err);
      showToast('Something went wrong. Please try again.', 'error');
      setIsProcessing(false);
    }
  };

  return (
    <section className="px-5 md:px-8 py-6 md:py-8" aria-labelledby="pip-value-heading">
      <div className="max-w-3xl mx-auto bg-teal-700 rounded-3xl p-5 md:p-8 text-white shadow-lg border border-teal-600/30">
        <h2
          id="pip-value-heading"
          className="text-center text-xl md:text-2xl font-bold text-white mb-6 md:mb-8 leading-snug"
        >
          How much is PIP actually worth to you?
        </h2>

        <div className="relative grid grid-cols-2 gap-3 md:gap-4 mb-6">
          {/* Gain */}
          <div className="rounded-2xl border-2 border-amber-300/80 bg-teal-800/50 p-3 md:p-5 text-center flex flex-col">
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-amber-200 mb-2 md:mb-3 leading-tight">
              What you stand to gain
            </p>
            <p className="text-2xl md:text-4xl font-black text-amber-300 tabular-nums leading-none">
              {fmtWhole(PIP_ENHANCED_YEARLY_GBP)}
            </p>
            <p className="text-[10px] md:text-xs text-teal-100 mt-1.5 md:mt-2">Enhanced rate per year</p>
            <div className="border-t border-amber-300/30 my-3 md:my-4" />
            <p className="text-sm md:text-base font-semibold text-white tabular-nums mt-auto">
              {fmtWhole(SIX_YEAR_TOTAL_GBP)}
            </p>
            <p className="text-[10px] md:text-xs text-teal-100 mt-1">over 6 years</p>
          </div>

          {/* vs */}
          <div
            className="absolute left-1/2 top-1/2 z-10 flex h-9 w-9 md:h-10 md:w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-black shadow-md ring-4 ring-teal-700"
            aria-hidden
          >
            vs
          </div>

          {/* Cost */}
          <div className="rounded-2xl border border-teal-400/40 bg-teal-800/30 p-3 md:p-5 text-center flex flex-col">
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-teal-200 mb-2 md:mb-3 leading-tight">
              What it costs
            </p>
            <p className="text-2xl md:text-4xl font-black text-white tabular-nums leading-none">
              {fmtPrice(FULL_ACCESS_PRICE_GBP)}
            </p>
            <p className="text-[10px] md:text-xs text-teal-100 mt-1.5 md:mt-2">One-off, no subscription</p>
            <div className="border-t border-teal-400/30 my-3 md:my-4" />
            <p className="text-sm md:text-base font-semibold text-white tabular-nums mt-auto">
              {ROI_MULTIPLIER.toLocaleString('en-GB')}×
            </p>
            <p className="text-[10px] md:text-xs text-teal-100 mt-1">return on investment</p>
          </div>
        </div>

        <p className="text-center text-sm md:text-base text-teal-50 leading-relaxed max-w-lg mx-auto mb-6">
          A single PIP award is worth{' '}
          <strong className="text-amber-300 font-bold">thousands of times</strong> the cost. Don&apos;t lose
          thousands because of wrong wording on the form.
        </p>

        <button
          type="button"
          onClick={handleStart}
          disabled={isProcessing}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 md:py-4 rounded-xl font-bold text-base md:text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm disabled:opacity-70"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Redirecting to payment…
            </>
          ) : (
            <>
              Start now
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </section>
  );
}
