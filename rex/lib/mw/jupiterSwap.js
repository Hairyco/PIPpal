/**
 * Just-in-time SOL → USDC via Jupiter (Mainnet).
 * Vault stays SOL-denominated; convert only the invoice amount (+ buffer) at settle.
 *
 * Requires SOLANA_RPC_URL. Mainnet only — Devnet test SOL cannot buy Dex ads.
 */

const JUPITER_QUOTE = 'https://quote-api.jup.ag/v6/quote';
const JUPITER_SWAP = 'https://quote-api.jup.ag/v6/swap';

/** Mainnet USDC mint */
export const USDC_MINT_MAINNET = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
/** Native SOL wrapped mint used by Jupiter */
export const SOL_MINT = 'So11111111111111111111111111111111111111112';

/**
 * @param {{ amountLamports: number | bigint, slippageBps?: number }} opts
 */
export async function quoteSolToUsdc({ amountLamports, slippageBps = 50 }) {
  if (process.env.SOLANA_CLUSTER === 'devnet' || /devnet/i.test(process.env.SOLANA_RPC_URL || '')) {
    return {
      ok: false,
      reason: 'Jupiter SOL→USDC is Mainnet-only; Devnet test SOL cannot settle Dex Helio charges.',
    };
  }
  const amount = String(typeof amountLamports === 'bigint' ? amountLamports : BigInt(amountLamports));
  if (BigInt(amount) <= 0n) {
    return { ok: false, reason: 'amountLamports must be positive' };
  }

  const params = new URLSearchParams({
    inputMint: SOL_MINT,
    outputMint: USDC_MINT_MAINNET,
    amount,
    slippageBps: String(slippageBps),
  });

  try {
    const res = await fetch(`${JUPITER_QUOTE}?${params}`);
    if (!res.ok) {
      return { ok: false, reason: `Jupiter quote failed: ${res.status}` };
    }
    const quote = await res.json();
    return { ok: true, quote };
  } catch (err) {
    return { ok: false, reason: err.message || String(err) };
  }
}

/**
 * Build an unsigned swap transaction (base64) for the keeper/hot wallet to sign.
 * Does not broadcast — caller signs with ops key.
 *
 * @param {{ quote: object, userPublicKey: string }} opts
 */
export async function buildSolToUsdcSwapTx({ quote, userPublicKey }) {
  if (!quote || !userPublicKey) {
    return { ok: false, reason: 'quote and userPublicKey required' };
  }
  try {
    const res = await fetch(JUPITER_SWAP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
      }),
    });
    if (!res.ok) {
      return { ok: false, reason: `Jupiter swap build failed: ${res.status}` };
    }
    const data = await res.json();
    return { ok: true, swapTransaction: data.swapTransaction };
  } catch (err) {
    return { ok: false, reason: err.message || String(err) };
  }
}
