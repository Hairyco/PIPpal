import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  readSession,
  registerWithEmail,
  signInWithEmail,
  signInWithGooglePreview,
  writeSession,
} from '../auth/storage';
import type { AuthSession, AuthUser } from '../auth/types';

type AuthContextValue = {
  user: AuthUser | null;
  signedIn: boolean;
  busy: boolean;
  registerEmail: (input: { email: string; password: string; name?: string }) => Promise<AuthUser>;
  signInEmail: (input: { email: string; password: string }) => Promise<AuthUser>;
  signInGoogle: () => Promise<AuthUser>;
  signOut: () => void;
  /** Open the global auth modal; resolves true if signed in when closed. */
  requireAuth: (reason?: string) => Promise<boolean>;
  authModalOpen: boolean;
  authModalReason: string | null;
  closeAuthModal: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    typeof window === 'undefined' ? null : readSession(),
  );
  const [busy, setBusy] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);
  const waitersRef = useRef<Array<(ok: boolean) => void>>([]);

  const persist = useCallback((next: AuthSession | null) => {
    writeSession(next);
    setSession(next);
  }, []);

  const resolveWaiters = useCallback((ok: boolean) => {
    const waiters = waitersRef.current;
    waitersRef.current = [];
    waiters.forEach((resolve) => resolve(ok));
  }, []);

  const registerEmail = useCallback(
    async (input: { email: string; password: string; name?: string }) => {
      setBusy(true);
      try {
        const next = registerWithEmail(input);
        persist(next);
        setAuthModalOpen(false);
        setAuthModalReason(null);
        resolveWaiters(true);
        return next.user;
      } finally {
        setBusy(false);
      }
    },
    [persist, resolveWaiters],
  );

  const signInEmail = useCallback(
    async (input: { email: string; password: string }) => {
      setBusy(true);
      try {
        const next = signInWithEmail(input);
        persist(next);
        setAuthModalOpen(false);
        setAuthModalReason(null);
        resolveWaiters(true);
        return next.user;
      } finally {
        setBusy(false);
      }
    },
    [persist, resolveWaiters],
  );

  const signInGoogle = useCallback(async () => {
    setBusy(true);
    try {
      // Real Google Sign-In is free via Google Cloud OAuth client ID (GIS).
      // Until VITE_GOOGLE_CLIENT_ID is set, preview creates a Google-style session locally.
      void (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined);
      const next = signInWithGooglePreview();
      persist(next);
      setAuthModalOpen(false);
      setAuthModalReason(null);
      resolveWaiters(true);
      return next.user;
    } finally {
      setBusy(false);
    }
  }, [persist, resolveWaiters]);

  const signOut = useCallback(() => {
    persist(null);
  }, [persist]);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setAuthModalReason(null);
    resolveWaiters(Boolean(readSession()?.user));
  }, [resolveWaiters]);

  const requireAuth = useCallback(
    (reason?: string) => {
      if (session?.user) return Promise.resolve(true);
      setAuthModalReason(reason ?? null);
      setAuthModalOpen(true);
      return new Promise<boolean>((resolve) => {
        waitersRef.current.push(resolve);
      });
    },
    [session?.user],
  );

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      signedIn: Boolean(session?.user),
      busy,
      registerEmail,
      signInEmail,
      signInGoogle,
      signOut,
      requireAuth,
      authModalOpen,
      authModalReason,
      closeAuthModal,
    }),
    [
      session,
      busy,
      registerEmail,
      signInEmail,
      signInGoogle,
      signOut,
      requireAuth,
      authModalOpen,
      authModalReason,
      closeAuthModal,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
