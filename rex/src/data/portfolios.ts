export type PortfolioItem = {
  title: string;
  type: string;
  result: string;
};

const studioPortfolios: Record<string, PortfolioItem[]> = {
  'pixel-forge': [
    { title: 'Neon Drift', type: 'Mobile game', result: '120K downloads · token-gated skins' },
    { title: 'MemeQuest', type: 'Web3 app', result: '$2.1M raise · 8-week delivery' },
    { title: 'Arcade Coin UI', type: 'Product design', result: '40% higher D1 retention' },
  ],
  'nova-labs': [
    { title: 'YieldVault', type: 'DeFi protocol', result: '$18M TVL in 90 days' },
    { title: 'SwapDash', type: 'Analytics dashboard', result: 'Used by 3 live Rex projects' },
    { title: 'StakeHub', type: 'Smart contract', result: 'Audited · zero critical findings' },
  ],
  stackline: [
    { title: 'MarketMint', type: 'SaaS marketplace', result: 'Full-stack MVP in 6 weeks' },
    { title: 'FounderOS', type: 'Web app', result: '500+ active teams' },
    { title: 'LaunchPad Pro', type: 'Landing + auth', result: '3.2% signup conversion' },
  ],
  'arcade-works': [
    { title: 'FrogTap', type: 'Meme mini-game', result: 'Viral TikTok launch · 2M plays' },
    { title: 'ChatCoin', type: 'Social app', result: 'Holder chat + tipping live' },
    { title: 'PepeRun', type: 'Endless runner', result: 'Trade-tax funded ad burst' },
  ],
  'prism-ui': [
    { title: 'Token brand kit', type: 'Brand & UI', result: '12 Rex launches shipped' },
    { title: 'DeFi dashboard', type: 'UI system', result: 'Design system in 10 days' },
    { title: 'NFT drop site', type: 'Marketing site', result: 'Sold out in 4 hours' },
  ],
  'orbit-digital': [
    { title: 'FanBet', type: 'Sports app', result: 'Live on Rex sport category' },
    { title: 'StreamVault', type: 'Media platform', result: 'Subscription + tipping' },
    { title: 'LeagueDAO', type: 'Fantasy league', result: 'On-chain prize pools' },
  ],
  'chaincraft': [
    { title: 'MemeLauncher', type: 'Token tooling', result: '50+ coins deployed' },
    { title: 'TaxRouter', type: 'Smart contract', result: 'Auto marketing wallet splits' },
    { title: 'BondingCurve X', type: 'DeFi', result: 'Fair launch template' },
  ],
  'vertex-games': [
    { title: 'DungeonFi', type: 'P2E RPG', result: 'Daily active wallets +28%' },
    { title: 'Card Clash', type: 'Mobile game', result: 'Season pass in token' },
    { title: 'Guild Wars', type: 'Multiplayer', result: 'Tournament fee revenue' },
  ],
};

const talentPortfolios: Record<string, PortfolioItem[]> = {
  t1: [
    { title: 'FitTrack marketing site', type: 'Website', result: 'Lighthouse 95 · responsive' },
    { title: 'SaaS onboarding UI', type: 'Frontend', result: 'React + Tailwind component lib' },
    { title: 'Rex founder dashboard', type: 'Dashboard', result: 'Charts + milestone views' },
  ],
  t2: [
    { title: 'Talent marketplace MVP', type: 'Full-stack', result: 'Auth, payments, search' },
    { title: 'API gateway', type: 'Backend', result: '10K req/min · Postgres' },
    { title: 'Mobile companion app', type: 'React Native', result: 'iOS + Android ship' },
  ],
  t3: [
    { title: 'Meme coin brand', type: 'Brand & design', result: 'Logo, UI kit, social templates' },
    { title: 'DeFi app redesign', type: 'UI/UX', result: 'Usability test score +32%' },
    { title: 'NFT collection art direction', type: 'Visual design', result: '10K piece drop' },
  ],
  t4: [
    { title: 'ERC-20 + tax router', type: 'Smart contract', result: 'Mainnet deploy · audited' },
    { title: 'Staking vault', type: 'DeFi', result: '$4M locked' },
    { title: 'Multisig treasury', type: 'On-chain', result: 'Gnosis-safe integration' },
  ],
  t5: [
    { title: 'Fitness tracker app', type: 'Mobile', result: 'Flutter · App Store live' },
    { title: 'Wallet connect flow', type: 'Mobile + Web3', result: 'Solana + EVM' },
    { title: 'Push notification system', type: 'Backend', result: 'Firebase + API' },
  ],
  t6: [
    { title: 'Crypto landing pages', type: 'Webflow', result: '12 launches in 8 weeks' },
    { title: 'WordPress token site', type: 'Website', result: 'CMS + buy widget' },
    { title: 'Email capture funnel', type: 'Marketing', result: '18% opt-in rate' },
  ],
  t7: [
    { title: 'Analytics pipeline', type: 'Backend', result: 'Event stream · dashboards' },
    { title: 'Billing API', type: 'Node + Postgres', result: 'Stripe + webhooks' },
    { title: 'Admin tooling', type: 'Internal tools', result: 'Role-based access' },
  ],
  t8: [
    { title: 'Meme coin launch', type: 'Growth', result: 'Trending push · 5K holders' },
    { title: 'Twitter/X campaign', type: 'Marketing', result: '2M impressions' },
    { title: 'Community playbook', type: 'Content', result: 'Telegram 8K members' },
  ],
};

const defaultStudioPortfolio: PortfolioItem[] = [
  { title: 'Rex incubator project', type: 'Client build', result: 'Delivered on milestone escrow' },
  { title: 'Token launch site', type: 'Web', result: 'Live within roadmap window' },
];

const defaultTalentPortfolio: PortfolioItem[] = [
  { title: 'Founder roadmap deliverable', type: 'Freelance', result: 'Completed via Rex escrow' },
  { title: 'Sprint delivery', type: 'Contract', result: '5-star founder review' },
];

export function getStudioPortfolio(studioId: string): PortfolioItem[] {
  return studioPortfolios[studioId] ?? defaultStudioPortfolio;
}

export function getTalentPortfolio(talentId: string): PortfolioItem[] {
  return talentPortfolios[talentId] ?? defaultTalentPortfolio;
}
