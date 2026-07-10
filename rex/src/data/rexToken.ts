export const REX_TOKEN_SYMBOL = 'REX';

/** Cost in REX tokens per AI image generation */
export const REX_GENERATE_IMAGE_COST = 25;

/** Cost in REX tokens to generate a launch landing page ready on launch */
export const REX_GENERATE_LANDING_COST = 75;

/** Cost in REX tokens per launch banner generation */
export const REX_GENERATE_BANNER_COST = 25;

export type RexTokenPackage = {
  id: string;
  rexAmount: number;
  priceUsd: number;
  label: string;
  popular?: boolean;
};

export const rexTokenPackages: RexTokenPackage[] = [
  { id: 'starter', rexAmount: 50, priceUsd: 4.99, label: 'Starter' },
  { id: 'creator', rexAmount: 150, priceUsd: 12.99, label: 'Creator', popular: true },
  { id: 'studio', rexAmount: 500, priceUsd: 39.99, label: 'Studio' },
];

export function formatRexBalance(amount: number): string {
  return `${amount.toLocaleString()} ${REX_TOKEN_SYMBOL}`;
}
