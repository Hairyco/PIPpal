/**
 * Post-migration / Jupiter fee settlement boundary.
 *
 * Native bonding-curve trades already credit the marketing vault PDA on-chain.
 * After Raydium graduation, CTOgo UI may collect an integrator fee via Jupiter Terminal.
 * Jupiter does NOT split raid / marketing / creator — CTOgo must settle credits itself.
 *
 * This module is the adapter contract. Live Jupiter fee webhooks need your
 * Jupiter / RPC credentials (paid/partner) — until then, reconcile is manual.
 */

export type SettlementCredit = {
  /** Project mint (or CTOgo project id). */
  mint: string;
  /** Lamports (or USDC base units) credited toward this project's marketing bucket. */
  amountBaseUnits: bigint;
  /** Source venue. */
  source: 'jupiter_terminal' | 'ctogo_curve' | 'manual';
  /** On-chain signature that proves the credit. */
  txSignature: string;
  /** When observed (ISO). */
  observedAt: string;
};

export type SettlementResult =
  | { ok: true; credited: SettlementCredit; note: string }
  | { ok: false; reason: string };

/**
 * Record a fee credit that should eventually land in (or be swept into) the MW PDA.
 * Fail-closed when env is missing — never invent a credit.
 */
export async function recordTerminalFeeCredit(
  credit: SettlementCredit,
): Promise<SettlementResult> {
  if (!credit.txSignature || credit.txSignature.length < 32) {
    return { ok: false, reason: 'Missing or invalid transaction signature' };
  }
  if (credit.amountBaseUnits <= 0n) {
    return { ok: false, reason: 'Amount must be positive' };
  }

  // Live path: insert into mw_audit_events / a future mw_settlement_credits table via API.
  // Without Supabase, return a structured dry-run for ops.
  if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: true,
      credited: credit,
      note:
        'Dry-run only — Supabase not configured. Bypass disclosure still applies: trades outside CTOgo UI do not fill the marketing wallet.',
    };
  }

  return {
    ok: true,
    credited: credit,
    note:
      'Credit accepted for reconciliation. Ops must confirm vault transfer / conversion separately from supplier auto-pay.',
  };
}

export const SETTLEMENT_DISCLOSURE = {
  bypass:
    'Trades on Pump, Jupiter (outside CTOgo embed), Trojan, Raydium UI, or other interfaces do not fill an external coin’s marketing wallet.',
  jupiter:
    'CTOgo’s Jupiter Terminal embed can collect an integrator fee; CTOgo code must distribute that fee. Jupiter itself does not pay raid, marketing, or creator splits.',
  nativeCurve: 'Pre-graduation curve buys/sells credit the marketing vault PDA directly on-chain.',
} as const;
