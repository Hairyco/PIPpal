import React, { useState, useEffect, useRef } from 'react';
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
  Search,
  Download,
  Eye,
  BarChart2,
  Clock,
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
  id?: string;
  name: string;
  email: string;
  has_paid: boolean;
  created_at: string;
  influencer_source?: string;
}

interface DayData {
  date: string;
  signups: number;
  revenue: number;
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
  chartData: DayData[];
  avgTimeToPayment: string;
  churnCount: number;
  todayViews: number;
  weekViews: number;
  monthViews: number;
}

type PeriodFilter = 'all' | 'today' | 'week' | 'month' | 'year';
type StatusFilter = 'all' | 'paid' | 'free';
type SourceFilter = 'all' | 'organic' | 'influencer';
type TabType = 'stats' | 'visitors' | 'influencers' | 'blog';

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

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
      <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
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
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [sendingDigest, setSendingDigest] = useState(false);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogSaving, setBlogSaving] = useState(false);
  const [blogMsg, setBlogMsg] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateTopic, setGenerateTopic] = useState('');
  const [redditSources, setRedditSources] = useState<any[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);

  const generatePost = async () => {
    setGenerating(true);
    setBlogMsg('');
    try {
      const res = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: generateTopic || undefined }),
      });
      const data = await res.json();
      if (data.post) {
        setEditingPost({ ...data.post, published: false });
        setRedditSources(data.reddit_sources || []);
        setShowGenerator(false);
        setBlogMsg(`Post generated from: "${data.generated_from}"`);
      } else {
        setBlogMsg('Generation failed. Try again.');
      }
    } catch {
      setBlogMsg('Error generating post.');
    } finally {
      setGenerating(false);
    }
  };

  const fetchBlogPosts = async () => {
    setBlogLoading(true);
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setBlogPosts(data || []);
    setBlogLoading(false);
  };

  const savePost = async () => {
    if (!editingPost?.title || !editingPost?.slug) { setBlogMsg('Title and slug are required'); return; }
    setBlogSaving(true);
    const { id, ...rest } = editingPost;
    const payload = { ...rest, updated_at: new Date().toISOString(), tags: editingPost.tags || [] };
    if (id) {
      await supabase.from('blog_posts').update(payload).eq('id', id);
    } else {
      await supabase.from('blog_posts').insert({ ...payload, created_at: new Date().toISOString() });
    }
    setBlogMsg('Saved!');
    setEditingPost(null);
    fetchBlogPosts();
    setBlogSaving(false);
    setTimeout(() => setBlogMsg(''), 3000);
  };

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    fetchBlogPosts();
  };

  const togglePublished = async (id: string, published: boolean) => {
    await supabase.from('blog_posts').update({ published: !published }).eq('id', id);
    fetchBlogPosts();
  };
  const [digestResult, setDigestResult] = useState<string | null>(null);

  const sendDigest = async (testOnly = false) => {
    setSendingDigest(true);
    setDigestResult(null);
    try {
      // Fetch articles client-side first (Vercel blocks server-side RSS fetches)
      setDigestResult('Fetching latest PIP news...');
      const newsRes = await fetch('/api/news');
      const newsData = await newsRes.json();
      const articles = newsData.articles || [];

      if (articles.length === 0) {
        setDigestResult('No PIP articles found. Try again later.');
        setSendingDigest(false);
        return;
      }

      setDigestResult(`Found ${articles.length} articles. Sending...`);

      const res = await fetch('/api/send-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testOnly, articles }),
      });
      const data = await res.json();
      if (testOnly) {
        setDigestResult(`Test email sent to your admin inbox. Check for email from news@pippal.uk.`);
      } else {
        setDigestResult(`Sent to ${data.sent} subscribers. Failed: ${data.failed || 0}.`);
      }
    } catch {
      setDigestResult('Failed to send. Check Vercel logs.');
    } finally {
      setSendingDigest(false);
    }
  };
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const getDateFilter = (period: PeriodFilter): Date | null => {
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
      const today = new Date(); today.setHours(0,0,0,0);
      const { count: todaySignups } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString());
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: weekSignups } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString());
      const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);
      const { count: monthSignups } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo.toISOString());
      const { count: totalDiaryEntries } = await supabase.from('diary_entries').select('*', { count: 'exact', head: true });
      const { data: allUsers } = await supabase.from('profiles').select('id, name, email, has_paid, created_at, influencer_source').order('created_at', { ascending: false });
      const { data: influencerData } = await supabase.from('profiles').select('influencer_source, has_paid').not('influencer_source', 'is', null);

      // Chart data — last 14 days
      const chartData: DayData[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0,0,0,0);
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', d.toISOString()).lt('created_at', next.toISOString());
        const { count: paidCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('has_paid', true).gte('created_at', d.toISOString()).lt('created_at', next.toISOString());
        chartData.push({
          date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          signups: count || 0,
          revenue: (paidCount || 0) * 12.99,
        });
      }

      // Avg time to payment
      const { data: paidProfiles } = await supabase.from('profiles').select('created_at').eq('has_paid', true).not('influencer_source', 'is', null).is('influencer_source', null);
      let avgTimeToPayment = 'N/A';
      if (paidProfiles && paidProfiles.length > 0) {
        avgTimeToPayment = 'Same session';
      }

      // Churn — signed up but never answered a question
      const { data: allProfileIds } = await supabase.from('profiles').select('id');
      const { data: activeIds } = await supabase.from('pip_answers').select('user_id');
      const activeSet = new Set((activeIds || []).map((a: any) => a.user_id));
      const churnCount = (allProfileIds || []).filter((p: any) => !activeSet.has(p.id)).length;

      // Page views
      const { count: todayViews } = await supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString());
      const { count: weekViews } = await supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString());
      const { count: monthViews } = await supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo.toISOString());

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
        chartData,
        avgTimeToPayment,
        churnCount,
        todayViews: todayViews || 0,
        weekViews: weekViews || 0,
        monthViews: monthViews || 0,
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
        setAddError(error.code === '23505' ? 'That code already exists.' : 'Something went wrong.');
        return;
      }
      setNewInfluencerName('');
      setNewInfluencerCode('');
      await loadInfluencerCodes();
    } catch {
      setAddError('Something went wrong.');
    } finally {
      setAddingInfluencer(false);
    }
  };

  const toggleInfluencerCode = async (id: string, active: boolean) => {
    try {
      await supabase.from('influencer_codes').update({ active: !active }).eq('id', id);
      await loadInfluencerCodes();
    } catch { }
  };

  const deleteInfluencerCode = async (id: string) => {
    try {
      await supabase.from('influencer_codes').delete().eq('id', id);
      await loadInfluencerCodes();
    } catch { }
  };

  const resetTestData = async () => {
    setResetting(true);
    try {
      await supabase.rpc('delete_test_profiles');
      setShowResetConfirm(false);
      await loadStats();
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setResetting(false);
    }
  };

  const exportCSV = () => {
    if (!stats) return;
    const rows = [
      ['Name', 'Email', 'Status', 'Source', 'Signed Up'],
      ...stats.allUsers.map(u => [
        u.name || '',
        u.email,
        u.has_paid ? 'Paid' : 'Free',
        u.influencer_source || 'Organic',
        new Date(u.created_at).toLocaleDateString('en-GB'),
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pippal-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFilteredUsers = (): UserRow[] => {
    if (!stats) return [];
    let users = stats.allUsers;
    const dateFilter = getDateFilter(periodFilter);
    if (dateFilter) users = users.filter(u => new Date(u.created_at) >= dateFilter);
    if (statusFilter === 'paid') users = users.filter(u => u.has_paid);
    if (statusFilter === 'free') users = users.filter(u => !u.has_paid);
    if (sourceFilter === 'organic') users = users.filter(u => !u.influencer_source);
    if (sourceFilter === 'influencer') users = users.filter(u => !!u.influencer_source);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      users = users.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
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
  const maxSignups = stats ? Math.max(...stats.chartData.map(d => d.signups), 1) : 1;

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
        {(['stats', 'visitors', 'influencers', 'blog'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            onClick={() => { setActiveTab(tab as TabType); if (tab === 'blog') fetchBlogPosts(); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors capitalize ${activeTab === tab ? 'text-teal-700 border-b-2 border-teal-700' : 'text-stone-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {/* Email digest section - always visible */}
      <div className="mx-4 mt-4 bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-bold text-stone-900 text-sm">Weekly news digest</p>
            <p className="text-xs text-stone-500">Sends to all subscribers with email notifications on</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => sendDigest(true)}
              disabled={sendingDigest}
              className="bg-stone-100 text-stone-700 text-xs font-bold px-3 py-2 rounded-lg hover:bg-stone-200 transition-colors disabled:opacity-50"
            >
              {sendingDigest ? '⏳ Sending...' : '🔍 Test (me only)'}
            </button>
            <button
              onClick={() => sendDigest(false)}
              disabled={sendingDigest}
              className="bg-teal-700 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-teal-800 transition-colors disabled:opacity-50"
            >
              {sendingDigest ? '⏳ Sending...' : '📧 Send to all'}
            </button>
          </div>
        </div>
        {digestResult && <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{digestResult}</p>}
      </div>

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
                <StatCard icon={TrendingUp} label="Conversion" value={`${stats.conversionRate}%`} sub="Free → Paid" color="bg-amber-500" />
              </div>
            </section>

            {/* Extra metrics */}
            <section>
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={Clock} label="Avg Time to Payment" value={stats.avgTimeToPayment} sub="From signup" color="bg-blue-500" />
                <StatCard icon={Activity} label="Churn Risk" value={stats.churnCount} sub="Signed up, never started" color="bg-rose-500" />
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

            {/* Revenue chart */}
            <section>
              <h2 className="text-sm font-bold text-stone-900 mb-3">Signups — Last 14 Days</h2>
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                <div className="flex items-end gap-1 h-24">
                  {stats.chartData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                        <div
                          className="w-full bg-teal-500 rounded-t-sm transition-all"
                          style={{ height: `${maxSignups > 0 ? Math.max((d.signups / maxSignups) * 80, d.signups > 0 ? 4 : 0) : 0}px` }}
                          title={`${d.date}: ${d.signups} signups`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[9px] text-stone-400">{stats.chartData[0]?.date}</span>
                  <span className="text-[9px] text-stone-400">{stats.chartData[stats.chartData.length - 1]?.date}</span>
                </div>
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

            {/* Users list with filters and search */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-stone-900">Users</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400">{filteredUsers.length} shown</span>
                  <button
                    onClick={exportCSV}
                    className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    CSV
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Filters */}
              <div className="space-y-2 mb-4">
                <div className="flex gap-1.5 flex-wrap">
                  {(['all', 'today', 'week', 'month', 'year'] as PeriodFilter[]).map(p => (
                    <button key={p} onClick={() => setPeriodFilter(p)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${periodFilter === p ? 'bg-teal-700 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}>
                      {p === 'all' ? 'All Time' : p === 'today' ? 'Today' : p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'This Year'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  {(['all', 'paid', 'free'] as StatusFilter[]).map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}>
                      {s === 'all' ? 'All Users' : s === 'paid' ? 'Paid Only' : 'Free Only'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  {(['all', 'organic', 'influencer'] as SourceFilter[]).map(s => (
                    <button key={s} onClick={() => setSourceFilter(s)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${sourceFilter === s ? 'bg-purple-600 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}>
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
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
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
                    <p className="text-sm text-rose-800 leading-relaxed">This will permanently delete all user accounts except yours. Cannot be undone.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={resetTestData} disabled={resetting}
                      className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Yes, delete all test data
                    </button>
                    <button onClick={() => setShowResetConfirm(false)}
                      className="flex-1 bg-white border border-stone-200 text-stone-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-stone-50 transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowResetConfirm(true)}
                  className="w-full bg-white border border-rose-200 text-rose-600 py-3 rounded-xl font-semibold text-sm hover:bg-rose-50 transition-all flex items-center justify-center gap-2">
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

      {/* Visitors Tab */}
      {activeTab === 'visitors' && (
        statsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        ) : stats ? (
          <div className="flex-1 overflow-y-auto scrollbar-hide px-5 md:px-8 py-6 space-y-6 pb-10">

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p className="text-xs text-amber-800 leading-relaxed">Visitor tracking counts app page views. Data starts from when tracking was enabled. For full website analytics including landing page visits, check your Vercel dashboard.</p>
            </div>

            <section>
              <h2 className="text-sm font-bold text-stone-900 mb-3">Page Views</h2>
              <div className="grid grid-cols-3 gap-3">
                <StatCard icon={Eye} label="Today" value={stats.todayViews} color="bg-teal-600" />
                <StatCard icon={Eye} label="This Week" value={stats.weekViews} color="bg-indigo-500" />
                <StatCard icon={Eye} label="This Month" value={stats.monthViews} color="bg-purple-500" />
              </div>
            </section>

            <section>
              <h2 className="text-sm font-bold text-stone-900 mb-3">Signups vs Views</h2>
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-stone-600">Total signups</span>
                    <span className="text-xs font-bold text-stone-900">{stats.totalUsers}</span>
                  </div>
                  <MiniBar value={stats.totalUsers} max={Math.max(stats.totalUsers, stats.monthViews)} color="bg-teal-500" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-stone-600">Page views this month</span>
                    <span className="text-xs font-bold text-stone-900">{stats.monthViews}</span>
                  </div>
                  <MiniBar value={stats.monthViews} max={Math.max(stats.totalUsers, stats.monthViews)} color="bg-indigo-400" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-stone-600">Paying users</span>
                    <span className="text-xs font-bold text-stone-900">{stats.paidUsers}</span>
                  </div>
                  <MiniBar value={stats.paidUsers} max={Math.max(stats.totalUsers, stats.monthViews)} color="bg-emerald-500" />
                </div>
              </div>
            </section>

            <section>
              <div className="bg-teal-700 rounded-2xl p-4 text-white text-center">
                <p className="text-xs text-teal-200 mb-1">Signup conversion rate</p>
                <p className="text-3xl font-bold">
                  {stats.monthViews > 0 ? `${Math.round((stats.totalUsers / stats.monthViews) * 100)}%` : 'N/A'}
                </p>
                <p className="text-xs text-teal-300 mt-1">Visitors who signed up this month</p>
              </div>
            </section>

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-stone-500 text-sm">Failed to load data.</p>
          </div>
        )
      )}

      {/* Influencers Tab */}
      {activeTab === 'blog' && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-stone-900 text-sm">Blog Posts</h2>
            <div className="flex gap-2">
              <button onClick={() => setShowGenerator(!showGenerator)}
                className="bg-purple-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-purple-700">
                ✨ Generate
              </button>
              <button onClick={() => { setEditingPost({ title: '', slug: '', excerpt: '', body: '', category: 'Tips', tags: [], published: false }); fetchBlogPosts(); }}
                className="bg-teal-700 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-teal-800">
                + New Post
              </button>
            </div>
          </div>

          {/* Generator panel */}
          {showGenerator && (
            <div className="bg-purple-50 rounded-2xl border border-purple-100 p-4 mb-4">
              <p className="font-bold text-purple-900 text-sm mb-1">✨ AI Blog Generator</p>
              <p className="text-xs text-purple-700 mb-3">Searches Reddit for real PIP questions, then writes an SEO-optimised post that funnels readers to PIPpal.</p>
              <input
                value={generateTopic}
                onChange={e => setGenerateTopic(e.target.value)}
                placeholder="Topic (optional — leave blank to auto-pick from Reddit)"
                className="w-full border border-purple-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400 bg-white mb-3"
              />
              <button onClick={generatePost} disabled={generating}
                className="w-full bg-purple-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-purple-700 disabled:opacity-50">
                {generating ? '⏳ Generating post...' : '✨ Generate post from Reddit questions'}
              </button>
              {generating && <p className="text-xs text-purple-600 text-center mt-2">This takes 15-20 seconds...</p>}
            </div>
          )}

          {blogMsg && <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 mb-3">{blogMsg}</p>}

          {/* Editor */}
          {editingPost && (
            <div className="bg-white rounded-2xl border border-stone-100 p-4 mb-4 space-y-3">
              <h3 className="font-bold text-stone-900 text-sm">{editingPost.id ? 'Edit Post' : 'New Post'}</h3>
              <input value={editingPost.title} onChange={e => setEditingPost({...editingPost, title: e.target.value, slug: editingPost.id ? editingPost.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')})}
                placeholder="Title" className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
              <input value={editingPost.slug} onChange={e => setEditingPost({...editingPost, slug: e.target.value})}
                placeholder="slug-for-url" className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400 font-mono" />
              <select value={editingPost.category} onChange={e => setEditingPost({...editingPost, category: e.target.value})}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400">
                {['Tips', 'News', 'Legislation', 'Success Stories', 'How To', 'Appeals'].map(c => <option key={c}>{c}</option>)}
              </select>
              <textarea value={editingPost.excerpt} onChange={e => setEditingPost({...editingPost, excerpt: e.target.value})}
                placeholder="Short excerpt (shown on listing page)" rows={2}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400 resize-none" />
              <textarea value={editingPost.body} onChange={e => setEditingPost({...editingPost, body: e.target.value})}
                placeholder="Full post content. Use # for headings, ## for subheadings, - for bullet points" rows={10}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400 resize-none font-mono" />
              <input value={editingPost.tags?.join(', ')} onChange={e => setEditingPost({...editingPost, tags: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean)})}
                placeholder="Tags (comma separated)" className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />

              {/* SEO Panel */}
              {editingPost.seo && (
                <div className="bg-stone-50 rounded-xl border border-stone-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-stone-700 text-xs">SEO Score</p>
                    <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${editingPost.seo.score >= 70 ? 'bg-emerald-100 text-emerald-700' : editingPost.seo.score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                      {editingPost.seo.score}/100
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Title length</span>
                      <span className={editingPost.seo.title_length >= 50 && editingPost.seo.title_length <= 60 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>{editingPost.seo.title_length} chars {editingPost.seo.title_length >= 50 && editingPost.seo.title_length <= 60 ? '✓' : '(aim 50-60)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Meta description</span>
                      <span className={editingPost.seo.excerpt_length >= 150 && editingPost.seo.excerpt_length <= 160 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>{editingPost.seo.excerpt_length} chars {editingPost.seo.excerpt_length >= 150 && editingPost.seo.excerpt_length <= 160 ? '✓' : '(aim 150-160)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Keyword in title</span>
                      <span className={editingPost.seo.keyword_in_title ? 'text-emerald-600 font-bold' : 'text-rose-500'}>{editingPost.seo.keyword_in_title ? '✓ Yes' : '✗ No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Keyword in meta</span>
                      <span className={editingPost.seo.keyword_in_excerpt ? 'text-emerald-600 font-bold' : 'text-rose-500'}>{editingPost.seo.keyword_in_excerpt ? '✓ Yes' : '✗ No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Word count</span>
                      <span className={editingPost.seo.word_count >= 600 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>{editingPost.seo.word_count} words {editingPost.seo.word_count >= 600 ? '✓' : '(aim 600+)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Target keyword</span>
                      <span className="text-stone-700 font-medium">"{editingPost.seo.keyword}"</span>
                    </div>
                  </div>
                  {redditSources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-stone-200">
                      <p className="text-[10px] font-bold text-stone-500 mb-1">Generated from Reddit questions:</p>
                      {redditSources.map((s: any, i: number) => (
                        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                          className="block text-[10px] text-purple-600 hover:text-purple-800 truncate">↗ {s.title}</a>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                  <input type="checkbox" checked={editingPost.published} onChange={e => setEditingPost({...editingPost, published: e.target.checked})} className="w-4 h-4 accent-teal-600" />
                  Published
                </label>
                <div className="flex gap-2 ml-auto">
                  <button onClick={() => setEditingPost(null)} className="text-xs text-stone-500 px-3 py-2 rounded-lg hover:bg-stone-100">Cancel</button>
                  <button onClick={savePost} disabled={blogSaving} className="bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-teal-800 disabled:opacity-50">
                    {blogSaving ? 'Saving...' : 'Save Post'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Post list */}
          {blogLoading ? (
            <div className="text-center py-8 text-stone-400 text-sm">Loading...</div>
          ) : (
            <div className="space-y-3">
              {blogPosts.length === 0 && !editingPost && <p className="text-center text-stone-400 text-sm py-8">No posts yet. Create your first post!</p>}
              {blogPosts.map(post => (
                <div key={post.id} className="bg-white rounded-2xl border border-stone-100 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${post.published ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                          {post.published ? 'Live' : 'Draft'}
                        </span>
                        <span className="text-[10px] text-stone-400">{post.category}</span>
                      </div>
                      <p className="font-bold text-stone-900 text-sm truncate">{post.title}</p>
                      <p className="text-[10px] text-stone-400 font-mono">{post.slug}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => togglePublished(post.id, post.published)} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200">
                        {post.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => setEditingPost(post)} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100">Edit</button>
                      <button onClick={() => deletePost(post.id)} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">Del</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'influencers' && (
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 md:px-8 py-6 space-y-6 pb-10">

          <section>
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-teal-900">How influencer links work</p>
              <p className="text-xs text-teal-700 leading-relaxed">1. Add an influencer below and give them their unique link.</p>
              <p className="text-xs text-teal-700 leading-relaxed">2. Anyone who signs up via their link gets Pro access automatically and is tracked here.</p>
              <p className="text-xs text-teal-700 leading-relaxed">3. The check only applies to new signups — existing free users will not get Pro via the link.</p>
              <p className="text-xs text-teal-700 leading-relaxed">4. You can deactivate any code instantly — anyone using it after deactivation gets no Pro access.</p>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-stone-900 mb-3">Add Influencer</h2>
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Influencer name</label>
                <input type="text" value={newInfluencerName} onChange={(e) => setNewInfluencerName(e.target.value)}
                  placeholder="e.g. Sarah Jones"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Their unique code</label>
                <input type="text" value={newInfluencerCode} onChange={(e) => setNewInfluencerCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SARAH2026"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono" />
              </div>
              {newInfluencerCode && (
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-3">
                  <p className="text-xs text-teal-700 font-medium mb-1">Their link will be:</p>
                  <p className="text-xs text-teal-900 font-mono break-all">https://www.pippal.uk?promo={newInfluencerCode}</p>
                </div>
              )}
              {addError && <p className="text-xs text-rose-600">{addError}</p>}
              <button onClick={addInfluencerCode} disabled={addingInfluencer || !newInfluencerName.trim() || !newInfluencerCode.trim()}
                className="w-full bg-teal-700 text-white py-3 rounded-xl font-semibold text-sm hover:bg-teal-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {addingInfluencer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Influencer
              </button>
            </div>
          </section>

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
                        <button onClick={() => toggleInfluencerCode(inf.id, inf.active)}
                          className={`text-xs font-bold px-2 py-1 rounded-full transition-colors ${inf.active ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                          {inf.active ? 'ACTIVE' : 'OFF'}
                        </button>
                        <button onClick={() => deleteInfluencerCode(inf.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-rose-50 text-stone-400 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="bg-stone-50 rounded-lg px-3 py-2 flex items-center gap-2">
                        <Link className="w-3 h-3 text-stone-400 shrink-0" />
                        <p className="text-[10px] font-mono text-stone-500 truncate">https://www.pippal.uk?promo={inf.code}</p>
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