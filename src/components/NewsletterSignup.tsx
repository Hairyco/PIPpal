import React, { useState } from 'react';
import { Mail, Check, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    setStatus('loading');
    setErrorMsg('');

    try {
      // Save to email_leads
      const { error } = await supabase.from('email_leads').insert({
        email: email.toLowerCase().trim(),
        source: 'newsletter_landing',
      });

      if (error && error.code !== '23505') { // ignore duplicate
        throw error;
      }

      // Also save to profiles if they sign up later — store in localStorage
      localStorage.setItem('pippal_newsletter_email', email.toLowerCase().trim());

      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  return (
    <section className="px-5 md:px-8 py-10 bg-teal-700">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <h2 className="font-bold text-white text-xl mb-2">Stay up to date on PIP</h2>
        <p className="text-teal-100 text-sm leading-relaxed mb-6">
          Get a weekly roundup of PIP news, rule changes and tips — written in plain English. No spam, unsubscribe anytime.
        </p>

        {status === 'success' ? (
          <div className="bg-white/20 rounded-2xl p-5 text-center">
            <Check className="w-8 h-8 text-white mx-auto mb-2" />
            <p className="font-bold text-white text-sm">You're in!</p>
            <p className="text-teal-100 text-xs mt-1">Check your inbox every Monday for your PIP digest.</p>
          </div>
        ) : (
          <div className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrorMsg(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="your@email.com"
              className="flex-1 bg-white rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              onClick={handleSubmit}
              disabled={status === 'loading'}
              className="bg-orange-500 text-white px-4 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
            >
              {status === 'loading' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Join <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        )}
        {errorMsg && <p className="text-rose-200 text-xs mt-2">{errorMsg}</p>}
        <p className="text-teal-200 text-[11px] mt-3">Free · No spam · Unsubscribe anytime</p>
      </div>
    </section>
  );
}
