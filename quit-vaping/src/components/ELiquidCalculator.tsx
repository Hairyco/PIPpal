import { Droplets } from 'lucide-react'
import type { ReactNode } from 'react'
import { CIGARETTE_BRANDS, UK_MAX_NICOTINE } from '../data/cigaretteBrands'
import {
  E_LIQUID_BRANDS,
  E_LIQUID_STRENGTHS_MG,
  E_LIQUID_VOLUMES_ML,
  strengthOptionLabel,
  volumeOptionLabel,
  type ELiquidBrand,
} from '../data/eLiquidOptions'
import { ResultBox } from './ResultBox'

interface ELiquidCalculatorProps {
  nicotineMg: number
  volumeMl: number
  brand: ELiquidBrand
  onNicotineChange: (v: number) => void
  onVolumeChange: (v: number) => void
  onBrandChange: (brand: ELiquidBrand) => void
  compact?: boolean
}

const DEFAULT_BRAND = CIGARETTE_BRANDS[0]

function pillClass(active: boolean, compact: boolean) {
  return `rounded-full font-semibold transition ${
    compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
  } ${
    active
      ? 'bg-brand-600 text-white shadow-sm'
      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
  }`
}

function OptionGroup({
  label,
  hint,
  compact,
  children,
}: {
  label: string
  hint?: string
  compact?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <label className={`font-medium text-slate-700 ${compact ? 'text-xs' : 'text-sm'}`}>
          {label}
        </label>
        {hint && (
          <span className={`text-slate-500 ${compact ? 'text-[10px]' : 'text-xs'}`}>{hint}</span>
        )}
      </div>
      {children}
    </div>
  )
}

export function ELiquidCalculator({
  nicotineMg,
  volumeMl,
  brand,
  onNicotineChange,
  onVolumeChange,
  onBrandChange,
  compact = false,
}: ELiquidCalculatorProps) {
  const totalNicotine = nicotineMg * volumeMl
  const cigarettes = Math.round(totalNicotine / DEFAULT_BRAND.nicotineMg)
  const formula = `${nicotineMg}mg/mL × ${volumeMl}mL = ${totalNicotine}mg total nicotine`

  const controls = (
    <div className={`space-y-5 ${compact ? '' : 'space-y-6'}`}>
      <OptionGroup label="Nicotine strength" hint={`UK max ${UK_MAX_NICOTINE}mg/mL`} compact={compact}>
        <div className="flex flex-wrap gap-2">
          {E_LIQUID_STRENGTHS_MG.map((mg) => (
            <button
              key={mg}
              type="button"
              onClick={() => onNicotineChange(mg)}
              className={pillClass(nicotineMg === mg, compact)}
            >
              {strengthOptionLabel(mg)}
            </button>
          ))}
        </div>
      </OptionGroup>

      <OptionGroup label="Bottle volume" compact={compact}>
        <div className="flex flex-wrap gap-2">
          {E_LIQUID_VOLUMES_ML.map((ml) => (
            <button
              key={ml}
              type="button"
              onClick={() => onVolumeChange(ml)}
              className={pillClass(volumeMl === ml, compact)}
            >
              {volumeOptionLabel(ml)}
            </button>
          ))}
        </div>
      </OptionGroup>

      <OptionGroup label="Brand" compact={compact}>
        <select
          value={brand}
          onChange={(e) => onBrandChange(e.target.value as ELiquidBrand)}
          className={`w-full rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
            compact ? 'px-2.5 py-2 text-xs' : 'px-3 py-2.5 text-sm'
          }`}
        >
          {E_LIQUID_BRANDS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </OptionGroup>
    </div>
  )

  if (compact) {
    return (
      <div className="mb-6 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
        <div className="mb-4 flex items-center gap-2">
          <Droplets className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-bold text-slate-900">Find e-liquid by strength & brand</h3>
        </div>
        {controls}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <Droplets className="h-5 w-5 text-brand-600" />
        <h2 className="text-lg font-bold text-slate-900">E-Liquid to Cigarette Comparison</h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {controls}
        <div>
          <ResultBox cigarettes={cigarettes} formula={formula} />
        </div>
      </div>
    </div>
  )
}
