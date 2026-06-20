import { PoundSterling, TrendingDown } from 'lucide-react'
import {
  CIGARETTES_PER_PACK,
  ELIQUID_10ML_PRICE_GBP,
  PACK_PRICE_GBP,
  PUFFS_PER_CIGARETTE,
} from '../data/cigaretteBrands'

interface CostComparisonProps {
  cigarettesPerDay: number
  onCigarettesChange: (v: number) => void
}

export function CostComparison({
  cigarettesPerDay,
  onCigarettesChange,
}: CostComparisonProps) {
  const packsPerDay = cigarettesPerDay / CIGARETTES_PER_PACK
  const monthlyCigaretteCost = packsPerDay * PACK_PRICE_GBP * 30

  const puffsPerDay = cigarettesPerDay * PUFFS_PER_CIGARETTE
  const mlPerDay = puffsPerDay / 60
  const bottlesPerMonth = (mlPerDay * 30) / 10
  const monthlyVapeCost = bottlesPerMonth * ELIQUID_10ML_PRICE_GBP

  const monthlySavings = Math.max(0, monthlyCigaretteCost - monthlyVapeCost)
  const annualSavings = monthlySavings * 12

  const formatGbp = (n: number) =>
    `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <PoundSterling className="h-5 w-5 text-brand-600" />
        <h2 className="text-lg font-bold text-slate-900">Cost Comparison Calculator</h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Cigarettes Per Day
          </label>
          <p className="mb-3 text-3xl font-bold text-brand-600">{cigarettesPerDay}</p>
          <input
            type="range"
            min={1}
            max={40}
            step={1}
            value={cigarettesPerDay}
            onChange={(e) => onCigarettesChange(Number(e.target.value))}
          />
        </div>

        <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white">
          <p className="text-sm font-medium text-brand-100">Annual Savings</p>
          <p className="mt-1 text-4xl font-bold">{formatGbp(annualSavings)}</p>
          <p className="text-sm text-brand-100">by switching to vaping</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-5">
          <h4 className="text-sm font-semibold text-slate-700">Monthly Cost Breakdown</h4>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Smoking ({cigarettesPerDay}/day)</span>
              <span className="font-semibold text-slate-900">
                {formatGbp(monthlyCigaretteCost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Vaping (equivalent)</span>
              <span className="font-semibold text-brand-600">
                {formatGbp(monthlyVapeCost)}
              </span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between text-sm">
              <span className="font-medium text-slate-700">Monthly saving</span>
              <span className="font-bold text-accent-500">
                {formatGbp(monthlySavings)}
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            * Based on {formatGbp(PACK_PRICE_GBP)}/pack and{' '}
            {formatGbp(ELIQUID_10ML_PRICE_GBP)} per 10ml e-liquid
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-5">
          <h4 className="text-sm font-semibold text-slate-700">Yearly Projection</h4>
          <p className="mt-2 text-xs text-slate-500">
            Potential annual savings with vaping
          </p>
          <div className="mt-4 flex items-center gap-3">
            <TrendingDown className="h-8 w-8 text-brand-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {formatGbp(annualSavings)}
              </p>
              <p className="text-xs text-slate-500">Annual Savings</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-600">
            What you could buy with annual savings: a weekend break, new tech, or
            put it towards quitting nicotine entirely.
          </p>
        </div>
      </div>
    </div>
  )
}
