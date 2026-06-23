export const CLAIM_FEE = 1;

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  price: number;
}

export const premiumFeatures: PremiumFeature[] = [
  {
    id: 'profit-share',
    name: 'Profit share',
    description: 'Distribute a % of product revenue to top token holders monthly.',
    price: 79,
  },
  {
    id: 'governance',
    name: 'Holder governance',
    description: 'Let investors vote on roadmap priorities and milestone approvals.',
    price: 49,
  },
  {
    id: 'beta-access',
    name: 'Early beta access',
    description: 'Token-gated early access to the MVP before public launch.',
    price: 29,
  },
  {
    id: 'nft-badge',
    name: 'Investor NFT badge',
    description: 'On-chain badge and perks for early supporters at launch.',
    price: 39,
  },
];

export const founderSupplierOptions = [
  {
    title: 'Browse Rex suppliers',
    description:
      'Search our active list of vetted dev studios. Assign one to your roadmap — they are paid automatically when milestones hit.',
  },
  {
    title: 'Bring your own supplier',
    description:
      'Source your own team or agency. They must complete Rex onboarding and pass our vetting before they can fulfil your project or receive roadmap funds.',
  },
];
