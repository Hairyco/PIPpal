export type ProjectOrigin = 'new' | 'existing';

export function isExistingProject(origin: ProjectOrigin): boolean {
  return origin === 'existing';
}
