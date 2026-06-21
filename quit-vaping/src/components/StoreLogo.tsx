import { getRetailer } from '../data/retailers'

interface StoreLogoProps {
  storeName: string
  size?: 'sm' | 'md'
}

export function StoreLogo({ storeName, size = 'sm' }: StoreLogoProps) {
  const retailer = getRetailer(storeName)
  const height = size === 'sm' ? 'h-8' : 'h-10'

  if (!retailer) {
    return (
      <span className="text-xs font-semibold text-slate-700">{storeName}</span>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <img
        src={retailer.logo}
        alt=""
        className={`${height} w-auto shrink-0 rounded-md object-contain`}
      />
      <span className="truncate text-xs font-semibold text-slate-700">{retailer.name}</span>
    </div>
  )
}
