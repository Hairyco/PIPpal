/**
 * Helio (MoonPay Commerce) charge helpers for DexScreener QR settle.
 * Dex QR embeds a charge deeplink — we capture and pay; we do not create Dex's charge.
 */

const CHARGE_URL_RE =
  /https?:\/\/(?:moonpay\.)?hel\.io\/charge\/([a-f0-9-]{36})(?:\?[^\s]*)?/i;

/** Mainnet USDC mint */
export const USDC_MINT_MAINNET = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

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
    depositAddress: p.depositAddress || null,
    /** Human-readable amount in asset units (e.g. 299 for USDC) */
    depositAmount: p.depositAmount ?? p.amountUsd ?? null,
    mint: p.mint || (p.asset === 'SOL' ? null : USDC_MINT_MAINNET),
  };
}

/**
 * Merge ops-provided deposit fields into an existing instruction.
 */
export function withHelioDeposit(instruction, deposit) {
  const base = instruction && typeof instruction === 'object' ? { ...instruction } : {};
  return {
    ...base,
    processor: base.processor || 'helio',
    depositAddress: deposit.depositAddress || base.depositAddress || null,
    depositAmount:
      deposit.depositAmount != null
        ? Number(deposit.depositAmount)
        : base.depositAmount ?? base.amountUsd ?? null,
    asset: deposit.asset || base.asset || 'USDC',
    mint:
      deposit.mint ||
      base.mint ||
      (deposit.asset === 'SOL' || base.asset === 'SOL' ? null : USDC_MINT_MAINNET),
    depositCapturedAt: new Date().toISOString(),
  };
}

/**
 * Resolve deposit destination for auto-transfer.
 * Dex charges are merchant-owned — usually ops pastes depositAddress from the QR screen.
 * Optional: HELIO_PUBLIC_KEY + HELIO_SECRET_KEY may retrieve charges we created (not Dex's).
 *
 * Payer: pickActiveOpsWallet() / failoverOpsWallet(); until pool registered, keeper fallback.
 */
export async function resolveHelioDeposit(instruction) {
  if (!instruction || typeof instruction !== 'object') {
    return { ok: false, reason: 'No payment_instruction on order' };
  }

  if (instruction.depositAddress && instruction.depositAmount != null) {
    return {
      ok: true,
      depositAddress: String(instruction.depositAddress).trim(),
      depositAmount: Number(instruction.depositAmount),
      asset: instruction.asset || 'USDC',
      mint: instruction.mint || USDC_MINT_MAINNET,
      source: 'instruction',
    };
  }

  const token = instruction.chargeToken;
  const pub = process.env.HELIO_PUBLIC_KEY;
  const secret = process.env.HELIO_SECRET_KEY;
  const base =
    process.env.HELIO_API_BASE ||
    (process.env.HELIO_NETWORK === 'devnet'
      ? 'https://api.dev.hel.io/v1'
      : 'https://api.hel.io/v1');

  if (token && pub && secret) {
    try {
      const res = await fetch(
        `${base}/charge/${encodeURIComponent(token)}?publicKey=${encodeURIComponent(pub)}`,
        { headers: { Authorization: `Bearer ${secret}` } },
      );
      if (res.ok) {
        const data = await res.json();
        const addr =
          data.depositAddress ||
          data.wallet?.publicKey ||
          data.recipientWallet ||
          data.meta?.depositAddress;
        const amount =
          data.requestAmount ?? data.amount ?? data.meta?.amount ?? instruction.amountUsd;
        if (addr && amount != null) {
          return {
            ok: true,
            depositAddress: String(addr),
            depositAmount: Number(amount),
            asset: instruction.asset || 'USDC',
            mint: instruction.mint || USDC_MINT_MAINNET,
            source: 'helio_api',
            raw: data,
          };
        }
      }
    } catch (err) {
      return { ok: false, reason: `Helio API resolve failed: ${err.message || err}` };
    }
  }

  return {
    ok: false,
    reason:
      'Deposit address missing — on Dex QR screen copy the Solana pay address/amount, then POST /api/mw-payment-instruction with depositAddress + depositAmount (Dex charges are not readable with our Helio API keys).',
  };
}
