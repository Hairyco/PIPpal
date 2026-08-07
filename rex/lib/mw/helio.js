/**
 * Helio (MoonPay Commerce) charge helpers for DexScreener QR settle.
 * Dex QR embeds a charge deeplink — we capture and pay; we do not create Dex's charge.
 */

const CHARGE_URL_RE =
  /https?:\/\/(?:moonpay\.)?hel\.io\/charge\/([a-f0-9-]{36})(?:\?[^\s]*)?/i;

/**
 * @param {string} raw QR value, pasted URL, or deeplink
 * @returns {{ ok: true, chargeToken: string, deeplink: string, network: string | null } | { ok: false, reason: string }}
 */
export function parseHelioChargeUrl(raw) {
  if (!raw || typeof raw !== 'string') {
    return { ok: false, reason: 'Empty payment instruction' };
  }
  const trimmed = raw.trim();
  const match = trimmed.match(CHARGE_URL_RE);
  if (!match) {
    return { ok: false, reason: 'Not a Helio charge URL (expected moonpay.hel.io/charge/{token})' };
  }
  const chargeToken = match[1];
  let network = null;
  try {
    const u = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    network = u.searchParams.get('network');
  } catch {
    /* ignore */
  }
  const deeplink = trimmed.startsWith('http')
    ? trimmed
    : `https://moonpay.hel.io/charge/${chargeToken}?network=SOL&deeplink=true`;
  return { ok: true, chargeToken, deeplink, network };
}

/**
 * Build payment_instruction JSON stored on mw_campaign_orders.
 * @param {{ chargeToken: string, deeplink: string, network?: string | null, amountUsd?: number, asset?: string }} p
 */
export function helioPaymentInstruction(p) {
  return {
    processor: 'helio',
    rail: 'hosted_checkout_crypto',
    chargeToken: p.chargeToken,
    deeplink: p.deeplink,
    network: p.network || 'SOL',
    asset: p.asset || 'USDC',
    amountUsd: p.amountUsd ?? null,
    capturedAt: new Date().toISOString(),
    /** Deposit destination resolved later (Helio page / API). */
    depositAddress: null,
    depositAmount: null,
  };
}

/**
 * Placeholder: resolve deposit destination for auto-transfer.
 * Live Dex charges are merchant-owned; v1 may require ops paste of deposit address
 * or wallet-connect pay until Helio deposit fields are scraped/resolved reliably.
 */
export async function resolveHelioDeposit(_instruction) {
  return {
    ok: false,
    reason:
      'Helio deposit resolve not wired — capture deeplink, then ops/hot wallet pays deposit or Pay with Wallet contingency.',
  };
}
