import React, { useState, createContext, useContext, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../supabaseClient';

export type Screen =
  | 'landing'
  | 'login'
  | 'home'
  | 'eligibility'
  | 'medical_profile'
  | 'q1_intro'
  | 'q1_chat'
  | 'q1_result'
  | 'question_index'
  | 'assessment_prep'
  | 'pip_diary'
  | 'downloads'
  | 'decision_received'
  | 'mandatory_reconsideration'
  | 'appeal'
  | 'change_of_circumstances'
  | 'pre_claim_checklist'
  | 'claim_steps'
  | 'about'
  | 'privacy'
  | 'accessibility'
  | 'terms'
  | 'new_claim_intro'
  | 'claim_process'
  | 'descriptors_guide'
  | 'scoring_criteria'
  | 'upsell'
  | 'post_payment_guide'
  | 'timeline_calculator'
  | 'payment_calculator'
  | 'backpay_calculator';

export interface User {
  name: string;
  email: string;
  avatar?: string;
  id?: string;
}

export interface Condition {
  name: string;
  durationNum: string;
  durationUnit: 'months' | 'years';
}

export interface MedProfile {
  conditions: Condition[];
  medications: string;
  notes: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentScreen: Screen;
  navigationHistory: Screen[];
  navigateTo: (screen: Screen) => void;
  goBack: () => void;
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
  medProfile: MedProfile;
  setMedProfile: (profile: MedProfile) => void;
  badDayMode: boolean;
  setBadDayMode: (active: boolean) => void;
  q1Result: any;
  setQ1Result: (result: any) => void;
  savedAnswers: Record<string, string>;
  saveAnswer: (questionId: string, answer: string) => void;
  getSavedAnswer: (questionId: string) => string | undefined;
  hasCompletedEligibility: boolean;
  setHasCompletedEligibility: (completed: boolean) => void;
  hasPaid: boolean;
  setHasPaid: (paid: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable — fail silently
  }
}

export function AppProvider({ children }: { children: ReactNode }) {

  // Read Supabase session from localStorage instantly — no network call needed
  const getInitialSession = () => {
    try {
      const raw = localStorage.getItem('pippal-auth');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Check session has not expired
      const expiresAt = parsed?.expires_at;
      if (expiresAt && expiresAt * 1000 < Date.now()) return null;
      return parsed?.user || null;
    } catch {
      return null;
    }
  };
  const initialSessionUser = getInitialSession();
  // If URL has a code param, Supabase needs to process it — show loading
  const hasAuthCode = window.location.search.includes('code=');

  const [currentScreen, setCurrentScreen] = useState<Screen>(initialSessionUser && !hasAuthCode ? 'home' : 'landing');
  const [navigationHistory, setNavigationHistory] = useState<Screen[]>([]);
  const [isLoading, setIsLoading] = useState(hasAuthCode);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [user, setUser] = useState<User | null>(initialSessionUser ? {
    name: initialSessionUser.user_metadata?.name || initialSessionUser.email?.split('@')[0] || '',
    email: initialSessionUser.email || '',
    id: initialSessionUser.id,
  } : null);
  const [hasPaid, setHasPaidState] = useState<boolean>(() => loadFromStorage('pippal_paid_cache', false));

  const [medProfile, setMedProfileState] = useState<MedProfile>(() =>
    loadFromStorage('pippal_med_profile', {
      conditions: [],
      medications: '',
      notes: '',
    })
  );

  const [badDayMode, setBadDayMode] = useState(false);
  const [q1Result, setQ1Result] = useState<any>(null);

  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>(() =>
    loadFromStorage('pippal_answers', {})
  );

  const [hasCompletedEligibility, setHasCompletedEligibilityState] =
    useState<boolean>(() => loadFromStorage('pippal_eligibility', false));

  // Persist to localStorage
  useEffect(() => { saveToStorage('pippal_med_profile', medProfile); }, [medProfile]);
  useEffect(() => { saveToStorage('pippal_answers', savedAnswers); }, [savedAnswers]);
  useEffect(() => { saveToStorage('pippal_eligibility', hasCompletedEligibility); }, [hasCompletedEligibility]);
  useEffect(() => { saveToStorage('pippal_paid_cache', hasPaid); }, [hasPaid]);

  useEffect(() => {
    // Check for promo code in URL on load
    const PROMO_CODES = ['PIPPAL2026', 'PIPPALFRIEND', 'PIPPALVIP'];
    const urlParams = new URLSearchParams(window.location.search);
    const initialPromo = urlParams.get('promo')?.toUpperCase();
    if (initialPromo && PROMO_CODES.includes(initialPromo)) {
      sessionStorage.setItem('pippal_pending_promo', 'true');
      window.history.replaceState({}, '', window.location.pathname);
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || '';
        const userEmail = session.user.email || '';
        setUser({ name, email: userEmail, id: session.user.id });
        localStorage.setItem('pippal_cached_user', JSON.stringify({ name, email: userEmail, id: session.user.id }));

        const params = new URLSearchParams(window.location.search);
        const PROMO_CODES = ['PIPPAL2026', 'PIPPALFRIEND', 'PIPPALVIP'];
        const promoCode = params.get('promo')?.toUpperCase();
        const pendingPromo = sessionStorage.getItem('pippal_pending_promo') === 'true';

        // Handle payment success redirect
        if (params.get('payment') === 'success') {
          setHasPaidState(true);
          setCurrentScreen('post_payment_guide');
          window.history.replaceState({}, '', window.location.pathname);
          try {
            await supabase.from('profiles').update({ has_paid: true }).eq('id', session.user.id);
          } catch { /* Fail silently */ }
        }
        // Handle promo code in URL
        else if (promoCode && PROMO_CODES.includes(promoCode)) {
          setHasPaidState(true);
          setCurrentScreen('post_payment_guide');
          window.history.replaceState({}, '', window.location.pathname);
          try {
            await supabase.from('profiles').update({ has_paid: true }).eq('id', session.user.id);
          } catch { /* Fail silently */ }
        }
        // Handle pending promo from pre-login session
        else if (pendingPromo) {
          setHasPaidState(true);
          sessionStorage.removeItem('pippal_pending_promo');
          try {
            await supabase.from('profiles').update({ has_paid: true }).eq('id', session.user.id);
          } catch { /* Fail silently */ }
          setCurrentScreen('home');
        } else {
          setCurrentScreen('home');
        }

        // Always load has_paid status from Supabase — this is the source of truth
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('has_paid')
            .eq('id', session.user.id)
            .single();
          if (profile?.has_paid) {
            setHasPaidState(true);
          }
        } catch { /* No profile yet */ }

        // Load medical profile from Supabase
        try {
          const { data } = await supabase
            .from('medical_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          if (data) {
            setMedProfileState({
              conditions: data.conditions || [],
              medications: data.medications || '',
              notes: data.notes || '',
            });
          }
        } catch { /* No profile yet */ }
      }
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Skip if we are in the middle of logging out
      if (localStorage.getItem('pippal_logging_out') === 'true') return;
      if (session?.user) {
        const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || '';
        const email = session.user.email || '';
        setUser({ name, email, id: session.user.id });

        // Always check Supabase for paid status — never trust localStorage alone
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('has_paid')
            .eq('id', session.user.id)
            .single();
          if (profile?.has_paid) {
            setHasPaidState(true);
          } else {
            setHasPaidState(false);
          }
        } catch {
          setHasPaidState(false);
        }

        if (currentScreen === 'login' || currentScreen === 'landing') {
          setCurrentScreen('home');
        }
      } else {
        setUser(null);
        setHasPaidState(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setHasPaid = async (paid: boolean) => {
    setHasPaidState(paid);
    // Write to Supabase immediately — Supabase is the source of truth
    if (paid && user?.id) {
      try {
        await supabase.from('profiles').update({ has_paid: true }).eq('id', user.id);
      } catch { /* Fail silently */ }
    }
  };

  const setMedProfile = (profile: MedProfile) => setMedProfileState(profile);
  const setHasCompletedEligibility = (completed: boolean) => setHasCompletedEligibilityState(completed);

  const login = (newUser: User) => {
    setUser(newUser);
  };

  const logout = async () => {
    // Set flag to prevent onAuthStateChange from overriding logout
    localStorage.setItem('pippal_logging_out', 'true');
    // Clear state immediately
    setUser(null);
    setHasPaidState(false);
    setSavedAnswers({});
    setMedProfileState({ conditions: [], medications: '', notes: '' });
    setHasCompletedEligibilityState(false);
    localStorage.removeItem('pippal_med_profile');
    localStorage.removeItem('pippal_answers');
    localStorage.removeItem('pippal_eligibility');
    setCurrentScreen('landing');
    setNavigationHistory([]);
    // Sign out from Supabase then clear flag
    supabase.auth.signOut().finally(() => {
      localStorage.removeItem('pippal_logging_out');
    });
  };

  const navigateTo = (screen: Screen) => {
    setNavigationHistory((prev) => [...prev, currentScreen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setNavigationHistory((prev) => {
      const newHistory = [...prev];
      const previousScreen = newHistory.pop();
      if (previousScreen) {
        setCurrentScreen(previousScreen);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return newHistory;
    });
  };

  const saveAnswer = (questionId: string, answer: string) => {
    setSavedAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const getSavedAnswer = (questionId: string) => savedAnswers[questionId];

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-stone-500 font-medium">Loading PIPpal…</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        navigationHistory,
        navigateTo,
        goBack,
        user,
        isLoggedIn: !!user,
        login,
        logout,
        medProfile,
        setMedProfile,
        badDayMode,
        setBadDayMode,
        q1Result,
        setQ1Result,
        savedAnswers,
        saveAnswer,
        getSavedAnswer,
        hasCompletedEligibility,
        setHasCompletedEligibility,
        hasPaid,
        setHasPaid,
        isLoading,
        setIsLoading,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
      {/* Global Toast Notifications */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => dismissToast(toast.id)}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium transition-all animate-fade-in cursor-pointer max-w-xs text-center
              ${toast.type === 'success' ? 'bg-teal-700 text-white' : ''}
              ${toast.type === 'error' ? 'bg-rose-600 text-white' : ''}
              ${toast.type === 'info' ? 'bg-stone-800 text-white' : ''}
            `}
          >
            {toast.type === 'success' && (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.type === 'info' && (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
              </svg>
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}