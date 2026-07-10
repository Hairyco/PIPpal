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
    title: 'Launch immediately',
    description: 'Go live on Rex right away — trading starts from day one.',
    bullets: [
      'Listed in live markets across Rex',
      'Buy/sell tax starts filling your marketing wallet',
    ],
  },
  {
    id: 'staging',
    icon: Hourglass,
    title: 'Prelaunch',
    description: 'List in Launching Soon and build hype before trading opens.',
    bullets: [
      'Featured in the Launching Soon section',
      'Flip to live from your dashboard when ready',
    ],
  },
];

export function getLaunchModeLabel(id: LaunchModeId): string {
  return launchModeOptions.find((option) => option.id === id)?.title ?? id;
}
