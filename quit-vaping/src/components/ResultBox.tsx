interface ResultBoxProps {
  cigarettes: number
  formula: string
  compact?: boolean
}

export function ResultBox({ cigarettes, formula, compact }: ResultBoxProps) {
  return (
    <div
      className={`rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-600/20 ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      <p className={`font-medium text-brand-100 ${compact ? 'text-xs' : 'text-sm'}`}>
        Equivalent number of cigarettes:
      </p>
      <p
        className={`mt-1 font-bold tracking-tight ${compact ? 'text-3xl' : 'mt-2 text-5xl'}`}
      >
        {cigarettes}
      </p>
      <p className={`font-medium text-brand-100 ${compact ? 'text-sm' : 'text-lg'}`}>
        Cigarettes
      </p>
      <p
        className={`rounded-lg bg-white/10 text-brand-100 ${
          compact ? 'mt-2 px-2 py-1.5 text-[10px]' : 'mt-4 px-3 py-2 text-xs'
        }`}
      >
        {formula}
      </p>
    </div>
  )
}
