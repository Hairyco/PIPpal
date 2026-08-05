/**
 * Client helpers for CTOgo marketing-wallet APIs.
 * When Supabase/env is unset, endpoints return `{ demo: true }` and the UI keeps a demo badge.
 */

export type MwProjectStatus = {
  configured: boolean;
  demo: boolean;
  message?: string;
  project?: {
    mint: string;
    ticker: string;
    spend_paused: boolean;
    spend_unlocked: boolean;
    marketing_vault: string | null;
    marketing_attached: boolean;
  } | null;
  orders?: Array<{
    id: string;
    status: string;
    invoice_id: string;
    breakdown?: { invoiceUsd: number; serviceFeeUsd: number; totalDebitUsd: number } | null;
    mw_provider_offers?: { label: string; price_usd: number };
    mw_providers?: { display_name: string };
  }>;
  receipts?: Array<{
    id: string;
    tx_signature: string;
    invoice_lamports: number;
    service_fee_lamports: number;
    total_debit_lamports: number;
    confirmed_at: string;
  }>;
  feeNote?: string;
};

export async function fetchMwProjectStatus(mint: string | null | undefined): Promise<MwProjectStatus> {
  if (!mint || mint.includes('…')) {
    return { configured: false, demo: true, message: 'No marketing vault mint yet' };
  }
  try {
    const res = await fetch(`/api/mw-project-status?mint=${encodeURIComponent(mint)}`);
    if (!res.ok) {
      return { configured: false, demo: true, message: `Status ${res.status}` };
    }
    return (await res.json()) as MwProjectStatus;
  } catch {
    return { configured: false, demo: true, message: 'API unreachable — demo mode' };
  }
}

export async function fetchMwProviders(all = false) {
  try {
    const res = await fetch(`/api/mw-providers${all ? '?all=1' : ''}`);
    if (!res.ok) return { providers: [], feeNote: null };
    return await res.json();
  } catch {
    return { providers: [], feeNote: null };
  }
}
