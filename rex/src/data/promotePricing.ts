export type CategoryBoostTier = {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  position: string;
  highlight?: boolean;
};

export const categoryBoostTiers: CategoryBoostTier[] = [
  {
    id: 'spotlight',
    name: 'Spotlight',
    price: 99,
    period: '7 days',
    description: 'Pinned #1 in your category with a highlighted card and badge. Funded from your marketing wallet.',
    position: '#1 pinned',
    highlight: true,
  },
  {
    id: 'featured',
    name: 'Featured',
    price: 49,
    period: '7 days',
    description: 'Top 3 placement and a “Featured” ribbon on the category list. Funded from your marketing wallet.',
    position: 'Top 3',
  },
  {
    id: 'boosted',
    name: 'Boosted',
    price: 19,
    period: '7 days',
    description: 'Move up the default sort — more visibility without a pinned slot. Funded from your marketing wallet.',
    position: 'Rank boost',
  },
];

export const affiliateProgramDefaults = {
  /** Commission % of marketing tax — always paid from the marketing wallet */
  commissionMin: 5,
  commissionMax: 40,
  defaultCommission: 15,
  attributionDays: 14,
  minPayout: 25,
};
