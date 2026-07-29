import { LogIn, LogOut, UserRound } from 'lucide-react';
import { useAuth } from './AuthProvider';

type AuthButtonProps = {
  className?: string;
  /** Header: sign-in only. Sidebar: account once signed in. */
  variant?: 'header' | 'sidebar';
};

export function AuthButton({ className = '', variant = 'header' }: AuthButtonProps) {
  const { user, signedIn, signOut, requireAuth } = useAuth();

  if (variant === 'sidebar') {
    if (!signedIn || !user) {
      return (
        <button
          type="button"
          onClick={() => void requireAuth('Sign in with Google or email.')}
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/55 transition hover:bg-white/[0.04] hover:text-white ${className}`}
        >
          <LogIn className="h-4 w-4 shrink-0" />
          Sign in
        </button>
      );
    }

    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-start gap-2.5 px-1">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#c8ff3d]/15 text-[#d5ff69]">
            <UserRound className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-[11px] text-white/40">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-white/45 transition hover:bg-white/[0.04] hover:text-white"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    );
  }

  if (signedIn) return null;

  return (
    <button
      type="button"
      onClick={() => void requireAuth('Sign in with Google or email.')}
      className={`inline-flex h-10 items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 text-xs font-semibold text-white transition hover:border-[#c8ff3d]/35 hover:bg-[#c8ff3d]/10 hover:text-[#d5ff69] sm:px-3 ${className}`}
      aria-label="Sign in"
    >
      <LogIn className="h-3.5 w-3.5 shrink-0" />
      <span className="hidden sm:inline">Sign in</span>
    </button>
  );
}
