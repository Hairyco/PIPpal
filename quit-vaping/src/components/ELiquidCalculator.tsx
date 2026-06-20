import { Droplets } from 'lucide-react'
import {
  CIGARETTE_BRANDS,
  UK_MAX_NICOTINE,
} from '../data/cigaretteBrands'
import { ResultBox } from './ResultBox'

interface ELiquidCalculatorProps {
  nicotineMg: number
  volumeMl: number
  onNicotineChange: (v: number) => void
  onVolumeChange: (v: number) => void
  compact?: boolean
}

const DEFAULT_BRAND = CIGARETTE_BRANDS[0]

export function ELiquidCalculator({
  nicotineMg,
  volumeMl,
  onNicotineChange,
  onVolumeChange,
  compact = false,
}: ELiquidCalculatorProps) {
  const totalNicotine = nicotineMg * volumeMl
  const cigarettes = Math.round(totalNicotine / DEFAULT_BRAND.nicotineMg)
  const formula = `${nicotineMg}mg/mL × ${volumeMl}mL = ${totalNicotine}mg total nicotine`

  const controls = (
    <>
      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <label className={`font-medium text-slate-700 ${compact ? 'text-xs' : 'text-sm'}`}>
            Nicotine Strength (mg/mL)
          </label>
          <span className={`text-slate-500 ${compact ? 'text-[10px]' : 'text-xs'}`}>
            UK Max: {UK_MAX_NICOTINE}mg/mL
          </span>
        </div>
        <p className={`mb-2 font-bold text-brand-600 ${compact ? 'text-lg' : 'mb-3 text-3xl'}`}>
          {nicotineMg}mg/mL
        </p>
        <input
          type="range"
          min={0}
          max={UK_MAX_NICOTINE}
          step={1}
          value={nicotineMg}
          onChange={(e) => onNicotineChange(Number(e.target.value))}
        />
      </div>

      <div>
        <label
          className={`mb-1.5 block font-medium text-slate-700 ${compact ? 'text-xs' : 'text-sm'}`}
        >
          E-liquid Volume (mL)
        </label>
        <p className={`mb-2 font-bold text-brand-600 ${compact ? 'text-lg' : 'mb-3 text-3xl'}`}>
          {volumeMl}mL
        </p>
        <input
          type="range"
          min={1}
          max={100}
          step={1}
          value={volumeMl}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
        />
        <p className={`mt-1 text-slate-500 ${compact ? 'text-[10px]' : 'text-xs'}`}>
          {volumeMl <= 10
            ? 'Small bottle'
            : volumeMl <= 50
              ? 'Medium bottle'
              : 'Large bottle'}
        </p>
      </div>
    </>
  )

  if (compact) {
    return (
      <div className="mb-6 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
        <div className="mb-4 flex items-center gap-2">
          <Droplets className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-bold text-slate-900">E-Liquid to Cigarette Comparison</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_200px] lg:items-end">
          {controls}
          <ResultBox cigarettes={cigarettes} formula={formula} compact />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <Droplets className="h-5 w-5 text-brand-600" />
        <h2 className="text-lg font-bold text-slate-900">
          E-Liquid to Cigarette Comparison
        </h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">{controls}</div>
        <div>
          <ResultBox cigarettes={cigarettes} formula={formula} />
        </div>
      </div>
    </div>
  )
}
