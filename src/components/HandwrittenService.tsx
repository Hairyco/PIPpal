import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock, Zap, PenLine, Mail } from 'lucide-react';
import { useAppContext } from './AppContext';

const TIERS = [
  {
    id: 'standard',
    label: 'Standard',
    price: '£19.99',
    days: '7–10 working days',
    icon: Clock,
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    selected: 'border-teal-600 bg-teal-50 ring-2 ring-teal-400',
  },
  {
    id: 'fasttrack',
    label: 'Fast Track',
    price: '£24.99',
    days: '1–3 working days',
    icon: Zap,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    selected: 'border-amber-500 bg-amber-50 ring-2 ring-amber-400',
    badge: 'Priority',
  },
];

export function HandwrittenService() {
  const { goBack, navigateTo } = useAppContext();
  const [tier, setTier] = useState<'standard' | 'fasttrack'>('standard');
  const [form, setForm] = useState({ name: '', email: '', address: '', postcode: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.address || !form.postcode) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'handwritten_service',
          tier,
          name: form.name,
          email: form.email,
          address: form.address,
          postcode: form.postcode,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError('Something went wrong. Please try again or email support@pippal.uk');
      }
    } catch {
      setError('Something went wrong. Please try again or email support@pippal.uk');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="flex flex-col h-full bg-stone-50">
        <div className="px-5 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
          <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-stone-900 text-base">Handwritten Form Service</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-teal-600" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900 text-xl mb-2">Request received</h2>
            <p className="text-sm text-stone-600 leading-relaxed">We'll be in touch at <strong>{form.email}</strong> within 24 hours to confirm your order and arrange payment.</p>
          </div>
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 w-full text-left space-y-2">
            <p className="text-xs font-bold text-teal-700 uppercase tracking-widest">Your order</p>
            <p className="text-sm font-semibold text-stone-900">{tier === 'fasttrack' ? 'Fast Track — £24.99' : 'Standard — £19.99'}</p>
            <p className="text-xs text-stone-500">{tier === 'fasttrack' ? '1–3 working days' : '7–10 working days'}</p>
          </div>
          <button onClick={() => navigateTo('home')} className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-teal-800 active:scale-[0.98] transition-all">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-stone-900 text-base">Handwritten Form Service</h1>
          <p className="text-xs text-stone-400">We complete and post your PIP2 form for you</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-8">

        {/* Explainer */}
        <div className="bg-teal-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <PenLine className="w-5 h-5 text-teal-300" />
            <h2 className="font-bold text-base">Can't write it out yourself?</h2>
          </div>
          <p className="text-teal-100 text-sm leading-relaxed">
            We take your completed PIPpal answers and write them out onto your official PIP2 form by hand and post the completed form back to you. You then sign it and send it to DWP yourself.
          </p>
        </div>

        {/* What's included */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-2">
          <p className="text-sm font-bold text-stone-900 mb-2">What's included</p>
          {[
            'Your PIPpal answers transferred onto the official PIP2 form',
            'Handwritten clearly in black ink — DWP compliant',
            'Checked for completeness before posting',
            'Posted recorded delivery back to your address',
            'Confirmation email when your form has been posted back to you',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <p className="text-sm text-stone-600">{item}</p>
            </div>
          ))}
        </div>

        {/* Tier picker */}
        <div className="space-y-3">
          <p className="text-sm font-bold text-stone-900">Choose your service</p>
          {TIERS.map(t => (
            <button
              key={t.id}
              onClick={() => setTier(t.id as 'standard' | 'fasttrack')}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-[0.99] ${tier === t.id ? t.selected : `${t.bg} ${t.border}`}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.bg}`}>
                <t.icon className={`w-5 h-5 ${t.color}`} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-stone-900 text-sm">{t.label}</p>
                  {t.badge && <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{t.badge}</span>}
                </div>
                <p className="text-xs text-stone-500">{t.days}</p>
              </div>
              <p className={`font-black text-lg ${t.color}`}>{t.price}</p>
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
          <p className="text-sm font-bold text-stone-900">Your details</p>

          {[
            { label: 'Full name *', key: 'name', placeholder: 'As it appears on your PIP claim' },
            { label: 'Email address *', key: 'email', placeholder: 'We will confirm your order here' },
            { label: 'Postal address *', key: 'address', placeholder: 'Where to send your completed form' },
            { label: 'Postcode *', key: 'postcode', placeholder: 'e.g. SW1A 1AA' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs font-semibold text-stone-600 block mb-1">{field.label}</label>
              <input
                type={field.key === 'email' ? 'email' : 'text'}
                value={form[field.key as keyof typeof form]}
                onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-teal-400 focus:border-teal-400"
              />
            </div>
          ))}

          <div>
            <label className="text-xs font-semibold text-stone-600 block mb-1">Anything else we should know? (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. I have tremors so handwriting is impossible, I need large print..."
              rows={3}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-teal-400 focus:border-teal-400 resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <p className="text-xs text-stone-500 leading-relaxed">
              After submitting we will email you within 24 hours to confirm your order and arrange payment. Payment is taken before we begin your form.
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-teal-700 text-white py-4 rounded-xl font-bold text-base hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : `Request ${tier === 'fasttrack' ? 'Fast Track — £24.99' : 'Standard — £19.99'}`}
        </button>

        <p className="text-xs text-stone-400 text-center pb-4">
          🔒 100% Secure & Confidential · Your answers are only used to complete your form
        </p>
      </div>
    </div>
  );
}
