import { Leaf } from 'lucide-react'
import { SearchBar } from './SearchBar'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
          <a href="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Quit Vaping
              </span>
              <p className="hidden text-xs text-slate-500 sm:block">
                Compare prices · Step down · Quit
              </p>
            </div>
          </a>

          <SearchBar value={searchQuery} onChange={onSearchChange} />

          <nav className="hidden shrink-0 items-center gap-4 text-sm lg:flex">
            <a
              href="#calculator"
              className="font-medium text-slate-600 transition hover:text-brand-600"
            >
              Calculator
            </a>
            <a
              href="#recommendations"
              className="font-medium text-slate-600 transition hover:text-brand-600"
            >
              Shop
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
