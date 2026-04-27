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
} from 'lucide-react';
import { useAppContext } from './AppContext';
import { supabase } from '../supabaseClient';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

interface Stats {
  totalUsers: number;
  paidUsers: number;
  freeUsers: number;
  conversionRate: number;
  todaySignups: number;
  weekSignups: number;
  monthSignups: number;
  totalDiaryEntries: number;
  recentUsers: { name: string; email: string; has_paid: boolean; created_at: string }[];
}

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
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const isAdmin = user?.email === ADMIN_EMAIL;

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Paid users
      const { count: paidUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('has_paid', true);

      // Today signups
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todaySignups } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // This week signups
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: weekSignups } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      // This month signups
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const { count: monthSignups } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthAgo.toISOString());

      // Total diary entries
      const { count: totalDiaryEntries } = await supabase
        .from('diary_entries')
        .select('*', { count: 'exact', head: true });

      // Recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('name, email, has_paid, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

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
        recentUsers: recentUsers || [],
      });
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadStats();
    else setIsLoading(false);
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

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">Admin Dashboard</h1>
        <button
          onClick={loadStats}
          disabled={isLoading}
          className="ml-auto w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      ) : stats ? (
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 md:px-8 py-6 space-y-6 pb-10">

          {/* Last refresh */}
          <p className="text-xs text-stone-400 text-right">
            Last updated: {lastRefresh.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </p>

          {/* Key stats */}
          <section>
            <h2 className="text-sm font-bold text-stone-900 mb-3">Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-teal-600" />
              <StatCard icon={CreditCard} label="Paid Users" value={stats.paidUsers} sub={`£${(stats.paidUsers * 12.99).toFixed(2)} revenue`} color="bg-emerald-600" />
              <StatCard icon={UserX} label="Free Users" value={stats.freeUsers} color="bg-stone-500" />
              <StatCard icon={TrendingUp} label="Conversion Rate" value={`${stats.conversionRate}%`} sub="Free → Paid" color="bg-amber-500" />
            </div>
          </section>

          {/* Signups */}
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

          {/* Revenue summary */}
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

          {/* Recent signups */}
          <section>
            <h2 className="text-sm font-bold text-stone-900 mb-3">Recent Signups</h2>
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              {stats.recentUsers.length === 0 ? (
                <p className="text-sm text-stone-500 p-4 text-center">No users yet</p>
              ) : (
                <div className="divide-y divide-stone-100">
                  {stats.recentUsers.map((u, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center font-bold text-teal-700 text-sm shrink-0">
                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">{u.name || 'Unknown'}</p>
                        <p className="text-xs text-stone-400 truncate">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
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

        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500 text-sm">Failed to load stats. Try refreshing.</p>
        </div>
      )}
    </div>
  );
}