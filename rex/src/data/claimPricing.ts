export const CLAIM_FEE = 1;
export const KYC_FEE = 150;

/**
 * Optional marketing-wallet attach on List a CTO (external / indexed coins).
 * Flat $1 covers on-chain rent + tx; any remainder goes to the CTOgo treasury.
 * Launch a CTO still includes the vault in the launch pack (CLAIM_FEE path).
 */
export const MARKETING_WALLET_ATTACH_FEE_USD = 1;

export const MARKETING_WALLET_ATTACH_POLICY = {
  feeUsd: MARKETING_WALLET_ATTACH_FEE_USD,
  summary:
    'Attaching a marketing wallet to a listed coin costs $1. On-chain rent and transaction fees come out of that; whatever is left goes to the CTOgo treasury.',
  paidWhen: 'Optional step on List a CTO — skip to list without a vault',
  fillsFrom: 'CTOgo-routed trades only (platform fee always; marketing cut when vault is attached)',
} as const;

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
    title: 'Browse CTOgo suppliers',
    description:
      'Search our active list of vetted dev studios. Assign one to your roadmap — they are paid automatically when milestones hit.',
  },
  {
    title: 'Bring your own supplier',
    description:
      'Source your own team or agency. They must complete CTOgo onboarding and pass our vetting before they can fulfil your project or receive roadmap funds.',
  },
];
