import { useState, type FormEvent } from 'react';
import { Mail, X } from 'lucide-react';
import { useAuth } from './AuthProvider';

function GoogleGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.8-4.1 2.8-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M6.6 14.3l-.5.4-2.7 2.1C5.1 19.5 8.3 21.5 12 21.5c2.4 0 4.4-.8 5.9-2.1l-3.1-2.4c-.8.6-1.9.9-2.8.9-2.2 0-4-1.5-4.7-3.5z"
      />
      <path
        fill="#4A90E2"
        d="M3.4 7.2C2.7 8.6 2.3 10.2 2.3 12s.4 3.4 1.1 4.8l3.2-2.5c-.2-.6-.3-1.2-.3-1.8s.1-1.3.3-1.9L3.4 7.2z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.1c1.3 0 2.5.5 3.4 1.3l2.6-2.6C16.4 2.3 14.4 1.5 12 1.5 8.3 1.5 5.1 3.5 3.4 7.2l3.2 2.5C7.9 6.6 9.8 5.1 12 5.1z"
      />
    </svg>
  );
}

export function AuthModal() {
  const {
    authModalOpen,
    authModalReason,
    closeAuthModal,
    registerEmail,
    signInEmail,
    signInGoogle,
    busy,
  } = useAuth();
  const [mode, setMode] = useState<'signin' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      if (mode === 'register') {
        await registerEmail({ email, password, name });
      } else {
        await signInEmail({ email, password });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not continue.');
    }
  };

  const onGoogle = async () => {
    setError(null);
    try {
      await signInGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal
      aria-labelledby="auth-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75"
        aria-label="Close"
        onClick={closeAuthModal}
      />
      <div className="relative z-[1] w-full max-w-md overflow-hidden rounded-t-2xl border border-white/10 bg-[#090b14] shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
          <div>
            <p id="auth-modal-title" className="text-sm font-semibold text-white">
              {mode === 'register' ? 'Create your CTOgo account' : 'Sign in to CTOgo'}
            </p>
            <p className="mt-0.5 text-[11px] text-white/45">
              {authModalReason ??
                'Register with Google or email to Launch or List. Connect a wallet only when you pay.'}
            </p>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="grid h-8 w-8 place-items-center rounded-lg text-white/45 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => void onGoogle()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white hover:bg-white/[0.07] disabled:opacity-50"
          >
            <GoogleGlyph className="h-5 w-5" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
            <span className="h-px flex-1 bg-white/10" />
            or email
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={(e) => void onSubmit(e)} className="space-y-3">
            {mode === 'register' ? (
              <label className="block">
                <span className="text-[11px] font-medium text-white/45">Username</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="username"
                  autoComplete="username"
                  className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#c8ff3d]/40"
                />
              </label>
            ) : null}
            <label className="block">
              <span className="text-[11px] font-medium text-white/45">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#c8ff3d]/40"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-medium text-white/45">Password</span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#c8ff3d]/40"
              />
            </label>

            {error ? <p className="text-[12px] font-medium text-rose-300">{error}</p> : null}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8ff3d] px-4 py-3 text-sm font-bold text-[#090b14] hover:bg-[#d5ff69] disabled:opacity-50"
            >
              <Mail className="h-4 w-4" />
              {busy
                ? 'Working…'
                : mode === 'register'
                  ? 'Create account'
                  : 'Sign in with email'}
            </button>
          </form>

          <p className="text-center text-[11px] text-white/40">
            {mode === 'register' ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="font-semibold text-[#d5ff69] hover:underline"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New here?{' '}
                <button
                  type="button"
                  className="font-semibold text-[#d5ff69] hover:underline"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                >
                  Register
                </button>
              </>
            )}
          </p>
          <p className="text-[10px] leading-relaxed text-white/30">
            Accounts are free. Paying for launch fees, vault attach, or Advertise packs still needs a
            connected Solana wallet.
          </p>
        </div>
      </div>
    </div>
  );
}
