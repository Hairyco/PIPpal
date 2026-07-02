import { getCategoryContent, type ActiveProject } from './categoryContent';
import { industries } from './industries';

export interface TradeProject extends ActiveProject {
  categoryId: string;
  categoryName: string;
}

export function getAllTradeProjects(): TradeProject[] {
  return industries.flatMap((industry) =>
    getCategoryContent(industry.id).projects.map((project) => ({
      ...project,
      categoryId: industry.id,
      categoryName: industry.name,
    })),
  );
}
