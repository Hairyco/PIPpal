import elfBar600 from '../assets/products/elf-bar-600.png'
import lostMaryBm600 from '../assets/products/lost-mary-bm600.png'
import nastyFix from '../assets/products/nasty-fix.png'
import oxvaXlimPro from '../assets/products/oxva-xlim-pro.png'
import vampireVape from '../assets/products/vampire-vape.png'
import dinnerLady from '../assets/products/dinner-lady.png'

export interface StorePrice {
  store: string
  price: number
  url: string
}

export type ProductType = 'pod' | 'disposable' | 'e-liquid'

export type SearchQuickFilter = 'deals' | 'bulk' | null

export interface Product {
  id: string
  name: string
  brand: string
  strengthMg: number
  type: ProductType
  description: string
  image: string
  prices: StorePrice[]
  deal?: boolean
  bulk?: boolean
}

export const PRODUCTS: Product[] = [
  {
    id: 'elf-bar-low',
    name: 'Elf Bar 600 — 10mg',
    brand: 'Elf Bar',
    strengthMg: 10,
    type: 'disposable',
    description:
      'Popular disposable with a smoother 10mg hit — a common first step down from 20mg.',
    image: elfBar600,
    deal: true,
    prices: [
      { store: 'Vape Superstore', price: 3.99, url: '#' },
      { store: 'Ecigwizard', price: 4.49, url: '#' },
      { store: 'Vape Club', price: 3.79, url: '#' },
    ],
  },
  {
    id: 'lost-mary-10',
    name: 'Lost Mary BM600 — 10mg',
    brand: 'Lost Mary',
    strengthMg: 10,
    type: 'disposable',
    description:
      'Compact disposable ideal for reducing nicotine without changing your routine.',
    image: lostMaryBm600,
    deal: true,
    prices: [
      { store: 'Vape Superstore', price: 4.29, url: '#' },
      { store: 'Totally Wicked', price: 4.99, url: '#' },
      { store: 'Vape Club', price: 3.99, url: '#' },
    ],
  },
  {
    id: 'nasty-fix-6',
    name: 'Nasty Fix Go — 6mg',
    brand: 'Nasty',
    strengthMg: 6,
    type: 'disposable',
    description: 'Mid-strength option for the second stage of stepping down.',
    image: nastyFix,
    prices: [
      { store: 'Ecigwizard', price: 5.49, url: '#' },
      { store: 'Vape Superstore', price: 5.29, url: '#' },
      { store: 'Vape Club', price: 4.99, url: '#' },
    ],
  },
  {
    id: 'oxva-mini-6',
    name: 'OXVA Xlim Pro Pod Kit + 6mg Salts',
    brand: 'OXVA',
    strengthMg: 6,
    type: 'pod',
    description:
      'Refillable pod kit with 6mg nic salts — cheaper long-term than disposables.',
    image: oxvaXlimPro,
    bulk: true,
    prices: [
      { store: 'Vape Club', price: 18.99, url: '#' },
      { store: 'Totally Wicked', price: 21.99, url: '#' },
      { store: 'Ecigwizard', price: 19.49, url: '#' },
    ],
  },
  {
    id: 'vampire-3',
    name: 'Vampire Vape — 3mg E-Liquid 10ml',
    brand: 'Vampire Vape',
    strengthMg: 3,
    type: 'e-liquid',
    description:
      'Low-strength freebase e-liquid for the final stretch before nicotine-free.',
    image: vampireVape,
    deal: true,
    bulk: true,
    prices: [
      { store: 'Vape Superstore', price: 2.99, url: '#' },
      { store: 'Vape Club', price: 2.79, url: '#' },
      { store: 'Totally Wicked', price: 3.49, url: '#' },
    ],
  },
  {
    id: 'dinner-lady-0',
    name: 'Dinner Lady — 0mg E-Liquid 10ml',
    brand: 'Dinner Lady',
    strengthMg: 0,
    type: 'e-liquid',
    description:
      'Nicotine-free e-liquid to break the habit while keeping the hand-to-mouth routine.',
    image: dinnerLady,
    bulk: true,
    prices: [
      { store: 'Vape Club', price: 2.49, url: '#' },
      { store: 'Ecigwizard', price: 2.99, url: '#' },
      { store: 'Vape Superstore', price: 2.79, url: '#' },
    ],
  },
]

export function getRecommendedStrengths(currentMg: number): number[] {
  const available = [...new Set(PRODUCTS.map((p) => p.strengthMg))].sort(
    (a, b) => b - a,
  )
  if (currentMg <= 0) return [0]
  return available.filter((s) => s < currentMg).slice(0, 3)
}

export function getRecommendedProducts(currentMg: number): Product[] {
  const targets = getRecommendedStrengths(currentMg)
  const seen = new Set<string>()
  const matched: Product[] = []

  for (const strength of targets) {
    for (const product of PRODUCTS) {
      if (product.strengthMg === strength && !seen.has(product.id)) {
        seen.add(product.id)
        matched.push(product)
      }
    }
  }

  return matched.slice(0, 4)
}

export function lowestPrice(product: Product): StorePrice {
  return product.prices.reduce((min, p) => (p.price < min.price ? p : min))
}

export function highestPrice(product: Product): StorePrice {
  return product.prices.reduce((max, p) => (p.price > max.price ? p : max))
}

export function filterProducts(
  products: Product[],
  query: string,
  category: ProductType | 'all' = 'all',
  quickFilter: SearchQuickFilter = null,
  brandFilter: string | null = null,
): Product[] {
  const q = query.trim().toLowerCase()

  return products.filter((product) => {
    const matchesCategory = category === 'all' || product.type === category
    if (!matchesCategory) return false

    if (quickFilter === 'deals' && !product.deal) return false
    if (quickFilter === 'bulk' && !product.bulk) return false

    if (brandFilter && brandFilter !== 'All brands') {
      if (product.brand.toLowerCase() !== brandFilter.toLowerCase()) return false
    }

    if (!q) return true

    return (
      product.name.toLowerCase().includes(q) ||
      product.brand.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q) ||
      product.type.toLowerCase().includes(q) ||
      `${product.strengthMg}mg`.includes(q) ||
      (product.strengthMg === 0 && q.includes('nicotine-free'))
    )
  })
}
