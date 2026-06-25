import { banner } from './marketplaceBanners';

export interface TalentWorker {
  id: string;
  name: string;
  role: string;
  specialty: string;
  rate: string;
  rating: number;
  completedJobs: number;
  skills: string[];
  available: boolean;
  avatar: string;
  banner: string;
  yearsExperience: number;
}

export const talentPool: TalentWorker[] = [
  {
    id: 't1',
    name: 'Maya Chen',
    role: 'Frontend developer',
    specialty: 'React, Next.js & marketing websites',
    rate: '$65/hr',
    rating: 4.9,
    completedJobs: 38,
    skills: ['website', 'dashboard', 'design'],
    available: true,
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=faces',
    banner: banner('t1'),
    yearsExperience: 6,
  },
  {
    id: 't2',
    name: 'James Okonkwo',
    role: 'Full-stack developer',
    specialty: 'SaaS products & marketplaces',
    rate: '$85/hr',
    rating: 4.8,
    completedJobs: 24,
    skills: ['website', 'api', 'dashboard', 'mobile-app'],
    available: true,
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces',
    banner: banner('t2'),
    yearsExperience: 7,
  },
  {
    id: 't3',
    name: 'Sofia Ruiz',
    role: 'UI/UX designer',
    specialty: 'Brand systems & product design',
    rate: '$55/hr',
    rating: 5.0,
    completedJobs: 52,
    skills: ['design', 'website'],
    available: true,
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=faces',
    banner: banner('t3'),
    yearsExperience: 8,
  },
  {
    id: 't4',
    name: 'Alex Kim',
    role: 'Solidity developer',
    specialty: 'Token contracts & DeFi protocols',
    rate: '$120/hr',
    rating: 4.9,
    completedJobs: 19,
    skills: ['smart-contract', 'api'],
    available: true,
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&h=256&fit=crop&crop=faces',
    banner: banner('t4'),
    yearsExperience: 5,
  },
  {
    id: 't5',
    name: 'Priya Sharma',
    role: 'Mobile developer',
    specialty: 'React Native & Flutter apps',
    rate: '$75/hr',
    rating: 4.7,
    completedJobs: 31,
    skills: ['mobile-app', 'api'],
    available: true,
    avatar:
      'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=256&h=256&fit=crop&crop=faces',
    banner: banner('t5'),
    yearsExperience: 5,
  },
  {
    id: 't6',
    name: 'Tom Bradley',
    role: 'WordPress & Webflow dev',
    specialty: 'Fast marketing sites & landing pages',
    rate: '$45/hr',
    rating: 4.8,
    completedJobs: 67,
    skills: ['website', 'marketing'],
    available: true,
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=faces',
    banner: banner('t6'),
    yearsExperience: 9,
  },
  {
    id: 't7',
    name: 'Elena Voss',
    role: 'Backend engineer',
    specialty: 'Node, Postgres & API design',
    rate: '$90/hr',
    rating: 4.9,
    completedJobs: 28,
    skills: ['api', 'dashboard'],
    available: false,
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256&h=256&fit=crop&crop=faces',
    banner: banner('t7'),
    yearsExperience: 6,
  },
  {
    id: 't8',
    name: 'Marcus Webb',
    role: 'Growth marketer',
    specialty: 'Crypto launches & community growth',
    rate: '$60/hr',
    rating: 4.6,
    completedJobs: 41,
    skills: ['marketing', 'website'],
    available: true,
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&h=256&fit=crop&crop=faces',
    banner: banner('t8'),
    yearsExperience: 7,
  },
];

export function getTalentForDeliverable(deliverableId: string): TalentWorker[] {
  return talentPool.filter((t) => t.skills.includes(deliverableId));
}
