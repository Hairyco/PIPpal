import {
  FEE_TIERS,
  MARKETING_AUTO_SPEND_USD,
  MARKETING_INACTIVITY_HOURS,
  MARKETING_V2_DEADLINE_DAYS,
  TRADE_FEE_LABEL,
  formatBpsPercent,
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
          'External coins are indexed from other venues (PumpSwap, Pump.fun, Raydium, etc.) and are tradeable on CTOgo immediately — we take a platform fee on every CTOgo trade. List a CTO claims the page (wallet) and optionally attaches a marketing wallet for $1 so CTOgo-routed volume also fills growth. Native V2 / Launch coins are minted on CTOgo with a marketing vault included automatically.',
      },
      {
        id: 'who-can-start',
        question: 'Who can start a CTO?',
        answer:
          'Anyone with a free CTOgo account (Google or email). List an existing coin from the board or Launch a new mint on CTOgo. Connect a Solana wallet only when you pay — launch fee, optional $1 marketing vault on List, or Advertise packs. Whoever lists or launches becomes the page operator; CTOgo remains admin of the Telegram group we create. Unhappy communities can Launch a Native V2 instead of fighting over the old page.',
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
          'A non-custodial vault attached to the coin — powered by Polessia. On Native Launch / V2 it is included automatically. On listed external coins it is optional ($1 to open on-chain — rent/tx from that fee, remainder to treasury). A share of CTOgo-routed trades flows into it for growth — trending spots, banners, Telegram — instead of a free founder wallet. Volume on other venues does not fill this vault.',
      },
      {
        id: 'vault-fill-rate',
        question: 'What is the vault fill rate?',
        answer: `A slice of each CTOgo trade lands in the marketing vault automatically. At launch it is ${formatBpsPercent(FEE_TIERS[0].marketingBps)} of volume (${FEE_TIERS[0].marketCap} mcap). As market cap grows the rate steps down — ${FEE_TIERS.map((t) => `${t.label}: ${formatBpsPercent(t.marketingBps)} (${t.marketCap})`).join('; ')}. Growth keeps funding without you wiring ads by hand. Full trade fee split is on the Fees page.`,
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
        id: 'abandonment',
        question: 'What if the creator dumps?',
        answer:
          'Their fee cut is revoked on-chain and redirected to the marketing wallet (or the trader rebate pool). The total trade tax stays on, so recovery spend keeps getting funded.',
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
        answer: `${TRADE_FEE_LABEL} on Native CTOgo coins. For any coin traded through CTOgo (including external listings), CTOgo always takes a platform/integrator fee. If a marketing wallet is attached, a marketing cut of CTOgo-routed volume also fills that vault.`,
      },
      {
        id: 'list-marketing-wallet-fee',
        question: 'What does it cost to add a marketing wallet when I List a CTO?',
        answer:
          '$1 one-time. That covers opening the on-chain vault (rent + transaction). Whatever is left from the $1 goes to the CTOgo treasury. Listing the page itself is free — the vault is optional.',
      },
      {
        id: 'raydium-first',
        question: 'Where do coins go when they graduate?',
        answer:
          'Raydium. The bonding curve’s remaining SOL and tokens become the Raydium pool’s liquidity, and the LP tokens are burned so nobody can pull that liquidity — the same core graduate model Pump.fun used. We are not building a private CTOgo DEX yet; Raydium keeps coins visible on Jupiter and DexScreener.',
      },
      {
        id: 'graduation-liquidity',
        question: 'What happens to the bonding-curve money at graduation?',
        answer:
          'Almost all of it becomes locked Raydium liquidity. Two amounts come off the top: the 2 SOL CTOgo migration protocol fee and ~0.20 SOL for Raydium’s pool-creation cost. Everything else from the curve SOL vault, plus remaining curve tokens, is deposited into the pool. The LP tokens are burned (or permanently locked). If liquidity is not seeded or LP is not burned, migration must fail — otherwise the coin would graduate with no depth and could be rugged.',
      },
      {
        id: 'migration-fee',
        question: 'Is there a migration fee?',
        answer:
          'Yes. CTOgo charges a 2 SOL migration protocol fee when a coin graduates. On top of that, ~0.20 SOL (0.15 create + rent) is passed through to Raydium so the pool can open — so about 2.2 SOL total leaves the curve. Everything remaining seeds the Raydium pool and the LP is burned.',
      },
      {
        id: 'after-migration',
        question: 'Do fees stop after Raydium migration?',
        answer:
          'No. Graduating off the bonding curve does not disable tax. Platform, marketing, and creator/trader pool cuts keep applying to post-migration volume so the marketing wallet keeps funding growth.',
      },
      {
        id: 'own-amm',
        question: 'Will CTOgo build its own PumpSwap-style DEX?',
        answer:
          'Not now. Pump built PumpSwap after it already owned the attention funnel. CTOgo ships Raydium graduation (seed pool + burn LP + fee continuity) first. A private AMM is only worth revisiting when most volume already happens on CTOgo and fee leakage on Raydium outweighs build cost.',
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
          'Mint authority is revoked or locked (nobody can print more supply). Freeze authority is revoked (nobody can freeze wallets). Token metadata is locked so name, ticker, and logo cannot be silently changed later. On graduation, curve liquidity seeds the Raydium pool and LP is burned or locked so liquidity cannot be pulled as a rug.',
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
          'No — Telegram does not allow bulk member transfers. When you List or Launch, CTOgo provisions an official group (we remain chat admin) and gives you a share link; holders join from that link or the coin page. Bot tools for one-click trades and easy listings come later.',
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
