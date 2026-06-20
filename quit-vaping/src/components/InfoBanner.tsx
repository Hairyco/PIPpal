import { useState } from 'react'
import { ChevronDown, Info } from 'lucide-react'

export function InfoBanner() {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-5 text-left sm:p-6"
        aria-expanded={open}
      >
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <span className="flex-1 font-semibold text-amber-900">
          Important: Understanding the Comparison
        </span>
        <ChevronDown
          className={`mt-0.5 h-5 w-5 shrink-0 text-amber-600 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="border-t border-amber-200/80 px-5 pb-5 text-sm leading-relaxed text-amber-800 sm:px-6 sm:pb-6">
          This calculator provides a rough estimate based on total nicotine content.
          In reality, only about 5% of nicotine from cigarettes is absorbed, while
          vaping has a higher absorption rate of around 50%. The actual experience
          varies greatly between individuals. Always consult healthcare professionals
          for personalised advice about nicotine consumption and cessation.
        </p>
      )}
    </div>
  )
}
