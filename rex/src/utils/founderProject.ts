import type { ShareGrant } from '../data/founderTokenomics';
import type { DeliverableId } from '../data/devStudios';
import type { CoinUtilityId } from '../data/coinUtilities';
import type { RoadmapHorizonId } from '../data/roadmapHorizons';
import type { LaunchModeId } from '../data/launchModes';
import type { VendorChatTarget } from './vendorChat';
import type { MarketingTimelineOverrides } from './buildMarketingRoadmap';
import type { ProjectOrigin } from './projectOrigin';

export type FounderProject = {
  projectName: string;
  categoryId: string;
  description: string;
  coinUtilities: CoinUtilityId[];
  deliverables: DeliverableId[];
  roadmapHorizon: RoadmapHorizonId;
  shareGrants: ShareGrant[];
  kycCompleted: boolean;
  shortlistedStudios: string[];
  studioSkipped: boolean;
  ownSupplierName: string;
  ownSupplierEmail: string;
  talentAssignments: Record<string, string>;
  vendorChats: VendorChatTarget[];
  launchMode: LaunchModeId;
  stagingLaunchDate?: string;
  launchedAt: string;
  /** KYC-gated: shift marketing phase timing */
  marketingTimelineOverrides?: MarketingTimelineOverrides;
  /** Phases submitted for Rex PM approval */
  pmApprovedPhases?: string[];
  /** Custom project / token image (data URL or remote URL) */
  projectImageUrl?: string | null;
  projectImageSource?: 'upload' | 'generated';
  /** New idea vs product already live */
  projectOrigin?: ProjectOrigin;
  /** Live site or app store link when bringing an existing project */
  existingProductUrl?: string;
  /** Uploaded logos, screenshots, and brand assets */
  projectAssets?: string[];
  /** Creative suite — landing page hosted via Vercel */
  landingPageUrl?: string | null;
  landingPageSource?: 'upload' | 'generated' | 'cloned';
  landingPageFunding?: 'marketing-wallet' | 'pay-now' | 'rex-coin';
  sourceWebsiteUrl?: string;
  websiteMode?: 'clone' | 'simple' | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  bannerAssets?: string[];
  queuedBannerCount?: number;
  starterBundleSelected?: boolean;
  starterBundleFunding?: 'pay-now' | 'wait-wallet' | null;
  telegramGroup: string;
  discordUrl?: string;
};

const STORAGE_KEY = 'rex-founder-project';

export function projectSymbol(name: string): string {
  const slug = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
  return slug || 'COIN';
}

export function saveFounderProject(project: FounderProject): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch {
    // ignore quota errors in demo
  }
}

export function loadFounderProject(): FounderProject | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FounderProject>;
    return {
      ...parsed,
      roadmapHorizon: parsed.roadmapHorizon ?? '12-months',
      shareGrants: parsed.shareGrants ?? [],
      kycCompleted: parsed.kycCompleted ?? false,
      launchMode: parsed.launchMode ?? 'immediate',
      marketingTimelineOverrides: parsed.marketingTimelineOverrides ?? {},
      pmApprovedPhases: parsed.pmApprovedPhases ?? [],
      projectOrigin: parsed.projectOrigin ?? 'new',
      telegramGroup: parsed.telegramGroup ?? '',
    } as FounderProject;
  } catch {
    return null;
  }
}

export function hasFounderProject(): boolean {
  return loadFounderProject() !== null;
}
