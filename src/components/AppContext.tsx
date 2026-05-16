import React, { useState, createContext, useContext, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import {
  COC_POST_MEDICAL_SNAPSHOT_KEY,
  COC_MEDICAL_EXPECTED_KEY,
  computeCocSessionFromSnapshot,
  type CocMedicalSnapshot,
} from '../cocMedicalSnapshot';
import { PIP_QUESTIONS } from '../pipQuestions';

export type Screen =
  | 'landing'
  | 'login'
  | 'home'
  | 'eligibility'
  | 'medical_profile'
  | 'handwritten_service'
  | 'personalising'
  | 'claim_flow'
  | 'points_estimator'
  | 'question_wizard'
  | 'q1_intro'
  | 'q1_chat'
  | 'q1_result'
  | 'question_index'
  | 'answers_review'
  | 'assessment_prep'
  | 'pip_diary'
  | 'downloads'
  | 'decision_received'
  | 'awaiting_decision'
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
  | 'backpay_calculator'
  | 'news'
  | 'blog'
  | 'blog_post'
  | 'influencer_portal'
  | 'pip_benefits'
  | 'assessment_mock'
  | 'survey';

/** Dev-only: `/?screenshot=…` for marketing captures (see `scripts/capture-marketing-screens.mjs`). */
type DevScreenshot = {
  screen: Screen;
  seedReviewAnswers: boolean;
  seedDraftAnswer: boolean;
  /** QuestionFlow CoC compare (PIP2 + PA4 + example) — `q1_intro` */
  seedCocQuestionFlow?: boolean;
  /** Rich sample profile for marketing capture (`medical_profile` screen) */
  seedMedicalProfileMarketing?: boolean;
};

const COC_MARKET_FLOW_Q1_PREV =
  'I can prepare a simple meal but I need to sit down regularly due to pain. I use the microwave most days as standing at the hob is too difficult. My partner helps with anything involving heavy pans or the oven.';
const COC_MARKET_FLOW_Q1_PA4 =
  'Claimant states they use a microwave only and cannot use the hob due to pain and fatigue. A perching stool is used at the kitchen counter. Partner reported to assist with preparing hot food daily. Observed reduced grip strength on examination. Recommended descriptor: E (supervision required). 4 points.';

function readDevScreenshot(): DevScreenshot | null {
  if (!import.meta.env.DEV) return null;
  const v = new URLSearchParams(window.location.search).get('screenshot');
  if (v === 'home') return { screen: 'home', seedReviewAnswers: false, seedDraftAnswer: false };
  if (v === 'answers_review') return { screen: 'answers_review', seedReviewAnswers: true, seedDraftAnswer: false };
  if (v === 'draft_answer' || v === 'q1_result')
    return { screen: 'q1_result', seedReviewAnswers: false, seedDraftAnswer: true };
  if (v === 'coc_step2' || v === 'coc_step3')
    return { screen: 'change_of_circumstances', seedReviewAnswers: false, seedDraftAnswer: false };
  if (v === 'coc_compare')
    return {
      screen: 'q1_intro',
      seedReviewAnswers: false,
      seedDraftAnswer: false,
      seedCocQuestionFlow: true,
    };
  if (v === 'pip_diary') return { screen: 'pip_diary', seedReviewAnswers: false, seedDraftAnswer: false };
  if (v === 'medical_profile')
    return {
      screen: 'medical_profile',
      seedReviewAnswers: false,
      seedDraftAnswer: false,
      seedMedicalProfileMarketing: true,
    };
  return null;
}

function buildDevScreenshotAnswerPacks(): {
  savedAnswers: Record<string, string>;
  savedAnswerDetails: Record<string, { difficulties: string[]; answerText?: string }>;
} {
  const savedAnswers: Record<string, string> = {};
  const savedAnswerDetails: Record<string, { difficulties: string[]; answerText?: string }> = {};
  for (const q of PIP_QUESTIONS) {
    savedAnswerDetails[q.id] = {
      difficulties: ['Pain', 'Fatigue'],
      answerText: `Example worst-day wording for ${q.shortTitle} — illustrative draft text only.`,
    };
  }
  return { savedAnswers, savedAnswerDetails };
}

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

/** Dev-only: `/?screenshot=medical_profile` — aligns with presets in MedicalProfile.tsx */
const MED_PROFILE_MARKETING: MedProfile = {
  conditions: [
    { name: 'Fibromyalgia', durationNum: '6', durationUnit: 'years' },
    { name: 'Chronic pain', durationNum: '6', durationUnit: 'years' },
    { name: 'Anxiety disorder', durationNum: '4', durationUnit: 'years' },
    { name: 'Depression', durationNum: '4', durationUnit: 'years' },
  ],
  medications: 'Amitriptyline 10mg at night, Sertraline 50mg daily, Ibuprofen 400mg when needed',
  notes: 'Flare-ups are worse in cold, damp weather. I need a rest day after physio or long outings.',
};

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
  descriptorHint: string | null;
  setDescriptorHint: (hint: string | null) => void;
  q1Result: any;
  setQ1Result: (result: any) => void;
  selectedQuestionId: string;
  setSelectedQuestionId: (id: string) => void;
  assistantQuestion: string | null;
  setAssistantQuestion: (q: string | null) => void;
  assistantContext: string | null;
  setAssistantContext: (c: string | null) => void;
  selectedBlogSlug: string | null;
  setSelectedBlogSlug: (slug: string | null) => void;
  emailNotifications: boolean;
  setEmailNotifications: (val: boolean) => void;
  savedAnswers: Record<string, string>;
  saveAnswer: (questionId: string, answer: string) => void;
  getSavedAnswer: (questionId: string) => string | undefined;
  /** Selected difficulty texts + generated answer text, keyed by question ID */
  savedAnswerDetails: Record<string, { difficulties: string[]; answerText?: string }>;
  saveAnswerDetails: (questionId: string, details: { difficulties: string[]; answerText?: string }) => void;
  /** Worksheet answers from the new-claim path (not CoC walkthrough) */
  savedAnswersNewClaim: Record<string, string>;
  savedAnswerDetailsNewClaim: Record<string, { difficulties: string[]; answerText?: string }>;
  /** Worksheet answers updated during Change of circumstances */
  savedAnswersCoC: Record<string, string>;
  savedAnswerDetailsCoC: Record<string, { difficulties: string[]; answerText?: string }>;
  /** Latest Mandatory Reconsideration letter draft for the answer library */
  mrDraftLetter: string;
  setMrDraftLetter: (text: string) => void;
  /** Latest tribunal appeal grounds draft */
  appealDraftReasons: string;
  setAppealDraftReasons: (text: string) => void;
  /** Previous answers extracted from uploaded CoC documents — shown in QuestionWizard step 1 instead of the example answer */
  cocPreviousAnswers: Record<string, string>;
  setCocPreviousAnswers: (answers: Record<string, string>) => void;
  /** When true the question wizard shows "previous answer" framing instead of "example answer" */
  cocMode: boolean;
  setCocMode: (on: boolean) => void;
  /** Which form the user is completing — affects framing throughout the question wizard */
  cocFormType: 'pip2' | 'ar1' | null;
  setCocFormType: (type: 'pip2' | 'ar1' | null) => void;
  /** What was uploaded — affects label and card logic throughout the wizard */
  cocDocumentType: 'pip2_only' | 'pa4_only' | 'both' | 'award_only' | null;
  setCocDocumentType: (type: 'pip2_only' | 'pa4_only' | 'both' | 'award_only' | null) => void;
  /** Assessor observations extracted from PA4 — shown as a secondary card alongside pip2 answers */
  cocAssessorNotes: Record<string, string>;
  setCocAssessorNotes: (notes: Record<string, string>) => void;
  /** Points awarded on the previous decision letter / extraction, per activity (q1–q12); null if unknown */
  cocPreviousPoints: Record<string, number | null>;
  setCocPreviousPoints: (points: Record<string, number | null>) => void;
  /** During CoC, questions counted here when the user saves an answer — avoids treating old saved answers as “done” */
  cocWalkthroughAnsweredIds: Record<string, boolean>;
  resetCocWalkthroughProgress: () => void;
  /** Overall “what got worse” text from Medical Profile on the CoC path — fed into draft prompts */
  cocCircumstancesSummary: string;
  /** Consumes CoC snapshot after Medical Profile save → question hub + coc mode */
  tryFinishCocAfterMedicalSave: () => boolean;
  hasCompletedEligibility: boolean;
  setHasCompletedEligibility: (completed: boolean) => void;
  hasPaid: boolean;
  setHasPaid: (paid: boolean) => void;
  /** True when the signed-in user's email matches admin (env or owner fallback). Used for previews / dashboards. */
  isAdmin: boolean;
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

/** Deep-link targets for /blog and /blog/:slug (SPA has no router — path was ignored before). */
export type BlogPathParse = { type: 'blog' } | { type: 'blog_post'; slug: string } | null;

export function parseBlogPath(): BlogPathParse {
  try {
    let path = window.location.pathname || '/';
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    if (path.toLowerCase() === '/blog') return { type: 'blog' };
    const m = path.match(/^\/blog\/([^/]+)$/i);
    if (m?.[1]) {
      const slug = decodeURIComponent(m[1]);
      if (slug) return { type: 'blog_post', slug };
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Supabase PKCE redirect uses a real `code` query param — avoid substring false positives from URLs like `?promocode=`. */
function readOAuthAuthCodePresent(): boolean {
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.has('code')) return true;
    const rawHash = window.location.hash?.replace(/^#/, '');
    if (rawHash?.includes('=')) {
      const h = new URLSearchParams(rawHash);
      if (h.has('code')) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {

  const [{ devScreenshot, demoAnswers, draftAnswerSeed, cocFlowMarketing }] = useState(() => {
    const shot = readDevScreenshot();
    const draft =
      shot?.seedDraftAnswer
        ? {
            descriptor: 'E',
            points: 4,
            label: 'Needs supervision or assistance',
            text:
              'I need someone with me when I cook because I often forget the hob is on and I cannot stand long enough to finish a meal without pain.',
          }
        : null;

    const cocFlowMarketing =
      shot?.seedCocQuestionFlow === true
        ? {
            cocPreviousAnswers: { q1: COC_MARKET_FLOW_Q1_PREV },
            cocAssessorNotes: { q1: COC_MARKET_FLOW_Q1_PA4 },
          }
        : null;

    return {
      devScreenshot: shot,
      demoAnswers: shot?.seedReviewAnswers ? buildDevScreenshotAnswerPacks() : null,
      draftAnswerSeed: draft,
      cocFlowMarketing,
    };
  });

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
  const initialSessionUser = devScreenshot ? null : getInitialSession();
  // If URL has OAuth `code`, Supabase needs to exchange it — show loading overlay
  const hasAuthCode = readOAuthAuthCodePresent();

  const blogPath = !hasAuthCode ? parseBlogPath() : null;
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    if (devScreenshot) return devScreenshot.screen;
    if (blogPath?.type === 'blog') return 'blog';
    if (blogPath?.type === 'blog_post') return 'blog_post';
    return initialSessionUser && !hasAuthCode ? 'home' : 'landing';
  });
  const [navigationHistory, setNavigationHistory] = useState<Screen[]>([]);
  const [isLoading, setIsLoading] = useState(hasAuthCode);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [user, setUser] = useState<User | null>(() => {
    if (devScreenshot) return { name: 'Jamie', email: 'jamie@example.com', id: 'dev-screenshot' };
    return initialSessionUser
      ? {
          name: initialSessionUser.user_metadata?.name || initialSessionUser.email?.split('@')[0] || '',
          email: initialSessionUser.email || '',
          id: initialSessionUser.id,
        }
      : null;
  });
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
  const emailIsAdmin = (email: string) => email === ADMIN_EMAIL || email === 'daley_cutler@hotmail.co.uk';

  const [hasPaid, setHasPaidState] = useState<boolean>(() => (devScreenshot ? true : loadFromStorage('pippal_paid_cache', false)));

  const [medProfile, setMedProfileState] = useState<MedProfile>(() => {
    if (devScreenshot?.seedMedicalProfileMarketing) return { ...MED_PROFILE_MARKETING };
    return loadFromStorage('pippal_med_profile', {
      conditions: [],
      medications: '',
      notes: '',
    });
  });

  const [badDayMode, setBadDayMode] = useState(false);
  const [descriptorHint, setDescriptorHint] = useState<string | null>(null);
  const [q1Result, setQ1Result] = useState<any>(() => draftAnswerSeed);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('q1');
  const [assistantQuestion, setAssistantQuestion] = useState<string | null>(null);
  const [assistantContext, setAssistantContext] = useState<string | null>(null);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(() =>
    blogPath?.type === 'blog_post' ? blogPath.slug : null,
  );
  const [emailNotifications, setEmailNotificationsState] = useState<boolean>(true);

  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>(() =>
    demoAnswers ? demoAnswers.savedAnswers : loadFromStorage('pippal_answers', {}),
  );

  const [savedAnswerDetails, setSavedAnswerDetails] = useState<Record<string, { difficulties: string[]; answerText?: string }>>(() =>
    demoAnswers ? demoAnswers.savedAnswerDetails : loadFromStorage('pippal_answer_details', {}),
  );

  const [savedAnswersNewClaim, setSavedAnswersNewClaim] = useState<Record<string, string>>(() => {
    if (demoAnswers) return { ...demoAnswers.savedAnswers };
    const bucket = loadFromStorage('pippal_answers_new_claim', {});
    if (Object.keys(bucket).length > 0) return bucket;
    return loadFromStorage('pippal_answers', {});
  });

  const [savedAnswerDetailsNewClaim, setSavedAnswerDetailsNewClaim] = useState<
    Record<string, { difficulties: string[]; answerText?: string }>
  >(() => {
    if (demoAnswers) return { ...demoAnswers.savedAnswerDetails };
    const bucket = loadFromStorage('pippal_answer_details_new_claim', {});
    if (Object.keys(bucket).length > 0) return bucket;
    return loadFromStorage('pippal_answer_details', {});
  });

  const [savedAnswersCoC, setSavedAnswersCoC] = useState<Record<string, string>>(() =>
    loadFromStorage('pippal_answers_coc', {}),
  );

  const [savedAnswerDetailsCoC, setSavedAnswerDetailsCoC] = useState<
    Record<string, { difficulties: string[]; answerText?: string }>
  >(() => loadFromStorage('pippal_answer_details_coc', {}));

  const [mrDraftLetter, setMrDraftLetterState] = useState<string>(() => loadFromStorage('pippal_mr_draft', ''));
  const [appealDraftReasons, setAppealDraftReasonsState] = useState<string>(() =>
    loadFromStorage('pippal_appeal_draft', ''),
  );

  const savedAnswersRef = useRef(savedAnswers);
  savedAnswersRef.current = savedAnswers;
  const savedAnswerDetailsRef = useRef(savedAnswerDetails);
  savedAnswerDetailsRef.current = savedAnswerDetails;

  const [cocPreviousAnswers, setCocPreviousAnswers] = useState<Record<string, string>>(() =>
    cocFlowMarketing ? { ...cocFlowMarketing.cocPreviousAnswers } : {},
  );
  const [cocMode, setCocMode] = useState(() => cocFlowMarketing !== null);
  const [cocFormType, setCocFormType] = useState<'pip2' | 'ar1' | null>(() =>
    cocFlowMarketing ? 'pip2' : null,
  );
  const [cocDocumentType, setCocDocumentType] = useState<
    'pip2_only' | 'pa4_only' | 'both' | 'award_only' | null
  >(() => (cocFlowMarketing ? 'both' : null));
  const [cocAssessorNotes, setCocAssessorNotes] = useState<Record<string, string>>(() =>
    cocFlowMarketing ? { ...cocFlowMarketing.cocAssessorNotes } : {},
  );
  const [cocPreviousPoints, setCocPreviousPoints] = useState<Record<string, number | null>>({});
  const [cocWalkthroughAnsweredIds, setCocWalkthroughAnsweredIds] = useState<Record<string, boolean>>({});
  const [cocCircumstancesSummary, setCocCircumstancesSummary] = useState('');

  const resetCocWalkthroughProgress = useCallback(() => {
    setCocWalkthroughAnsweredIds({});
  }, []);

  const [hasCompletedEligibility, setHasCompletedEligibilityState] =
    useState<boolean>(() => loadFromStorage('pippal_eligibility', false));

  // Persist to localStorage
  useEffect(() => { saveToStorage('pippal_med_profile', medProfile); }, [medProfile]);
  useEffect(() => {
    saveToStorage('pippal_answers', savedAnswers);
  }, [savedAnswers]);
  useEffect(() => {
    saveToStorage('pippal_answer_details', savedAnswerDetails);
  }, [savedAnswerDetails]);
  useEffect(() => {
    saveToStorage('pippal_answers_new_claim', savedAnswersNewClaim);
  }, [savedAnswersNewClaim]);
  useEffect(() => {
    saveToStorage('pippal_answer_details_new_claim', savedAnswerDetailsNewClaim);
  }, [savedAnswerDetailsNewClaim]);
  useEffect(() => {
    saveToStorage('pippal_answers_coc', savedAnswersCoC);
  }, [savedAnswersCoC]);
  useEffect(() => {
    saveToStorage('pippal_answer_details_coc', savedAnswerDetailsCoC);
  }, [savedAnswerDetailsCoC]);
  useEffect(() => {
    saveToStorage('pippal_mr_draft', mrDraftLetter);
  }, [mrDraftLetter]);
  useEffect(() => {
    saveToStorage('pippal_appeal_draft', appealDraftReasons);
  }, [appealDraftReasons]);
  useEffect(() => { saveToStorage('pippal_eligibility', hasCompletedEligibility); }, [hasCompletedEligibility]);
  useEffect(() => { saveToStorage('pippal_paid_cache', hasPaid); }, [hasPaid]);

  useEffect(() => {
    if (devScreenshot) {
      setIsLoading(false);
      return;
    }

    let oauthFailsafe: ReturnType<typeof setTimeout> | undefined;
    const oauthCallbackPending = new URLSearchParams(window.location.search).has('code');
    const clearOAuthFailsafe = () => {
      if (oauthFailsafe !== undefined) {
        clearTimeout(oauthFailsafe);
        oauthFailsafe = undefined;
      }
    };
    if (oauthCallbackPending) {
      oauthFailsafe = setTimeout(() => setIsLoading(false), 25000);
    }

    // Check for promo code in URL on load
    const PROMO_CODES = ['PIPPAL2026', 'PIPPALFRIEND', 'PIPPALVIP'];
    const urlParams = new URLSearchParams(window.location.search);
    const initialPromo = urlParams.get('promo')?.toUpperCase();
    if (initialPromo) {
      if (PROMO_CODES.includes(initialPromo)) {
        // Fixed promo code — grant Pro access
        sessionStorage.setItem('pippal_pending_promo', 'true');
        sessionStorage.setItem('pippal_promo_source', initialPromo);
      } else {
        // Could be an influencer code — store it and check against Supabase after session loads
        sessionStorage.setItem('pippal_promo_source', initialPromo);
        sessionStorage.setItem('pippal_check_influencer', initialPromo);
      }
      window.history.replaceState({}, '', window.location.pathname);
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearOAuthFailsafe();
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
          // Check if there is a pending influencer code to verify against Supabase
          const pendingInfluencer = sessionStorage.getItem('pippal_check_influencer');
          if (pendingInfluencer) {
            sessionStorage.removeItem('pippal_check_influencer');
            try {
              const { data: infCode } = await supabase
                .from('influencer_codes')
                .select('code, active')
                .eq('code', pendingInfluencer)
                .eq('active', true)
                .single();
              if (infCode) {
                setHasPaidState(true);
                try {
                  await supabase.from('profiles').update({ has_paid: true, influencer_source: pendingInfluencer }).eq('id', session.user.id);
                  // Send congrats email to influencer
                  fetch('/api/notify-influencer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ influencerCode: pendingInfluencer }),
                  }).catch(() => undefined);
                } catch { /* Fail silently */ }
              }
            } catch { /* Not a valid influencer code */ }
          }
          const p = parseBlogPath();
          if (p?.type === 'blog') {
            setCurrentScreen('blog');
            setSelectedBlogSlug(null);
          } else if (p?.type === 'blog_post') {
            setCurrentScreen('blog_post');
            setSelectedBlogSlug(p.slug);
          } else {
            setCurrentScreen('home');
          }
        }

        // Always load has_paid status from Supabase — this is the source of truth
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('has_paid')
            .eq('id', session.user.id)
            .single();
          if (profile?.has_paid || emailIsAdmin(session.user.email || '')) {
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

        // Load saved answers from Supabase — restores progress on new device/browser
        try {
          const { data: answerRows } = await supabase
            .from('pip_answers')
            .select('question_id, answer')
            .eq('user_id', session.user.id);
          if (answerRows && answerRows.length > 0) {
            const remoteAnswers = Object.fromEntries(answerRows.map((r: any) => [r.question_id, r.answer]));
            setSavedAnswers(prev => ({ ...remoteAnswers, ...prev })); // local takes priority if both exist
          }
        } catch { /* pip_answers table may not exist yet */ }
      } else {
        setIsLoading(false);
      }
      setIsLoading(false);
    }).catch(() => {
      clearOAuthFailsafe();
      setIsLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Skip if we are in the middle of logging out
      if (localStorage.getItem('pippal_logging_out') === 'true') return;
      // Always clear loading when auth state changes
      clearOAuthFailsafe();
      setIsLoading(false);
      if (session?.user) {
        const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || '';
        const email = session.user.email || '';
        setUser({ name, email, id: session.user.id });
        // Do not reset screen on TOKEN_REFRESHED — only align with URL on sign-in / initial session
        if (event === 'SIGNED_IN') {
          const p = parseBlogPath();
          if (p?.type === 'blog') {
            setCurrentScreen('blog');
            setSelectedBlogSlug(null);
          } else if (p?.type === 'blog_post') {
            setCurrentScreen('blog_post');
            setSelectedBlogSlug(p.slug);
          } else {
            setCurrentScreen('home');
          }
        } else if (event === 'INITIAL_SESSION') {
          const p = parseBlogPath();
          if (p?.type === 'blog') {
            setCurrentScreen('blog');
            setSelectedBlogSlug(null);
          } else if (p?.type === 'blog_post') {
            setCurrentScreen('blog_post');
            setSelectedBlogSlug(p.slug);
          }
        }

        // Always check Supabase for paid status — never trust localStorage alone
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('has_paid')
            .eq('id', session.user.id)
            .single();
          if (profile?.has_paid || emailIsAdmin(session.user.email || '')) {
            setHasPaidState(true);
          } else {
            setHasPaidState(false);
          }
        } catch {
          setHasPaidState(emailIsAdmin(session.user.email || ''));
        }

      } else {
        setUser(null);
        setHasPaidState(false);
      }
    });

    return () => {
      clearOAuthFailsafe();
      subscription.unsubscribe();
    };
  }, [devScreenshot]);

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
    setSavedAnswerDetails({});
    setSavedAnswersNewClaim({});
    setSavedAnswerDetailsNewClaim({});
    setSavedAnswersCoC({});
    setSavedAnswerDetailsCoC({});
    setMrDraftLetterState('');
    setAppealDraftReasonsState('');
    setCocMode(false);
    setCocWalkthroughAnsweredIds({});
    setCocPreviousAnswers({});
    setCocFormType(null);
    setCocDocumentType(null);
    setCocAssessorNotes({});
    setCocPreviousPoints({});
    setCocCircumstancesSummary('');
    setMedProfileState({ conditions: [], medications: '', notes: '' });
    setHasCompletedEligibilityState(false);
    localStorage.removeItem('pippal_med_profile');
    localStorage.removeItem('pippal_answers');
    localStorage.removeItem('pippal_answer_details');
    localStorage.removeItem('pippal_answers_new_claim');
    localStorage.removeItem('pippal_answer_details_new_claim');
    localStorage.removeItem('pippal_answers_coc');
    localStorage.removeItem('pippal_answer_details_coc');
    localStorage.removeItem('pippal_mr_draft');
    localStorage.removeItem('pippal_appeal_draft');
    localStorage.removeItem('pippal_eligibility');
    setCurrentScreen('landing');
    setNavigationHistory([]);
    try {
      sessionStorage.removeItem(COC_POST_MEDICAL_SNAPSHOT_KEY);
      sessionStorage.removeItem(COC_MEDICAL_EXPECTED_KEY);
    } catch {
      /* ignore */
    }
    // Sign out from Supabase then clear flag
    supabase.auth.signOut().finally(() => {
      localStorage.removeItem('pippal_logging_out');
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Also scroll any overflow containers
    document.querySelectorAll('.overflow-y-auto').forEach(el => { el.scrollTop = 0; });
  };

  const navigateTo = (screen: Screen) => {
    if (screen === 'change_of_circumstances') {
      setCocCircumstancesSummary('');
      try {
        sessionStorage.removeItem('coc_flow_step');
        sessionStorage.removeItem('coc_return_step');
        sessionStorage.removeItem('coc_has_original_pip2');
        sessionStorage.removeItem(COC_POST_MEDICAL_SNAPSHOT_KEY);
        sessionStorage.removeItem(COC_MEDICAL_EXPECTED_KEY);
      } catch {
        /* ignore */
      }
    }
    setNavigationHistory((prev) => [...prev, currentScreen]);
    setCurrentScreen(screen);
    scrollToTop();
  };

  const goBack = () => {
    setNavigationHistory((prev) => {
      const newHistory = [...prev];
      const previousScreen = newHistory.pop();
      if (previousScreen) {
        setCurrentScreen(previousScreen);
        scrollToTop();
      }
      return newHistory;
    });
  };

  const tryFinishCocAfterMedicalSave = (): boolean => {
    try {
      const raw = sessionStorage.getItem(COC_POST_MEDICAL_SNAPSHOT_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as CocMedicalSnapshot;
      const session = computeCocSessionFromSnapshot(parsed);
      sessionStorage.removeItem(COC_POST_MEDICAL_SNAPSHOT_KEY);
      sessionStorage.removeItem(COC_MEDICAL_EXPECTED_KEY);
      resetCocWalkthroughProgress();
      setCocMode(true);
      setCocFormType(parsed.formType ?? null);
      setCocDocumentType(session.derivedDocType);
      setCocPreviousAnswers(session.primary);
      setCocPreviousPoints(session.cocPreviousPoints);
      setCocAssessorNotes(session.pa4Answers);
      setCocCircumstancesSummary(parsed.circumstancesChangeSummary?.trim() ?? '');
      setSavedAnswersCoC({ ...savedAnswersRef.current });
      setSavedAnswerDetailsCoC({ ...savedAnswerDetailsRef.current });
      navigateTo('question_index');
      return true;
    } catch {
      return false;
    }
  };

  const saveAnswer = (questionId: string, answer: string) => {
    setSavedAnswers((prev) => {
      const updated = { ...prev, [questionId]: answer };
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          supabase
            .from('pip_answers')
            .upsert(
              {
                user_id: session.user.id,
                question_id: questionId,
                answer,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id,question_id' },
            )
            .then(() => undefined);
        }
      });
      return updated;
    });
    if (cocMode) {
      setSavedAnswersCoC((prev) => ({ ...prev, [questionId]: answer }));
      setCocWalkthroughAnsweredIds((prev) => ({ ...prev, [questionId]: true }));
    } else {
      setSavedAnswersNewClaim((prev) => ({ ...prev, [questionId]: answer }));
    }
  };

  const getSavedAnswer = (questionId: string) => savedAnswers[questionId];

  const saveAnswerDetails = (questionId: string, details: { difficulties: string[]; answerText?: string }) => {
    setSavedAnswerDetails((prev) => ({ ...prev, [questionId]: details }));
    if (cocMode) {
      setSavedAnswerDetailsCoC((prev) => ({ ...prev, [questionId]: details }));
    } else {
      setSavedAnswerDetailsNewClaim((prev) => ({ ...prev, [questionId]: details }));
    }
  };

  const setMrDraftLetter = useCallback((text: string) => {
    setMrDraftLetterState(text);
  }, []);

  const setAppealDraftReasons = useCallback((text: string) => {
    setAppealDraftReasonsState(text);
  }, []);

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
        descriptorHint,
        setDescriptorHint,
        q1Result,
        setQ1Result,
        selectedQuestionId,
        setSelectedQuestionId,
        assistantQuestion,
        setAssistantQuestion,
        assistantContext,
        setAssistantContext,
        selectedBlogSlug,
        setSelectedBlogSlug,
        emailNotifications,
        setEmailNotifications: async (val: boolean) => {
          setEmailNotificationsState(val);
          if (user?.id) {
            await supabase.from('profiles').update({ email_notifications: val }).eq('id', user.id);
          }
        },
        savedAnswers,
        saveAnswer,
        getSavedAnswer,
        savedAnswerDetails,
        saveAnswerDetails,
        savedAnswersNewClaim,
        savedAnswerDetailsNewClaim,
        savedAnswersCoC,
        savedAnswerDetailsCoC,
        mrDraftLetter,
        setMrDraftLetter,
        appealDraftReasons,
        setAppealDraftReasons,
        cocPreviousAnswers,
        setCocPreviousAnswers,
        cocMode,
        setCocMode,
        cocFormType,
        setCocFormType,
        cocDocumentType,
        setCocDocumentType,
        cocAssessorNotes,
        setCocAssessorNotes,
        cocPreviousPoints,
        setCocPreviousPoints,
        cocWalkthroughAnsweredIds,
        resetCocWalkthroughProgress,
        cocCircumstancesSummary,
        tryFinishCocAfterMedicalSave,
        hasCompletedEligibility,
        setHasCompletedEligibility,
        hasPaid,
        setHasPaid,
        isAdmin: !!(user?.email && emailIsAdmin(user.email)),
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