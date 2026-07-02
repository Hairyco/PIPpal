import { Wallet, BadgeCheck, Map, Building2, Rocket, Gift, Hourglass } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CLAIM_FEE, premiumFeatures } from './claimPricing';
import { LAUNCH_NOTE, LAUNCH_TRADE_NOTE } from './launchTerms';

export interface HowItWorksStep {
  id: string;
  step: number;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  highlight?: string;
}

/** Short 5-step flow for the landing timeline. */
export const landingTimelineSteps: Pick<HowItWorksStep, 'id' | 'icon' | 'title' | 'subtitle'>[] = [
  {
    id: 'launch',
    icon: Rocket,
    title: 'Launch for $1',
    subtitle: 'Bring any idea to life',
  },
  {
    id: 'roadmap',
    icon: Map,
    title: 'Roadmap set',
    subtitle: 'Milestones define what gets built and when',
  },
  {
    id: 'staging',
    icon: Hourglass,
    title: 'Launch now or stage',
    subtitle: 'Go live immediately — or list in Launching Soon',
  },
  {
    id: 'wallet',
    icon: Wallet,
    title: 'Automated marketing wallet',
    subtitle: 'Buy/sell tax grows your marketing wallet to fund your project',
  },
  {
    id: 'payout',
    icon: Building2,
    title: 'Suppliers get paid',
    subtitle: 'Rex releases funds to vetted suppliers at each milestone',
  },
];

export const landingPillarStepIds = ['launch', 'roadmap', 'marketing'] as const;

export const howItWorksSteps: HowItWorksStep[] = [
  {
    id: 'launch',
    step: 1,
    icon: Rocket,
    title: 'Launch for $1',
    subtitle: 'Low barrier entry',
    description:
      'Bring an idea to life in minutes — your coin launches on Rex for $1, no LP or coding required.',
    bullets: [
      'Pick a category or claim a generated idea',
      'Launch right away — or join staging in Launching Soon',
      LAUNCH_NOTE,
      'Marketing and roadmap wallets created automatically',
    ],
  },
  {
    id: 'roadmap',
    step: 2,
    icon: Map,
    title: 'Roadmap & milestones',
    subtitle: 'Set what gets built and when',
    description:
      'A separate roadmap wallet fills from trading activity. When milestones hit, funds unlock automatically for the next phase.',
    bullets: [
      'Milestone 1: Token launch',
      'Milestone 2: Marketing fund threshold → first ads',
      'Milestone 3: Roadmap wallet unlock → supplier build begins',
      'Milestone 4: MVP release to token holders',
    ],
  },
  {
    id: 'staging',
    step: 3,
    icon: Hourglass,
    title: 'Launch now or stage',
    subtitle: 'Trade immediately or build buzz first',
    description:
      'Choose to go live on Rex right away, or list in Launching Soon to grow community interest before trading opens.',
    bullets: [
      'Launch right away — your coin is ready to trade from day one',
      'Join staging — featured in Launching Soon with a target go-live date',
      'Followers get notified when staging projects flip to live',
      'Switch from staging to live anytime from your founder dashboard',
    ],
  },
  {
    id: 'marketing',
    step: 4,
    icon: Wallet,
    title: 'Automated marketing wallet',
    subtitle: 'Trades fund the wallet — milestones pay providers',
    description:
      'Built-in buy/sell tax on every trade — typically 2–10% — flows into a dedicated marketing wallet. When milestones are reached, Rex pays vetted suppliers for the services your project needs.',
    bullets: [
      '2–10% tax on buys and sells',
      LAUNCH_TRADE_NOTE,
      'Milestone thresholds unlock payouts to approved suppliers automatically',
      'Investors can track wallet balance and upcoming supplier spend live',
      'Platform takes a 5–10% management fee on milestone payouts',
    ],
  },
  {
    id: 'claim',
    step: 5,
    icon: BadgeCheck,
    title: 'Claim ownership — KYC',
    subtitle: 'Become the verified founder',
    description:
      'This is where the owner can officially claim the role of founder — set new milestones, identify marketing, and put it to community vote.',
    bullets: [
      'Complete KYC to verify your identity as founder',
      'Unlock vesting on your 15% founder allocation (share pool uses the same rules)',
      'Set roadmap milestones and propose marketing spend',
      'Community vote on major founder decisions',
      `One-time $${CLAIM_FEE} claim fee plus optional premium perks from $${Math.min(...premiumFeatures.map((p) => p.price))} each`,
    ],
  },
  {
    id: 'supplier',
    step: 6,
    icon: Building2,
    title: 'Founder & supplier delivery',
    subtitle: 'Your build, your choice',
    description:
      'As founder, you are responsible for getting the product built. Search our active list of vetted suppliers — or bring your own team and have them onboarded by Rex.',
    bullets: [
      'Browse Rex partner studios by specialty and assign one to your roadmap',
      'Roadmap wallet pays the supplier automatically when milestones are met',
      'Bringing your own supplier? They must pass Rex vetting before receiving funds',
      'Rex audits all delivery before milestone payouts release',
    ],
  },
  {
    id: 'perks',
    step: 7,
    icon: Gift,
    title: 'Investor perks',
    subtitle: 'Optional paid add-ons',
    description:
      'Attract more investors by enabling premium features. These are not included in the $1 claim — each perk requires a separate fee.',
    bullets: premiumFeatures.map((p) => `${p.name} — $${p.price}: ${p.description}`),
  },
];
