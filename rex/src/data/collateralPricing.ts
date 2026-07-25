/** Creative collateral pricing for the Launch Wizard Website step. */

/** First logo + first banner on the Website step are included. */
export const COLLATERAL_INCLUDED = {
  logos: 1,
  banners: 1,
} as const;

/**
 * Estimated platform cost for each *extra* generation after the free first.
 * Billed at publish (not charged per click). Template gens today; AI later.
 */
export const COLLATERAL_EXTRA_USD = {
  logo: 0.05,
  banner: 0.12,
} as const;

export type CollateralUsage = {
  /** Extra logo generations beyond the free first (button clicks). */
  extraLogos: number;
  /** Extra banner generations beyond the free first (button clicks). */
  extraBanners: number;
};

export function collateralExtraTotalUsd(usage: CollateralUsage): number {
  return (
    usage.extraLogos * COLLATERAL_EXTRA_USD.logo +
    usage.extraBanners * COLLATERAL_EXTRA_USD.banner
  );
}

export function formatCollateralUsd(amount: number): string {
  if (amount <= 0) return '$0';
  return `$${amount.toFixed(2)}`;
}

export function collateralBillSummary(usage: CollateralUsage): {
  hasExtras: boolean;
  totalUsd: number;
  lines: string[];
} {
  const totalUsd = collateralExtraTotalUsd(usage);
  const lines: string[] = [];
  if (usage.extraLogos > 0) {
    lines.push(
      `${usage.extraLogos} extra logo${usage.extraLogos === 1 ? '' : 's'} · ${formatCollateralUsd(
        usage.extraLogos * COLLATERAL_EXTRA_USD.logo,
      )}`,
    );
  }
  if (usage.extraBanners > 0) {
    lines.push(
      `${usage.extraBanners} extra banner${usage.extraBanners === 1 ? '' : 's'} · ${formatCollateralUsd(
        usage.extraBanners * COLLATERAL_EXTRA_USD.banner,
      )}`,
    );
  }
  return { hasExtras: lines.length > 0, totalUsd, lines };
}
