import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Bell, BellOff } from 'lucide-react';
import { HeartHandshake, Copy, Check, TrendingUp, Users, PoundSterling } from 'lucide-react';

export function InfluencerPortal() {
  const [code, setCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [savingNotif, setSavingNotif] = useState(false);

  const toggleNotifications = async (val: boolean) => {
    setSavingNotif(true);
    await supabase.from('influencer_codes').update({ notify_on_signup: val }).eq('code', code);
    setNotifications(val);
    setSavingNotif(false);
  };

  // Auto-load from URL param - supports ?code=THEIRCODE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('code')?.toUpperCase();
    if (urlCode) {
      setInputCode(urlCode);
      loadData(urlCode);
    }
  }, []);

  // Show unique URL for this influencer
  const getUniquePortalUrl = (c: string) => `https://www.pippal.uk?partner=true&code=${c}`;

  const loadData = async (c: string) => {
    setLoading(true);
    setError('');
    setData(null);

    // Check code exists
    const { data: codeData } = await supabase
      .from('influencer_codes')
      .select('*')
      .eq('code', c.toUpperCase())
      .eq('active', true)
      .single();

    if (!codeData) {
      setError('Code not found or inactive. Check with PIPpal.');
      setLoading(false);
      return;
    }

    // Get signups
    const { data: signups } = await supabase
      .from('profiles')
      .select('id, created_at')
      .eq('influencer_source', c.toUpperCase())
      .eq('has_paid', true);

    const count = signups?.length || 0;
    const revenue = count * 6.99;
    const rate = codeData.commission_rate || 20;
    const commission = revenue * (rate / 100);

    setCode(c.toUpperCase());
    setNotifications(codeData.notify_on_signup !== false);
    setData({
      name: codeData.name,
      code: c.toUpperCase(),
      rate,
      signups: count,
      revenue: revenue.toFixed(2),
      commission: commission.toFixed(2),
      signupList: signups || [],
    });
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(`https://www.pippal.uk?promo=${code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <div className="bg-teal-700 px-5 py-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <HeartHandshake className="w-5 h-5 text-teal-200" />
          <h1 className="font-bold text-white text-lg">PIPpal Partner Portal</h1>
        </div>
        <p className="text-xs text-teal-200">Track your referrals and commission</p>
      </div>

      <div className="flex-1 px-5 py-6 max-w-md mx-auto w-full">
        {/* Admin instructions */}
        <div className="bg-teal-50 rounded-2xl border border-teal-100 p-4 mb-4">
          <p className="font-bold text-teal-900 text-sm mb-2">📋 How to share with influencers</p>
          <div className="space-y-1.5 text-xs text-teal-800">
            <p>1. Create their code in <span className="font-bold">Admin → Influencers tab</span></p>
            <p>2. Send them this URL: <span className="font-mono bg-white px-2 py-0.5 rounded font-bold">pippal.uk?partner=true</span></p>
            <p>3. They enter their unique code to see their stats</p>
            <p>4. Their referral link is: <span className="font-mono bg-white px-2 py-0.5 rounded font-bold">pippal.uk?promo=THEIRCODE</span></p>
            <p>5. PIPpal will ask for UK bank details separately — <span className="font-bold">in private</span> — before paying commission.</p>
          </div>
        </div>

        {/* Code input */}
        {!data && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <p className="font-bold text-stone-900 text-sm mb-1">Enter your partner code</p>
            <p className="text-xs text-stone-500 mb-4">Your unique code was sent to you by PIPpal</p>
            <input
              value={inputCode}
              onChange={e => setInputCode(e.target.value.toUpperCase())}
              placeholder="e.g. SARAH2026"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono mb-3 focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={() => loadData(inputCode)}
              disabled={loading || !inputCode}
              className="w-full bg-teal-700 text-white font-bold py-3 rounded-xl hover:bg-teal-800 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Loading...' : 'View my stats'}
            </button>
            {error && <p className="text-xs text-rose-600 mt-3 text-center">{error}</p>}
          </div>
        )}

        {/* Stats */}
        {data && (
          <div className="space-y-4">
            <div className="bg-teal-700 rounded-2xl p-5 text-center">
              <p className="text-teal-200 text-xs mb-1">Welcome back</p>
              <p className="text-white font-bold text-xl">{data.name}</p>
              <p className="text-teal-300 text-xs font-mono mt-1">{data.code}</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl border border-stone-100 p-4 text-center shadow-sm">
                <Users className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                <p className="font-black text-stone-900 text-xl">{data.signups}</p>
                <p className="text-[10px] text-stone-500">Signups</p>
              </div>
              <div className="bg-white rounded-2xl border border-stone-100 p-4 text-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="font-black text-stone-900 text-xl">£{data.revenue}</p>
                <p className="text-[10px] text-stone-500">Revenue</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4 text-center shadow-sm">
                <PoundSterling className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="font-black text-emerald-700 text-xl">£{data.commission}</p>
                <p className="text-[10px] text-emerald-600">Earned ({data.rate}%)</p>
              </div>
            </div>

            {/* Referral link */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="font-bold text-stone-900 text-sm mb-1">Your referral link</p>
              <p className="text-xs text-stone-500 mb-3">Share this link to earn commission on every signup</p>
              <div className="bg-stone-50 rounded-xl px-3 py-2.5 flex items-center gap-2 mb-3">
                <p className="text-xs text-stone-700 font-mono flex-1 truncate">pippal.uk?promo={data.code}</p>
                <button onClick={copyLink} className="shrink-0">
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-400" />}
                </button>
              </div>
              <p className="text-[10px] text-stone-400">Each signup earns you £{(6.99 * data.rate / 100).toFixed(2)}</p>
            </div>

            {/* Recent signups */}
            {data.signupList.length > 0 && (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                <p className="font-bold text-stone-900 text-sm mb-3">Recent signups</p>
                <div className="space-y-2">
                  {data.signupList.slice(0, 10).map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-stone-50 last:border-0">
                      <span className="text-xs text-stone-600">Signup {i + 1}</span>
                      <span className="text-xs text-stone-400">{new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="text-xs font-bold text-emerald-600">+£{(6.99 * data.rate / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notification settings */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-900 text-sm">Email notifications</p>
                  <p className="text-xs text-stone-400 mt-0.5">Get an email every time someone signs up via your link</p>
                </div>
                <button
                  onClick={() => toggleNotifications(!notifications)}
                  disabled={savingNotif}
                  className={`relative w-11 h-6 rounded-full transition-colors ${notifications ? 'bg-teal-600' : 'bg-stone-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <button onClick={() => { setData(null); setCode(''); setInputCode(''); }}
              className="w-full text-xs text-stone-400 py-2">
              Switch code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
