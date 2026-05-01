import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Lock,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Save,
  Download,
  Plus,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { useAppContext } from './AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

const ACTIVITIES = [
  { id: 'food', label: 'Preparing food' },
  { id: 'eating', label: 'Eating & drinking' },
  { id: 'therapy', label: 'Managing treatments' },
  { id: 'washing', label: 'Washing & bathing' },
  { id: 'toilet', label: 'Toilet needs' },
  { id: 'dressing', label: 'Dressing & undressing' },
  { id: 'talking', label: 'Talking & understanding' },
  { id: 'reading', label: 'Reading' },
  { id: 'mixing', label: 'Mixing with people' },
  { id: 'money', label: 'Managing money' },
  { id: 'out', label: 'Going out' },
  { id: 'moving', label: 'Moving around' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface WeekEntry {
  id: string;
  weekStart: string; // ISO date of Monday
  notes: Record<string, Record<string, string>>; // notes[day][activityId]
}

const emptyWeek = (): WeekEntry => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return {
    id: Date.now().toString(),
    weekStart: monday.toISOString().split('T')[0],
    notes: {},
  };
};

const formatWeekLabel = (weekStart: string) => {
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
};

export function PIPDiaryScreen({ hasPaid = false }: { hasPaid?: boolean }) {
  const { goBack, user, showToast, navigateTo } = useAppContext();
  const [weeks, setWeeks] = useState<WeekEntry[]>([emptyWeek()]);
  const [currentWeekId, setCurrentWeekId] = useState<string>('');
  const [expandedCell, setExpandedCell] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<'diary' | 'entries'>('diary');

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase.from('diary_entries').select('*').eq('user_id', user.id).order('date', { ascending: false });
        if (data && data.length > 0) {
          const loaded: WeekEntry[] = data.map((row: any) => ({
            id: row.id,
            weekStart: row.date,
            notes: row.content?.notes ?? {},
          }));
          setWeeks(loaded);
          setCurrentWeekId(loaded[0].id);
          setView('diary');
        } else {
          const w = emptyWeek();
          setWeeks([w]);
          setCurrentWeekId(w.id);
        }
      } catch { } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const currentWeek = weeks.find(w => w.id === currentWeekId) || weeks[0];

  const updateNote = (day: string, activityId: string, value: string) => {
    setWeeks(prev => prev.map(w => {
      if (w.id !== currentWeek.id) return w;
      return {
        ...w,
        notes: {
          ...w.notes,
          [day]: { ...(w.notes[day] || {}), [activityId]: value },
        },
      };
    }));
  };

  const saveWeek = async () => {
    if (!user?.id || !currentWeek) return;
    setIsSaving(true);
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(currentWeek.id);
      if (isUUID) {
        await supabase.from('diary_entries').update({ date: currentWeek.weekStart, content: { notes: currentWeek.notes } }).eq('id', currentWeek.id).eq('user_id', user.id);
      } else {
        const { data } = await supabase.from('diary_entries').insert({ user_id: user.id, date: currentWeek.weekStart, content: { notes: currentWeek.notes }, mood: '' }).select().single();
        if (data) setWeeks(prev => prev.map(w => w.id === currentWeek.id ? { ...w, id: data.id } : w));
      }
      showToast('Diary saved!', 'success');
    } catch {
      showToast('Saved locally.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const addNewWeek = () => {
    const w = emptyWeek();
    setWeeks(prev => [w, ...prev]);
    setCurrentWeekId(w.id);
    setView('diary');
  };

  const deleteWeek = async (id: string) => {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(id);
    if (isUUID && user?.id) await supabase.from('diary_entries').delete().eq('id', id).eq('user_id', user.id);
    const remaining = weeks.filter(w => w.id !== id);
    if (remaining.length === 0) {
      const w = emptyWeek();
      setWeeks([w]);
      setCurrentWeekId(w.id);
    } else {
      setWeeks(remaining);
      setCurrentWeekId(remaining[0].id);
    }
    showToast('Week deleted.', 'info');
  };

  const exportDiary = () => {
    const weeksHtml = weeks.map(week => {
      const rowsHtml = DAYS.map(day => {
        const cells = ACTIVITIES.map(act => {
          const note = week.notes[day]?.[act.id] || '';
          return `<td>${note}</td>`;
        }).join('');
        return `<tr><td class="day">${day}</td>${cells}</tr>`;
      }).join('');
      return `
        <div class="week">
          <h2>Week of ${formatWeekLabel(week.weekStart)}</h2>
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th>Day</th>
                ${ACTIVITIES.map(a => `<th>${a.label}</th>`).join('')}
              </tr></thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
        </div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>PIP Diary</title>
<style>
  body { font-family: Arial, sans-serif; margin: 30px; color: #1c1917; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .subtitle { font-size: 12px; color: #78716c; margin-bottom: 30px; }
  .week { margin-bottom: 40px; page-break-inside: avoid; }
  .week h2 { font-size: 15px; color: #0f766e; margin-bottom: 10px; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: #f0fdf4; border: 1px solid #d1fae5; padding: 6px 4px; text-align: left; font-size: 10px; min-width: 80px; }
  td { border: 1px solid #e7e5e4; padding: 6px 4px; vertical-align: top; min-height: 50px; min-width: 80px; }
  td.day { background: #f5f5f4; font-weight: bold; font-size: 11px; min-width: 70px; }
  @media print { body { margin: 15px; } .week { page-break-inside: avoid; } }
</style>
</head>
<body>
<h1>PIP Diary</h1>
<p class="subtitle">This diary records how my health condition affects my daily life and is provided as supporting evidence for my PIP claim.</p>
${weeksHtml}
</body>
</html>`;

    const newTab = window.open('', '_blank');
    if (newTab) { newTab.document.write(html); newTab.document.close(); }
  };

  if (!hasPaid) {
    return (
      <div className="flex flex-col h-full bg-stone-50">
        <div className="px-5 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
          <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-stone-900 text-lg">PIP Diary</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-teal-600" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900 text-lg mb-2">Full Access required</h2>
            <p className="text-sm text-stone-500 leading-relaxed">The PIP Diary is available to Full Access users. Unlock it for a one-time payment of £12.99.</p>
          </div>
          <button onClick={() => navigateTo('upsell')} className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm">
            Unlock Full Access — £12.99
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-stone-50 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-stone-500">Loading your diary…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-stone-50">

      {/* Header */}
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">PIP Diary</h1>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={exportDiary} className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-teal-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button onClick={saveWeek} disabled={isSaving} className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60">
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Week selector */}
      <div className="bg-white border-b border-stone-100 px-5 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {weeks.map(w => (
          <button
            key={w.id}
            onClick={() => { setCurrentWeekId(w.id); setView('diary'); }}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${currentWeekId === w.id ? 'bg-teal-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
          >
            {formatWeekLabel(w.weekStart)}
          </button>
        ))}
        <button onClick={addNewWeek} className="shrink-0 flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 transition-colors px-2">
          <Plus className="w-3.5 h-3.5" />
          New week
        </button>
      </div>

      {/* Info banner */}
      <div className="px-5 py-3 bg-teal-50 border-b border-teal-100">
        <p className="text-xs text-teal-700 leading-relaxed">
          Tap any cell to add notes for that day and activity. Focus on your <strong>worst days</strong> — describe what you could not do safely or reliably.
        </p>
      </div>

      {/* Diary grid */}
      <div className="flex-1 overflow-auto pb-10">
        <div className="min-w-[700px]">
          {/* Header row */}
          <div className="grid sticky top-0 z-10 bg-stone-100 border-b border-stone-200" style={{ gridTemplateColumns: '80px repeat(12, 1fr)' }}>
            <div className="px-2 py-2 text-[10px] font-bold text-stone-500 uppercase">Day</div>
            {ACTIVITIES.map(act => (
              <div key={act.id} className="px-1.5 py-2 text-[10px] font-bold text-stone-700 leading-tight border-l border-stone-200">
                {act.label}
              </div>
            ))}
          </div>

          {/* Day rows */}
          {DAYS.map((day, di) => (
            <div
              key={day}
              className={`grid border-b border-stone-200 ${di % 2 === 0 ? 'bg-white' : 'bg-stone-50'}`}
              style={{ gridTemplateColumns: '80px repeat(12, 1fr)' }}
            >
              <div className="px-2 py-3 text-xs font-bold text-stone-700 flex items-start pt-3">{day}</div>
              {ACTIVITIES.map(act => {
                const cellKey = `${day}-${act.id}`;
                const note = currentWeek?.notes[day]?.[act.id] || '';
                const isExpanded = expandedCell === cellKey;
                return (
                  <div key={act.id} className="border-l border-stone-200 relative">
                    {isExpanded ? (
                      <div className="absolute z-20 top-0 left-0 w-64 bg-white shadow-xl border border-teal-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 bg-teal-50 border-b border-teal-100">
                          <p className="text-[10px] font-bold text-teal-800">{day} — {act.label}</p>
                          <button onClick={() => setExpandedCell(null)} className="text-[10px] text-teal-600 font-medium">Done</button>
                        </div>
                        <textarea
                          autoFocus
                          value={note}
                          onChange={e => updateNote(day, act.id, e.target.value)}
                          placeholder="What happened? Describe difficulties, help needed, aids used..."
                          className="w-full p-3 text-xs text-stone-700 resize-none focus:outline-none min-h-[100px]"
                          rows={4}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setExpandedCell(isExpanded ? null : cellKey)}
                        className="w-full h-full min-h-[52px] px-1.5 py-1.5 text-left hover:bg-teal-50 transition-colors"
                      >
                        {note ? (
                          <p className="text-[10px] text-stone-700 leading-relaxed line-clamp-3">{note}</p>
                        ) : (
                          <p className="text-[10px] text-stone-300">Tap to add</p>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}