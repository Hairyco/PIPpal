import {
  TRADE_FEE_LABEL,
  formatBpsPercent,
  SCOUT_FEE_ENGINE,
  LAUNCH_FEE_ENGINE,
  LIST_FEE_ENGINE,
  CREATOR_DUMP_TRIGGER_PCT,
  FEE_GUIDELINES,
} from './chainConfig';

export const LAUNCH_SUMMARY =
  'Rex hosts your coin, routes trade tax into a non-custodial marketing wallet, and pays approved suppliers for growth. Raiders earn instant SOL for shared buy links.';

export const LAUNCH_NOTE = `Trades on Rex feed your marketing wallet and raid wallets. ${TRADE_FEE_LABEL}. If a creator dumps ${CREATOR_DUMP_TRIGGER_PCT}%+ of holdings, only their legacy fee cut is revoked — platform and marketing keep collecting.`;

export const LAUNCH_TRADE_NOTE = `Launch swaps take ${formatBpsPercent(LAUNCH_FEE_ENGINE.totalBps)}: ${formatBpsPercent(LAUNCH_FEE_ENGINE.raidBps)} raid (to referrer, or CTOgo treasury if unclaimed) + ${formatBpsPercent(LAUNCH_FEE_ENGINE.marketingBps)} marketing + ${formatBpsPercent(LAUNCH_FEE_ENGINE.creatorBps)} creator + ${formatBpsPercent(LAUNCH_FEE_ENGINE.platformBps)} CTOgo. List swaps take ${formatBpsPercent(LIST_FEE_ENGINE.totalBps)} with no creator cut. Attribution is last-click for ${SCOUT_FEE_ENGINE.attributionHours} hours.`;

export { FEE_GUIDELINES };
