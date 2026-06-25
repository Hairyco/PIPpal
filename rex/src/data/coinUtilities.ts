export type CoinUtilityId =
  | 'staking'
  | 'holder-rewards'
  | 'auto-marketing'
  | 'merch-drops'
  | 'governance'
  | 'nft-mint'
  | 'community-dao'
  | 'token-gating'
  | 'revenue-share'
  | 'tipping'
  | 'play-to-earn'
  | 'liquidity-pools'
  | 'charity-donations'
  | 'referral-rewards'
  | 'fan-perks'
  | 'meme-contests'
  | 'subscriptions';

export type CoinUtilityOption = {
  id: CoinUtilityId;
  label: string;
  description: string;
};

export const coinUtilityOptions: CoinUtilityOption[] = [
  {
    id: 'staking',
    label: 'Staking rewards',
    description: 'Lock tokens to earn yield or perks over time.',
  },
  {
    id: 'holder-rewards',
    label: 'Holder rewards',
    description: 'Distribute benefits to long-term token holders.',
  },
  {
    id: 'auto-marketing',
    label: 'Auto marketing',
    description: 'Trade tax funds ads, boosts, and trending pushes.',
  },
  {
    id: 'merch-drops',
    label: 'Merch drops',
    description: 'Token-gated or holder-exclusive merchandise releases.',
  },
  {
    id: 'governance',
    label: 'Fan voting',
    description: 'Let holders vote on roadmap and community decisions.',
  },
  {
    id: 'nft-mint',
    label: 'NFT mint',
    description: 'Collectible drops tied to your coin or community.',
  },
  {
    id: 'community-dao',
    label: 'Community DAO',
    description: 'Treasury and proposals managed by token holders.',
  },
  {
    id: 'token-gating',
    label: 'Premium access',
    description: 'Gate content, tools, or channels behind your token.',
  },
  {
    id: 'revenue-share',
    label: 'Revenue share',
    description: 'Share product or ad revenue with top holders.',
  },
  {
    id: 'tipping',
    label: 'Tipping',
    description: 'In-app tips and micro-payments in your token.',
  },
  {
    id: 'play-to-earn',
    label: 'Play-to-earn',
    description: 'Game or challenge rewards paid in your coin.',
  },
  {
    id: 'liquidity-pools',
    label: 'Liquidity pools',
    description: 'LP incentives and DEX liquidity bootstrapping.',
  },
  {
    id: 'charity-donations',
    label: 'Charity donations',
    description: 'Transparent % of trades sent to a cause wallet.',
  },
  {
    id: 'referral-rewards',
    label: 'Referral rewards',
    description: 'Bonus tokens for users who bring in new holders.',
  },
  {
    id: 'fan-perks',
    label: 'Fan perks',
    description: 'AMAs, early access, and exclusive community benefits.',
  },
  {
    id: 'meme-contests',
    label: 'Meme contests',
    description: 'Prize pools for community-created content and memes.',
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    description: 'Recurring access or SaaS tiers paid in your token.',
  },
];

export function getCoinUtilityLabel(id: string): string {
  return coinUtilityOptions.find((u) => u.id === id)?.label ?? id;
}
