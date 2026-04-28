import React, { useState, Component } from 'react';
import { Coins, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareButton } from './ShareButton';
const rates = {
  daily: {
    none: 0,
    standard: 76.70,
    enhanced: 114.60
  },
  mobility: {
    none: 0,
    standard: 30.30,
    enhanced: 80.00
  }
};
export function PaymentCalculator() {
  const [claimType, setClaimType] = useState<'new' | 'change'>('new');
  const [daily, setDaily] = useState<'none' | 'standard' | 'enhanced'>('none');
  const [mobility, setMobility] = useState<'none' | 'standard' | 'enhanced'>(
    'none'
  );
  const [currentDaily, setCurrentDaily] = useState<
    'none' | 'standard' | 'enhanced'>(
    'none');
  const [currentMobility, setCurrentMobility] = useState<
    'none' | 'standard' | 'enhanced'>(
    'none');
  const weeklyTotal = rates.daily[daily] + rates.mobility[mobility];
  const monthlyTotal = weeklyTotal * 52 / 12;
  const annualTotal = weeklyTotal * 52;
  const currentWeeklyTotal =
  rates.daily[currentDaily] + rates.mobility[currentMobility];
  const currentMonthlyTotal = currentWeeklyTotal * 52 / 12;
  const currentAnnualTotal = currentWeeklyTotal * 52;
  const upliftWeekly = weeklyTotal - currentWeeklyTotal;
  const upliftMonthly = monthlyTotal - currentMonthlyTotal;
  const upliftAnnual = annualTotal - currentAnnualTotal;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount);
  };
  const isChange = claimType === 'change';
  const headerBg = isChange ?
  'bg-purple-50 border-purple-100' :
  'bg-amber-50 border-amber-100';
  const iconBg = isChange ? 'bg-purple-100' : 'bg-amber-100';
  const iconColor = isChange ? 'text-purple-600' : 'text-amber-600';
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-6">
      <div
        className={`${headerBg} border-b p-4 flex items-center gap-3 transition-colors`}>
        
        <div className={`${iconBg} p-2 rounded-lg`}>
          {isChange ?
          <TrendingUp className={`w-5 h-5 ${iconColor}`} /> :

          <Coins className={`w-5 h-5 ${iconColor}`} />
          }
        </div>
        <h3 className="font-bold text-stone-900 flex-1">PIP award</h3>
        <ShareButton
          title="PIP Payment Calculator"
          text="See how much you could receive from PIP with this free calculator from PIPpal."
          className={iconColor} />
        
      </div>

      <div className="p-5">
        <div className="flex bg-stone-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => setClaimType('new')}
            className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all ${!isChange ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
            
            New Claim
          </button>
          <button
            onClick={() => setClaimType('change')}
            className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all ${isChange ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
            
            Change of Circumstances
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={claimType}
            initial={{
              opacity: 0,
              x: 10
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            exit={{
              opacity: 0,
              x: -10
            }}
            transition={{
              duration: 0.2
            }}
            className="space-y-6">
            
            {isChange &&
            <div className="space-y-4 p-4 bg-stone-50 rounded-xl border border-stone-100">
                <h4 className="font-bold text-stone-900 text-sm">
                  Current Award
                </h4>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-2">
                    Daily Living Component
                  </label>
                  <div className="flex bg-stone-200/50 p-1 rounded-xl">
                    {(['none', 'standard', 'enhanced'] as const).map(
                    (level) =>
                    <button
                      key={`curr-daily-${level}`}
                      onClick={() => setCurrentDaily(level)}
                      className={`flex-1 text-xs py-2 rounded-lg capitalize transition-all ${currentDaily === level ? 'bg-white text-stone-900 font-semibold shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                      
                          {level}
                        </button>

                  )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-2">
                    Mobility Component
                  </label>
                  <div className="flex bg-stone-200/50 p-1 rounded-xl">
                    {(['none', 'standard', 'enhanced'] as const).map(
                    (level) =>
                    <button
                      key={`curr-mob-${level}`}
                      onClick={() => setCurrentMobility(level)}
                      className={`flex-1 text-xs py-2 rounded-lg capitalize transition-all ${currentMobility === level ? 'bg-white text-stone-900 font-semibold shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                      
                          {level}
                        </button>

                  )}
                  </div>
                </div>
              </div>
            }

            <div
              className={`space-y-4 ${isChange ? 'p-4 bg-purple-50/50 rounded-xl border border-purple-100/50' : ''}`}>
              
              {isChange &&
              <h4 className="font-bold text-purple-900 text-sm">
                  Expected New Award
                </h4>
              }
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-2">
                  Daily Living Component
                </label>
                <div className="flex bg-stone-100 p-1 rounded-xl">
                  {(['none', 'standard', 'enhanced'] as const).map((level) =>
                  <button
                    key={`new-daily-${level}`}
                    onClick={() => setDaily(level)}
                    className={`flex-1 text-xs py-2 rounded-lg capitalize transition-all ${daily === level ? 'bg-white text-stone-900 font-semibold shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                    
                      {level}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-2">
                  Mobility Component
                </label>
                <div className="flex bg-stone-100 p-1 rounded-xl">
                  {(['none', 'standard', 'enhanced'] as const).map((level) =>
                  <button
                    key={`new-mob-${level}`}
                    onClick={() => setMobility(level)}
                    className={`flex-1 text-xs py-2 rounded-lg capitalize transition-all ${mobility === level ? 'bg-white text-stone-900 font-semibold shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                    
                      {level}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${claimType}-${daily}-${mobility}-${currentDaily}-${currentMobility}`}
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className={`mt-6 rounded-xl p-4 border ${isChange ? 'bg-purple-50 border-purple-100' : 'bg-stone-50 border-stone-100'}`}>
            
            {isChange ?
            <div className="space-y-4">
                <div>
                  <div className="text-sm text-purple-700 mb-1 font-medium">
                    Total Monthly Payment
                  </div>
                  <div className="text-3xl font-bold text-purple-700">
                    {formatCurrency(monthlyTotal)}
                  </div>
                  <div className="text-xs text-purple-600/80 mt-1">
                    {formatCurrency(weeklyTotal)}/wk ·{' '}
                    {formatCurrency(annualTotal)}/yr
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-200/50">
                  <div>
                    <div className="text-xs text-purple-600/80 mb-1">
                      Current Monthly
                    </div>
                    <div className="font-semibold text-purple-900/60">
                      {formatCurrency(currentMonthlyTotal)}
                    </div>
                    <div className="text-[10px] text-purple-500/60">
                      {formatCurrency(currentWeeklyTotal)}/wk
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-purple-600/80 mb-1">
                      New Monthly
                    </div>
                    <div className="font-semibold text-purple-900">
                      {formatCurrency(monthlyTotal)}
                    </div>
                    <div className="text-[10px] text-purple-500/80">
                      {formatCurrency(weeklyTotal)}/wk
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-purple-200/50">
                  <div className="text-xs text-purple-700 mb-1 font-medium">
                    Monthly Uplift
                  </div>
                  <div
                  className={`text-xl font-bold ${upliftMonthly > 0 ? 'text-purple-700' : upliftMonthly < 0 ? 'text-rose-600' : 'text-stone-500'}`}>
                  
                    {upliftMonthly > 0 ? '+' : ''}
                    {formatCurrency(upliftMonthly)}
                  </div>
                  <div className="text-[10px] text-purple-600/80 mt-1">
                    {upliftWeekly > 0 ? '+' : ''}
                    {formatCurrency(upliftWeekly)}/wk ·{' '}
                    {upliftAnnual > 0 ? '+' : ''}
                    {formatCurrency(upliftAnnual)}/yr
                  </div>
                </div>
              </div> :

            <>
                <div className="mb-4">
                  <div className="text-sm text-stone-500 mb-1">
                    Monthly Total
                  </div>
                  <div className="text-3xl font-bold text-amber-600">
                    {formatCurrency(monthlyTotal)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-200">
                  <div>
                    <div className="text-xs text-stone-500 mb-1">Weekly</div>
                    <div className="font-semibold text-stone-900">
                      {formatCurrency(weeklyTotal)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-stone-500 mb-1">Annual</div>
                    <div className="font-semibold text-stone-900">
                      {formatCurrency(annualTotal)}
                    </div>
                  </div>
                </div>
              </>
            }
          </motion.div>
        </AnimatePresence>

        <p className="text-[10px] text-stone-400 mt-3 text-center">
          Rates shown are for 2025/26.
        </p>
      </div>
    </div>);

}