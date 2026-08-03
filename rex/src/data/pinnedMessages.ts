export type PinnedMessage = {
  ticker: string;
  text: string;
  when: string;
  minutesAgo: number;
};

/** Most recent pinned message per public Telegram (demo until t.me/s scrape / bot). */
export const pinnedByTicker: Record<string, PinnedMessage> = {
  GOB: {
    ticker: 'GOB',
    text: 'Raid starts in 10m — everyone reply with the DexScreener link + CA. No spam bots. Official contract only in this pin. Mods will ban call-group shillers and fake admin DMs. Full raid pack + GIF pack in #raids.',
    when: '2h ago',
    minutesAgo: 120,
  },
  MPEG: {
    ticker: 'MPEG',
    text: 'Marketing wallet hit $482. Next spend: DexScreener banner. Vote in the poll below — community picks the creative. Do not trust DMs asking for seed phrases. CA stays pinned here until socials are updated.',
    when: '3h ago',
    minutesAgo: 180,
  },
  LMARS: {
    ticker: 'LMARS',
    text: 'Pinned: Official CA + Telegram rules. Mods will ban call-group shillers. Verify the mint on CTOgo before you ape. Website and X must match this contract. Report impostors in #mods.',
    when: '5h ago',
    minutesAgo: 300,
  },
  SURV: {
    ticker: 'SURV',
    text: 'Community takeover vote open until Friday. Bring holders from the old group. Snapshot rules and voting link are in the thread under this pin. Liquidity and marketing wallet details stay locked to this message.',
    when: '8h ago',
    minutesAgo: 480,
  },
  NITE: {
    ticker: 'NITE',
    text: 'Tonight’s raid window: 9–11pm UTC. Target list in #raids. Copy the pinned CA only — ignore any “new ticker” announcements outside this channel.',
    when: '11h ago',
    minutesAgo: 660,
  },
  EXIT: {
    ticker: 'EXIT',
    text: 'No marketing wallet yet — help us enable one after listing. AMA notes pinned here with timestamps and next steps for the community vote.',
    when: '14h ago',
    minutesAgo: 840,
  },
  TFROG: {
    ticker: 'TFROG',
    text: 'Forming channel rules + CA verification thread. Stick to official links only. When Native V2 launches on CTOgo, this pin updates with the traded contract.',
    when: '16h ago',
    minutesAgo: 960,
  },
  CALL: {
    ticker: 'CALL',
    text: 'Hotline raid pack: copy, GIF, and Dex chart. Drop once, don’t spam. Keep replies under the raid post so mods can track reach.',
    when: '1d ago',
    minutesAgo: 1440,
  },
};
