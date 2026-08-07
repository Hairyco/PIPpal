/**
 * Build a DexScreener fill sheet from a CTOgo campaign order.
 * Branches by offerKey: Token Ad · Trending Bar · Enhanced Token Info · Boosts.
 * Ops (or a future session bot) uses this — we do not automate Google login per order.
 */

import { usdWithServiceFee } from './fees.js';
import { canonicalOfferKey } from './catalog.js';

export const DEX_TOKEN_AD_ORDER_URL = 'https://marketplace.dexscreener.com/product/ad/order';
export const DEX_TRENDING_ORDER_URL =
  'https://marketplace.dexscreener.com/product/trending-bar-ad/order';
export const DEX_TOKEN_INFO_ORDER_URL =
  'https://marketplace.dexscreener.com/product/token-info/order';
export const DEX_SIGN_IN_URL =
  'https://marketplace.dexscreener.com/sign-in?callbackUrl=https%3A%2F%2Fmarketplace.dexscreener.com%2Fproduct%2Fad%2Forder';
export const DEX_PAIR_HOME = 'https://dexscreener.com';

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

const TRENDING_BY_USD = {
  2000: { label: 'Trending Bar · 24h $2,000', duration: '24h' },
  4000: { label: 'Trending Bar · 48h $4,000', duration: '48h' },
  14000: { label: 'Trending Bar · 7d $14,000', duration: '7d' },
};

const BOOST_BY_USD = {
  99: { label: '10 boosts · 12h $99', count: 10, duration: '12h' },
  249: { label: '30 boosts · $249', count: 30 },
  399: { label: '50 boosts · $399', count: 50 },
  899: { label: '100 boosts · $899', count: 100 },
  3999: { label: '500 boosts · $3,999', count: 500 },
};

function paymentDefaults(priceUsd) {
  if (!(priceUsd > 0)) {
    return { invoiceUsd: null, serviceFeeUsd: null, totalDebitUsd: null };
  }
  const f = usdWithServiceFee(priceUsd);
  return {
    invoiceUsd: f.invoiceUsd,
    serviceFeeUsd: f.serviceFeeUsd,
    totalDebitUsd: f.totalDebitUsd,
  };
}

function baseSheet({ order, provider, sheetType, ready, hardMissing, softWarnings, fill, steps, priceUsd }) {
  return {
    orderId: order.id,
    providerSlug: provider?.slug || null,
    adapterType: provider?.adapter_type || 'dexscreener',
    sheetType,
    ready,
    hardMissing,
    softWarnings: softWarnings || [],
    fill,
    steps,
    paymentDefaults: {
      network: 'Solana',
      asset: 'USDC',
      avoid: ['Pay with Card'],
      ...paymentDefaults(priceUsd),
    },
  };
}

function buildTokenAdSheet({ order, project, offer, provider, creatives, mint, priceUsd }) {
  const pkg =
    offer?.metadata?.dexPackage ||
    PACKAGE_BY_USD[priceUsd] ||
    (priceUsd > 0 ? { label: `Custom $${priceUsd}`, impressions: null } : null);

  const title = String(creatives.adTitle || creatives.title || '').trim().slice(0, 50);
  const pitch = String(creatives.adPitch || creatives.pitch || creatives.description || '')
    .trim()
    .slice(0, 120);
  const squareImageUrl = creatives.squareImageUrl || creatives.imageUrl || null;

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

  return baseSheet({
    order,
    provider,
    sheetType: 'token-ad',
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
    priceUsd,
  });
}

function buildTrendingSheet({ order, project, offer, provider, creatives, mint, priceUsd }) {
  const pkg =
    offer?.metadata?.dexPackage ||
    TRENDING_BY_USD[priceUsd] ||
    (priceUsd > 0 ? { label: `Trending $${priceUsd}`, duration: null } : null);

  const title = String(creatives.adTitle || creatives.title || '').trim().slice(0, 50);
  const squareImageUrl = creatives.squareImageUrl || creatives.imageUrl || null;

  const hardMissing = [];
  if (!mint) hardMissing.push('tokenAddress (project mint)');
  if (!title) hardMissing.push('title');
  if (!squareImageUrl) hardMissing.push('squareImageUrl');
  if (!pkg) hardMissing.push('trendingPackage (offer price)');

  const steps = [
    { n: 1, action: 'Sign in', detail: 'Google on Dex marketplace', url: DEX_SIGN_IN_URL },
    {
      n: 2,
      action: 'Open order form',
      detail: 'Trending Bar Advertising',
      url: DEX_TRENDING_ORDER_URL,
    },
    { n: 3, action: 'Chain', detail: 'Select Solana', value: 'Solana' },
    { n: 4, action: 'Token Address', detail: 'Paste mint', value: mint },
    {
      n: 5,
      action: 'Package',
      detail: pkg?.label || 'Select matching Trending Bar tier',
      value: pkg?.label || null,
    },
    { n: 6, action: 'Title', detail: 'max 50', value: title },
    { n: 7, action: 'Image', detail: '1:1 png/jpg/webp (same as Token Ad OK)', value: squareImageUrl },
    { n: 8, action: 'Checkboxes', detail: 'Accept marketplace policies' },
    { n: 9, action: 'Order Now', detail: 'Submit form → payment page' },
    {
      n: 10,
      action: 'Payment',
      detail: 'Network = Solana · Pay with = USDC · Pay with QR (not Card)',
    },
    {
      n: 11,
      action: 'Capture',
      detail:
        'Copy Helio charge URL from QR + deposit address + amount → POST /api/mw-dex-feed action=capture',
    },
  ];

  return baseSheet({
    order,
    provider,
    sheetType: 'trending-bar',
    ready: hardMissing.length === 0,
    hardMissing,
    softWarnings: [],
    fill: {
      chain: 'Solana',
      tokenAddress: mint,
      packageLabel: pkg?.label || null,
      packagePriceUsd: priceUsd || null,
      title,
      pitch: null,
      squareImageUrl,
      links: null,
    },
    steps,
    priceUsd,
  });
}

