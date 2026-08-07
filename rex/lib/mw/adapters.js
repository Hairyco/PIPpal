/**
 * Provider fulfilment adapters.
 * Payment is on-chain / Helio deposit; fulfilment may stay manual until confirm signal.
 */

import { parseHelioChargeUrl } from './helio.js';

/**
 * Poll Dex public orders API (read-only) for paid placements on a mint.
 * @param {string} chainId e.g. solana
 * @param {string} tokenAddress
 */
export async function fetchDexScreenerOrders(chainId, tokenAddress) {
  if (!chainId || !tokenAddress) {
    return { ok: false, reason: 'chainId and tokenAddress required' };
  }
  try {
    const res = await fetch(
      `https://api.dexscreener.com/orders/v1/${encodeURIComponent(chainId)}/${encodeURIComponent(tokenAddress)}`,
    );
    if (!res.ok) {
      return { ok: false, reason: `Dex orders API ${res.status}` };
    }
    const data = await res.json();
    return { ok: true, orders: data };
  } catch (err) {
    return { ok: false, reason: err.message || String(err) };
  }
}

export async function fulfilOrder({ adapterType, order, offer, project }) {
  switch (adapterType) {
    case 'manual':
    case 'telegram':
      return {
        status: 'manual',
        notes: `Manual fulfilment queued for ${offer?.label || order.offer_id}. Ops completes off-platform.`,
        externalRef: null,
      };
    case 'dexscreener': {
      const instr = order.payment_instruction;
      const charge =
        instr?.deeplink != null ? parseHelioChargeUrl(String(instr.deeplink)) : { ok: false };
      const mint = project?.mint;
      let ordersNote = '';
      if (mint) {
        const dex = await fetchDexScreenerOrders('solana', mint);
        if (dex.ok) {
          ordersNote = ` Dex orders API returned ${Array.isArray(dex.orders) ? dex.orders.length : 'n/a'} entr(y/ies).`;
        } else {
          ordersNote = ` Dex orders poll: ${dex.reason}.`;
        }
      }
      return {
        status: 'manual',
        notes:
          `DexScreener: feed creatives into marketplace, capture Helio QR, settle USDC (JIT from vault SOL). ` +
          (charge.ok
            ? `Charge ${charge.chargeToken} on file.`
            : 'No Helio charge on file yet — use /api/mw-payment-instruction.') +
          ordersNote +
          ' Playbook: docs/suppliers/dexscreener.md. Socials optional on Dex.',
        externalRef: charge.ok ? charge.chargeToken : null,
      };
    }
    case 'influencer':
      return {
        status: 'manual',
        notes: `Influencer payout recorded for ${project?.ticker || 'project'}; delivery tracked manually.`,
        externalRef: null,
      };
    default:
      return {
        status: 'failed',
        notes: `Unknown adapter ${adapterType}`,
        externalRef: null,
      };
  }
}
