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
 * Parse human USDC/SOL amount from Helio charge fields (often 6-decimal base units).
 * @param {unknown} raw
 * @param {number | null} fallback
 */
function helioAmountToUnits(raw, fallback = null) {
  if (raw == null || raw === '') return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  // Typical USDC: 299 USDC → 299000000 base units
  if (n >= 1_000_000) return n / 1_000_000;
  return n;
}

/**
 * Extract deposit wallet + amount from a Helio charge JSON body (public GET /v1/charge/:token).
 * @param {any} data
 */
export function extractDepositFromHelioCharge(data) {
  if (!data || typeof data !== 'object') return null;

  const candidates = [
    data.prepareRequestBody?.recipientPK,
    data.recipientPK,
    data.depositAddress,
    data.paylink?.wallet?.publicKey,
    data.paylink?.recipients?.[0]?.wallet?.publicKey,
    data.wallet?.publicKey,
    data.recipientWallet,
    data.meta?.depositAddress,
  ].filter(Boolean);

  const addr = candidates.find((a) => typeof a === 'string' && a.length >= 32);
  if (!addr) return null;

  const amount = helioAmountToUnits(
    data.requestAmount ?? data.usdcAmount ?? data.amount ?? data.meta?.amount,
    null,
  );

  return {
    depositAddress: String(addr).trim(),
    depositAmount: amount,
  };
}

/**
 * Resolve deposit destination for auto-transfer.
 * Prefer pasted instruction fields; else public Helio charge GET (works for Dex-owned charges);
 * then authenticated Helio merchant API for charges we created.
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

  // Public charge lookup — Dex/Moon Eagle charges are readable without our merchant keys.
  if (token) {
    try {
      const res = await fetch(`${base}/charge/${encodeURIComponent(token)}`);
      if (res.ok) {
        const data = await res.json();
        const extracted = extractDepositFromHelioCharge(data);
        const depositAmount =
          extracted?.depositAmount ??
          helioAmountToUnits(instruction.amountUsd ?? instruction.depositAmount, null);
        if (extracted?.depositAddress && depositAmount != null) {
          return {
            ok: true,
            depositAddress: extracted.depositAddress,
            depositAmount: Number(depositAmount),
            asset: instruction.asset || data.currencySymbol || 'USDC',
            mint: instruction.mint || USDC_MINT_MAINNET,
            source: 'helio_public_charge',
            raw: data,
          };
        }
      }
    } catch (err) {
      // Fall through to authenticated / error
      if (!pub || !secret) {
        return { ok: false, reason: `Helio public charge resolve failed: ${err.message || err}` };
      }
    }
  }

  if (token && pub && secret) {
    try {
      const res = await fetch(
        `${base}/charge/${encodeURIComponent(token)}?publicKey=${encodeURIComponent(pub)}`,
        { headers: { Authorization: `Bearer ${secret}` } },
      );
      if (res.ok) {
        const data = await res.json();
        const extracted = extractDepositFromHelioCharge(data);
        const amount =
          extracted?.depositAmount ??
          helioAmountToUnits(
            data.requestAmount ?? data.amount ?? data.meta?.amount ?? instruction.amountUsd,
            null,
          );
        if (extracted?.depositAddress && amount != null) {
          return {
            ok: true,
            depositAddress: extracted.depositAddress,
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
      'Deposit address missing — open the Helio charge URL (or run npm run dex:capture-charge), then POST depositAddress + depositAmount. Public GET /v1/charge/{token} usually returns paylink.wallet.publicKey.',
  };
}
