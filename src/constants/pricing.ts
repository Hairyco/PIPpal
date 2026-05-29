/** Full Access one-time price shown in marketing copy and admin revenue estimates. */
export const FULL_ACCESS_PRICE_GBP = 8.99;

/** Compare-at price shown struck through on upsell surfaces. */
export const FULL_ACCESS_COMPARE_AT_GBP = 12.99;

export function formatFullAccessPrice(options?: { includeSymbol?: boolean }): string {
  const value = FULL_ACCESS_PRICE_GBP.toFixed(2);
  return options?.includeSymbol === false ? value : `£${value}`;
}

export function formatCompareAtPrice(): string {
  return `£${FULL_ACCESS_COMPARE_AT_GBP.toFixed(2)}`;
}
