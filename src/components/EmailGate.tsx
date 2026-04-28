import React, { useState } from 'react';
import { Mail, ArrowRight, X, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { useAppContext } from './AppContext';
import { supabase } from '../supabaseClient';

interface EmailGateProps {
  title: string;
  subtitle: string;
  onContinue: () => void;
  onSkip?: () => void;
}

export function EmailGate({ title, subtitle, onContinue, onSkip }: EmailGateProps) {
  const { user, showToast } = useAppContext();
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, skip the gate
  if (user?.email) {
    onContinue();
    return null;
  }

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      // Save email to a leads table in Supabase
      await supabase.from('email_leads').insert({
        email: email.toLowerCase().trim(),
        source: title,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Fail silently — don't block user
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
      showToast('Your results are ready!', 'success');
      setTimeout(() => onContinue(), 800);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-5">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
          <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto mb-3" />
          <h3 className="font-bold text-stone-900 text-lg mb-1">You're in!</h3>
          <p className="text-stone-500 text-sm">Loading your results…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="bg-teal-700 rounded-t-3xl md:rounded-t-2xl px-6 py-5 text-white relative">
          {onSkip && (
            <button
              onClick={onSkip}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full hover:bg-teal-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-bold text-lg mb-1">{title}</h2>
          <p className="text-teal-100 text-sm">{subtitle}</p>
        </div>

        {/* Form */}
        <div className="p-6">
          <p className="text-sm text-stone-600 mb-4 leading-relaxed">
            Enter your email to see your results and save your progress — we'll also send you helpful PIP tips.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="your@email.com"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-white transition-all outline-none
                  ${error
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                    : 'border-stone-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
                  }`}
              />
            </div>
            {error && (
              <p className="text-xs text-rose-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  See my results
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {onSkip && (
            <button
              onClick={onSkip}
              className="w-full mt-3 text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              Skip for now
            </button>
          )}

          <p className="text-center text-xs text-stone-400 mt-4 leading-relaxed">
            No spam. Unsubscribe any time. We respect your privacy.
          </p>
        </div>
      </div>
    </div>
  );
}