function buildTokenInfoSheet({ order, project, offer, provider, creatives, mint, priceUsd }) {
  const description = String(
    creatives.etiDescription || creatives.description || creatives.adPitch || '',
  ).trim();
  const iconUrl = creatives.etiIconUrl || creatives.iconUrl || creatives.squareImageUrl || null;
  const headerUrl = creatives.etiHeaderUrl || creatives.headerUrl || null;
  const supplyNote = String(creatives.etiSupplyDescription || '').trim();

  const hardMissing = [];
  if (!mint) hardMissing.push('tokenAddress (project mint)');
  if (!description) hardMissing.push('etiDescription');
  if (!iconUrl) hardMissing.push('etiIconUrl');
  if (!headerUrl) hardMissing.push('etiHeaderUrl');

  const steps = [
    { n: 1, action: 'Sign in', detail: 'Google on Dex marketplace', url: DEX_SIGN_IN_URL },
    {
      n: 2,
      action: 'Open order form',
      detail: 'Enhanced Token Info',
      url: DEX_TOKEN_INFO_ORDER_URL,
    },
    { n: 3, action: 'Chain', detail: 'Select Solana', value: 'Solana' },
    { n: 4, action: 'Token Address', detail: 'Paste mint', value: mint },
    { n: 5, action: 'Description', detail: 'Plain text on pair page', value: description },
    { n: 6, action: 'Icon', detail: '1:1 png/jpg/webp/gif', value: iconUrl },
    { n: 7, action: 'Header', detail: '3:1 png/jpg/webp/gif', value: headerUrl },
    {
      n: 8,
      action: 'Extra links / locked supply (optional)',
      detail: 'Paste if provided',
      value: {
        website: creatives.websiteUrl || '',
        x: creatives.xUrl || '',
        telegram: creatives.telegramUrl || '',
        discord: creatives.discordUrl || '',
        supplyDescription: supplyNote,
      },
    },
    { n: 9, action: 'Order Now', detail: 'Submit form → payment page' },
    {
      n: 10,
      action: 'Payment',
      detail: 'Network = Solana · Pay with = USDC · Pay with QR (not Card)',
    },
    {
      n: 11,
      action: 'Capture',
      detail:
        'Copy Helio charge URL from QR + deposit address + amount → POST /api/mw-dex-feed action=capture',
    },
  ];

  return baseSheet({
    order,
    provider,
    sheetType: 'token-info',
    ready: hardMissing.length === 0,
    hardMissing,
    softWarnings: [],
    fill: {
      chain: 'Solana',
      tokenAddress: mint,
      packageLabel: 'Enhanced Token Info $299',
      packagePriceUsd: priceUsd || 299,
      description,
      iconUrl,
      headerUrl,
      supplyDescription: supplyNote,
      links: {
        website: creatives.websiteUrl || '',
        x: creatives.xUrl || '',
        telegram: creatives.telegramUrl || '',
        discord: creatives.discordUrl || '',
      },
    },
    steps,
    priceUsd: priceUsd || 299,
  });
}

