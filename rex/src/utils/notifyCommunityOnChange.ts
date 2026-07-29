/**
 * Future: Telegram bot posts to the community group when listing metadata changes.
 * Stub only — no bot API in this environment (bot + hosting are external/paid later).
 */
export type CommunityChangeKind =
  | 'socials'
  | 'website'
  | 'contract_correction_requested';

export type CommunityChangePayload = {
  symbol: string;
  kind: CommunityChangeKind;
  summary: string;
  telegramInvite?: string | null;
};

export function notifyCommunityOnChange(payload: CommunityChangePayload): void {
  // TODO: wire Telegram Bot API → community chat
  if (typeof console !== 'undefined') {
    console.info('[CTOgo] community notify (pending bot)', payload);
  }
}
