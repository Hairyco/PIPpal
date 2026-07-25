import {
  MARKETING_AUTO_SPEND_USD,
  MARKETING_INACTIVITY_HOURS,
  MARKETING_V2_DEADLINE_DAYS,
  TRADE_FEE_LABEL,
} from './chainConfig';

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqSection = {
  id: string;
  label: string;
  items: FaqItem[];
};

export const FAQ_SECTIONS: FaqSection[] = [
  {
    id: 'basics',
    label: 'Basics',
    items: [
      {
        id: 'what-is-ctogo',
        question: 'What is CTOgo?',
        answer:
          'CTOgo is the home of Solana community takeovers. Discover abandoned or rugged coins, relaunch them with a marketing wallet funded by trade fees, and trade with communities that are already ready to move.',
      },
      {
        id: 'what-is-cto',
        question: 'What is a CTO?',
        answer:
          'A community takeover. The original developer abandoned or dumped the coin, and holders take over the narrative, the socials, and the marketing. CTOgo is where those takeovers get discovered, funded, and traded.',
      },
      {
        id: 'native-vs-external',
        question: 'What is the difference between Native V2, External, and Launch?',
        answer:
          'Native V2 coins were relaunched on CTOgo and have a marketing vault attached. External coins are tracked from other venues (Pump.fun, LetsBonk, Moonshot) so you can watch them before a takeover happens. Launch coins are new CTOgo mints still on the bonding curve.',
      },
      {
        id: 'who-can-start',
        question: 'Who can start a CTO?',
        answer:
          'Anyone. Submit the coin from the Launch page with the old contract address and the old socials, and it enters the board where holders can vote and organise.',
      },
    ],
  },
  {
    id: 'marketing-wallet',
    label: 'Marketing wallet',
    items: [
      {
        id: 'what-is-vault',
        question: 'What is the marketing wallet?',
        answer:
          'A non-custodial vault attached to the coin. A share of every trade flows into it and is spent on growth — trending spots, banners, and Telegram placements — instead of going to a founder wallet.',
      },
      {
        id: 'who-controls',
        question: 'Can the founder drain it?',
        answer:
          'No. Funds only leave the vault PDA through whitelisted suppliers under protocol authority, so there is no free wallet to withdraw from.',
      },
      {
        id: 'auto-spend',
        question: 'When does the wallet actually spend?',
        answer: `At $${MARKETING_AUTO_SPEND_USD} the automated spend fires and buys placements without anyone signing off.`,
      },
      {
        id: 'inactive',
        question: 'What happens if the coin goes quiet?',
        answer: `If the vault is under $${MARKETING_AUTO_SPEND_USD} and records $0 volume for ${MARKETING_INACTIVITY_HOURS} hours, the balance is swept into the protocol CTO Reserve. A Native V2 takeover restores 100% of it into the new vault. If no Native V2 happens within ${MARKETING_V2_DEADLINE_DAYS} days of the V1 mint, the funds go to the protocol treasury.`,
      },
      {
        id: 'verify',
        question: 'Can I verify the balance myself?',
        answer:
          'Yes. Every marketing wallet on the coin page and the rankings table links straight to Solscan so you can check the account on-chain.',
      },
    ],
  },
  {
    id: 'fees',
    label: 'Fees',
    items: [
      {
        id: 'trade-fee',
        question: 'What is the trade fee?',
        answer: `${TRADE_FEE_LABEL}. The rate scales down as market cap grows, and the marketing share never turns off.`,
      },
      {
        id: 'after-migration',
        question: 'Do fees stop after Raydium migration?',
        answer:
          'No. Graduating off the bonding curve does not disable tax. Platform, marketing, and creator/trader pool cuts keep applying to post-migration volume.',
      },
      {
        id: 'dev-dumps',
        question: 'What if the creator dumps?',
        answer:
          'Their fee cut is revoked on-chain and redirected to the marketing wallet (or the trader rebate pool). The total trade tax stays on, so recovery spend keeps getting funded.',
      },
    ],
  },
  {
    id: 'token-safety',
    label: 'Token safety',
    items: [
      {
        id: 'investor-basics',
        question: 'What basic protections do Native CTOgo coins have?',
        answer:
          'Mint authority is revoked or locked (nobody can print more supply). Freeze authority is revoked (nobody can freeze wallets). Token metadata is locked so name, ticker, and logo cannot be silently changed later. On graduation, LP is burned or locked so liquidity cannot be pulled as a rug.',
      },
      {
        id: 'safety-vs-marketing',
        question: 'Do those locks turn off the marketing wallet or fees?',
        answer:
          'No. Mint, freeze, and metadata locks protect the coin — they do not control trade fees. Every trade still fills the marketing vault and the platform cut. We lock dangerous founder powers; we keep the fee engine on so growth spend keeps working.',
      },
      {
        id: 'what-stays-on',
        question: 'What stays on for the business model?',
        answer:
          'The trade tax schedule (marketing never turns off), the marketing vault (protocol-controlled, not a free founder wallet), Mode A / Mode B routing, the abandonment rule if a creator dumps, and fees after Raydium migration. Those are protocol rules — not something a founder key can turn off.',
      },
      {
        id: 'vs-pump',
        question: 'Isn’t this already true on Pump.fun?',
        answer:
          'Pump coins usually revoke mint and freeze at launch, but that alone is not a full safety story. Metadata is often still mutable, and a dumped creator can keep collecting fees until someone changes keys manually. CTOgo adds locked metadata, a non-drainable marketing vault, fees that survive migration, and automatic creator-fee revoke on dump.',
      },
    ],
  },
  {
    id: 'community',
    label: 'Community',
    items: [
      {
        id: 'old-socials',
        question: 'Why does the launch form ask for old socials?',
        answer:
          'They are context, not the new home. The old Telegram, X, and website tell holders where the coin came from and help the original community find the takeover.',
      },
      {
        id: 'new-telegram',
        question: 'Do members get moved into a new Telegram automatically?',
        answer:
          'No — Telegram does not allow bulk member transfers. CTOgo provisions an official group and gives you a share link; holders join from that link or from the coin page.',
      },
      {
        id: 'raids',
        question: 'What are raids and MPH?',
        answer:
          'MPH is messages per hour across the coin’s community, and raids are coordinated posting pushes. Both are activity signals used to rank coins on the board.',
      },
    ],
  },
];
