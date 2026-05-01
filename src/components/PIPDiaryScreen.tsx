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
  const { goBack, user, showToast, navigateTo, savedAnswers, medProfile } = useAppContext();

  // Map question answers to activity pre-fills
  const Q_TO_ACTIVITY: Record<string, string> = {
    q1: 'food', q2: 'eating', q3: 'therapy', q4: 'washing',
    q5: 'toilet', q6: 'dressing', q7: 'talking', q8: 'reading',
    q9: 'mixing', q10: 'money', q11: 'out', q12: 'moving',
  };

  const ACTIVITY_LABELS: Record<string, string> = {
    food: 'preparing food', eating: 'eating and drinking', therapy: 'managing treatments',
    washing: 'washing and bathing', toilet: 'toilet needs', dressing: 'dressing and undressing',
    talking: 'talking and understanding', reading: 'reading', mixing: 'mixing with other people',
    money: 'managing money', out: 'going out', moving: 'moving around',
  };

  const getAutoNote = (activityId: string): string => {
    const qId = Object.entries(Q_TO_ACTIVITY).find(([, aid]) => aid === activityId)?.[0];
    if (!qId || !savedAnswers[qId]) return '';
    const answer = savedAnswers[qId].replace(/<[^>]*>/g, '').trim();
    if (!answer || answer.startsWith('Descriptor')) return '';
    return answer;
  };
  const [weeks, setWeeks] = useState<WeekEntry[]>([emptyWeek()]);
  const [currentWeekId, setCurrentWeekId] = useState<string>('');
  const [expandedCell, setExpandedCell] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [improvingCell, setImprovingCell] = useState<string | null>(null);
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

  // Auto-populate cells from saved answers if empty
  const getNoteOrAuto = (day: string, activityId: string): string => {
    return currentWeek?.notes[day]?.[activityId] ?? '';
  };

  const getDisplayNote = (day: string, activityId: string): string => {
    const saved = currentWeek?.notes[day]?.[activityId];
    if (saved !== undefined) return saved;
    return getAutoNote(activityId);
  };

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

  const improveNote = async (day: string, activityId: string) => {
    const note = currentWeek?.notes[day]?.[activityId] || getAutoNote(activityId);
    if (!note) return;
    const cellKey = `${day}-${activityId}`;
    setImprovingCell(cellKey);
    const conditions = medProfile.conditions.map((c: any) => c.name).join(', ') || 'not specified';
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Rewrite this PIP diary note to be more effective for a DWP assessor. Make it specific, focus on inability to do the task safely, reliably and repeatedly. Reference the activity: ${ACTIVITY_LABELS[activityId]}. The person has: ${conditions}. Current note: "${note}". Return only the improved note text, no preamble.`,
          medProfile: { conditions: medProfile.conditions, medications: '', notes: '' },
          conversationHistory: [],
        }),
      });
      const data = await response.json();
      if (data.reply) {
        updateNote(day, activityId, data.reply.trim());
      }
    } catch { } finally {
      setImprovingCell(null);
    }
  };

  const redoNote = (day: string, activityId: string) => {
    const auto = getAutoNote(activityId);
    updateNote(day, activityId, auto);
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
          return `<td>${note.replace(/\n/g, '<br/>')}</td>`;
        }).join('');
        return `<tr><td class="day-cell">${day}</td>${cells}</tr>`;
      }).join('');
      return `
        <div class="week">
          <div style="display:flex;justify-content:space-between;border-bottom:2px solid #000;padding-bottom:4px;margin-bottom:8px;">
            <span style="font-size:13px;font-weight:bold;">Weekly diary</span>
            <span style="font-size:11px;">Week of: ${formatWeekLabel(week.weekStart)}</span>
          </div>
          <table>
            <thead><tr>
              <th style="width:55px;">Day</th>
              ${ACTIVITIES.map(a => `<th>${a.label}</th>`).join('')}
            </tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>PIP Weekly Diary</title>
<style>
  body { font-family: Arial, sans-serif; margin: 15mm; color: #000; font-size: 10px; }
  .doc-header { margin-bottom: 14px; border-bottom: 2px solid #000; padding-bottom: 10px; }
  .doc-header h1 { font-size: 18px; font-weight: bold; margin: 0 0 10px 0; }
  .field-row { display: flex; gap: 30px; margin-bottom: 8px; }
  .field { display: flex; align-items: center; gap: 6px; }
  .field label { font-weight: bold; font-size: 10px; white-space: nowrap; }
  .field .line { border-bottom: 1px solid #000; min-width: 160px; height: 16px; }
  .instructions { font-size: 10px; margin-bottom: 14px; line-height: 1.5; }
  .week { margin-bottom: 20px; page-break-before: always; }
  .week:first-child { page-break-before: avoid; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  th { border: 1px solid #000; padding: 4px 3px; text-align: left; font-size: 9px; font-weight: bold; vertical-align: top; word-wrap: break-word; }
  td { border: 1px solid #000; padding: 3px; vertical-align: top; height: 72px; font-size: 9px; word-wrap: break-word; }
  td.day-cell { font-weight: bold; width: 55px; }
  @media print {
    body { margin: 10mm; }
    .week { page-break-before: always; }
    .week:first-child { page-break-before: avoid; }
  }
</style>
</head>
<body>
<div class="doc-header">
  <h1>PIP Weekly Diary</h1>
  <div class="field-row">
    <div class="field"><label>Full name:</label><div class="line"></div></div>
    <div class="field"><label>National Insurance number:</label><div class="line" style="min-width:130px"></div></div>
  </div>
  <div class="field-row">
    <div class="field"><label>Date of birth:</label><div class="line" style="min-width:100px"></div></div>
    <div class="field"><label>PIP reference (if known):</label><div class="line" style="min-width:130px"></div></div>
  </div>
</div>
<p class="instructions">Use this diary to record how your condition affects you each day. For each activity describe what happened — whether you could do it safely, if you needed help, or if you used any aids. Focus on your worst days. This diary can be submitted as supporting evidence with your PIP claim.</p>
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
                      <div className="absolute z-20 top-0 left-0 w-72 bg-white shadow-xl border border-teal-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 bg-teal-50 border-b border-teal-100">
                          <p className="text-[10px] font-bold text-teal-800">{day} — {act.label}</p>
                          <button onClick={() => setExpandedCell(null)} className="text-[10px] text-teal-600 font-medium">Done</button>
                        </div>
                        <textarea
                          autoFocus
                          value={getDisplayNote(day, act.id)}
                          onChange={e => updateNote(day, act.id, e.target.value)}
                          placeholder="Describe what happened today. Include whether you could do this safely, if you needed help, or used any aids."
                          className="w-full p-3 text-xs text-stone-700 resize-none focus:outline-none min-h-[100px]"
                          rows={4}
                        />
                        <div className="flex gap-1.5 px-3 py-2 border-t border-stone-100">
                          <button
                            onClick={() => improveNote(day, act.id)}
                            disabled={improvingCell === cellKey}
                            className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-700 py-1.5 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                          >
                            {improvingCell === cellKey ? '✨ Improving...' : '✨ Improve'}
                          </button>
                          <button
                            onClick={() => redoNote(day, act.id)}
                            className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold bg-stone-50 text-stone-600 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                          >
                            ↩ Reset
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setExpandedCell(isExpanded ? null : cellKey)}
                        className="w-full h-full min-h-[52px] px-1.5 py-1.5 text-left hover:bg-teal-50 transition-colors"
                      >
                        {getDisplayNote(day, act.id) ? (
                          <p className={`text-[10px] leading-relaxed line-clamp-3 ${currentWeek?.notes[day]?.[act.id] ? 'text-stone-700' : 'text-stone-400 italic'}`}>
                            {getDisplayNote(day, act.id)}
                          </p>
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