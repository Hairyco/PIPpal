/** Common UK e-liquid nicotine strengths (mg/mL). */
export const E_LIQUID_STRENGTHS_MG = [0, 3, 5, 6, 10, 12, 18, 20] as const

/** Standard bottle sizes (mL). */
export const E_LIQUID_VOLUMES_ML = [10, 50, 100] as const

export const ALL_E_LIQUID_BRANDS = 'All brands'

/** Popular e-liquid brands for browsing. */
export const E_LIQUID_BRANDS = [
  ALL_E_LIQUID_BRANDS,
  'Vampire Vape',
  'Dinner Lady',
  'Double Drip',
  'Bar Juice',
  'Elfliq',
  'IVG',
  'Riot Squad',
  'Drip Hacks',
] as const

export type ELiquidBrand = (typeof E_LIQUID_BRANDS)[number]

export function strengthOptionLabel(mg: number): string {
  return mg === 0 ? '0mg (free)' : `${mg}mg`
}

export function volumeOptionLabel(ml: number): string {
  if (ml === 10) return '10ml (standard)'
  if (ml === 50) return '50ml (shortfill)'
  if (ml === 100) return '100ml (shortfill)'
  return `${ml}ml`
}
