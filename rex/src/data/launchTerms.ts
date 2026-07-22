import { TRADE_FEE_LABEL, formatBpsPercent, FEE_TIERS } from './chainConfig';

export const LAUNCH_SUMMARY =
  'Rex hosts your coin, routes trade tax into a non-custodial marketing wallet, and pays approved suppliers for growth.';

export const LAUNCH_NOTE =
  `Trades on Rex feed your marketing wallet. ${TRADE_FEE_LABEL} — fees scale down as market cap grows, marketing never turns off.`;

const launch = FEE_TIERS[0];

export const LAUNCH_TRADE_NOTE = `Launch-phase buy/sell takes ${formatBpsPercent(launch.marketingBps + launch.creatorPoolBps + launch.platformBps)}: ${formatBpsPercent(launch.platformBps)} Rex + ${formatBpsPercent(launch.creatorPoolBps)} creator/trader pool + ${formatBpsPercent(launch.marketingBps)} marketing. Creators choose at deploy whether that pool stays with them or cashbacks traders.`;
