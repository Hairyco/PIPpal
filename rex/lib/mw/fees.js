/**
 * CTOgo marketing wallet math — 20% service fee ON TOP of supplier invoice.
 * Keep in sync with rex-contracts fees::invoice_with_service_fee.
 */

import { createHash } from 'crypto';

export const CTOGO_SERVICE_FEE_BPS = 2000;
export const BPS_DENOMINATOR = 10_000;

export function invoiceWithServiceFee(invoiceLamports) {
  const invoice = BigInt(invoiceLamports);
  if (invoice <= 0n) throw new Error('invoice must be > 0');
  const serviceFee = (invoice * BigInt(CTOGO_SERVICE_FEE_BPS)) / BigInt(BPS_DENOMINATOR);
  const totalDebit = invoice + serviceFee;
  return {
    invoiceLamports: invoice,
    serviceFeeLamports: serviceFee,
    totalDebitLamports: totalDebit,
  };
}

/** USD helpers for UI (approximate; settlement is on-chain lamports). */
export function usdWithServiceFee(invoiceUsd) {
  const invoice = Number(invoiceUsd);
  if (!(invoice > 0)) throw new Error('invoice must be > 0');
  const serviceFee = Math.round(invoice * (CTOGO_SERVICE_FEE_BPS / BPS_DENOMINATOR) * 100) / 100;
  const total = Math.round((invoice + serviceFee) * 100) / 100;
  return { invoiceUsd: invoice, serviceFeeUsd: serviceFee, totalDebitUsd: total };
}

export function makeInvoiceIdHex(projectMint, orderKey) {
  return createHash('sha256').update(`${projectMint}:${orderKey}`).digest('hex');
}
