export type AffiliateCatalogueEntry = {
  id: string;
  name: string;
  symbol: string;
  category: string;
  conversion: string;
  epc: string;
  commission: string;
};

/** Demo programmes for the promoter-facing catalogue. */
export const affiliateCatalogue: AffiliateCatalogueEntry[] = [
  {
    id: 'swiftie',
    name: 'SwiftieCoin',
    symbol: 'SWFT',
    category: 'Celebrity Coins',
    conversion: '3.2%',
    epc: '$3.19',
    commission: '12%',
  },
  {
    id: 'cwh',
    name: 'CatWifHat',
    symbol: 'CWH',
    category: 'Meme Coins',
    conversion: '4.1%',
    epc: '$2.84',
    commission: '10%',
  },
  {
    id: 'prex',
    name: 'PepeRex',
    symbol: 'PREX',
    category: 'Meme Coins',
    conversion: '2.8%',
    epc: '$2.41',
    commission: '15%',
  },
  {
    id: 'fit',
    name: 'FitTrack AI',
    symbol: 'FITAI',
    category: 'Artificial Intelligence',
    conversion: '1.9%',
    epc: '$5.02',
    commission: '8%',
  },
  {
    id: 'orbit',
    name: 'OrbitPay',
    symbol: 'ORBT',
    category: 'Apps',
    conversion: '2.2%',
    epc: '$3.88',
    commission: '12%',
  },
];
