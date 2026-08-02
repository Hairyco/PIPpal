/** Demo marketing-wallet ledger until live PDA + indexed txs. */

export type MarketingTxKind =
  | 'trade_fee'
  | 'investor_in'
  | 'supplier_payout'
  | 'affiliate_payout';

export type MarketingTxDirection = 'in' | 'out';

export type MarketingWalletTx = {
  id: string;
  kind: MarketingTxKind;
  direction: MarketingTxDirection;
  /** Human label shown in the ledger. */
  label: string;
  /** Optional counterparty / supplier / wallet short name. */
  counterparty: string;
  /**
   * Display note (DexScreener, Telegram, etc.).
   * On-chain memos on Solscan land when the wallet contract is final.
   */
  note: string | null;
  amountUsd: number;
  amountSol: number;
  /** Relative time for demo UI. */
  when: string;
  /** Minutes ago — for stable sort. */
  minutesAgo: number;
  /** Demo signature for Solscan tx link. */
  signature: string;
};

const KIND_META: Record<
  MarketingTxKind,
  { direction: MarketingTxDirection; defaultNote: string | null }
> = {
  trade_fee: { direction: 'in', defaultNote: 'Trade fee · CTOgo' },
  investor_in: { direction: 'in', defaultNote: 'Manual deposit' },
  supplier_payout: { direction: 'out', defaultNote: null },
  affiliate_payout: {
    direction: 'out',
    defaultNote: 'Legacy affiliate (demo) — raiders now earn 0.50% to their own wallets',
  },
};

function demoSig(seed: string): string {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let n = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 9973 + 424242;
  let out = '';
  for (let i = 0; i < 64; i++) {
    n = (n * 1103515245 + 12345) >>> 0;
    out += alphabet[n % alphabet.length];
  }
  return out;
}

/** Deterministic demo ledger for a wallet (ticker-scoped). */
export function demoMarketingWalletActivity(ticker: string): MarketingWalletTx[] {
  const t = ticker.replace(/^\$/, '').toUpperCase() || 'CTO';
  const rows: Omit<MarketingWalletTx, 'id' | 'signature' | 'direction'>[] = [
    {
      kind: 'investor_in',
      label: 'Investor pay-in',
      counterparty: '7xK4…mN2p',
      note: 'Manual deposit',
      amountUsd: 120,
      amountSol: 0.82,
      when: '2h ago',
      minutesAgo: 120,
    },
    {
      kind: 'trade_fee',
      label: 'Buy/sell fee fill',
      counterparty: 'CTOgo curve',
      note: 'Trade fee · CTOgo',
      amountUsd: 18.4,
      amountSol: 0.126,
      when: '5h ago',
      minutesAgo: 300,
    },
    {
      kind: 'supplier_payout',
      label: 'DexScreener socials update',
      counterparty: 'DexScreener',
      note: 'DexScreener',
      amountUsd: 350,
      amountSol: 2.41,
      when: '1d ago',
      minutesAgo: 1440,
    },
    {
      kind: 'investor_in',
      label: 'Investor pay-in',
      counterparty: '9pQw…kR8s',
      note: 'Manual deposit',
      amountUsd: 50,
      amountSol: 0.34,
      when: '2d ago',
      minutesAgo: 2880,
    },
    {
      kind: 'trade_fee',
      label: 'Buy/sell fee fill',
      counterparty: 'CTOgo curve',
      note: 'Trade fee · CTOgo',
      amountUsd: 42.1,
      amountSol: 0.29,
      when: '2d ago',
      minutesAgo: 3000,
    },
    {
      kind: 'supplier_payout',
      label: 'Pinned message · CTOgo Telegram',
      counterparty: 'Telegram',
      note: 'Telegram',
      amountUsd: 150,
      amountSol: 1.03,
      when: '3d ago',
      minutesAgo: 4320,
    },
    {
      kind: 'trade_fee',
      label: 'Buy/sell fee fill',
      counterparty: 'CTOgo curve',
      note: 'Trade fee · CTOgo',
      amountUsd: 9.6,
      amountSol: 0.066,
      when: '4d ago',
      minutesAgo: 5760,
    },
    {
      kind: 'affiliate_payout',
      label: 'Affiliate payout',
      counterparty: 'aff:heli…x9',
      note: 'Affiliate commission',
      amountUsd: 25,
      amountSol: 0.17,
      when: '5d ago',
      minutesAgo: 7200,
    },
    {
      kind: 'investor_in',
      label: 'Investor pay-in',
      counterparty: 'B3nL…tY4w',
      note: 'Manual deposit',
      amountUsd: 200,
      amountSol: 1.37,
      when: '6d ago',
      minutesAgo: 8640,
    },
    {
      kind: 'supplier_payout',
      label: 'DexScreener trending bar',
      counterparty: 'DexScreener',
      note: 'DexScreener',
      amountUsd: 2000,
      amountSol: 13.7,
      when: '8d ago',
      minutesAgo: 11520,
    },
  ];

  return rows
    .map((row, index) => ({
      ...row,
      id: `${t}-mkt-${index}`,
      direction: KIND_META[row.kind].direction,
      note: row.note ?? KIND_META[row.kind].defaultNote,
      signature: demoSig(`${t}-mkt-tx-${index}`),
    }))
    .sort((a, b) => a.minutesAgo - b.minutesAgo);
}

export function solscanTxUrl(signature: string): string {
  return `https://solscan.io/tx/${signature}`;
}

export function formatMarketingUsd(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  }
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  })}`;
}

export function formatMarketingSol(amount: number): string {
  return `${amount.toLocaleString(undefined, { maximumFractionDigits: 3 })} SOL`;
}
