import disposableAlternatives from '../assets/collections/disposable-alternatives.png'
import eLiquids from '../assets/collections/e-liquids.png'
import vapeKits from '../assets/collections/vape-kits.png'
import nicotinePouches from '../assets/collections/nicotine-pouches.png'
import pods from '../assets/collections/pods.png'
import coils from '../assets/collections/coils.png'
import type { ProductType } from './products'

export interface Collection {
  id: string
  label: string
  image: string
  category: ProductType | 'all'
  searchTerm?: string
}

export const COLLECTIONS: Collection[] = [
  {
    id: 'e-liquids',
    label: 'E-Liquids',
    image: eLiquids,
    category: 'e-liquid',
  },
  {
    id: 'disposable-alternatives',
    label: 'Disposable Alternatives',
    image: disposableAlternatives,
    category: 'disposable',
  },
  {
    id: 'vape-kits',
    label: 'Vape Kits',
    image: vapeKits,
    category: 'pod',
  },
  {
    id: 'nicotine-pouches',
    label: 'Nicotine Pouches',
    image: nicotinePouches,
    category: 'all',
    searchTerm: 'pouch',
  },
  {
    id: 'pods',
    label: 'Pods',
    image: pods,
    category: 'pod',
    searchTerm: 'pod',
  },
  {
    id: 'coils',
    label: 'Coils',
    image: coils,
    category: 'all',
    searchTerm: 'coil',
  },
]
