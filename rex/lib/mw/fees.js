/**
 * CTOgo / Polessia marketing service fee — ON TOP of supplier invoice (never from supplier cut).
 * Sliding scale by invoice USD (keep in sync with rex-contracts + chainConfig).
 *
 *   under $250  → 10%
 *   $250–$1,000 → 7%
 *   $1,000+     → 5%
 */

import { createHash } from 'crypto';

export const BPS_DENOMINATOR = 10_000;

/** @deprecated Prefer serviceFeeBpsForInvoiceUsd — flat default was removed. */
export const CTOGO_SERVICE_FEE_BPS = 500;

/**
 * @param {number} invoiceUsd
 * @returns {number} fee bps (1000 | 700 | 500)
 */
export function serviceFeeBpsForInvoiceUsd(invoiceUsd) {
  const n = Number(invoiceUsd);
  if (!(n > 0)) throw new Error('invoice must be > 0');
  if (n < 250) return 1000;
  if (n < 1000) return 700;
  return 500;
}

/**
 * @param {bigint | number} invoiceLamports
 * @param {number} feeBps — from serviceFeeBpsForInvoiceUsd
 */
export function invoiceWithServiceFee(invoiceLamports, feeBps) {
  const invoice = BigInt(invoiceLamports);
  if (invoice <= 0n) throw new Error('invoice must be > 0');
  const bps = BigInt(feeBps ?? CTOGO_SERVICE_FEE_BPS);
  if (bps < 0n || bps > 10_000n) throw new Error('feeBps out of range');
  const serviceFee = (invoice * bps) / BigInt(BPS_DENOMINATOR);
  const totalDebit = invoice + serviceFee;
  return {
    invoiceLamports: invoice,
    serviceFeeLamports: serviceFee,
    totalDebitLamports: totalDebit,
    feeBps: Number(bps),
  };
}

/** USD helpers for UI / Approve / Helio dry-run. */
export function usdWithServiceFee(invoiceUsd) {
  const invoice = Number(invoiceUsd);
  if (!(invoice > 0)) throw new Error('invoice must be > 0');
  const feeBps = serviceFeeBpsForInvoiceUsd(invoice);
  const serviceFee = Math.round(invoice * (feeBps / BPS_DENOMINATOR) * 100) / 100;
  const total = Math.round((invoice + serviceFee) * 100) / 100;
  return {
    invoiceUsd: invoice,
    serviceFeeUsd: serviceFee,
    totalDebitUsd: total,
    feeBps,
    feePercent: feeBps / 100,
  };
}

export function makeInvoiceIdHex(projectMint, orderKey) {
  return createHash('sha256').update(`${projectMint}:${orderKey}`).digest('hex');
}
