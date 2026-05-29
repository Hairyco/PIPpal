/** Owner accounts — excluded from visitor analytics (matches digest/notify lists). */
export const OWNER_EMAILS = ['daley_cutler@hotmail.co.uk', 'hairyco2@gmail.com'] as const;

export function isOwnerEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return OWNER_EMAILS.some((owner) => owner === normalized);
}

/** Admin emails — must match across App, AdminDashboard, and AppContext. */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const configured = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.trim().toLowerCase();
  return normalized === 'daley_cutler@hotmail.co.uk' || (!!configured && normalized === configured);
}
