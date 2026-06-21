import { Calculator, PoundSterling, Users, Wind } from 'lucide-react'

export type CalculatorTab = 'eliquid' | 'puff' | 'cost'

interface CalculatorTabsProps {
  active: CalculatorTab
  onChange: (tab: CalculatorTab) => void
  onChallengeClick: () => void
}

const tabs: { id: CalculatorTab; label: string; icon: typeof Calculator }[] = [
  { id: 'puff', label: 'Puff Calculator', icon: Wind },
  { id: 'eliquid', label: 'E-Liquid Calculator', icon: Calculator },
  { id: 'cost', label: 'Cost Comparison', icon: PoundSterling },
]

function tabClass(isActive: boolean) {
  return `flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition sm:px-4 sm:py-3 ${
    isActive
      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
  }`
}

export function CalculatorTabs({
  active,
  onChange,
  onChallengeClick,
}: CalculatorTabsProps) {
  const puffTab = tabs[0]
  const eliquidTab = tabs[1]
  const costTab = tabs[2]
  const PuffIcon = puffTab.icon
  const EliquidIcon = eliquidTab.icon
  const CostIcon = costTab.icon

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onChange(puffTab.id)}
        className={tabClass(active === puffTab.id)}
      >
        <PuffIcon className="h-4 w-4 shrink-0" />
        <span className="text-center leading-tight">{puffTab.label}</span>
      </button>

      <button
        type="button"
        onClick={() => onChange(eliquidTab.id)}
        className={tabClass(active === eliquidTab.id)}
      >
        <EliquidIcon className="h-4 w-4 shrink-0" />
        <span className="text-center leading-tight">{eliquidTab.label}</span>
      </button>

      <button type="button" onClick={onChallengeClick} className={tabClass(false)}>
        <Users className="h-4 w-4 shrink-0" />
        <span className="text-center leading-tight">Compare with friend</span>
      </button>

      <button
        type="button"
        onClick={() => onChange(costTab.id)}
        className={tabClass(active === costTab.id)}
      >
        <CostIcon className="h-4 w-4 shrink-0" />
        <span className="text-center leading-tight">{costTab.label}</span>
      </button>
    </div>
  )
}
