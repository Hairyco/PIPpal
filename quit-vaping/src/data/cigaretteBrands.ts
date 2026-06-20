export interface CigaretteBrand {
  name: string
  nicotineMg: number
}

export const CIGARETTE_BRANDS: CigaretteBrand[] = [
  { name: 'Sterling', nicotineMg: 9 },
  { name: 'Richmond', nicotineMg: 9.5 },
  { name: 'Lambert & Butler', nicotineMg: 10 },
  { name: 'Benson & Hedges', nicotineMg: 10 },
  { name: 'Silk Cut', nicotineMg: 7 },
  { name: 'Silk Cut Purple', nicotineMg: 5 },
  { name: 'Mayfair', nicotineMg: 9 },
  { name: 'Rothmans', nicotineMg: 10 },
  { name: 'Embassy', nicotineMg: 10 },
  { name: 'John Player Special', nicotineMg: 10.5 },
  { name: 'Sovereign', nicotineMg: 9 },
  { name: 'Superkings', nicotineMg: 11 },
  { name: 'Windsor Blue', nicotineMg: 9 },
  { name: 'Carlton', nicotineMg: 9.5 },
  { name: 'Pall Mall', nicotineMg: 10 },
  { name: 'Marlboro', nicotineMg: 10 },
  { name: 'Marlboro Light', nicotineMg: 8 },
  { name: 'Marlboro Gold', nicotineMg: 6 },
  { name: 'Camel', nicotineMg: 12 },
  { name: 'Camel Blue', nicotineMg: 8 },
  { name: 'Lucky Strike', nicotineMg: 11 },
  { name: 'Parliament', nicotineMg: 9 },
  { name: 'Winston', nicotineMg: 10 },
  { name: 'Newport', nicotineMg: 13 },
  { name: 'American Spirit', nicotineMg: 18 },
  { name: 'Dunhill', nicotineMg: 10 },
  { name: 'Kent', nicotineMg: 9 },
  { name: 'Vogue', nicotineMg: 8 },
  { name: 'Davidoff', nicotineMg: 10 },
  { name: 'Gauloises', nicotineMg: 12 },
]

export const UK_MAX_NICOTINE = 20
export const PUFFS_PER_CIGARETTE = 12
export const CIGARETTES_PER_PACK = 20
export const PACK_PRICE_GBP = 12.5
export const ELIQUID_10ML_PRICE_GBP = 3.5
