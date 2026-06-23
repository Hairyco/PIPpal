import { BadgeCheck, ClipboardCheck, FileSearch, ShieldCheck, UserCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SupplierType = 'individual' | 'agency';

export interface VettingStep {
  id: string;
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const vettingSteps: VettingStep[] = [
  {
    id: 'apply',
    step: 1,
    icon: ClipboardCheck,
    title: 'Submit your application',
    description: 'Tell us who you are, what you build, and share your portfolio or agency credentials.',
  },
  {
    id: 'review',
    step: 2,
    icon: FileSearch,
    title: 'Portfolio & background review',
    description: 'Our team reviews shipped work, references, and delivery history. We verify identity and business details.',
  },
  {
    id: 'skills',
    step: 3,
    icon: ShieldCheck,
    title: 'Skills & quality check',
    description: 'A short technical or process assessment confirms you can deliver to Rex milestone standards.',
  },
  {
    id: 'onboard',
    step: 4,
    icon: UserCheck,
    title: 'Rex onboarding',
    description: 'Complete supplier agreements, milestone templates, and payout setup. Learn how founders assign you to roadmaps.',
  },
  {
    id: 'preferred',
    step: 5,
    icon: BadgeCheck,
    title: 'Preferred supplier status',
    description: 'Once approved, you appear in the Rex supplier marketplace. Founders can assign you and funds release on milestone completion.',
  },
];

export const supplierTypeInfo: Record<
  SupplierType,
  { title: string; subtitle: string; description: string; perks: string[] }
> = {
  individual: {
    title: 'Individual builder',
    subtitle: 'Freelancers & solo devs',
    description:
      'For designers, developers, and product builders working independently. Show your portfolio and get matched to founder roadmaps.',
    perks: [
      'Listed in the Rex supplier marketplace',
      'Paid automatically when milestones are approved',
      'Build reputation with verified delivery badges',
      'Work with multiple incubator projects',
    ],
  },
  agency: {
    title: 'Agency or studio',
    subtitle: 'Teams & dev shops',
    description:
      'For agencies, studios, and product teams that deliver at scale. Vetting covers your company, team capacity, and case studies.',
    perks: [
      'Agency profile with team size and specialties',
      'Assign multiple builders under one vetted account',
      'Priority matching for larger roadmap budgets',
      'Co-branded preferred supplier badge',
    ],
  },
};

export const individualSpecialties = [
  'Web development',
  'Mobile apps',
  'UI/UX design',
  'Smart contracts',
  'AI / ML products',
  'Game development',
  'Marketing & growth',
  'Other',
];

export const agencyServices = [
  'Full-stack product builds',
  'Mobile app development',
  'Design systems & branding',
  'Web3 & smart contracts',
  'AI integration',
  'Game & interactive',
  'Growth & launch marketing',
  'Other',
];
