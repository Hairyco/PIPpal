import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

export type SearchQuickFilter = 'deals' | 'bulk' | null

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  quickFilter?: SearchQuickFilter
  onQuickFilterChange?: (filter: SearchQuickFilter) => void
  compact?: boolean
}

export function SearchBar({
  value,
  onChange,
  quickFilter = null,
  onQuickFilterChange,
  compact,
}: SearchBarProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectQuick(filter: SearchQuickFilter) {
    onQuickFilterChange?.(filter)
    onChange('')
    setOpen(false)
    document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div ref={rootRef} className={`relative ${compact ? 'w-full' : 'w-full max-w-xl flex-1'}`}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => {
          onQuickFilterChange?.(null)
          onChange(e.target.value)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search products, strength, or type..."
        className={`w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
          compact ? 'py-2.5' : 'py-3'
        }`}
      />
      {(value || quickFilter) && (
        <button
          type="button"
          onClick={() => {
            onChange('')
            onQuickFilterChange?.(null)
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {open && onQuickFilterChange && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Quick filters
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => selectQuick('deals')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                quickFilter === 'deals'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              Deals
            </button>
            <button
              type="button"
              onClick={() => selectQuick('bulk')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                quickFilter === 'bulk'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              Bulk
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
