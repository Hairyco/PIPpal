import { useState } from 'react';
import { LogIn, LogOut, UserRound } from 'lucide-react';
import { useAuth } from './AuthProvider';

export function AuthButton({ className = '' }: { className?: string }) {
  const { user, signedIn, signOut, requireAuth } = useAuth();
  const [open, setOpen] = useState(false);

  if (!signedIn || !user) {
    return (
      <button
        type="button"
        onClick={() => void requireAuth('Sign in with Google or email to Launch or List.')}
        className={`inline-flex h-10 items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 text-xs font-semibold text-white transition hover:border-[#c8ff3d]/35 hover:bg-[#c8ff3d]/10 hover:text-[#d5ff69] sm:px-3 ${className}`}
      >
        <LogIn className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">Sign in</span>
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 max-w-[10rem] items-center gap-2 rounded-lg border border-[#c8ff3d]/30 bg-[#c8ff3d]/10 px-2.5 text-xs font-semibold text-[#d5ff69] transition hover:bg-[#c8ff3d]/15 sm:px-3"
        title={user.email}
      >
        <UserRound className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden truncate sm:inline">{user.name}</span>
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close account menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#0a0e17] shadow-xl">
            <div className="border-b border-white/[0.06] px-3 py-2.5">
              <p className="truncate text-xs font-semibold text-white">{user.name}</p>
              <p className="truncate text-[10px] text-white/40">{user.email}</p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-white/30">
                {user.provider === 'google' ? 'Google' : 'Email'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold text-white/70 hover:bg-white/[0.04] hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
