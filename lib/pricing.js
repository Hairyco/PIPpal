/** Keep in sync with src/constants/pricing.ts — used by Stripe checkout API */
export const FULL_ACCESS_PRICE_GBP = 8.99;
export const FULL_ACCESS_COMPARE_AT_GBP = 12.99;
export const FULL_ACCESS_PRICE_PENCE = Math.round(FULL_ACCESS_PRICE_GBP * 100);
