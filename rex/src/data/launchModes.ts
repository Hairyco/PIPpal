import { Hourglass, Rocket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type LaunchModeId = 'immediate' | 'staging';

export interface LaunchModeOption {
  id: LaunchModeId;
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
}

export const launchModeOptions: LaunchModeOption[] = [
  {
    id: 'immediate',
    icon: Rocket,
    title: 'Launch right away',
    description: 'Your coin goes live on Rex immediately — ready to trade from day one.',
    bullets: [
      'Listed in live markets across Rex',
      'Buy/sell tax starts filling your marketing wallet',
      'Best when your idea and roadmap are ready to share',
    ],
  },
  {
    id: 'staging',
    icon: Hourglass,
    title: 'Join staging',
    description:
      'List in Launching Soon to generate community interest before trading opens.',
    bullets: [
      'Featured in the Launching Soon section on Rex',
      'Grow followers and early supporters before go-live',
      'Set a target launch date — flip to live when you are ready',
    ],
  },
];

export function getLaunchModeLabel(id: LaunchModeId): string {
  return launchModeOptions.find((option) => option.id === id)?.title ?? id;
}
