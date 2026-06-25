export type RoadmapHorizonId = '12-months' | '2-3-years';

export type RoadmapHorizon = {
  id: RoadmapHorizonId;
  label: string;
  summary: string;
  exitWindow: string;
};

export const roadmapHorizons: RoadmapHorizon[] = [
  {
    id: '12-months',
    label: '12 months',
    summary: 'Launch, build, and grow to MVP within one year — best for fast MVPs and meme launches.',
    exitWindow: 'Month 12',
  },
  {
    id: '2-3-years',
    label: '2–3 years',
    summary: 'Phased product build and scale over multiple years — best for apps, AI, and deep tech.',
    exitWindow: 'Year 2–3',
  },
];

/** @deprecated Use EXIT_MARKETPLACE_FEE_PERCENT from founderTokenomics */
export const EXIT_SALE_FEE_PERCENT = 10;

export function getRoadmapHorizon(id: RoadmapHorizonId): RoadmapHorizon {
  return roadmapHorizons.find((h) => h.id === id) ?? roadmapHorizons[0];
}
