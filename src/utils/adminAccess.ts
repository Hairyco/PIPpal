/** Admin emails — must match across App, AdminDashboard, and AppContext. */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const configured = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.trim().toLowerCase();
  return normalized === 'daley_cutler@hotmail.co.uk' || (!!configured && normalized === configured);
}
