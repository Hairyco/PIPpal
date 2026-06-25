import type { RoadmapHorizonId } from './roadmapHorizons';

export type ShareGrant = {
  id: string;
  name: string;
  role: string;
  /** Percent of total supply, drawn from the share pool */
  percent: number;
};

export type TokenSupplySlice = {
  id: string;
  label: string;
  percent: number;
  note: string;
};

/** Published at launch — holders see this breakdown on the project page. */
export const tokenSupplySlices: TokenSupplySlice[] = [
  {
    id: 'community',
    label: 'Community & liquidity',
    percent: 75,
    note: 'Circulating supply at launch',
  },
  {
    id: 'founder',
    label: 'Founder allocation',
    percent: 15,
    note: 'Locked until KYC + vesting schedule',
  },
  {
    id: 'share-pool',
    label: 'Share pool',
    percent: 10,
    note: 'Co-founders, advisors, and team — same KYC + vesting rules',
  },
];

export const FOUNDER_ALLOCATION_PERCENT = 15;
export const SHARE_POOL_PERCENT = 10;

/** Rex fee on qualified exit marketplace transactions (T&Cs). */
export const EXIT_MARKETPLACE_FEE_PERCENT = 10;

export type VestingSchedule = {
  cliffMonths: number;
  vestMonths: number;
  label: string;
};

export function getVestingSchedule(horizon: RoadmapHorizonId): VestingSchedule {
  if (horizon === '2-3-years') {
    return {
      cliffMonths: 6,
      vestMonths: 24,
      label: '6-month cliff after KYC, then 24-month linear unlock',
    };
  }
  return {
    cliffMonths: 3,
    vestMonths: 9,
    label: '3-month cliff after KYC, then 9-month linear unlock',
  };
}

export type VestingStatus =
  | 'locked-kyc'
  | 'cliff'
  | 'vesting'
  | 'fully-vested';

export type VestingProgress = {
  status: VestingStatus;
  unlockedPercent: number;
  founderUnlockedPercent: number;
  statusLabel: string;
  nextUnlockLabel: string;
};

export function getVestingProgress(
  launchedAt: string,
  horizon: RoadmapHorizonId,
  kycCompleted: boolean,
): VestingProgress {
  const schedule = getVestingSchedule(horizon);
  const allocation = FOUNDER_ALLOCATION_PERCENT;

  if (!kycCompleted) {
    return {
      status: 'locked-kyc',
      unlockedPercent: 0,
      founderUnlockedPercent: 0,
      statusLabel: 'Locked — complete KYC to start vesting',
      nextUnlockLabel: schedule.label,
    };
  }

  const launch = new Date(launchedAt);
  const now = new Date();
  const monthsElapsed =
    (now.getFullYear() - launch.getFullYear()) * 12 + (now.getMonth() - launch.getMonth());

  if (monthsElapsed < schedule.cliffMonths) {
    const remaining = schedule.cliffMonths - monthsElapsed;
    return {
      status: 'cliff',
      unlockedPercent: 0,
      founderUnlockedPercent: 0,
      statusLabel: `Cliff period — ${remaining} month${remaining === 1 ? '' : 's'} until first unlock`,
      nextUnlockLabel: `${schedule.cliffMonths}-month cliff after KYC`,
    };
  }

  const vestElapsed = monthsElapsed - schedule.cliffMonths;
  const vestRatio = Math.min(1, vestElapsed / schedule.vestMonths);
  const founderUnlocked = Math.round(allocation * vestRatio * 10) / 10;

  if (vestRatio >= 1) {
    return {
      status: 'fully-vested',
      unlockedPercent: allocation,
      founderUnlockedPercent: allocation,
      statusLabel: 'Fully vested — eligible for Rex exit marketplace',
      nextUnlockLabel: 'All founder tokens unlocked',
    };
  }

  const monthsLeft = schedule.vestMonths - vestElapsed;
  return {
    status: 'vesting',
    unlockedPercent: founderUnlocked,
    founderUnlockedPercent: founderUnlocked,
    statusLabel: `Vesting — ${founderUnlocked}% of ${allocation}% founder allocation unlocked`,
    nextUnlockLabel: `~${monthsLeft} month${monthsLeft === 1 ? '' : 's'} to full unlock`,
  };
}

export function sharePoolRemaining(grants: ShareGrant[]): number {
  const allocated = grants.reduce((sum, g) => sum + g.percent, 0);
  return Math.max(0, SHARE_POOL_PERCENT - allocated);
}

export function createShareGrant(name: string, role: string, percent: number): ShareGrant {
  return {
    id: `grant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    role: role.trim(),
    percent,
  };
}
