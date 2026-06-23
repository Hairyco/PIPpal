export const projectUtilities: Record<string, Record<string, string[]>> = {
  'meme-coins': {
    '1': ['Meme game', 'Merch store', 'Auto ads'],
    '2': ['NFT mint', 'Community DAO', 'Staking'],
    '3': ['Holder rewards', 'Meme contests'],
    '4': ['Merch drops', 'Fan voting', 'Auto marketing'],
    '5': ['Mobile game', 'Revenue share'],
  },
  media: {
    '1': ['Streaming app', 'Creator payouts', 'Subscriptions'],
    '2': ['Tipping platform', 'Revenue split'],
    '3': ['Clip marketplace', 'Ad revenue'],
    '4': ['Podcast hosting', 'Listener perks'],
  },
  sport: {
    '1': ['Betting app', 'Live odds', 'P2P wagers'],
    '2': ['Fan tokens', 'Merch store', 'Voting'],
    '3': ['Fantasy league', 'Prize pools'],
    '4': ['Athlete tokens', 'Sponsorship deals'],
  },
  aerospace: {
    '1': ['Satellite data', 'API access', 'B2B sales'],
    '2': ['Imagery marketplace', 'On-demand feeds'],
    '3': ['Launch tracker', 'DAO governance'],
  },
  gaming: {
    '1': ['Play-to-earn', 'In-game market', 'NFT items'],
    '2': ['Dungeon RPG', 'Daily quests', 'Token rewards'],
    '3': ['Guild battles', 'Tournament fees'],
    '4': ['Idle game', 'Ad revenue share'],
    '5': ['Card battler', 'Season passes'],
  },
  'ai-tech': {
    '1': ['AI API', 'Pay-per-call', 'Dev tools'],
    '2': ['Prompt marketplace', 'Creator royalties'],
    '3': ['Data labeling', 'B2B contracts'],
    '4': ['Agent platform', 'Automation SaaS'],
  },
  defi: {
    '1': ['Yield vault', 'Auto-compound', 'Staking'],
    '2': ['DEX swap', 'Liquidity pools'],
    '3': ['Lending protocol', 'Collateral loans'],
    '4': ['Staking rewards', 'Governance'],
  },
  fashion: {
    '1': ['Limited drops', 'Token-gated shop', 'Merch'],
    '2': ['Digital wearables', 'NFT fashion'],
    '3': ['Supply chain', 'Product passports'],
  },
  music: {
    '1': ['Royalty splits', 'Streaming rights', 'Fan funding'],
    '2': ['Artist shares', 'Revenue distribution'],
    '3': ['Vinyl NFTs', 'Collector perks'],
  },
  'real-estate': {
    '1': ['Fractional ownership', 'Rental yield'],
    '2': ['Property tokens', 'Monthly payouts'],
    '3': ['Rent distribution', 'Tenant portal'],
    '4': ['Land DAO', 'Development votes'],
  },
};

export function resolveProjectUtilities(categoryId: string, projectId: string): string[] {
  return projectUtilities[categoryId]?.[projectId] ?? ['Product build', 'Roadmap'];
}
