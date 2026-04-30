import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  CreditCard,
  TrendingUp,
  Calendar,
  Lock,
  Loader2,
  RefreshCw,
  UserCheck,
  UserX,
  Activity,
  Plus,
  Trash2,
  Link,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import { useAppContext } from './AppContext';
import { supabase } from '../supabaseClient';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

interface InfluencerCode {
  id: string;
  name: string;
  code: string;
  active: boolean;
  created_at: string;
}

interface UserRow {
  name: string;
  email: string;
  has_paid: boolean;
  created_at: string;
  influencer_source?: string;
}

interface Stats {
  totalUsers: number;
  paidUsers: number;
  freeUsers: number;
  conversionRate: number;
  todaySignups: number;
  weekSignups: number;
  monthSignups: number;
  totalDiaryEntries: number;
  allUsers: UserRow[];
  influencerStats: { source: string; count: number; paid: number }[];
}

type PeriodFilter = 'all' | 'today' | 'week' | 'month' | 'year';
type StatusFilter = 'all' | 'paid' | 'free';
type SourceFilter = 'all' | 'organic' | 'influencer';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
      <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="text-2xl font-bold text-stone-900 mb-0.5">{value}</div>
      <div className="text-xs font-medium text-stone-500">{label}</div>
      {sub && <div className="text-[10px] text-stone-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export function AdminDashboard() {
  const { user, goBack } = useAppContext();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [influencerCodes, setInfluencerCodes] = useState<InfluencerCode[]>([]);
  const [influencerLoading, setInfluencerLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [newInfluencerName, setNewInfluencerName] = useState('');
  const [newInfluencerCode, setNewInfluencerCode] = useState('');
  const [addingInfluencer, setAddingInfluencer] = useState(false);
  const [addError, setAddError] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'influencers'>('stats');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const getDateFilter = (period: PeriodFilter): Date | null => {
    const now = new Date();
    switch (period) {
      case 'today': { const d = new Date(); d.setHours(0,0,0,0); return d; }
      case 'week': { const d = new Date(); d.setDate(d.getDate() - 7); return d; }
      case 'month': { const d = new Date(); d.setDate(d.getDate() - 30); return d; }
      case 'year': { const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d; }
      default: return null;
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: paidUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('has_paid', true);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const { count: todaySignups } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString());
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: weekSignups } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString());
      const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);
      const { count: monthSignups } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo.toISOString());
      const { count: totalDiaryEntries } = await supabase.from('diary_entries').select('*', { count: 'exact', head: true });
      const { data: allUsers } = await supabase.from('profiles').select('name, email, has_paid, created_at, influencer_source').order('created_at', { ascending: false });
      const { data: influencerData } = await supabase.from('profiles').select('influencer_source, has_paid').not('influencer_source', 'is', null);
      const total = totalUsers || 0;
      const paid = paidUsers || 0;
      setStats({
        totalUsers: total,
        paidUsers: paid,
        freeUsers: total - paid,
        conversionRate: total > 0 ? Math.round((paid / total) * 100) : 0,
        todaySignups: todaySignups || 0,
        weekSignups: weekSignups || 0,
        monthSignups: monthSignups || 0,
        totalDiaryEntries: totalDiaryEntries || 0,
        allUsers: allUsers || [],
        influencerStats: (() => {
          const map: Record<string, { count: number; paid: number }> = {};
          (influencerData || []).forEach((u: any) => {
            if (!u.influencer_source) return;
            if (!map[u.influencer_source]) map[u.influencer_source] = { count: 0, paid: 0 };
            map[u.influencer_source].count++;
            if (u.has_paid) map[u.influencer_source].paid++;
          });
          return Object.entries(map).map(([source, data]) => ({ source, ...data })).sort((a, b) => b.count - a.count);
        })(),
      });
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadInfluencerCodes = async () => {
    setInfluencerLoading(true);
    try {
      const { data, error } = await supabase.from('influencer_codes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setInfluencerCodes(data || []);
    } catch (err) {
      console.error('Failed to load influencer codes:', err);
    } finally {
      setInfluencerLoading(false);
    }
  };

  const addInfluencerCode = async () => {
    if (!newInfluencerName.trim() || !newInfluencerCode.trim()) return;
    setAddingInfluencer(true);
    setAddError('');
    try {
      const { error } = await supabase.from('influencer_codes').insert({
        name: newInfluencerName.trim(),
        code: newInfluencerCode.trim().toUpperCase(),
        active: true,
      });
      if (error) {
        if (error.code === '23505') {
          setAddError('That code already exists. Please use a different code.');
        } else {
          setAddError('Something went wrong. Please try again.');
        }
        return;
      }
      setNewInfluencerName('');
      setNewInfluencerCode('');
      await loadInfluencerCodes();
    } catch {
      setAddError('Something went wrong. Please try again.');
    } finally {
      setAddingInfluencer(false);
    }
  };

  const toggleInfluencerCode = async (id: string, active: boolean) => {
    try {
      await supabase.from('influencer_codes').update({ active: !active }).eq('id', id);
      await loadInfluencerCodes();
    } catch { /* Fail silently */ }
  };

  const deleteInfluencerCode = async (id: string) => {
    try {
      await supabase.from('influencer_codes').delete().eq('id', id);
      await loadInfluencerCodes();
    } catch { /* Fail silently */ }
  };

  const resetTestData = async () => {
    setResetting(true);
    try {
      await supabase.from('profiles').delete().neq('email', ADMIN_EMAIL);
      setShowResetConfirm(false);
      await loadStats();
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setResetting(false);
    }
  };

  const getFilteredUsers = (): UserRow[] => {
    if (!stats) return [];
    let users = stats.allUsers;
    const dateFilter = getDateFilter(periodFilter);
    if (dateFilter) {
      users = users.filter(u => new Date(u.created_at) >= dateFilter);
    }
    if (statusFilter === 'paid') users = users.filter(u => u.has_paid);
    if (statusFilter === 'free') users = users.filter(u => !u.has_paid);
    if (sourceFilter === 'organic') users = users.filter(u => !u.influencer_source);
    if (sourceFilter === 'influencer') users = users.filter(u => !!u.influencer_source);
    return users;
  };

  useEffect(() => {
    if (isAdmin) {
      loadStats();
      loadInfluencerCodes();
    } else {
      setStatsLoading(false);
      setInfluencerLoading(false);
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col h-full bg-stone-50">
        <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
          <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-stone-900 text-lg">Admin</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-stone-400" />
          </div>
          <h2 className="font-bold text-stone-900 text-lg">Access Restricted</h2>
          <p className="text-sm text-stone-500">This area is only accessible to PIPpal administrators.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = getFilteredUsers();

  return (
    <div className="flex flex-col h-full bg-stone-50">

      {/* Header */}
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">Admin Dashboard</h1>
        <button
          onClick={() => { loadStats(); loadInfluencerCodes(); }}
          className="ml-auto w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-stone-100 sticky top-14 z-10">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'stats' ? 'text-teal-700 border-b-2 border-teal-700' : 'text-stone-500'}`}
        >
          Stats
        </button>
        <button
          onClick={() => setActiveTab('influencers')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'influencers' ? 'text-teal-700 border-b-2 border-teal-700' : 'text-stone-500'}`}
        >
          Influencers
        </button>
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        statsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        ) : stats ? (
          <div className="flex-1 overflow-y-auto scrollbar-hide px-5 md:px-8 py-6 space-y-6 pb-10">

            <p className="text-xs text-stone-400 text-right">
              Last updated: {lastRefresh.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </p>

            {/* Overview */}
            <section>
              <h2 className="text-sm font-bold text-stone-900 mb-3">Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-teal-600" />
                <StatCard icon={CreditCard} label="Paid Users" value={stats.paidUsers} sub={`£${(stats.paidUsers * 12.99).toFixed(2)} revenue`} color="bg-emerald-600" />
                <StatCard icon={UserX} label="Free Users" value={stats.freeUsers} color="bg-stone-500" />
                <StatCard icon={TrendingUp} label="Conversion Rate" value={`${stats.conversionRate}%`} sub="Free → Paid" color="bg-amber-500" />
              </div>
            </section>

            {/* New Signups */}
            <section>
              <h2 className="text-sm font-bold text-stone-900 mb-3">New Signups</h2>
              <div className="grid grid-cols-3 gap-3">
                <StatCard icon={Calendar} label="Today" value={stats.todaySignups} color="bg-blue-500" />
                <StatCard icon={Calendar} label="This Week" value={stats.weekSignups} color="bg-indigo-500" />
                <StatCard icon={Calendar} label="This Month" value={stats.monthSignups} color="bg-purple-500" />
              </div>
            </section>

            {/* Engagement */}
            <section>
              <h2 className="text-sm font-bold text-stone-900 mb-3">Engagement</h2>
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={Activity} label="Diary Entries" value={stats.totalDiaryEntries} sub="Total logged" color="bg-rose-500" />
                <StatCard icon={UserCheck} label="Avg Revenue" value={stats.totalUsers > 0 ? `£${((stats.paidUsers * 12.99) / stats.totalUsers).toFixed(2)}` : '£0'} sub="Per user" color="bg-orange-500" />
              </div>
            </section>

            {/* Revenue Summary */}
            <section className="bg-teal-700 rounded-2xl p-5 text-white">
              <h2 className="text-sm font-bold mb-4">Revenue Summary</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">£{(stats.paidUsers * 12.99).toFixed(2)}</div>
                  <div className="text-teal-200 text-xs mt-0.5">Total revenue</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.paidUsers}</div>
                  <div className="text-teal-200 text-xs mt-0.5">Paying customers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.conversionRate}%</div>
                  <div className="text-teal-200 text-xs mt-0.5">Conversion</div>
                </div>
              </div>
            </section>

            {/* Influencer breakdown */}
            {stats.influencerStats.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-stone-900 mb-3">Influencer Signups</h2>
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                  <div className="divide-y divide-stone-100">
                    {stats.influencerStats.map((inf, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-700 text-sm shrink-0">
                          {inf.source.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-900 truncate">{inf.source}</p>
                          <p className="text-xs text-stone-400">{inf.count} signup{inf.count !== 1 ? 's' : ''} · {inf.paid} paid</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          £{(inf.paid * 12.99).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Users list with filters */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-stone-900">Users</h2>
                <span className="text-xs text-stone-400">{filteredUsers.length} shown</span>
              </div>

              {/* Filters */}
              <div className="space-y-2 mb-4">
                {/* Period filter */}
                <div className="flex gap-1.5 flex-wrap">
                  {(['all', 'today', 'week', 'month', 'year'] as PeriodFilter[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setPeriodFilter(p)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${periodFilter === p ? 'bg-teal-700 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}
                    >
                      {p === 'all' ? 'All Time' : p === 'today' ? 'Today' : p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'This Year'}
                    </button>
                  ))}
                </div>
                {/* Status filter */}
                <div className="flex gap-1.5">
                  {(['all', 'paid', 'free'] as StatusFilter[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}
                    >
                      {s === 'all' ? 'All Users' : s === 'paid' ? 'Paid Only' : 'Free Only'}
                    </button>
                  ))}
                </div>
                {/* Source filter */}
                <div className="flex gap-1.5">
                  {(['all', 'organic', 'influencer'] as SourceFilter[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setSourceFilter(s)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${sourceFilter === s ? 'bg-purple-600 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}
                    >
                      {s === 'all' ? 'All Sources' : s === 'organic' ? 'Organic' : 'Influencer'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                {filteredUsers.length === 0 ? (
                  <p className="text-sm text-stone-500 p-4 text-center">No users match these filters</p>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {filteredUsers.map((u, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center font-bold text-teal-700 text-sm shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-900 truncate">{u.name || 'Unknown'}</p>
                          <p className="text-xs text-stone-400 truncate">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {u.influencer_source && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                              {u.influencer_source}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.has_paid ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                            {u.has_paid ? 'PAID' : 'FREE'}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Reset test data */}
            <section>
              <h2 className="text-sm font-bold text-stone-900 mb-3">Danger Zone</h2>
              {showResetConfirm ? (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-800 leading-relaxed">
                      This will permanently delete all user accounts except yours. This cannot be undone. Are you sure?
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={resetTestData}
                      disabled={resetting}
                      className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Yes, delete all test data
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 bg-white border border-stone-200 text-stone-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-stone-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full bg-white border border-rose-200 text-rose-600 py-3 rounded-xl font-semibold text-sm hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Reset test data
                </button>
              )}
            </section>

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-stone-500 text-sm">Failed to load stats. Try refreshing.</p>
          </div>
        )
      )}

      {/* Influencers Tab */}
      {activeTab === 'influencers' && (
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 md:px-8 py-6 space-y-6 pb-10">

          {/* How it works reminder */}
          <section>
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-teal-900">How influencer links work</p>
              <p className="text-xs text-teal-700 leading-relaxed">1. Add an influencer below and give them their unique link.</p>
              <p className="text-xs text-teal-700 leading-relaxed">2. Anyone who signs up via their link gets Pro access automatically and is tracked here.</p>
              <p className="text-xs text-teal-700 leading-relaxed">3. The check only applies to new signups — existing free users will not get Pro via the link.</p>
              <p className="text-xs text-teal-700 leading-relaxed">4. You can deactivate any code instantly — anyone using it after deactivation gets no Pro access.</p>
            </div>
          </section>

          {/* Add new influencer */}
          <section>
            <h2 className="text-sm font-bold text-stone-900 mb-3">Add Influencer</h2>
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Influencer name</label>
                <input
                  type="text"
                  value={newInfluencerName}
                  onChange={(e) => setNewInfluencerName(e.target.value)}
                  placeholder="e.g. Sarah Jones"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Their unique code</label>
                <input
                  type="text"
                  value={newInfluencerCode}
                  onChange={(e) => setNewInfluencerCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SARAH2026"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
                />
              </div>
              {newInfluencerCode && (
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-3">
                  <p className="text-xs text-teal-700 font-medium mb-1">Their link will be:</p>
                  <p className="text-xs text-teal-900 font-mono break-all">https://pippal-alpha.vercel.app?promo={newInfluencerCode}</p>
                </div>
              )}
              {addError && (
                <p className="text-xs text-rose-600">{addError}</p>
              )}
              <button
                onClick={addInfluencerCode}
                disabled={addingInfluencer || !newInfluencerName.trim() || !newInfluencerCode.trim()}
                className="w-full bg-teal-700 text-white py-3 rounded-xl font-semibold text-sm hover:bg-teal-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {addingInfluencer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Influencer
              </button>
            </div>
          </section>

          {/* Influencer list */}
          <section>
            <h2 className="text-sm font-bold text-stone-900 mb-3">Your Influencers</h2>
            {influencerLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
              </div>
            ) : influencerCodes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 text-center">
                <p className="text-sm text-stone-500">No influencers added yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-stone-100">
                  {influencerCodes.map((inf) => (
                    <div key={inf.id} className="px-4 py-3 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-700 text-sm shrink-0">
                          {inf.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-900">{inf.name}</p>
                          <p className="text-xs font-mono text-stone-400">{inf.code}</p>
                        </div>
                        <button
                          onClick={() => toggleInfluencerCode(inf.id, inf.active)}
                          className={`text-xs font-bold px-2 py-1 rounded-full transition-colors ${inf.active ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}
                        >
                          {inf.active ? 'ACTIVE' : 'OFF'}
                        </button>
                        <button
                          onClick={() => deleteInfluencerCode(inf.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-rose-50 text-stone-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="bg-stone-50 rounded-lg px-3 py-2 flex items-center gap-2">
                        <Link className="w-3 h-3 text-stone-400 shrink-0" />
                        <p className="text-[10px] font-mono text-stone-500 truncate">https://pippal-alpha.vercel.app?promo={inf.code}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

        </div>
      )}

    </div>
  );
}