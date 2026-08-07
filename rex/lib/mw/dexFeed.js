/**
 * Build a DexScreener marketplace fill sheet from a CTOgo campaign order.
 * Ops (or a future session bot) uses this to feed /product/ad/order — we do not
 * automate Google login per order.
 */

import { usdWithServiceFee } from './fees.js';

export const DEX_TOKEN_AD_ORDER_URL = 'https://marketplace.dexscreener.com/product/ad/order';
export const DEX_SIGN_IN_URL =
  'https://marketplace.dexscreener.com/sign-in?callbackUrl=https%3A%2F%2Fmarketplace.dexscreener.com%2Fproduct%2Fad%2Forder';

/**
 * Map USD package to Dex Token Ad radio labels (live Aug 2026).
 * Prefer exact offer metadata when present.
 */
const PACKAGE_BY_USD = {
  299: { label: '20k views $299.00', impressions: 20000 },
  699: { label: '50k views $699.00', impressions: 50000 },
  999: { label: '100k views $999.00', impressions: 100000 },
  1999: { label: '200k views $1,999.00', impressions: 200000 },
  3999: { label: '400k views $3,999.00', impressions: 400000 },
  6999: { label: '800k views $6,999.00', impressions: 800000 },
};

/**
 * @param {{ order: object, project?: object, offer?: object, provider?: object }} args
 */
export function buildDexFeedSheet({ order, project, offer, provider }) {
  const creatives = order?.creatives && typeof order.creatives === 'object' ? order.creatives : {};
  const priceUsd = Number(offer?.price_usd || creatives.priceUsd || 0);
  const pkg =
    offer?.metadata?.dexPackage ||
    PACKAGE_BY_USD[priceUsd] ||
    (priceUsd > 0 ? { label: `Custom $${priceUsd}`, impressions: null } : null);

  const title = String(creatives.adTitle || creatives.title || '').trim().slice(0, 50);
  const pitch = String(creatives.adPitch || creatives.pitch || creatives.description || '')
    .trim()
    .slice(0, 120);
  const squareImageUrl = creatives.squareImageUrl || creatives.imageUrl || null;
  const mint =
    String(creatives.dexMint || creatives.mint || project?.mint || '').trim() || null;

  const hardMissing = [];
  if (!mint) hardMissing.push('tokenAddress (project mint)');
  if (!title) hardMissing.push('title');
  if (!pitch) hardMissing.push('pitch');
  if (!squareImageUrl) hardMissing.push('squareImageUrl');
  if (!pkg) hardMissing.push('adPackage (offer price)');

  const steps = [
    { n: 1, action: 'Sign in', detail: 'Google on Dex marketplace', url: DEX_SIGN_IN_URL },
    { n: 2, action: 'Open order form', detail: 'Token Advertising', url: DEX_TOKEN_AD_ORDER_URL },
    { n: 3, action: 'Chain', detail: 'Select Solana', value: 'Solana' },
    { n: 4, action: 'Token Address', detail: 'Paste mint', value: mint },
    {
      n: 5,
      action: 'Ad package',
      detail: pkg?.label || 'Select matching views tier',
      value: pkg?.label || null,
    },
    { n: 6, action: 'Title', detail: 'max 50', value: title },
    { n: 7, action: 'Pitch', detail: 'max 120', value: pitch },
    { n: 8, action: 'Image', detail: '1:1 png/jpg/webp', value: squareImageUrl },
    {
      n: 9,
      action: 'Links (optional)',
      detail: 'Website / X / Telegram / Discord — optional on Dex',
      value: {
        website: creatives.websiteUrl || '',
        x: creatives.xUrl || '',
        telegram: creatives.telegramUrl || '',
        discord: creatives.discordUrl || '',
      },
    },
    { n: 10, action: 'Checkboxes', detail: 'Accept verifiable data + Dex may modify + refund policy' },
    { n: 11, action: 'Order Now', detail: 'Submit form → payment page' },
    {
      n: 12,
      action: 'Payment',
      detail: 'Network = Solana · Pay with = USDC · Pay with QR (not Card)',
    },
    {
      n: 13,
      action: 'Capture',
      detail:
        'Copy Helio charge URL from QR + deposit address + amount → POST /api/mw-dex-feed action=capture',
    },
  ];

  return {
    orderId: order.id,
    providerSlug: provider?.slug || null,
    adapterType: provider?.adapter_type || 'dexscreener',
    ready: hardMissing.length === 0,
    hardMissing,
    softWarnings:
      !creatives.websiteUrl && !creatives.xUrl && !creatives.telegramUrl
        ? ['No socials — optional on Dex but raises reject risk']
        : [],
    fill: {
      chain: 'Solana',
      tokenAddress: mint,
      packageLabel: pkg?.label || null,
      packagePriceUsd: priceUsd || null,
      title,
      pitch,
      squareImageUrl,
      links: {
        website: creatives.websiteUrl || '',
        x: creatives.xUrl || '',
        telegram: creatives.telegramUrl || '',
        discord: creatives.discordUrl || '',
      },
    },
    steps,
    paymentDefaults: {
      network: 'Solana',
      asset: 'USDC',
      avoid: ['Pay with Card'],
      /** Locked from approved offer — not ops-editable */
      ...(priceUsd > 0
        ? (() => {
            const f = usdWithServiceFee(priceUsd);
            return {
              invoiceUsd: f.invoiceUsd,
              serviceFeeUsd: f.serviceFeeUsd,
              totalDebitUsd: f.totalDebitUsd,
            };
          })()
        : { invoiceUsd: null, serviceFeeUsd: null, totalDebitUsd: null }),
    },
  };
}
