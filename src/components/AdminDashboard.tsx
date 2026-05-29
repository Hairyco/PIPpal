import React, { useState, useEffect, useRef } from 'react';
import { FULL_ACCESS_PRICE_GBP } from '../constants/pricing';
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
  Scale,
  FileText,
} from 'lucide-react';
import { useAppContext } from './AppContext';
import { supabase } from '../supabaseClient';

interface InfluencerCode {
  id: string;
  name: string;
  code: string;
  active: boolean;
  created_at: string;
  commission_rate: number;
  email: string;
  payout_account_name?: string | null;
  payout_sort_code?: string | null;
  payout_account_number?: string | null;
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
  newClaimCount: number;
  cocCount: number;
  appealCount: number;
}

type PeriodFilter = 'all' | 'today' | 'week' | 'month' | 'year';
type StatusFilter = 'all' | 'paid' | 'free';
type SourceFilter = 'all' | 'organic' | 'influencer';
type TabType = 'stats' | 'visitors' | 'influencers' | 'blog' | 'email';

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
  const { user, goBack, navigateTo, setSelectedBlogSlug, isAdmin, isLoading } = useAppContext();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [influencerCodes, setInfluencerCodes] = useState<InfluencerCode[]>([]);
  const [influencerPayouts, setInfluencerPayouts] = useState<any[]>([]);

  const fetchInfluencerPayouts = async () => {
    // Get all paid profiles with influencer source
    const { data: profiles } = await supabase
      .from('profiles')
      .select('influencer_source, created_at')
      .eq('has_paid', true)
      .not('influencer_source', 'is', null);

    if (!profiles || profiles.length === 0) { setInfluencerPayouts([]); return; }

    // Group by influencer code
    const grouped: Record<string, number> = {};
    profiles.forEach((p: any) => {
      if (p.influencer_source) {
        grouped[p.influencer_source] = (grouped[p.influencer_source] || 0) + 1;
      }
    });

    // Match with influencer codes to get commission rate
    const payouts = Object.entries(grouped).map(([code, count]) => {
      const influencer = influencerCodes.find(ic => ic.code === code);
      const rate = influencer?.commission_rate || 20;
      const gross = count * FULL_ACCESS_PRICE_GBP;
      const commission = gross * (rate / 100);
      return {
        code,
        name: influencer?.name || code,
        email: influencer?.email || '—',
        signups: count,
        gross: gross.toFixed(2),
        rate,
        commission: commission.toFixed(2),
        payout_account_name: influencer?.payout_account_name || '',
        payout_sort_code: influencer?.payout_sort_code || '',
        payout_account_number: influencer?.payout_account_number || '',
      };
    });

    setInfluencerPayouts(payouts.sort((a, b) => b.signups - a.signups));
  };
  const [influencerLoading, setInfluencerLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [newInfluencerName, setNewInfluencerName] = useState('');
  const [newInfluencerCode, setNewInfluencerCode] = useState('');
  const [newInfluencerEmail, setNewInfluencerEmail] = useState('');
  /** Optional — add when they supply BACS details securely */
  const [newPayoutAccountName, setNewPayoutAccountName] = useState('');
  const [newPayoutSortCode, setNewPayoutSortCode] = useState('');
  const [newPayoutAccountNumber, setNewPayoutAccountNumber] = useState('');
  const [newCommissionRate, setNewCommissionRate] = useState('20');
  const [addingInfluencer, setAddingInfluencer] = useState(false);
  const [addError, setAddError] = useState('');
  const [expandedPayoutInfId, setExpandedPayoutInfId] = useState<string | null>(null);
  const [savingPayoutFields, setSavingPayoutFields] = useState(false);
  /** Draft while editing payout row ([id] keyed not needed — single expanding row) */
  const [editPayoutName, setEditPayoutName] = useState('');
  const [editPayoutSort, setEditPayoutSort] = useState('');
  const [editPayoutAcct, setEditPayoutAcct] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [sendingDigest, setSendingDigest] = useState(false);
  const [emailHistory, setEmailHistory] = useState<any[]>([]);
  const [aiCosts, setAiCosts] = useState<{total: number, byUser: any[], thisMonth: number}>({ total: 0, byUser: [], thisMonth: 0 });
  const [anthropicBalance, setAnthropicBalance] = useState<string>(() => localStorage.getItem('anthropic_balance') || '');
  const [editingBalance, setEditingBalance] = useState(false);

  const saveBalance = (val: string) => {
    localStorage.setItem('anthropic_balance', val);
    setAnthropicBalance(val);
    setEditingBalance(false);
  };

  const fetchAiCosts = async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { data } = await supabase
      .from('ai_usage')
      .select('user_id, cost_usd, created_at, model, input_tokens, output_tokens')
      .gte('created_at', monthStart)
      .order('created_at', { ascending: false });
    if (!data) return;
    const total = data.reduce((sum: number, r: any) => sum + (r.cost_usd || 0), 0);
    // Group by user
    const byUser: Record<string, number> = {};
    data.forEach((r: any) => {
      const uid = r.user_id || 'anonymous';
      byUser[uid] = (byUser[uid] || 0) + (r.cost_usd || 0);
    });
    const byUserArr = Object.entries(byUser)
      .map(([uid, cost]) => ({ uid, cost }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10);
    setAiCosts({ total, byUser: byUserArr, thisMonth: total });
  };
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  const fetchSubscriberCount = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .neq('email_notifications', false);
    setSubscriberCount(data?.length || 0);
  };

  const fetchEmailHistory = async () => {
    const { data } = await supabase
      .from('email_sends')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(20);
    setEmailHistory(data || []);
  };
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogSaving, setBlogSaving] = useState(false);
  const [blogNotice, setBlogNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const blogNoticeRef = useRef<HTMLDivElement>(null);
  const blogNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showBlogNotice = (type: 'success' | 'error', text: string, clearMs = 8000) => {
    if (blogNoticeTimerRef.current) clearTimeout(blogNoticeTimerRef.current);
    setBlogNotice({ type, text });
    blogNoticeTimerRef.current = setTimeout(() => setBlogNotice(null), clearMs);
  };

  useEffect(() => {
    if (!blogNotice) return;
    blogNoticeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [blogNotice]);

  useEffect(
    () => () => {
      if (blogNoticeTimerRef.current) clearTimeout(blogNoticeTimerRef.current);
    },
    [],
  );

  const [generating, setGenerating] = useState(false);
  const [generateTopic, setGenerateTopic] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);

  const generatePost = async () => {
    setGenerating(true);
    setBlogNotice(null);
    try {
      const res = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: generateTopic || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showBlogNotice('error', data.error || `Generation failed (${res.status}). Try again.`);
        return;
      }
      if (data.post) {
        setEditingPost({ ...data.post, published: false });
        setShowGenerator(false);
        showBlogNotice('success', `Draft ready — topic: "${data.generated_from}". Review below, then save.`);
      } else {
        showBlogNotice('error', data.error || 'Generation failed. Try again.');
      }
    } catch {
      showBlogNotice('error', 'Error generating post. Check your connection and try again.');
    } finally {
      setGenerating(false);
    }
  };

  const [blogClicks, setBlogClicks] = useState<Record<string, {views: number, ctas: number}>>({});
  const [sendingBlog, setSendingBlog] = useState<string | null>(null);
  const [tiktokScript, setTiktokScript] = useState<{postId: string, script: string} | null>(null);
  const [generatingTiktok, setGeneratingTiktok] = useState<string | null>(null);

  const generateTiktok = async (post: any) => {
    setGeneratingTiktok(post.id);
    setTiktokScript(null);
    try {
      const res = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'tiktok',
          title: post.title,
          excerpt: post.excerpt,
          body: post.body,
          category: post.category,
        }),
      });
      const data = await res.json();
      if (data.script) setTiktokScript({ postId: post.id, script: data.script });
    } catch {
      showBlogNotice('error', 'TikTok script generation failed.');
    } finally {
      setGeneratingTiktok(null);
    }
  };
  const [blogSendResult, setBlogSendResult] = useState<string | null>(null);

  const sendBlogPost = async (post: any, testOnly = false) => {
    setSendingBlog(post.id);
    setBlogSendResult(null);
    try {
      const res = await fetch('/api/send-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post, testOnly }),
      });
      const data = await res.json();
      setBlogSendResult(testOnly ? `Test sent to admin inbox` : `Sent to ${data.sent} subscribers`);
    } catch {
      setBlogSendResult('Send failed');
    } finally {
      setSendingBlog(null);
      setTimeout(() => setBlogSendResult(null), 5000);
    }
  };

  const fetchBlogClicks = async () => {
    const { data } = await supabase.from('blog_clicks').select('slug, type');
    if (!data) return;
    const clicks: Record<string, {views: number, ctas: number}> = {};
    data.forEach((c: any) => {
      if (!clicks[c.slug]) clicks[c.slug] = { views: 0, ctas: 0 };
      if (c.type === 'view') clicks[c.slug].views++;
      if (c.type === 'cta_click') clicks[c.slug].ctas++;
    });
    setBlogClicks(clicks);
  };

  const fetchBlogPosts = async () => {
    setBlogLoading(true);
    // Fetch all posts including drafts for admin
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    console.log('Blog posts fetched:', data?.length, error?.message);
    setBlogPosts(data || []);
    setBlogLoading(false);
  };

  const savePost = async () => {
    if (!editingPost?.title?.trim() || !editingPost?.slug?.trim()) {
      showBlogNotice('error', 'Title and slug are required.');
      return;
    }
    setBlogSaving(true);
    setBlogNotice(null);
    try {
      // Remove seo field — not in DB schema
      const { id, seo, ...rest } = editingPost;
      const payload = {
        title: rest.title.trim(),
        slug: rest.slug.trim(),
        excerpt: rest.excerpt || '',
        body: rest.body || '',
        category: rest.category || 'Tips',
        tags: Array.isArray(rest.tags) ? rest.tags : [],
        published: rest.published || false,
        updated_at: new Date().toISOString(),
      };
      if (id) {
        const { data, error } = await supabase.from('blog_posts').update(payload).eq('id', id).select('id');
        if (error) throw error;
        if (!data?.length) {
          showBlogNotice('error', 'Nothing was updated. Refresh the post list — this draft may be out of date.');
          return;
        }
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert({ ...payload, created_at: new Date().toISOString() })
          .select('id');
        if (error) throw error;
        if (!data?.length) {
          showBlogNotice('error', 'Save did not create a row. Check Supabase RLS and the blog_posts table in the dashboard.');
          return;
        }
      }
      showBlogNotice('success', 'Post saved.');
      setEditingPost(null);
      void fetchBlogPosts();
    } catch (e: any) {
      console.error('savePost', e);
      const msg = e?.message || e?.error_description || String(e);
      showBlogNotice('error', msg ? `Save failed: ${msg}` : 'Save failed. Check your connection and try again.');
    } finally {
      setBlogSaving(false);
    }
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
      // Fetch news articles client-side
      setDigestResult('Fetching latest PIP news...');
      const newsRes = await fetch('/api/news');
      const newsData = await newsRes.json();
      const articles = newsData.articles || [];

      // Fetch 3 published blog posts - rotate by picking different ones each send
      const { data: allBlogs } = await supabase
        .from('blog_posts')
        .select('title, slug, excerpt, category')
        .eq('published', true)
        .order('created_at', { ascending: false });
      // Shuffle and pick 3 so different posts feature each time
      const shuffled = (allBlogs || []).sort(() => Math.random() - 0.5);
      const blogPosts = shuffled.slice(0, 3);

      if (articles.length === 0 && blogPosts.length === 0) {
        setDigestResult('No content found. Try again later.');
        setSendingDigest(false);
        return;
      }

      setDigestResult(`Found ${articles.length} news articles + ${blogPosts.length} blog posts. Sending...`);

      const res = await fetch('/api/send-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testOnly, articles, blogPosts }),
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

      // Chart data — last 14 days (parallel queries so the dashboard loads promptly)
      const chartData: DayData[] = await Promise.all(
        Array.from({ length: 14 }, (_, index) => {
          const dayOffset = 13 - index;
          const d = new Date();
          d.setDate(d.getDate() - dayOffset);
          d.setHours(0, 0, 0, 0);
          const next = new Date(d);
          next.setDate(next.getDate() + 1);
          const from = d.toISOString();
          const to = next.toISOString();
          return Promise.all([
            supabase
              .from('profiles')
              .select('*', { count: 'exact', head: true })
              .gte('created_at', from)
              .lt('created_at', to),
            supabase
              .from('profiles')
              .select('*', { count: 'exact', head: true })
              .eq('has_paid', true)
              .gte('created_at', from)
              .lt('created_at', to),
          ]).then(([signupsRes, paidRes]) => ({
            date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            signups: signupsRes.count || 0,
            revenue: (paidRes.count || 0) * FULL_ACCESS_PRICE_GBP,
          }));
        }),
      );

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

      // Claim completions
      const { count: newClaimCount } = await supabase.from('claim_events').select('*', { count: 'exact', head: true }).eq('event_type', 'new_claim');
      const { count: cocCount } = await supabase.from('claim_events').select('*', { count: 'exact', head: true }).eq('event_type', 'change_of_circumstances');
      const { count: appealCount } = await supabase.from('claim_events').select('*', { count: 'exact', head: true }).eq('event_type', 'appeal');

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
        newClaimCount: newClaimCount || 0,
        cocCount: cocCount || 0,
        appealCount: appealCount || 0,
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
        email: newInfluencerEmail.trim(),
        commission_rate: parseFloat(newCommissionRate) || 20,
        active: true,
        payout_account_name: newPayoutAccountName.trim() || null,
        payout_sort_code: newPayoutSortCode.trim() || null,
        payout_account_number: newPayoutAccountNumber.replace(/\s/g, '').trim() || null,
      });
      if (error) {
        setAddError(error.code === '23505' ? 'That code already exists.' : 'Something went wrong.');
        return;
      }
      setNewInfluencerName('');
      setNewInfluencerCode('');
      setNewInfluencerEmail('');
      setNewPayoutAccountName('');
      setNewPayoutSortCode('');
      setNewPayoutAccountNumber('');
      setNewCommissionRate('20');
      await loadInfluencerCodes();
    } catch {
      setAddError('Something went wrong.');
    } finally {
      setAddingInfluencer(false);
    }
  };

  const togglePayoutEdit = (inf: InfluencerCode) => {
    if (expandedPayoutInfId === inf.id) {
      setExpandedPayoutInfId(null);
      return;
    }
    setExpandedPayoutInfId(inf.id);
    setEditPayoutName(inf.payout_account_name?.trim() || '');
    setEditPayoutSort(inf.payout_sort_code?.trim() || '');
    setEditPayoutAcct(inf.payout_account_number?.trim() || '');
  };

  const saveInfluencerPayoutFields = async (id: string) => {
    setSavingPayoutFields(true);
    try {
      await supabase.from('influencer_codes').update({
        payout_account_name: editPayoutName.trim() || null,
        payout_sort_code: editPayoutSort.trim() || null,
        payout_account_number: editPayoutAcct.replace(/\s/g, '').trim() || null,
      }).eq('id', id);
      await loadInfluencerCodes();
      setExpandedPayoutInfId(null);
    } catch {
      /* ignore */
    } finally {
      setSavingPayoutFields(false);
    }
  };

  const influencerPayoutComplete = (inf: InfluencerCode) =>
    !!(inf.payout_account_name?.trim() && inf.payout_sort_code?.trim() && inf.payout_account_number?.trim());

  const toggleInfluencerCode = async (id: string, active: boolean) => {
    try {
      await supabase.from('influencer_codes').update({ active: !active }).eq('id', id);
      await loadInfluencerCodes();
    } catch {
      void 0;
    }
  };

  const deleteInfluencerCode = async (id: string) => {
    try {
      await supabase.from('influencer_codes').delete().eq('id', id);
      await loadInfluencerCodes();
    } catch {
      void 0;
    }
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
  }, [isAdmin, user?.email]);

  if (isLoading || (user && !user.email)) {
    return (
      <div className="flex flex-col h-full bg-stone-50 items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

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
        {(['stats', 'visitors', 'blog', 'email', 'influencers'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab as TabType); if (tab === 'blog') { fetchBlogPosts(); fetchBlogClicks(); } if (tab === 'email') { fetchEmailHistory(); fetchSubscriberCount(); } if (tab === 'stats') fetchAiCosts(); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors capitalize ${activeTab === tab ? 'text-teal-700 border-b-2 border-teal-700' : 'text-stone-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats Tab */}


      {activeTab === 'stats' && (
        statsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        ) : stats ? (
          <div className="flex-1 overflow-y-auto scrollbar-hide px-5 md:px-8 py-6 space-y-6 pb-10">

            {/* AI Cost vs Revenue */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-stone-900 text-sm">AI Cost vs Revenue — This Month</h2>
                <button onClick={fetchAiCosts} className="text-xs text-teal-700 font-bold">Refresh</button>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-teal-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-teal-700">£{((stats?.paidUsers || 0) * FULL_ACCESS_PRICE_GBP).toFixed(2)}</p>
                  <p className="text-[10px] text-teal-600 font-medium">Revenue</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center cursor-pointer" onClick={() => setEditingBalance(true)}>
                  {editingBalance ? (
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={anthropicBalance}
                      autoFocus
                      onBlur={e => saveBalance(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveBalance((e.target as HTMLInputElement).value)}
                      className="w-full text-center text-sm font-black text-purple-700 bg-transparent border-b border-purple-300 outline-none"
                    />
                  ) : (
                    <p className="text-lg font-black text-purple-700">{anthropicBalance ? `$${parseFloat(anthropicBalance).toFixed(2)}` : '—'}</p>
                  )}
                  <p className="text-[10px] text-purple-500 font-medium">API Credits</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-rose-600">£{(aiCosts.thisMonth * 0.79).toFixed(4)}</p>
                  <p className="text-[10px] text-rose-500 font-medium">AI Cost (GBP)</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-emerald-700">
                    {aiCosts.thisMonth > 0 ? `${((((stats?.paidUsers || 0) * FULL_ACCESS_PRICE_GBP) / (aiCosts.thisMonth * 0.79)) * 100).toFixed(0)}%` : '—'}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-medium">Margin</p>
                </div>
              </div>
              {aiCosts.byUser.length > 0 ? (
                <div>
                  <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Top AI users this month</p>
                  <div className="space-y-1.5">
                    {aiCosts.byUser.map((u: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] text-stone-400 w-4">{i + 1}.</span>
                        <span className="text-[10px] text-stone-600 flex-1 truncate font-mono">{u.uid === 'anonymous' ? 'Anonymous' : u.uid.slice(0, 8) + '...'}</span>
                        <span className="text-[10px] font-bold text-rose-600">£{(u.cost * 0.79).toFixed(5)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-400 text-center py-2">No AI usage tracked yet — data appears as users chat</p>
              )}
            </div>

            <p className="text-xs text-stone-400 text-right">
              Last updated: {lastRefresh.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </p>

            {/* Overview */}
            <section>
              <h2 className="text-sm font-bold text-stone-900 mb-3">Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-teal-600" />
                <StatCard icon={CreditCard} label="Paid Users" value={stats.paidUsers} sub={`£${(stats.paidUsers * FULL_ACCESS_PRICE_GBP).toFixed(2)} revenue`} color="bg-emerald-600" />
                <StatCard icon={UserX} label="Free Users" value={stats.freeUsers} color="bg-stone-500" />
                <StatCard icon={TrendingUp} label="Conversion" value={`${stats.conversionRate}%`} sub="Free → Paid" color="bg-amber-500" />
              </div>
            </section>

            {/* Claim completions */}
            <section>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Claim completions</h3>
              <div className="grid grid-cols-3 gap-3">
                <StatCard icon={FileText} label="New Claims" value={stats.newClaimCount} sub="All 12 answered" color="bg-teal-600" />
                <StatCard icon={RefreshCw} label="Change of Circ." value={stats.cocCount} sub="CoC completed" color="bg-purple-600" />
                <StatCard icon={Scale} label="Appeals" value={stats.appealCount} sub="Appeal started" color="bg-rose-500" />
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
                  <div className="text-2xl font-bold">£{(stats.paidUsers * FULL_ACCESS_PRICE_GBP).toFixed(2)}</div>
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
                          £{(inf.paid * FULL_ACCESS_PRICE_GBP).toFixed(2)}
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

            {/* AI Cost vs Revenue */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-stone-900 text-sm">AI Cost vs Revenue — This Month</h2>
                <button onClick={fetchAiCosts} className="text-xs text-teal-700 font-bold">Refresh</button>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-teal-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-teal-700">£{((stats?.paidUsers || 0) * FULL_ACCESS_PRICE_GBP).toFixed(2)}</p>
                  <p className="text-[10px] text-teal-600 font-medium">Revenue</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center cursor-pointer" onClick={() => setEditingBalance(true)}>
                  {editingBalance ? (
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={anthropicBalance}
                      autoFocus
                      onBlur={e => saveBalance(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveBalance((e.target as HTMLInputElement).value)}
                      className="w-full text-center text-sm font-black text-purple-700 bg-transparent border-b border-purple-300 outline-none"
                    />
                  ) : (
                    <p className="text-lg font-black text-purple-700">{anthropicBalance ? `$${parseFloat(anthropicBalance).toFixed(2)}` : '—'}</p>
                  )}
                  <p className="text-[10px] text-purple-500 font-medium">API Credits</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-rose-600">£{(aiCosts.thisMonth * 0.79).toFixed(4)}</p>
                  <p className="text-[10px] text-rose-500 font-medium">AI Cost (GBP)</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-emerald-700">
                    {aiCosts.thisMonth > 0 ? `${((((stats?.paidUsers || 0) * FULL_ACCESS_PRICE_GBP) / (aiCosts.thisMonth * 0.79)) * 100).toFixed(0)}%` : '—'}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-medium">Margin</p>
                </div>
              </div>
              {aiCosts.byUser.length > 0 ? (
                <div>
                  <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Top AI users this month</p>
                  <div className="space-y-1.5">
                    {aiCosts.byUser.map((u: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] text-stone-400 w-4">{i + 1}.</span>
                        <span className="text-[10px] text-stone-600 flex-1 truncate font-mono">{u.uid === 'anonymous' ? 'Anonymous' : u.uid.slice(0, 8) + '...'}</span>
                        <span className="text-[10px] font-bold text-rose-600">£{(u.cost * 0.79).toFixed(5)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-400 text-center py-2">No AI usage tracked yet — data appears as users chat</p>
              )}
            </div>

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

          <div className="bg-teal-50 border border-teal-100 rounded-2xl px-3 py-2.5 mb-4">
            <p className="text-[11px] text-teal-900 leading-relaxed">
              <span className="font-bold">Daily drafts:</span> Vercel runs <code className="text-[10px] bg-white/70 px-1 rounded">/api/blog-daily</code> once per day (07:00 UTC). It picks a topic you have not used recently, generates a draft with Claude, and saves it unpublished (tag <code className="text-[10px] bg-white/70 px-1 rounded">daily-cron</code>). Requires <code className="text-[10px] bg-white/70 px-1 rounded">CRON_SECRET</code>, <code className="text-[10px] bg-white/70 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>, and <code className="text-[10px] bg-white/70 px-1 rounded">ANTHROPIC_API_KEY</code> in production.
            </p>
          </div>

          {/* Generator panel */}
          {showGenerator && (
            <div className="bg-purple-50 rounded-2xl border border-purple-100 p-4 mb-4">
              <p className="font-bold text-purple-900 text-sm mb-1">AI blog generator</p>
              <p className="text-xs text-purple-700 mb-3">Writes an SEO-oriented draft from common PIP claimant topics. Edit before publishing.</p>
              <input
                value={generateTopic}
                onChange={e => setGenerateTopic(e.target.value)}
                placeholder="Topic (optional — leave blank to auto-pick a PIP topic)"
                className="w-full border border-purple-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400 bg-white mb-3"
              />
              <button onClick={generatePost} disabled={generating}
                className="w-full bg-purple-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-purple-700 disabled:opacity-50 active:scale-[0.98] transition-transform">
                {generating ? 'Generating…' : 'Generate draft'}
              </button>
              {generating && <p className="text-xs text-purple-600 text-center mt-2">This usually takes 15–20 seconds.</p>}
            </div>
          )}

          {blogNotice && (
            <div
              ref={blogNoticeRef}
              role="alert"
              className={`text-xs rounded-xl px-3 py-2.5 mb-3 border ${
                blogNotice.type === 'error'
                  ? 'text-rose-800 bg-rose-50 border-rose-100'
                  : 'text-emerald-800 bg-emerald-50 border-emerald-100'
              }`}
            >
              {blogNotice.text}
            </div>
          )}
          {blogSendResult && <p className="text-xs text-orange-700 bg-orange-50 rounded-lg px-3 py-2 mb-3">📧 {blogSendResult}</p>}

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

          {/* TikTok script viewer */}
          {tiktokScript && (
            <div className="bg-gradient-to-br from-pink-900 to-purple-900 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎬</span>
                  <p className="font-bold text-white text-sm">TikTok Script</p>
                  <span className="text-[10px] text-pink-300 bg-white/10 px-2 py-0.5 rounded-full">~60 seconds</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { navigator.clipboard?.writeText(tiktokScript.script); showBlogNotice('success', 'Script copied to clipboard.'); }}
                    className="text-[10px] font-bold bg-white/20 text-white px-3 py-1.5 rounded-lg hover:bg-white/30"
                  >📋 Copy</button>
                  <button onClick={() => setTiktokScript(null)} className="text-[10px] text-pink-300 hover:text-white">✕</button>
                </div>
              </div>
              <div className="bg-black/30 rounded-xl p-3 max-h-64 overflow-y-auto">
                <pre className="text-xs text-pink-100 leading-relaxed whitespace-pre-wrap font-sans">{tiktokScript.script}</pre>
              </div>
              <p className="text-[10px] text-pink-300 mt-2">Tip: Record on your phone speaking directly to camera. Keep energy high and pace fast.</p>
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
                      {blogClicks[post.slug] && (
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] text-stone-400">👁 {blogClicks[post.slug].views} views</span>
                          <span className="text-[10px] text-orange-500">→ {blogClicks[post.slug].ctas} CTA clicks</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                      <button onClick={() => togglePublished(post.id, post.published)} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200">
                        {post.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => setEditingPost(post)} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100">Edit</button>
                      <button onClick={() => { setSelectedBlogSlug(post.slug); navigateTo('blog_post'); }} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-stone-50 text-stone-600 hover:bg-stone-100">View</button>
                      <button onClick={async () => { try { await navigator.share({ title: post.title, text: post.excerpt, url: `https://www.pippal.uk` }); } catch { navigator.clipboard?.writeText(`https://www.pippal.uk`); } }} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">Share</button>
                      <button onClick={() => generateTiktok(post)} disabled={generatingTiktok === post.id} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 disabled:opacity-50">
                        {generatingTiktok === post.id ? '⏳' : '🎬 TikTok'}
                      </button>
                      <button onClick={() => sendBlogPost(post, true)} disabled={sendingBlog === post.id} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 disabled:opacity-50">
                        {sendingBlog === post.id ? '⏳' : '📧 Test'}
                      </button>
                      <button onClick={() => { if(confirm(`Send "${post.title}" to ${subscriberCount ?? 'all'} subscribers?`)) sendBlogPost(post, false); }} disabled={sendingBlog === post.id} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50">
                        {sendingBlog === post.id ? '⏳' : `📨 Send all${subscriberCount ? ` (${subscriberCount})` : ''}`}
                      </button>
                      <button onClick={() => deletePost(post.id)} className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">Del</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'email' && (
        <div className="px-4 py-4 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-stone-900 text-sm">Weekly news digest</p>
              {subscriberCount !== null && (
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
                  {subscriberCount} subscribers
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mb-3">Sends to all subscribers with email notifications on. Test first before sending to all.</p>
            <div className="flex gap-2">
              <button onClick={() => sendDigest(true)} disabled={sendingDigest}
                className="flex-1 bg-stone-100 text-stone-700 text-xs font-bold px-3 py-2.5 rounded-lg hover:bg-stone-200 transition-colors disabled:opacity-50">
                {sendingDigest ? '⏳ Sending...' : '🔍 Test (me only)'}
              </button>
              <button onClick={() => sendDigest(false)} disabled={sendingDigest}
                className="flex-1 bg-teal-700 text-white text-xs font-bold px-3 py-2.5 rounded-lg hover:bg-teal-800 transition-colors disabled:opacity-50">
                {sendingDigest ? '⏳ Sending...' : '📧 Send to all'}
              </button>
            </div>
            {digestResult && <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 mt-3">{digestResult}</p>}
          </div>

          {/* Send history */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-stone-900 text-sm">Send history</p>
              <button onClick={fetchEmailHistory} className="text-xs text-teal-700 font-bold hover:text-teal-800">Refresh</button>
            </div>
            {emailHistory.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-4">No sends yet — history will appear here</p>
            ) : (
              <div className="space-y-2">
                {emailHistory.map((send: any) => (
                  <div key={send.id} className="flex items-center gap-3 py-2 border-b border-stone-50 last:border-0">
                    <span className="text-lg">{send.type === 'digest' ? '📰' : '📖'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-700 truncate">{send.subject}</p>
                      <p className="text-[10px] text-stone-400">
                        {new Date(send.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full shrink-0">
                      {send.recipient_count} sent
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'influencers' && (
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 md:px-8 py-6 space-y-6 pb-10">

          {/* Partner Portal Info */}
          <section>
            <div className="bg-purple-50 rounded-2xl border border-purple-100 p-4">
              <p className="font-bold text-purple-900 text-sm mb-2">🔗 Influencer onboarding</p>
              <div className="space-y-1.5 text-xs text-purple-800">
                <p className="font-semibold text-purple-900">1. Links to send them</p>
                <div className="bg-white rounded-xl p-3 space-y-2 font-mono text-[11px]">
                  <p><span className="text-purple-500 font-sans font-bold">Their referral link:</span><br/>pippal.uk?promo=<span className="text-purple-700">THEIRCODE</span></p>
                  <p><span className="text-purple-500 font-sans font-bold">Their stats portal:</span><br/>pippal.uk?partner=true&code=<span className="text-purple-700">THEIRCODE</span></p>
                </div>
                <p className="text-[10px] text-purple-600 leading-relaxed">Replace THEIRCODE with their actual code — the portal link skips manual entry.</p>
                <div className="pt-2 border-t border-purple-100 mt-3">
                  <p className="font-semibold text-purple-900 mb-1">2. Ask for payout (BACS) details</p>
                  <p className="text-[11px] text-purple-800 leading-relaxed">
                    When you onboard them (same message/email as their links), ask them to send their <strong className="text-purple-900">UK bank details</strong>{' '}
                    for commissions: account holder name <strong>exactly</strong> as on the statement, sort code (6 digits), and account number (8 digits).
                    Prefer <strong className="text-purple-900">private channels</strong> (email/DM — not comments or screenshots in public chats).
                  </p>
                  <p className="text-[11px] text-purple-700 mt-1.5">
                    Record details in <span className="font-bold">Add influencer</span> below (if you already have them) or tap <strong className="text-purple-900">Payout bank</strong> beside their row after they reply — they&apos;re stored only here for when you settle commission.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Commission Payout Report */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-stone-900 text-base">Commission Report</h2>
              <button onClick={fetchInfluencerPayouts} className="text-xs text-teal-700 font-bold hover:text-teal-800">Refresh</button>
            </div>
            {influencerPayouts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-100 p-4 text-center">
                <p className="text-sm text-stone-400">No paid referrals yet — commission will appear here when influencers drive signups</p>
                <button onClick={fetchInfluencerPayouts} className="mt-3 text-xs text-teal-700 font-bold">Load report</button>
              </div>
            ) : (
              <div className="space-y-3">
                {influencerPayouts.map((p: any) => (
                  <div key={p.code} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-stone-900 text-sm">{p.name}</p>
                        <p className="text-[10px] text-stone-400 font-mono">{p.code} · {p.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-emerald-600 text-lg">£{p.commission}</p>
                        <p className="text-[10px] text-stone-400">owed ({p.rate}% of £{p.gross})</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-2 border-t border-stone-50">
                      <span className="text-xs text-stone-600"><span className="font-bold text-stone-900">{p.signups}</span> paid signups</span>
                      <span className="text-xs text-stone-600">Revenue: <span className="font-bold text-stone-900">£{p.gross}</span></span>
                      <span className="text-xs text-stone-600">Rate: <span className="font-bold text-stone-900">{p.rate}%</span></span>
                    </div>
                    {(p.payout_account_name || p.payout_sort_code || p.payout_account_number) ? (
                      <div className="mt-3 pt-3 border-t border-dashed border-stone-100 bg-emerald-50/60 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-wide mb-1">BACS (for payouts)</p>
                        <p className="text-xs text-stone-800 font-medium">{p.payout_account_name || '—'}</p>
                        <p className="text-xs font-mono text-stone-700 mt-0.5">
                          Sort {p.payout_sort_code || '—'} · Acct {p.payout_account_number || '—'}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 pt-3 border-t border-dashed border-amber-100 bg-amber-50/80 rounded-xl px-3 py-2">
                        <p className="text-[11px] text-amber-900"><strong>No bank details on file</strong> — add under Your Influencers → Payout bank for this code.</p>
                      </div>
                    )}
                  </div>
                ))}
                <div className="bg-stone-900 rounded-2xl p-4 text-center">
                  <p className="text-white font-bold">Total commission owed: £{influencerPayouts.reduce((s: number, p: any) => s + parseFloat(p.commission), 0).toFixed(2)}</p>
                </div>
              </div>
            )}
          </section>

          <section>
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-teal-900">How influencer links work</p>
              <p className="text-xs text-teal-700 leading-relaxed">1. Add an influencer and send them both links plus a request for BACS details (see purple box).</p>
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
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Their email</label>
                <input type="email" value={newInfluencerEmail} onChange={(e) => setNewInfluencerEmail(e.target.value)}
                  placeholder="e.g. sarah@example.com"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50/90 p-3 space-y-2">
                <p className="text-xs font-semibold text-stone-800">UK bank details (BACS)</p>
                <p className="text-[10px] text-stone-500 leading-relaxed">
                  Ask them privately when you send their links — or leave blank and add later via <strong className="text-stone-700">Payout bank</strong> on their row.
                </p>
                <input
                  type="text"
                  autoComplete="off"
                  value={newPayoutAccountName}
                  onChange={(e) => setNewPayoutAccountName(e.target.value)}
                  placeholder="Account holder name (as on statement)"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={newPayoutSortCode}
                    onChange={(e) => setNewPayoutSortCode(e.target.value)}
                    placeholder="Sort code"
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={newPayoutAccountNumber}
                    onChange={(e) => setNewPayoutAccountNumber(e.target.value)}
                    placeholder="Account no."
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 mb-1 block">Commission rate (%)</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={newCommissionRate} onChange={(e) => setNewCommissionRate(e.target.value)}
                    min="1" max="50" step="1"
                    className="w-24 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                  <span className="text-xs text-stone-500">% of £{FULL_ACCESS_PRICE_GBP.toFixed(2)} = <span className="font-bold text-emerald-600">£{((parseFloat(newCommissionRate || '0') / 100) * FULL_ACCESS_PRICE_GBP).toFixed(2)}</span> per signup</span>
                </div>
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
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${influencerPayoutComplete(inf) ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}
                        >
                          {influencerPayoutComplete(inf) ? 'BACS on file' : 'Bank details missing'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePayoutEdit(inf)}
                          className="text-[10px] font-bold text-teal-700 hover:text-teal-900"
                        >
                          {expandedPayoutInfId === inf.id ? 'Close' : 'Payout bank'}
                        </button>
                      </div>
                      {expandedPayoutInfId === inf.id && (
                        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3 space-y-2">
                          <p className="text-[10px] text-stone-600">Sensitive — avoid sharing screenshots; keep DB access restricted.</p>
                          <input
                            type="text"
                            autoComplete="off"
                            value={editPayoutName}
                            onChange={(e) => setEditPayoutName(e.target.value)}
                            placeholder="Account holder name"
                            className="w-full border border-stone-200 rounded-lg px-2.5 py-2 text-xs bg-white"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="off"
                              value={editPayoutSort}
                              onChange={(e) => setEditPayoutSort(e.target.value)}
                              placeholder="Sort code"
                              className="border border-stone-200 rounded-lg px-2.5 py-2 text-xs font-mono bg-white"
                            />
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="off"
                              value={editPayoutAcct}
                              onChange={(e) => setEditPayoutAcct(e.target.value)}
                              placeholder="Account no."
                              className="border border-stone-200 rounded-lg px-2.5 py-2 text-xs font-mono bg-white"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={savingPayoutFields}
                            onClick={() => saveInfluencerPayoutFields(inf.id)}
                            className="w-full bg-teal-700 text-white text-xs font-semibold py-2 rounded-lg hover:bg-teal-800 disabled:opacity-60"
                          >
                            {savingPayoutFields ? 'Saving…' : 'Save bank details'}
                          </button>
                        </div>
                      )}
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