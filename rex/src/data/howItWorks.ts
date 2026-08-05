import { Wallet, Map, Building2, Rocket, Gift } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DUAL_FEE_SHORT, MARKETING_FILL_SHORT } from './chainConfig';
import { premiumFeatures } from './claimPricing';
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

/** Short 3-step flow for the landing timeline. */
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
    id: 'wallet',
    icon: Wallet,
    title: 'Automated marketing wallet',
    subtitle: 'Buy/sell tax grows your marketing wallet to fund your project',
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
      'Bring an idea to life in minutes — your coin launches on CTOgo for $1, no LP or coding required.',
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
    id: 'marketing',
    step: 3,
    icon: Wallet,
    title: 'Automated marketing wallet',
    subtitle: 'Trades fund the wallet — milestones pay providers',
    description:
      `Built-in buy/sell tax on every CTOgo-routed trade — ${DUAL_FEE_SHORT} — flows into a dedicated marketing wallet (${MARKETING_FILL_SHORT}). When milestones are reached, CTOgo pays vetted suppliers for the services your project needs.`,
    bullets: [
      `${DUAL_FEE_SHORT}`,
      `${MARKETING_FILL_SHORT} fills the marketing wallet`,
      LAUNCH_TRADE_NOTE,
      'Milestone thresholds unlock payouts only after auto spend is turned on in settings',
      'Investors can track wallet balance and upcoming supplier spend live',
      'CTOgo adds a 20% automation fee on top of supplier invoices ($100 service → $120 vault debit)',
    ],
  },
  {
    id: 'supplier',
    step: 4,
    icon: Building2,
    title: 'Founder & supplier delivery',
    subtitle: 'Your build, your choice',
    description:
      'As founder, you are responsible for getting the product built. Search our active list of vetted suppliers — or bring your own team and have them onboarded by CTOgo.',
    bullets: [
      'Browse CTOgo partner studios by specialty and assign one to your roadmap',
      'Roadmap wallet pays the supplier automatically when milestones are met',
      'Bringing your own supplier? They must pass CTOgo vetting before receiving funds',
      'CTOgo audits all delivery before milestone payouts release',
    ],
  },
  {
    id: 'perks',
    step: 5,
    icon: Gift,
    title: 'Investor perks',
    subtitle: 'Optional paid add-ons',
    description:
      'Attract more investors by enabling premium features. These are not included in the $1 claim — each perk requires a separate fee.',
    bullets: premiumFeatures.map((p) => `${p.name} — $${p.price}: ${p.description}`),
  },
];
