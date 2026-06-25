import { resolveProjectUtilities } from './projectUtilities';

export interface ActiveProject {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  marketCap: string;
  price: string;
  change24h: number;
  age: string;
  verified: boolean;
  utilities: string[];
}

type RawProject = Omit<ActiveProject, 'utilities'>;

export interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  estimatedRaise: string;
  buildTime: string;
}

export interface CategoryContent {
  projects: ActiveProject[];
  ideas: ProjectIdea[];
}

type RawCategoryContent = {
  projects: RawProject[];
  ideas: ProjectIdea[];
};

function enrichContent(categoryId: string, content: RawCategoryContent): CategoryContent {
  return {
    ...content,
    projects: content.projects.map((p) => ({
      ...p,
      utilities: resolveProjectUtilities(categoryId, p.id),
    })),
  };
}

const categoryContent: Record<string, RawCategoryContent> = {
  'meme-coins': {
    projects: [
      { id: '1', rank: 1, name: 'CatWifHat', symbol: 'CWH', marketCap: '$4.2M', price: '$0.0042', change24h: 142.5, age: '2d', verified: true },
      { id: '2', rank: 2, name: 'PepeRex', symbol: 'PREX', marketCap: '$1.8M', price: '$0.0018', change24h: 67.3, age: '5d', verified: true },
      { id: '3', rank: 3, name: 'DogeMoon', symbol: 'DMOON', marketCap: '$890K', price: '$0.00089', change24h: -12.4, age: '1d', verified: false },
      { id: '4', rank: 4, name: 'ShibaSquad', symbol: 'SHIBS', marketCap: '$620K', price: '$0.00062', change24h: 28.1, age: '8d', verified: true },
      { id: '5', rank: 5, name: 'FrogFi', symbol: 'FFI', marketCap: '$410K', price: '$0.00041', change24h: 9.7, age: '3d', verified: false },
    ],
    ideas: [
      { id: 'i1', title: 'Celebrity parody meme coin', description: 'Launch a community token around a trending celebrity moment with built-in auto-marketing tax.', estimatedRaise: '$50K–$200K', buildTime: '1 week' },
      { id: 'i2', title: 'Pet photo meme token', description: 'Tokenize a viral pet photo into a community coin with holder rewards and meme contests.', estimatedRaise: '$30K–$150K', buildTime: '5 days' },
      { id: 'i3', title: 'AI-generated mascot coin', description: 'Create an AI-designed mascot character with merch drops funded by trading fees.', estimatedRaise: '$80K–$300K', buildTime: '2 weeks' },
      { id: 'i4', title: 'Charity meme fundraiser', description: 'Meme coin where 2% of every trade auto-donates to a transparent charity wallet.', estimatedRaise: '$100K–$500K', buildTime: '1 week' },
    ],
  },
  'celebrity-coins': {
    projects: [
      { id: '1', rank: 1, name: 'SwiftieCoin', symbol: 'SWFT', marketCap: '$3.1M', price: '$0.0031', change24h: 89.4, age: '3d', verified: true },
      { id: '2', rank: 2, name: 'KardashKoin', symbol: 'KARD', marketCap: '$1.4M', price: '$0.0014', change24h: 52.1, age: '6d', verified: true },
      { id: '3', rank: 3, name: 'DrakeDrop', symbol: 'DRKE', marketCap: '$920K', price: '$0.00092', change24h: -8.3, age: '2d', verified: false },
      { id: '4', rank: 4, name: 'ElonMuskMoon', symbol: 'ELON', marketCap: '$680K', price: '$0.00068', change24h: 34.7, age: '4d', verified: true },
      { id: '5', rank: 5, name: 'BeyHive', symbol: 'HIVE', marketCap: '$410K', price: '$0.00041', change24h: 21.2, age: '7d', verified: false },
    ],
    ideas: [
      { id: 'i1', title: 'Celebrity moment parody coin', description: 'Launch a token around a trending celebrity headline with auto-marketing and holder fan perks.', estimatedRaise: '$80K–$400K', buildTime: '1 week' },
      { id: 'i2', title: 'Influencer fan token', description: 'Verified creator launches a fan coin with exclusive drops, AMAs, and merch funded by trading tax.', estimatedRaise: '$50K–$250K', buildTime: '5 days' },
      { id: 'i3', title: 'Red carpet event coin', description: 'Time-limited token for awards season or a major premiere with countdown marketing pushes.', estimatedRaise: '$100K–$500K', buildTime: '10 days' },
      { id: 'i4', title: 'Celebrity charity token', description: 'Parody or tribute coin where a transparent % of trades supports a named cause or fan initiative.', estimatedRaise: '$150K–$600K', buildTime: '2 weeks' },
    ],
  },
  apps: {
    projects: [
      { id: '1', rank: 1, name: 'FitTrack', symbol: 'FIT', marketCap: '$2.6M', price: '$0.026', change24h: 41.2, age: '16d', verified: true },
      { id: '2', rank: 2, name: 'StudyPal', symbol: 'STUDY', marketCap: '$1.1M', price: '$0.011', change24h: 19.4, age: '22d', verified: true },
      { id: '3', rank: 3, name: 'LocalEats', symbol: 'EATS', marketCap: '$720K', price: '$0.0072', change24h: -4.8, age: '9d', verified: false },
      { id: '4', rank: 4, name: 'TaskFlow', symbol: 'TASK', marketCap: '$480K', price: '$0.0048', change24h: 12.6, age: '12d', verified: true },
      { id: '5', rank: 5, name: 'ChatLoop', symbol: 'LOOP', marketCap: '$310K', price: '$0.0031', change24h: 7.3, age: '5d', verified: false },
    ],
    ideas: [
      { id: 'i1', title: 'Habit tracker with streak rewards', description: 'Daily habit app where token holders unlock premium coaching and community challenges.', estimatedRaise: '$80K–$350K', buildTime: '5 weeks' },
      { id: 'i2', title: 'Local services marketplace', description: 'Book cleaners, tutors, and handymen with crypto payments and verified reviews.', estimatedRaise: '$150K–$700K', buildTime: '8 weeks' },
      { id: 'i3', title: 'AI study companion', description: 'Personalized quiz and flashcard app that adapts to each learner’s weak spots.', estimatedRaise: '$100K–$500K', buildTime: '6 weeks' },
      { id: 'i4', title: 'Neighborhood events app', description: 'Discover and host local meetups with ticket sales and sponsor slots funded by the token.', estimatedRaise: '$60K–$300K', buildTime: '4 weeks' },
    ],
  },
  media: {
    projects: [
      { id: '1', rank: 1, name: 'StreamVault', symbol: 'STRM', marketCap: '$2.1M', price: '$0.021', change24h: 34.2, age: '14d', verified: true },
      { id: '2', rank: 2, name: 'CreatorPay', symbol: 'CPAY', marketCap: '$980K', price: '$0.0098', change24h: 18.6, age: '21d', verified: true },
      { id: '3', rank: 3, name: 'ClipChain', symbol: 'CLIP', marketCap: '$540K', price: '$0.0054', change24h: -5.2, age: '6d', verified: false },
      { id: '4', rank: 4, name: 'PodcastFi', symbol: 'POD', marketCap: '$320K', price: '$0.0032', change24h: 11.3, age: '9d', verified: false },
    ],
    ideas: [
      { id: 'i1', title: 'Micro-drama streaming app', description: 'Short-form episodic content platform where viewers fund next episodes via token votes.', estimatedRaise: '$200K–$1M', buildTime: '8 weeks' },
      { id: 'i2', title: 'Creator tipping marketplace', description: 'Let fans tip creators in crypto with instant payouts and revenue splits.', estimatedRaise: '$150K–$600K', buildTime: '6 weeks' },
      { id: 'i3', title: 'AI news summarizer channel', description: 'Automated daily news digest app with token-gated premium analysis tiers.', estimatedRaise: '$80K–$400K', buildTime: '4 weeks' },
      { id: 'i4', title: 'Indie film crowdfunding DAO', description: 'Community votes on which films get produced from a shared treasury.', estimatedRaise: '$500K–$2M', buildTime: '12 weeks' },
    ],
  },
  sport: {
    projects: [
      { id: '1', rank: 1, name: 'FanBet Pro', symbol: 'FBET', marketCap: '$3.4M', price: '$0.034', change24h: 22.8, age: '30d', verified: true },
      { id: '2', rank: 2, name: 'ClubToken FC', symbol: 'CLUB', marketCap: '$1.2M', price: '$0.012', change24h: 8.4, age: '18d', verified: true },
      { id: '3', rank: 3, name: 'FantasyLeague', symbol: 'FANT', marketCap: '$760K', price: '$0.0076', change24h: -3.1, age: '11d', verified: false },
      { id: '4', rank: 4, name: 'AthleteX', symbol: 'ATHX', marketCap: '$490K', price: '$0.0049', change24h: 15.7, age: '7d', verified: true },
    ],
    ideas: [
      { id: 'i1', title: 'Sports betting app', description: 'Peer-to-peer sports betting platform with transparent odds and instant crypto settlements.', estimatedRaise: '$300K–$1.5M', buildTime: '10 weeks' },
      { id: 'i2', title: 'Fan prediction league', description: 'Weekly match prediction game where top scorers earn token rewards and NFT badges.', estimatedRaise: '$100K–$500K', buildTime: '5 weeks' },
      { id: 'i3', title: 'Athlete fan token launchpad', description: 'Help amateur athletes launch their own fan tokens with built-in merch store.', estimatedRaise: '$200K–$800K', buildTime: '7 weeks' },
      { id: 'i4', title: 'Live score + betting alerts', description: 'Real-time score tracker that pushes bet opportunities when odds shift.', estimatedRaise: '$80K–$350K', buildTime: '4 weeks' },
    ],
  },
  aerospace: {
    projects: [
      { id: '1', rank: 1, name: 'OrbitData', symbol: 'ORBT', marketCap: '$1.6M', price: '$0.16', change24h: 12.1, age: '45d', verified: true },
      { id: '2', rank: 2, name: 'SatLink', symbol: 'SATL', marketCap: '$720K', price: '$0.072', change24h: 6.8, age: '22d', verified: true },
      { id: '3', rank: 3, name: 'RocketDAO', symbol: 'RDAO', marketCap: '$380K', price: '$0.038', change24h: -8.2, age: '12d', verified: false },
    ],
    ideas: [
      { id: 'i1', title: 'Satellite imagery marketplace', description: 'Buy and sell on-demand satellite images for agriculture, insurance, and research.', estimatedRaise: '$500K–$3M', buildTime: '16 weeks' },
      { id: 'i2', title: 'Space tourism waitlist app', description: 'Tokenized waitlist for suborbital flights with transferable queue positions.', estimatedRaise: '$200K–$1M', buildTime: '8 weeks' },
      { id: 'i3', title: 'Drone delivery tracker', description: 'Track autonomous drone deliveries with proof-of-delivery on-chain.', estimatedRaise: '$150K–$700K', buildTime: '10 weeks' },
      { id: 'i4', title: 'STEM rocket kit subscription', description: 'Monthly educational rocket kits for schools, funded by community token.', estimatedRaise: '$80K–$400K', buildTime: '6 weeks' },
    ],
  },
  gaming: {
    projects: [
      { id: '1', rank: 1, name: 'PixelArena', symbol: 'PXL', marketCap: '$5.8M', price: '$0.058', change24h: 45.3, age: '60d', verified: true },
      { id: '2', rank: 2, name: 'LootRush', symbol: 'LOOT', marketCap: '$2.3M', price: '$0.023', change24h: 19.2, age: '35d', verified: true },
      { id: '3', rank: 3, name: 'GuildWars', symbol: 'GUILD', marketCap: '$1.1M', price: '$0.011', change24h: -7.6, age: '15d', verified: false },
      { id: '4', rank: 4, name: 'TapQuest', symbol: 'TAP', marketCap: '$670K', price: '$0.0067', change24h: 31.4, age: '4d', verified: true },
      { id: '5', rank: 5, name: 'CardClash', symbol: 'CARD', marketCap: '$420K', price: '$0.0042', change24h: 5.9, age: '9d', verified: false },
    ],
    ideas: [
      { id: 'i1', title: 'Play-to-earn mobile RPG', description: 'Casual dungeon crawler where players earn tokens for daily quests and boss raids.', estimatedRaise: '$250K–$1.2M', buildTime: '12 weeks' },
      { id: 'i2', title: 'Esports tournament platform', description: 'Host amateur esports brackets with crypto prize pools and spectator betting.', estimatedRaise: '$180K–$900K', buildTime: '8 weeks' },
      { id: 'i3', title: 'NFT trading card game', description: 'Collectible card battler with on-chain ownership and seasonal card drops.', estimatedRaise: '$300K–$1.5M', buildTime: '14 weeks' },
      { id: 'i4', title: 'Idle clicker with token rewards', description: 'Simple addictive clicker game that funds itself through ad revenue sharing.', estimatedRaise: '$50K–$250K', buildTime: '4 weeks' },
    ],
  },
  'ai-tech': {
    projects: [
      { id: '1', rank: 1, name: 'NeuralAPI', symbol: 'NAPI', marketCap: '$4.5M', price: '$0.45', change24h: 28.7, age: '40d', verified: true },
      { id: '2', rank: 2, name: 'PromptMarket', symbol: 'PRMT', marketCap: '$1.9M', price: '$0.019', change24h: 14.3, age: '25d', verified: true },
      { id: '3', rank: 3, name: 'DataLabel', symbol: 'DLBL', marketCap: '$830K', price: '$0.0083', change24h: -4.5, age: '13d', verified: false },
      { id: '4', rank: 4, name: 'AgentHub', symbol: 'AGNT', marketCap: '$510K', price: '$0.0051', change24h: 22.1, age: '6d', verified: true },
    ],
    ideas: [
      { id: 'i1', title: 'AI customer support bot', description: 'White-label chatbot SaaS for small businesses trained on their docs and FAQs.', estimatedRaise: '$150K–$800K', buildTime: '6 weeks' },
      { id: 'i2', title: 'AI image generation API', description: 'Pay-per-call image API for apps with token-based credit system.', estimatedRaise: '$200K–$1M', buildTime: '8 weeks' },
      { id: 'i3', title: 'Resume screening tool', description: 'AI that ranks job applicants and explains hiring decisions transparently.', estimatedRaise: '$100K–$500K', buildTime: '5 weeks' },
      { id: 'i4', title: 'Personal AI tutor app', description: 'Adaptive learning app that generates custom lessons for any subject.', estimatedRaise: '$180K–$750K', buildTime: '10 weeks' },
    ],
  },
  defi: {
    projects: [
      { id: '1', rank: 1, name: 'YieldVault', symbol: 'YLD', marketCap: '$8.2M', price: '$0.82', change24h: 6.4, age: '90d', verified: true },
      { id: '2', rank: 2, name: 'SwapRex', symbol: 'SWPX', marketCap: '$3.1M', price: '$0.031', change24h: 11.8, age: '55d', verified: true },
      { id: '3', rank: 3, name: 'LendPool', symbol: 'LEND', marketCap: '$1.4M', price: '$0.014', change24h: -2.3, age: '28d', verified: true },
      { id: '4', rank: 4, name: 'StakeFi', symbol: 'STK', marketCap: '$690K', price: '$0.0069', change24h: 8.9, age: '16d', verified: false },
    ],
    ideas: [
      { id: 'i1', title: 'Yield aggregator dashboard', description: 'One dashboard showing best yields across chains with one-click deposit.', estimatedRaise: '$200K–$900K', buildTime: '8 weeks' },
      { id: 'i2', title: 'Micro-lending protocol', description: 'Peer-to-peer micro loans with reputation scores and collateral pools.', estimatedRaise: '$400K–$2M', buildTime: '14 weeks' },
      { id: 'i3', title: 'Crypto savings app', description: 'Auto-convert spare change into stablecoin savings with weekly yield.', estimatedRaise: '$150K–$600K', buildTime: '6 weeks' },
      { id: 'i4', title: 'Token launch escrow', description: 'Escrow service that releases dev funds only when roadmap milestones hit.', estimatedRaise: '$100K–$500K', buildTime: '7 weeks' },
    ],
  },
  fashion: {
    projects: [
      { id: '1', rank: 1, name: 'StreetWear DAO', symbol: 'STRT', marketCap: '$1.3M', price: '$0.013', change24h: 19.5, age: '32d', verified: true },
      { id: '2', rank: 2, name: 'NFT Sneakers', symbol: 'SNKR', marketCap: '$580K', price: '$0.0058', change24h: 7.2, age: '19d', verified: false },
      { id: '3', rank: 3, name: 'WearFi', symbol: 'WEAR', marketCap: '$340K', price: '$0.0034', change24h: -6.8, age: '8d', verified: false },
    ],
    ideas: [
      { id: 'i1', title: 'Limited drop streetwear brand', description: 'Token-gated exclusive clothing drops with holder-only early access.', estimatedRaise: '$80K–$400K', buildTime: '6 weeks' },
      { id: 'i2', title: 'Digital fashion marketplace', description: 'Buy and sell wearable NFTs for metaverse avatars and social profiles.', estimatedRaise: '$150K–$700K', buildTime: '8 weeks' },
      { id: 'i3', title: 'Sustainable fashion tracker', description: 'Verify supply chain sustainability with on-chain product passports.', estimatedRaise: '$120K–$550K', buildTime: '7 weeks' },
      { id: 'i4', title: 'Custom merch print-on-demand', description: 'Community-designed merch store where designers earn per sale.', estimatedRaise: '$50K–$250K', buildTime: '4 weeks' },
    ],
  },
  music: {
    projects: [
      { id: '1', rank: 1, name: 'BeatChain', symbol: 'BEAT', marketCap: '$2.4M', price: '$0.024', change24h: 24.6, age: '38d', verified: true },
      { id: '2', rank: 2, name: 'ArtistShare', symbol: 'ARTS', marketCap: '$910K', price: '$0.0091', change24h: 10.3, age: '24d', verified: true },
      { id: '3', rank: 3, name: 'VinylNFT', symbol: 'VNYL', marketCap: '$470K', price: '$0.0047', change24h: -1.9, age: '10d', verified: false },
    ],
    ideas: [
      { id: 'i1', title: 'Indie artist funding platform', description: 'Fans invest in albums upfront and earn royalties when tracks stream.', estimatedRaise: '$100K–$600K', buildTime: '7 weeks' },
      { id: 'i2', title: 'Concert ticket NFT marketplace', description: 'Resellable ticket NFTs with anti-scalping smart contract rules.', estimatedRaise: '$200K–$900K', buildTime: '9 weeks' },
      { id: 'i3', title: 'AI beat marketplace', description: 'Producers sell AI-assisted beats with transparent royalty splits.', estimatedRaise: '$80K–$400K', buildTime: '5 weeks' },
      { id: 'i4', title: 'Fan club subscription app', description: 'Monthly token subscription unlocking exclusive content from artists.', estimatedRaise: '$60K–$300K', buildTime: '4 weeks' },
    ],
  },
  'real-estate': {
    projects: [
      { id: '1', rank: 1, name: 'PropToken', symbol: 'PROP', marketCap: '$6.1M', price: '$0.61', change24h: 4.2, age: '120d', verified: true },
      { id: '2', rank: 2, name: 'FractionHome', symbol: 'FRAC', marketCap: '$2.8M', price: '$0.028', change24h: 2.8, age: '75d', verified: true },
      { id: '3', rank: 3, name: 'RentFi', symbol: 'RENT', marketCap: '$1.2M', price: '$0.012', change24h: -1.4, age: '42d', verified: true },
      { id: '4', rank: 4, name: 'LandDAO', symbol: 'LAND', marketCap: '$650K', price: '$0.0065', change24h: 6.1, age: '20d', verified: false },
    ],
    ideas: [
      { id: 'i1', title: 'Fractional rental property fund', description: 'Pool capital to buy rental properties and distribute monthly yield to holders.', estimatedRaise: '$500K–$5M', buildTime: '12 weeks' },
      { id: 'i2', title: 'Property listing with token escrow', description: 'Buy/sell property with funds held in escrow until inspections pass.', estimatedRaise: '$200K–$1M', buildTime: '10 weeks' },
      { id: 'i3', title: 'Short-term rental manager', description: 'Airbnb-style management tool with automated payouts to co-owners.', estimatedRaise: '$150K–$800K', buildTime: '8 weeks' },
      { id: 'i4', title: 'Commercial lease marketplace', description: 'Match small businesses with retail spaces using smart lease contracts.', estimatedRaise: '$300K–$1.5M', buildTime: '11 weeks' },
    ],
  },
};

const defaultContent: RawCategoryContent = {
  projects: [
    { id: '1', rank: 1, name: 'RexStarter', symbol: 'REX', marketCap: '$500K', price: '$0.005', change24h: 15.0, age: '7d', verified: true },
    { id: '2', rank: 2, name: 'LaunchPad', symbol: 'LAUNCH', marketCap: '$250K', price: '$0.0025', change24h: 8.3, age: '3d', verified: false },
  ],
  ideas: [
    { id: 'i1', title: 'Community marketplace app', description: 'A token-powered marketplace for your niche community.', estimatedRaise: '$100K–$500K', buildTime: '6 weeks' },
    { id: 'i2', title: 'Subscription SaaS tool', description: 'Simple SaaS with crypto payments and holder discounts.', estimatedRaise: '$80K–$400K', buildTime: '5 weeks' },
  ],
};

export function getCategoryContent(categoryId: string): CategoryContent {
  const content = categoryContent[categoryId] ?? defaultContent;
  return enrichContent(categoryId, content);
}

export function getProject(categoryId: string, projectId: string): ActiveProject | null {
  const content = getCategoryContent(categoryId);
  return content.projects.find((p) => p.id === projectId) ?? null;
}
