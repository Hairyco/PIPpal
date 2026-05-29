/** Enhanced both components — monthly figure for marketing copy (keep in sync across site). */
export const PIP_ENHANCED_MONTHLY_GBP = 760;

export const PIP_ENHANCED_YEARLY_GBP = PIP_ENHANCED_MONTHLY_GBP * 12;

export function formatPipEnhancedMonthly(): string {
  return `£${PIP_ENHANCED_MONTHLY_GBP.toLocaleString('en-GB')}`;
}

export function formatPipEnhancedYearly(): string {
  return `£${PIP_ENHANCED_YEARLY_GBP.toLocaleString('en-GB')}`;
}
