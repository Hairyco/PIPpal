import React from 'react';
import { TrendingUp } from 'lucide-react';
import { formatPipEnhancedYearly, PIP_ENHANCED_YEARLY_GBP } from '../constants/pipDisplayRates';

const FULL_ACCESS_GBP = 6.99;
const ROI_MULTIPLIER = Math.round(PIP_ENHANCED_YEARLY_GBP / FULL_ACCESS_GBP);

export function ValueProp() {
  return (
    <section className="px-5 md:px-8 py-8">
      <div className="bg-teal-700 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-teal-100 text-sm font-medium mb-1">
              Enhanced PIP up to
            </div>
            <div className="text-3xl font-bold">
              {formatPipEnhancedYearly()}
              <span className="text-xl font-normal text-teal-200">/yr</span>
            </div>
          </div>
          <div className="bg-teal-600 p-2 rounded-xl">
            <TrendingUp className="w-6 h-6 text-teal-50" />
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 mb-6 backdrop-blur-sm border border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-teal-50 text-sm">Full Access cost</span>
            <span className="font-bold text-xl">£6.99</span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-lg leading-tight">
            That's a {ROI_MULTIPLIER.toLocaleString('en-GB')}× return if it makes the difference.
          </p>
          <p className="text-teal-100 text-sm leading-relaxed">
            Most claims fail because of how the form is filled in — not because
            people don't qualify. Don't leave it to chance.
          </p>
          <div className="bg-teal-800/50 rounded-xl p-3 border border-teal-600/30 mt-2">
            <p className="text-xs text-teal-50 leading-relaxed">
              <strong>How you fill in the form is what matters most.</strong>{' '}
              PIPpal helps you describe your difficulties clearly so assessors
              understand your needs.
            </p>
          </div>
        </div>
      </div>
    </section>);

}