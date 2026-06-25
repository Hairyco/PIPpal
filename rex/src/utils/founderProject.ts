import type { ShareGrant } from '../data/founderTokenomics';
import type { DeliverableId } from './devStudios';
import type { CoinUtilityId } from './coinUtilities';
import type { RoadmapHorizonId } from './roadmapHorizons';
import type { VendorChatTarget } from './vendorChat';

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
  launchedAt: string;
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
    } as FounderProject;
  } catch {
    return null;
  }
}

export function hasFounderProject(): boolean {
  return loadFounderProject() !== null;
}
