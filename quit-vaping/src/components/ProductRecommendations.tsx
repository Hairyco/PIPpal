import { useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ChevronDown,
  ExternalLink,
  ShoppingBag,
  Store,
} from 'lucide-react'
import {
  filterProducts,
  getRecommendedProducts,
  getRecommendedStrengths,
  highestPrice,
  lowestPrice,
  PRODUCTS,
  type Product,
  type ProductType,
} from '../data/products'
import { FeaturedCollectionsCarousel } from './FeaturedCollectionsCarousel'
import { ELiquidCalculator } from './ELiquidCalculator'
import type { Collection } from '../data/collections'

interface ProductRecommendationsProps {
  currentNicotineMg: number
  searchQuery: string
  onSearchChange?: (query: string) => void
  volumeMl: number
  onNicotineChange: (v: number) => void
  onVolumeChange: (v: number) => void
}

const CATEGORIES: { id: ProductType | 'all'; label: string }[] = [
  { id: 'all', label: 'All products' },
  { id: 'disposable', label: 'Disposables' },
  { id: 'pod', label: 'Pod kits' },
  { id: 'e-liquid', label: 'E-liquids' },
]

function strengthLabel(mg: number) {
  return mg === 0 ? 'Nicotine-free' : `${mg}mg`
}

function ProductCard({
  product,
  highlighted,
}: {
  product: Product
  highlighted?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const best = lowestPrice(product)
  const highest = highestPrice(product)
  const sorted = [...product.prices].sort((a, b) => a.price - b.price)
  const savings = highest.price - best.price

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
        highlighted
          ? 'border-brand-300 ring-2 ring-brand-100'
          : 'border-slate-200 hover:border-brand-200'
      }`}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain p-6 transition duration-300 group-hover:scale-105"
        />
        {highlighted && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Recommended
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600 shadow-sm">
          {product.type}
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-slate-900/85 px-2.5 py-1 text-xs font-semibold text-white">
          {strengthLabel(product.strengthMg)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug text-slate-900">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-500">
          {product.description}
        </p>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                From
              </p>
              <p className="text-2xl font-bold text-slate-900">
                £{best.price.toFixed(2)}
              </p>
              {savings > 0 && (
                <p className="text-xs text-slate-400">
                  up to £{highest.price.toFixed(2)}{' '}
                  <span className="text-accent-500">· save £{savings.toFixed(2)}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
              <Store className="h-3.5 w-3.5" />
              {product.prices.length} stores
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
          >
            Compare prices
            <ChevronDown
              className={`h-4 w-4 transition ${expanded ? 'rotate-180' : ''}`}
            />
          </button>

          {expanded && (
            <div className="mt-2 space-y-1.5">
              {sorted.map((price) => (
                <a
                  key={price.store}
                  href={price.url}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2.5 text-sm transition hover:border-brand-200 hover:bg-brand-50/50"
                >
                  <span className="font-medium text-slate-700">{price.store}</span>
                  <span className="flex items-center gap-1.5 font-semibold text-slate-900">
                    £{price.price.toFixed(2)}
                    {price.store === best.store && (
                      <span className="rounded bg-accent-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        BEST
                      </span>
                    )}
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export function ProductRecommendations({
  currentNicotineMg,
  searchQuery,
  onSearchChange,
  volumeMl,
  onNicotineChange,
  onVolumeChange,
}: ProductRecommendationsProps) {
  const [category, setCategory] = useState<ProductType | 'all'>('all')
  const recommended = getRecommendedProducts(currentNicotineMg)
  const recommendedIds = new Set(recommended.map((p) => p.id))
  const steps = getRecommendedStrengths(currentNicotineMg)

  const filteredProducts = useMemo(
    () => filterProducts(PRODUCTS, searchQuery, category),
    [searchQuery, category],
  )

  const isSearching = searchQuery.trim().length > 0 || category !== 'all'
  const showRecommended = !isSearching && recommended.length > 0
  const browseProducts = showRecommended
    ? filteredProducts.filter((p) => !recommendedIds.has(p.id))
    : filteredProducts

  function handleCollectionSelect(collection: Collection) {
    setCategory(collection.category)
    onSearchChange?.(collection.searchTerm ?? '')
    document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="recommendations" className="scroll-mt-24">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Vape Shop</h2>
              <p className="text-sm text-slate-600">
                Compare lower-strength alternatives across UK retailers
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'}
          </p>
        </div>

        <FeaturedCollectionsCarousel nested onSelect={handleCollectionSelect} />

        <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setCategory(id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              category === id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {category === 'e-liquid' && (
        <ELiquidCalculator
          compact
          nicotineMg={currentNicotineMg}
          volumeMl={volumeMl}
          onNicotineChange={onNicotineChange}
          onVolumeChange={onVolumeChange}
        />
      )}

      {showRecommended && (
        <>
          {steps.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
              <ArrowDownRight className="h-4 w-4 text-brand-600" />
              <span className="text-sm text-brand-800">
                Suggested step-down from your {currentNicotineMg}mg:{' '}
                <strong>
                  {currentNicotineMg}mg → {steps.join('mg → ')}mg
                </strong>
              </span>
            </div>
          )}

          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recommended for you
          </h3>
          <div className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {recommended.map((product) => (
              <ProductCard key={product.id} product={product} highlighted />
            ))}
          </div>
        </>
      )}

      {!isSearching && showRecommended && browseProducts.length > 0 && (
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Browse all products
        </h3>
      )}

      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-medium text-slate-700">No products found</p>
          <p className="mt-1 text-sm text-slate-500">
            Try a different search term or category filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(showRecommended ? browseProducts : filteredProducts).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              highlighted={!isSearching && recommendedIds.has(product.id)}
            />
          ))}
        </div>
      )}

      <p className="mt-8 rounded-xl bg-slate-100 px-4 py-3 text-xs leading-relaxed text-slate-500">
        Affiliate disclosure: Some links are affiliate links. We may earn a
        commission when you purchase through them, at no extra cost to you.
        Prices are indicative — always check the retailer for current stock and
        pricing.
      </p>
      </div>
    </section>
  )
}