function buildBoostSheet({ order, project, offer, provider, creatives, mint, priceUsd }) {
  const pkg =
    offer?.metadata?.dexPackage ||
    BOOST_BY_USD[priceUsd] ||
    BOOST_BY_USD[99];

  const hardMissing = [];
  if (!mint) hardMissing.push('tokenAddress (project mint)');

  const pairSearchUrl = mint
    ? `https://dexscreener.com/solana/${mint}`
    : DEX_PAIR_HOME;

  const steps = [
    {
      n: 1,
      action: 'Open pair page',
      detail: 'Browser on dexscreener.com — web only (not Marketplace)',
      url: pairSearchUrl,
    },
    {
      n: 2,
      action: 'Boost',
      detail: `Click Boost → select pack: ${pkg.label}`,
      value: pkg.label,
    },
    {
      n: 3,
      action: 'No creatives',
      detail: 'Boosts use mint only — do not open /product/ad',
    },
    {
      n: 4,
      action: 'Payment',
      detail: 'Complete checkout on Dex (Solana / USDC when offered) — capture charge if Helio',
    },
    {
      n: 5,
      action: 'Capture',
      detail:
        'If Helio QR appears: charge URL + deposit + amount → POST /api/mw-dex-feed action=capture',
    },
  ];

  return baseSheet({
    order,
    provider,
    sheetType: 'boost',
    ready: hardMissing.length === 0,
    hardMissing,
    softWarnings: [
      'Boosts are pair-page only — no Marketplace form. Autofill worker stub OK until selectors wired.',
    ],
    fill: {
      chain: 'Solana',
      tokenAddress: mint,
      pairUrl: pairSearchUrl,
      packageLabel: pkg.label,
      packagePriceUsd: priceUsd || 99,
      boostCount: pkg.count || 10,
      marketplaceForm: false,
      note: 'browser on dexscreener.com, web only',
    },
    steps,
    priceUsd: priceUsd || 99,
  });
}

function buildUpdateSocialsSheet({ order, project, offer, provider, creatives, mint, priceUsd }) {
  const links = {
    website: String(creatives.websiteUrl || '').trim(),
    x: String(creatives.xUrl || '').trim(),
    telegram: String(creatives.telegramUrl || '').trim(),
    discord: String(creatives.discordUrl || '').trim(),
  };
  const hardMissing = [];
  if (!mint) hardMissing.push('tokenAddress (project mint)');
  if (!links.website && !links.x && !links.telegram && !links.discord) {
    hardMissing.push('at least one social / website link');
  }

  const pairSearchUrl = mint
    ? `https://dexscreener.com/solana/${mint}`
    : DEX_PAIR_HOME;

  const steps = [
    {
      n: 1,
      action: 'Founder owns Dex',
      detail:
        'Prefer founder Google / wallet on Dex. Polessia Google is checkout-only for paid ads — never claim the token profile under Polessia.',
    },
    {
      n: 2,
      action: 'Open pair / update form',
      detail: 'Dex token update / socials (not Marketplace Token Ad)',
      url: pairSearchUrl,
    },
    {
      n: 3,
      action: 'Paste links',
      detail: 'Website / X / Telegram / Discord from creatives',
      value: links,
    },
    {
      n: 4,
      action: 'Submit',
      detail: 'Confirm update. Last writer wins on Dex — founder can edit later with their login.',
    },
    {
      n: 5,
      action: 'CTOgo fee',
      detail: `$99 fulfilment (Dex form is free). No Helio capture unless Dex charges.`,
    },
  ];

  return baseSheet({
    order,
    provider,
    sheetType: 'update-socials',
    ready: hardMissing.length === 0,
    hardMissing,
    softWarnings: [
      'Founder-owned Dex login preferred. Do not create/claim profile with Polessia Google.',
    ],
    fill: {
      chain: 'Solana',
      tokenAddress: mint,
      pairUrl: pairSearchUrl,
      packageLabel: 'Update socials · CTOgo fulfilment $99',
      packagePriceUsd: priceUsd || 99,
      marketplaceForm: false,
      links,
      note: 'founder owns Dex; last writer wins',
    },
    steps,
    priceUsd: priceUsd || 99,
  });
}

/**
 * @param {{ order: object, project?: object, offer?: object, provider?: object }} args
 */
export function buildDexFeedSheet({ order, project, offer, provider }) {
  const creatives = order?.creatives && typeof order.creatives === 'object' ? order.creatives : {};
  const priceUsd = Number(offer?.price_usd || creatives.priceUsd || 0);
  const mint =
    String(creatives.dexMint || creatives.mint || project?.mint || '').trim() || null;

  const rawKey =
    offer?.offer_key ||
    creatives.offerKey ||
    creatives.spendItemId ||
    order?.spendItemId ||
    order?.offerKey ||
    'dex-token-ad-20k';
  const offerKey = canonicalOfferKey(rawKey);

  const ctx = { order, project, offer, provider, creatives, mint, priceUsd };

  if (offerKey.startsWith('dex-boost')) {
    return buildBoostSheet(ctx);
  }
  if (offerKey === 'dex-update-socials') {
    return buildUpdateSocialsSheet(ctx);
  }
  if (offerKey.startsWith('dex-trending')) {
    return buildTrendingSheet(ctx);
  }
  if (offerKey === 'dex-token-info') {
    return buildTokenInfoSheet(ctx);
  }
  // dex-token-ad-* and legacy short keys → Token Ad form
  return buildTokenAdSheet(ctx);
}
