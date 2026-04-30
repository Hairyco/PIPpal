import React, { useState } from 'react';
import {
  HeartHandshake,
  ArrowLeft,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAppContext } from './AppContext';
import { supabase } from '../supabaseClient';

type Mode = 'login' | 'signup' | 'forgot';

const PROMO_CODES = ['PIPPAL2026', 'PIPPALFRIEND', 'PIPPALVIP'];

function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  rightElement,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  icon: React.ElementType;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-stone-700">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm bg-white transition-all outline-none
            ${error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
              : 'border-stone-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
            }`}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-rose-600 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export function LoginScreen() {
  const { login, navigateTo, goBack, showToast, setHasPaid } = useAppContext();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({});

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (mode === 'signup' && !name.trim()) newErrors.name = 'Please enter your full name';
    if (!email.trim()) newErrors.email = 'Please enter your email address';
    else if (!validateEmail(email)) newErrors.email = 'Please enter a valid email address';
    if (mode !== 'forgot') {
      if (!password) newErrors.password = 'Please enter your password';
      else if (mode === 'signup' && password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Apply promo code if pending — saves to Supabase immediately
  const applyPromoIfPending = async (userId: string, userEmail: string) => {
    const pendingPromo = sessionStorage.getItem('pippal_pending_promo');
    const urlPromo = new URLSearchParams(window.location.search).get('promo')?.toUpperCase();
    const hasPromo = pendingPromo === 'true' || (urlPromo != null && PROMO_CODES.includes(urlPromo));

    if (hasPromo) {
      setHasPaid(true);
      sessionStorage.removeItem('pippal_pending_promo');
      localStorage.setItem('pippal_paid', 'true');
      localStorage.setItem('pippal_paid_' + userEmail, 'true');
      try {
        await supabase.from('profiles').update({ has_paid: true }).eq('id', userId);
      } catch { /* Fail silently */ }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'https://pippal-alpha.vercel.app' },
      });
      if (error) throw error;
    } catch {
      showToast('Google sign in failed. Please try again.', 'error');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setForgotSent(true);

      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        if (data.user) {
          login({ name, email, id: data.user.id });
          // Check for influencer code FIRST before any other Supabase calls
          const storedPromo = sessionStorage.getItem('pippal_promo_source');
          const checkInfluencer = sessionStorage.getItem('pippal_check_influencer');
          const influencerSource = storedPromo || checkInfluencer || null;
          let isInfluencer = false;
          if (influencerSource) {
            try {
              const { data: infCode } = await supabase
                .from('influencer_codes')
                .select('code')
                .eq('code', influencerSource)
                .eq('active', true)
                .maybeSingle();
              if (infCode) {
                isInfluencer = true;
                sessionStorage.removeItem('pippal_check_influencer');
                // Set Pro in state immediately
                setHasPaid(true);
              }
            } catch { /* Not a valid influencer code */ }
          }
          // Now handle promo codes
          await applyPromoIfPending(data.user.id, email);
          // Save profile updates after a delay to allow trigger to complete
          const userId = data.user?.id;
          if (userId) {
            setTimeout(async () => {
              try {
                const updates: any = {};
                if (influencerSource) updates.influencer_source = influencerSource;
                if (isInfluencer) updates.has_paid = true;
                if (Object.keys(updates).length > 0) {
                  await supabase.from('profiles').update(updates).eq('id', userId);
                }
              } catch { /* Fail silently */ }
            }, 2000);
          }
          showToast('Account created! Welcome to PIPpal.', 'success');
          navigateTo('home');
        }

      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          const displayName = data.user.user_metadata?.name || email.split('@')[0];
          login({ name: displayName, email, id: data.user.id });
          await applyPromoIfPending(data.user.id, email);
          // Load Pro status immediately before navigating
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('has_paid')
              .eq('id', data.user.id)
              .single();
            if (profile?.has_paid) setHasPaid(true);
          } catch { /* Fail silently */ }
          showToast('Welcome back!', 'success');
          navigateTo('home');
        }
      }
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong. Please try again.';
      if (msg.includes('Invalid login credentials')) {
        setErrors({ general: 'Incorrect email or password. Please try again.' });
      } else if (msg.includes('User already registered')) {
        setErrors({ general: 'An account with this email already exists. Try signing in.' });
      } else if (msg.includes('Email not confirmed')) {
        setErrors({ general: 'Please check your email and confirm your account first.' });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setErrors({});
    setForgotSent(false);
  };

  return (
    <div className="flex flex-col min-h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center">
        <button
          onClick={goBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 px-6 md:px-8 pb-12 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-teal-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <HeartHandshake className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">
            {mode === 'login' && 'Welcome back'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h1>
          <p className="text-stone-500 text-sm mt-1 text-center">
            {mode === 'login' && 'Sign in to continue your PIP claim'}
            {mode === 'signup' && 'Start your PIP claim journey today'}
            {mode === 'forgot' && "We'll send a reset link to your email"}
          </p>
        </div>

        {forgotSent ? (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto mb-3" />
            <h3 className="font-semibold text-teal-900 mb-1">Check your inbox</h3>
            <p className="text-sm text-teal-700 mb-4">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <button
              onClick={() => switchMode('login')}
              className="text-sm font-medium text-teal-700 underline underline-offset-2"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            {errors.general && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700">{errors.general}</p>
              </div>
            )}

            {mode !== 'forgot' && (
              <>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-stone-200 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors active:scale-[0.98] shadow-sm disabled:opacity-60"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-stone-200" />
                  <span className="text-xs text-stone-400 font-medium">or</span>
                  <div className="flex-1 h-px bg-stone-200" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {mode === 'signup' && (
                <InputField
                  label="Full name"
                  type="text"
                  value={name}
                  onChange={setName}
                  placeholder="Your full name"
                  error={errors.name}
                  icon={UserIcon}
                />
              )}
              <InputField
                label="Email address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                error={errors.email}
                icon={Mail}
              />
              {mode !== 'forgot' && (
                <InputField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                  error={errors.password}
                  icon={Lock}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              )}

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs text-teal-700 font-medium hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {mode === 'login' && 'Sign in'}
                    {mode === 'signup' && 'Create account'}
                    {mode === 'forgot' && 'Send reset link'}
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-stone-500 mt-6">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => switchMode('signup')} className="font-medium text-teal-700 hover:underline">
                    Sign up free
                  </button>
                </>
              ) : mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button onClick={() => switchMode('login')} className="font-medium text-teal-700 hover:underline">
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Remembered it?{' '}
                  <button onClick={() => switchMode('login')} className="font-medium text-teal-700 hover:underline">
                    Back to sign in
                  </button>
                </>
              )}
            </p>

            {mode === 'signup' && (
              <p className="text-center text-xs text-stone-400 mt-4 leading-relaxed">
                By creating an account you agree to our{' '}
                <button onClick={() => navigateTo('privacy')} className="underline hover:text-stone-600">
                  Privacy Policy
                </button>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}