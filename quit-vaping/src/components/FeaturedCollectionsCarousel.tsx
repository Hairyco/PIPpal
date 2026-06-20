import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { COLLECTIONS, type Collection } from '../data/collections'

interface FeaturedCollectionsCarouselProps {
  onSelect?: (collection: Collection) => void
  nested?: boolean
}

export function FeaturedCollectionsCarousel({
  onSelect,
  nested = false,
}: FeaturedCollectionsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scrollBy(direction: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    const amount = Math.min(el.clientWidth * 0.85, 520)
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <div aria-label="Featured collections" className={nested ? 'mb-6' : 'mb-10'}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3
          className={
            nested
              ? 'text-base font-bold text-slate-900'
              : 'text-xl font-bold tracking-tight text-slate-900 sm:text-2xl'
          }
        >
          Featured Collections
        </h3>
        <div className="hidden shrink-0 gap-1.5 sm:flex">
          <button
            type="button"
            onClick={() => scrollBy('left')}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            aria-label="Scroll collections left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy('right')}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            aria-label="Scroll collections right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 scroll-smooth sm:gap-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {COLLECTIONS.map((collection) => (
          <button
            key={collection.id}
            type="button"
            onClick={() => onSelect?.(collection)}
            className="group w-[132px] shrink-0 snap-start text-left sm:w-[150px] md:w-[168px]"
          >
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:border-slate-300 group-hover:shadow-md">
              <img
                src={collection.image}
                alt={collection.label}
                className="aspect-[170/205] w-full object-cover object-top"
                draggable={false}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
