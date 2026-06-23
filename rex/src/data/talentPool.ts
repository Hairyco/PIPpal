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
  },
];

export function getTalentForDeliverable(deliverableId: string): TalentWorker[] {
  return talentPool.filter((t) => t.skills.includes(deliverableId));
}
