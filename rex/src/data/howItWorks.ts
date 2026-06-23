import { Wallet, BadgeCheck, Map, Building2, Rocket, Gift } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CLAIM_FEE, premiumFeatures } from './claimPricing';

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
      'Anyone can spin up a project in minutes — no coding or marketing experience required.',
    bullets: [
      'Pick a category or claim a generated idea',
      'Token and project page go live instantly',
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
      'Every trade feeds a dedicated marketing wallet. When it hits a threshold, Rex automatically buys ads — even if the founder disappears.',
    bullets: [
      '2–5% buy/sell tax flows into the marketing wallet',
      'Threshold triggers auto-spend on DexScreener or Coinzilla',
      'Investors can track balance and next ad campaign live',
      'Platform takes a 5–10% management fee on ad spends',
    ],
    highlight: 'The coin markets itself.',
  },
  {
    id: 'claim',
    step: 3,
    icon: BadgeCheck,
    title: 'Claim ownership',
    subtitle: 'Become the verified founder',
    description: `Generated ideas and unclaimed projects are open to anyone. Pay $${CLAIM_FEE} to officially claim — you get the verified founder badge and full control of the project.`,
    bullets: [
      'One-time $1 claim fee to take ownership',
      'Edit roadmap, tokenomics, and milestones',
      'Investor perks (profit share, etc.) are optional paid add-ons — not included in the $1 fee',
      `Premium perks from $${Math.min(...premiumFeatures.map((p) => p.price))} each — enable at claim or later`,
    ],
    highlight: `$${CLAIM_FEE} to claim`,
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
      'Milestone 1: Launch & liquidity',
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

export const pillarsSummary = howItWorksSteps
  .filter((s) => ['marketing', 'claim', 'roadmap'].includes(s.id))
  .map((s) => ({
    title: s.title,
    subtitle: s.subtitle,
    description: s.description,
    id: s.id,
  }));
