import { Wallet, BadgeCheck, Map, Building2, Rocket, Gift } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CLAIM_FEE, premiumFeatures } from './claimPricing';
import { BONDING_CURVE_LAUNCH_NOTE, BONDING_CURVE_TRADE_NOTE } from './bondingCurve';

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

export const howItWorksSteps: HowItWorksStep[] = [
  {
    id: 'launch',
    step: 1,
    icon: Rocket,
    title: 'Launch for $1',
    subtitle: 'Low barrier entry',
    description:
      'Bring an idea to life in minutes — your coin launches on a Rex bonding curve, no LP or coding required.',
    bullets: [
      'Pick a category or claim a generated idea',
      'Token goes live on the bonding curve instantly',
      BONDING_CURVE_LAUNCH_NOTE,
      'Marketing and roadmap wallets created automatically',
    ],
  },
  {
    id: 'marketing',
    step: 2,
    icon: Wallet,
    title: 'Automated marketing wallet',
    subtitle: 'The self-funding engine',
    description:
      'Built-in buy/sell tax on every curve trade — typically 2–10% — flows into a dedicated marketing wallet. When milestones are reached, Rex pays vetted vendors for the services your project needs.',
    bullets: [
      '2–10% tax on bonding-curve buys and sells',
      BONDING_CURVE_TRADE_NOTE,
      'Milestone thresholds unlock payouts to approved vendors automatically',
      'Investors can track wallet balance and upcoming vendor spend live',
      'Platform takes a 5–10% management fee on milestone payouts',
    ],
    highlight: 'Your coin builds and markets itself.',
  },
  {
    id: 'claim',
    step: 3,
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
    id: 'roadmap',
    step: 4,
    icon: Map,
    title: 'Roadmap & milestones',
    subtitle: 'Guaranteed delivery path',
    description:
      'A separate roadmap wallet fills from trading activity. When milestones hit, funds unlock automatically for the next phase.',
    bullets: [
      'Milestone 1: Bonding curve launch',
      'Milestone 2: Marketing fund threshold → first ads',
      'Milestone 3: Roadmap wallet unlock → supplier build begins',
      'Milestone 4: MVP release to token holders',
    ],
  },
  {
    id: 'supplier',
    step: 5,
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
    step: 6,
    icon: Gift,
    title: 'Investor perks',
    subtitle: 'Optional paid add-ons',
    description:
      'Attract more investors by enabling premium features. These are not included in the $1 claim — each perk requires a separate fee.',
    bullets: premiumFeatures.map((p) => `${p.name} — $${p.price}: ${p.description}`),
  },
];
