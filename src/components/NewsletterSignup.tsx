import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { supabase } from '../supabaseClient';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const { error } = await supabase.from('email_leads').insert({
        email: email.toLowerCase().trim(),
        source: 'newsletter_landing',
      });
      if (error && error.code !== '23505') throw error;
      localStorage.setItem('pippal_newsletter_email', email.toLowerCase().trim());
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="border-t border-white/10 mt-6 pt-6">
      {status === 'success' ? (
        <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3">
          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">You're on the list</p>
            <p className="text-stone-400 text-xs">Weekly PIP updates every Monday</p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-stone-300 text-sm font-semibold mb-1">Get weekly PIP updates</p>
          <p className="text-stone-500 text-xs mb-3">News, rule changes and tips — free, no spam</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrorMsg(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="your@email.com"
              className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-teal-500 transition-colors min-w-0"
            />
            <button
              onClick={handleSubmit}
              disabled={status === 'loading'}
              className="bg-orange-500 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0 text-sm"
            >
              {status === 'loading' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Join <ArrowRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>
          {errorMsg && <p className="text-rose-400 text-xs mt-2">{errorMsg}</p>}
        </>
      )}
    </div>
  );
}
