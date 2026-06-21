import vapeSuperstore from '../assets/retailers/vape-superstore.png'
import ecigwizard from '../assets/retailers/ecigwizard.png'
import vapeClub from '../assets/retailers/vape-club.png'
import totallyWicked from '../assets/retailers/totally-wicked.png'

export interface Retailer {
  id: string
  name: string
  logo: string
  accent: string
}

export const RETAILERS: Record<string, Retailer> = {
  'Vape Superstore': {
    id: 'vape-superstore',
    name: 'Vape Superstore',
    logo: vapeSuperstore,
    accent: '#dc2626',
  },
  Ecigwizard: {
    id: 'ecigwizard',
    name: 'Ecigwizard',
    logo: ecigwizard,
    accent: '#059669',
  },
  'Vape Club': {
    id: 'vape-club',
    name: 'Vape Club',
    logo: vapeClub,
    accent: '#2563eb',
  },
  'Totally Wicked': {
    id: 'totally-wicked',
    name: 'Totally Wicked',
    logo: totallyWicked,
    accent: '#7c3aed',
  },
}

export function getRetailer(storeName: string): Retailer | null {
  return RETAILERS[storeName] ?? null
}
