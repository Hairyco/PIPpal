import {
  TRADE_FEE_LABEL,
  formatBpsPercent,
  SCOUT_FEE_ENGINE,
  CREATOR_DUMP_TRIGGER_PCT,
  FEE_GUIDELINES,
} from './chainConfig';

export const LAUNCH_SUMMARY =
  'Rex hosts your coin, routes trade tax into a non-custodial marketing wallet, and pays approved suppliers for growth. Raiders earn instant SOL for shared buy links.';

export const LAUNCH_NOTE = `Trades on Rex feed your marketing wallet and raid wallets. ${TRADE_FEE_LABEL}. If a creator dumps ${CREATOR_DUMP_TRIGGER_PCT}%+ of holdings, only their legacy fee cut is revoked — platform and marketing keep collecting.`;

export const LAUNCH_TRADE_NOTE = `CTOgo-routed buy/sell takes ${formatBpsPercent(SCOUT_FEE_ENGINE.totalBps)}: ${formatBpsPercent(SCOUT_FEE_ENGINE.scoutBps)} raid (instant SOL to referrer) + ${formatBpsPercent(SCOUT_FEE_ENGINE.marketingBps)} marketing wallet + ${formatBpsPercent(SCOUT_FEE_ENGINE.platformBps)} CTOgo. Attribution is last-click for ${SCOUT_FEE_ENGINE.attributionHours} hours.`;

export { FEE_GUIDELINES };
