import React, { useState } from 'react';
import { Calculator, Calendar, TrendingUp } from 'lucide-react';
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
export function BackpayCalculator() {
  const [claimType, setClaimType] = useState<'new' | 'change'>('new');
  const [appDate, setAppDate] = useState('');
  const [decisionDate, setDecisionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [daily, setDaily] = useState<'none' | 'standard' | 'enhanced'>(
    'standard'
  );
  const [mobility, setMobility] = useState<'none' | 'standard' | 'enhanced'>(
    'none'
  );
  const [currentDaily, setCurrentDaily] = useState<
    'none' | 'standard' | 'enhanced'>(
    'none');
  const [currentMobility, setCurrentMobility] = useState<
    'none' | 'standard' | 'enhanced'>(
    'none');
  const [showResults, setShowResults] = useState(false);
  const calculateBackpay = () => {
    if (!appDate || !decisionDate) return null;
    const start = new Date(appDate);
    const end = new Date(decisionDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = diffDays / 7;
    const weeklyTotal = rates.daily[daily] + rates.mobility[mobility];
    const currentWeeklyTotal =
    rates.daily[currentDaily] + rates.mobility[currentMobility];
    const diffWeekly =
    claimType === 'change' ? weeklyTotal - currentWeeklyTotal : weeklyTotal;
    const totalBackpay = weeks * diffWeekly;
    return {
      weeks: Math.floor(weeks),
      total: totalBackpay,
      weekly: weeklyTotal,
      currentWeekly: currentWeeklyTotal,
      diffWeekly: diffWeekly
    };
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount);
  };
  const result = showResults ? calculateBackpay() : null;
  const isChange = claimType === 'change';
  const headerBg = isChange ?
  'bg-purple-50 border-purple-100' :
  'bg-emerald-50 border-emerald-100';
  const iconBg = isChange ? 'bg-purple-100' : 'bg-emerald-100';
  const iconColor = isChange ? 'text-purple-600' : 'text-emerald-600';
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-6">
      <div
        className={`${headerBg} border-b p-4 flex items-center gap-3 transition-colors`}>
        
        <div className={`${iconBg} p-2 rounded-lg`}>
          {isChange ?
          <TrendingUp className={`w-5 h-5 ${iconColor}`} /> :

          <Calculator className={`w-5 h-5 ${iconColor}`} />
          }
        </div>
        <h3 className="font-bold text-stone-900 flex-1">Backpay Calculator</h3>
        <ShareButton
          title="PIP Backpay Calculator"
          text="Estimate your PIP backpay with this free calculator from PIPpal."
          className={iconColor} />
        
      </div>

      <div className="p-5">
        <div className="flex bg-stone-100 p-1 rounded-xl mb-5">
          <button
            onClick={() => {
              setClaimType('new');
              setShowResults(false);
            }}
            className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all ${!isChange ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
            
            New Claim
          </button>
          <button
            onClick={() => {
              setClaimType('change');
              setShowResults(false);
            }}
            className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all ${isChange ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
            
            Change of Circumstances
          </button>
        </div>

        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              {isChange ? 'Date Change Reported' : 'Application Date'}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="date"
                value={appDate}
                onChange={(e) => {
                  setAppDate(e.target.value);
                  setShowResults(false);
                }}
                className={`w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${isChange ? 'focus:ring-purple-500/20 focus:border-purple-500' : 'focus:ring-emerald-500/20 focus:border-emerald-500'}`} />
              
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Expected Decision Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="date"
                value={decisionDate}
                onChange={(e) => {
                  setDecisionDate(e.target.value);
                  setShowResults(false);
                }}
                className={`w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${isChange ? 'focus:ring-purple-500/20 focus:border-purple-500' : 'focus:ring-emerald-500/20 focus:border-emerald-500'}`} />
              
            </div>
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
              className="space-y-4">
              
              {isChange &&
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <h4 className="text-xs font-bold text-stone-900 mb-2">
                    Current Award
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-medium text-stone-500 mb-1 uppercase tracking-wider">
                        Daily Living
                      </label>
                      <select
                      value={currentDaily}
                      onChange={(e) => {
                        setCurrentDaily(e.target.value as any);
                        setShowResults(false);
                      }}
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-purple-500">
                      
                        <option value="none">None</option>
                        <option value="standard">Standard</option>
                        <option value="enhanced">Enhanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-stone-500 mb-1 uppercase tracking-wider">
                        Mobility
                      </label>
                      <select
                      value={currentMobility}
                      onChange={(e) => {
                        setCurrentMobility(e.target.value as any);
                        setShowResults(false);
                      }}
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-purple-500">
                      
                        <option value="none">None</option>
                        <option value="standard">Standard</option>
                        <option value="enhanced">Enhanced</option>
                      </select>
                    </div>
                  </div>
                </div>
              }

              <div
                className={`${isChange ? 'bg-purple-50/50 p-3 rounded-xl border border-purple-100/50' : ''}`}>
                
                {isChange &&
                <h4 className="text-xs font-bold text-purple-900 mb-2">
                    Expected New Award
                  </h4>
                }
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-stone-500 mb-1 uppercase tracking-wider">
                      Daily Living
                    </label>
                    <select
                      value={daily}
                      onChange={(e) => {
                        setDaily(e.target.value as any);
                        setShowResults(false);
                      }}
                      className={`w-full p-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none ${isChange ? 'focus:border-purple-500' : 'focus:border-emerald-500'}`}>
                      
                      <option value="none">None</option>
                      <option value="standard">Standard</option>
                      <option value="enhanced">Enhanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-stone-500 mb-1 uppercase tracking-wider">
                      Mobility
                    </label>
                    <select
                      value={mobility}
                      onChange={(e) => {
                        setMobility(e.target.value as any);
                        setShowResults(false);
                      }}
                      className={`w-full p-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none ${isChange ? 'focus:border-purple-500' : 'focus:border-emerald-500'}`}>
                      
                      <option value="none">None</option>
                      <option value="standard">Standard</option>
                      <option value="enhanced">Enhanced</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={() => setShowResults(true)}
          disabled={!appDate || !decisionDate}
          className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium text-sm hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          
          Calculate Backpay
        </button>

        <AnimatePresence>
          {showResults && result &&
          <motion.div
            initial={{
              opacity: 0,
              height: 0
            }}
            animate={{
              opacity: 1,
              height: 'auto'
            }}
            exit={{
              opacity: 0,
              height: 0
            }}
            className="mt-5 overflow-hidden">
            
              <div
              className={`${isChange ? 'bg-purple-50 border-purple-100' : 'bg-emerald-50 border-emerald-100'} rounded-xl p-4 border`}>
              
                <div
                className={`text-sm ${isChange ? 'text-purple-800' : 'text-emerald-800'} mb-1`}>
                
                  Estimated Backpay
                </div>
                <div
                className={`text-3xl font-bold ${isChange ? result.total > 0 ? 'text-purple-700' : result.total < 0 ? 'text-rose-600' : 'text-stone-500' : 'text-emerald-700'} mb-3`}>
                
                  {result.total > 0 ? '' : result.total < 0 ? '-' : ''}
                  {formatCurrency(Math.abs(result.total))}
                </div>

                {isChange ?
              <div className="space-y-2 pt-3 border-t border-purple-200/50">
                    <div className="flex justify-between text-xs text-purple-900/70">
                      <span>New rate</span>
                      <span className="font-medium">
                        {formatCurrency(result.weekly)}/wk
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-purple-900/70">
                      <span>Current rate</span>
                      <span className="font-medium">
                        {formatCurrency(result.currentWeekly)}/wk
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-purple-800 pt-1">
                      <span>Difference</span>
                      <span>
                        {result.diffWeekly > 0 ? '+' : ''}
                        {formatCurrency(result.diffWeekly)}/wk
                      </span>
                    </div>
                    <div className="text-[10px] text-purple-600/80 mt-2">
                      Based on {result.weeks} weeks at{' '}
                      {formatCurrency(Math.abs(result.diffWeekly))}/wk
                      difference
                    </div>
                  </div> :

              <div className="text-xs text-emerald-600/80">
                    Based on {result.weeks} weeks at{' '}
                    {formatCurrency(result.weekly)}/wk
                  </div>
              }
              </div>
              <p className="text-[10px] text-stone-400 mt-3 text-center leading-relaxed">
                {isChange ?
              'Backpay for a change of circumstances is based on the difference between your old and new rates, calculated from the date you reported the change.' :
              'Backpay is calculated from your application date, not your decision date.'}
              </p>
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>);

}