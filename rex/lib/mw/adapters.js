/**
 * Provider fulfilment adapters.
 * Payment is on-chain; fulfilment may stay manual/sandbox until API credentials exist.
 */

export async function fulfilOrder({ adapterType, order, offer, project }) {
  switch (adapterType) {
    case 'manual':
    case 'telegram':
      return {
        status: 'manual',
        notes: `Manual fulfilment queued for ${offer?.label || order.offer_id}. Ops completes off-platform.`,
        externalRef: null,
      };
    case 'dexscreener':
      if (!process.env.DEXSCREENER_API_KEY) {
        return {
          status: 'manual',
          notes: 'DexScreener adapter sandbox — set DEXSCREENER_API_KEY for live API (paid/partner access).',
          externalRef: null,
        };
      }
      return {
        status: 'pending',
        notes: 'DexScreener API key present but live order submission not wired — treat as manual until contract signed.',
        externalRef: null,
      };
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
