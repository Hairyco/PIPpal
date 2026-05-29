import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Lock,
  Loader2,
  Save,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useAppContext } from './AppContext';
import { supabase } from '../supabaseClient';
import { PIP_QUESTIONS } from '../pipQuestions';
import { formatFullAccessPrice } from '../constants/pricing';

const ACTIVITIES = [
  { id: 'food', label: 'Preparing food', qId: 'q1' },
  { id: 'eating', label: 'Eating and drinking', qId: 'q2' },
  { id: 'therapy', label: 'Managing treatments', qId: 'q3' },
  { id: 'washing', label: 'Washing and bathing', qId: 'q4' },
  { id: 'toilet', label: 'Managing toilet needs', qId: 'q5' },
  { id: 'dressing', label: 'Dressing and undressing', qId: 'q6' },
  { id: 'talking', label: 'Talking, listening and understanding', qId: 'q7' },
  { id: 'reading', label: 'Reading', qId: 'q8' },
  { id: 'mixing', label: 'Mixing with other people', qId: 'q9' },
  { id: 'money', label: 'Making decisions about money', qId: 'q10' },
  { id: 'out', label: 'Going out', qId: 'q11' },
  { id: 'moving', label: 'Moving around', qId: 'q12' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface WeekEntry {
  id: string;
  weekStart: string;
  notes: Record<string, Record<string, string>>;
}

const getMonday = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
};

const emptyWeek = (): WeekEntry => ({
  id: Date.now().toString(),
  weekStart: getMonday(),
  notes: {},
});

const PIP_DIARY_MARKETING_WEEK_ID = 'pip-diary-market-week';

/** Dev-only: sample week for marketing capture (`/?screenshot=pip_diary`). */
function readPipDiaryMarketingSeed(): WeekEntry | null {
  if (!import.meta.env.DEV) return null;
  try {
    if (new URLSearchParams(window.location.search).get('screenshot') !== 'pip_diary') return null;
  } catch {
    return null;
  }
  return {
    id: PIP_DIARY_MARKETING_WEEK_ID,
    weekStart: getMonday(),
    notes: {
      Monday: {
        food:
          'Bad day: only managed a few minutes at the hob before pain forced me to sit. Partner finished the meal — microwave soup later.',
        eating:
          'Tremor with a full mug; breakfast took well over 45 minutes with lots of breaks.',
        washing: 'Used the shower stool; felt dizzy stepping out — had to lie down twenty minutes before I could dress.',
      },
      Tuesday: {
        food: 'No energy to cook — cereal only. Partner made cups of tea all day.',
      },
    },
  };
}

/** First render only — aligns weeks, current week selection, and an expanded activity for hero capture. */
function initDiaryScreenshotState(): {
  weeks: WeekEntry[];
  currentWeekId: string;
  expandedActivity: string | null;
} {
  const seed = readPipDiaryMarketingSeed();
  if (!seed)
    return { weeks: [emptyWeek()], currentWeekId: '', expandedActivity: null };
  return { weeks: [seed], currentWeekId: seed.id, expandedActivity: 'food' };
}

const formatWeekLabel = (weekStart: string) => {
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
};

const getDayDate = (weekStart: string, dayIndex: number) => {
  const d = new Date(weekStart + 'T00:00:00');
  d.setDate(d.getDate() + dayIndex);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

function mergeDayNotes(
  target: Record<string, string>,
  source: Record<string, string>,
) {
  for (const [key, value] of Object.entries(source)) {
    if (value && (!target[key] || value.length > (target[key]?.length ?? 0))) {
      target[key] = value;
    }
  }
}

function mergeWeekNotes(
  target: Record<string, Record<string, string>>,
  source: Record<string, Record<string, string>>,
) {
  for (const [day, activities] of Object.entries(source)) {
    if (!target[day]) target[day] = {};
    mergeDayNotes(target[day], activities);
  }
}

/** One row per Monday — newest weeks first in the picker. */
function dedupeAndSortWeeks(entries: WeekEntry[], createdAtById?: Map<string, string>): WeekEntry[] {
  const byWeekStart = new Map<string, WeekEntry>();

  for (const entry of entries) {
    const existing = byWeekStart.get(entry.weekStart);
    if (!existing) {
      byWeekStart.set(entry.weekStart, {
        id: entry.id,
        weekStart: entry.weekStart,
        notes: JSON.parse(JSON.stringify(entry.notes || {})),
      });
      continue;
    }

    mergeWeekNotes(existing.notes, entry.notes);

    const existingTs = createdAtById?.get(existing.id) ?? '';
    const entryTs = createdAtById?.get(entry.id) ?? '';
    const preferEntry =
      entryTs > existingTs ||
      (/^[0-9a-f-]{36}$/i.test(entry.id) && !/^[0-9a-f-]{36}$/i.test(existing.id));

    if (preferEntry) existing.id = entry.id;
  }

  return [...byWeekStart.values()].sort(
    (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime(),
  );
}

const escapeHtml = (value: string) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export function PIPDiaryScreen({ hasPaid = false }: { hasPaid?: boolean }) {
  const { goBack, user, showToast, navigateTo, savedAnswers, medProfile } = useAppContext();
  const [boot] = useState(() => initDiaryScreenshotState());
  const [weeks, setWeeks] = useState<WeekEntry[]>(() => boot.weeks);
  const [currentWeekId, setCurrentWeekId] = useState(() => boot.currentWeekId);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(() => boot.expandedActivity);
  const [showDescPanel, setShowDescPanel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [improvingCell, setImprovingCell] = useState<string | null>(null);
  const [showWeekPicker, setShowWeekPicker] = useState(false);

  useEffect(() => {
    if (readPipDiaryMarketingSeed()) return;
    if (!user?.id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('diary_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false });
        if (data && data.length > 0) {
          const createdAtById = new Map<string, string>(
            data.map((row: { id: string; created_at?: string }) => [row.id, row.created_at ?? '']),
          );
          const loaded: WeekEntry[] = data.map((row: { id: string; date: string; content?: { notes?: WeekEntry['notes'] } }) => ({
            id: row.id,
            weekStart: row.date,
            notes: row.content?.notes ?? {},
          }));
          const normalized = dedupeAndSortWeeks(loaded, createdAtById);
          setWeeks(normalized);
          setCurrentWeekId(normalized[0]?.id ?? '');
        } else {
          const w = emptyWeek();
          setWeeks([w]);
          setCurrentWeekId(w.id);
        }
      } catch {
        void 0;
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const currentWeek = weeks.find(w => w.id === currentWeekId) || weeks[0];
  const currentDay = DAYS[currentDayIndex];

  const getNote = (activityId: string) =>
    currentWeek?.notes[currentDay]?.[activityId] ?? '';

  const getAutoNote = (qId: string) => {
    if (!qId || !savedAnswers[qId]) return '';
    const answer = savedAnswers[qId].replace(/<[^>]*>/g, '').trim();
    if (!answer || answer.startsWith('Descriptor')) return '';
    return answer;
  };

  const getDisplayNote = (activityId: string, qId: string) => {
    const saved = currentWeek?.notes[currentDay]?.[activityId];
    if (saved !== undefined) return saved;
    return getAutoNote(qId);
  };

  const updateNote = (activityId: string, value: string) => {
    setWeeks(prev => prev.map(w => {
      if (w.id !== currentWeek?.id) return w;
      return {
        ...w,
        notes: {
          ...w.notes,
          [currentDay]: { ...(w.notes[currentDay] || {}), [activityId]: value },
        },
      };
    }));
  };

  const getDescriptors = (qId: string) => {
    const q = PIP_QUESTIONS.find(q => q.id === qId);
    return q?.descriptors?.filter((d: any) => d.points > 0) || [];
  };

  const improveNote = async (activityId: string, qId: string) => {
    const note = getDisplayNote(activityId, qId);
    if (!note) return;
    setImprovingCell(activityId);
    const conditions = medProfile.conditions.map((c: any) => c.name).join(', ') || 'not specified';
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Rewrite this PIP diary note to be more effective for a DWP assessor. Make it specific, focus on inability to do the task safely, reliably and repeatedly. The activity is: ${ACTIVITIES.find(a => a.id === activityId)?.label}. The person has: ${conditions}. Current note: "${note}". Return only the improved note, no preamble.`,
          medProfile: { conditions: medProfile.conditions, medications: '', notes: '' },
          conversationHistory: [],
        }),
      });
      const data = await response.json();
      if (data.reply) updateNote(activityId, data.reply.trim());
    } catch {
      void 0;
    } finally {
      setImprovingCell(null);
    }
  };

  const saveWeek = async () => {
    if (!user?.id || !currentWeek) return;
    setIsSaving(true);
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(currentWeek.id);
      if (isUUID) {
        await supabase
          .from('diary_entries')
          .update({ date: currentWeek.weekStart, content: { notes: currentWeek.notes } })
          .eq('id', currentWeek.id)
          .eq('user_id', user.id);
      } else {
        const { data: existing } = await supabase
          .from('diary_entries')
          .select('id')
          .eq('user_id', user.id)
          .eq('date', currentWeek.weekStart)
          .maybeSingle();

        if (existing?.id) {
          await supabase
            .from('diary_entries')
            .update({ content: { notes: currentWeek.notes } })
            .eq('id', existing.id)
            .eq('user_id', user.id);
          setWeeks((prev) => {
            const merged = prev.map((w) =>
              w.id === currentWeek.id ? { ...w, id: existing.id } : w,
            );
            return dedupeAndSortWeeks(merged);
          });
          setCurrentWeekId(existing.id);
        } else {
          const { data } = await supabase
            .from('diary_entries')
            .insert({
              user_id: user.id,
              date: currentWeek.weekStart,
              content: { notes: currentWeek.notes },
              mood: '',
            })
            .select()
            .single();
          if (data) {
            setWeeks((prev) =>
              dedupeAndSortWeeks(
                prev.map((w) => (w.id === currentWeek.id ? { ...w, id: data.id } : w)),
              ),
            );
            setCurrentWeekId(data.id);
          }
        }
      }
      showToast('Diary saved!', 'success');
    } catch {
      showToast('Saved locally.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const addNewWeek = () => {
    const monday = getMonday();
    const existing = weeks.find((w) => w.weekStart === monday);
    if (existing) {
      setCurrentWeekId(existing.id);
      setCurrentDayIndex(0);
      setShowWeekPicker(false);
      showToast('This week is already in your diary.', 'info');
      return;
    }
    const w = emptyWeek();
    setWeeks((prev) => dedupeAndSortWeeks([w, ...prev]));
    setCurrentWeekId(w.id);
    setCurrentDayIndex(0);
    setShowWeekPicker(false);
  };

  const getExportNote = (week: WeekEntry, day: string, activityId: string, qId: string) => {
    const saved = week.notes[day]?.[activityId];
    if (saved !== undefined) return saved;
    return getAutoNote(qId);
  };

  const exportDiary = () => {
    const sortedWeeks = [...weeks].sort(
      (a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime(),
    );
    const weeksHtml = sortedWeeks.map(week => {
      const daysHtml = DAYS.map((day, di) => {
        const date = getDayDate(week.weekStart, di);
        const rowsHtml = ACTIVITIES.map(act => {
          const note = getExportNote(week, day, act.id, act.qId);
          return `<tr>
            <td class="act-cell"><strong>${escapeHtml(act.label)}</strong></td>
            <td class="note-cell">${escapeHtml(note).replace(/\n/g, '<br/>')}</td>
          </tr>`;
        }).join('');
        return `<div class="day-section">
          <div class="day-header">
            <span class="day-name">${day}</span>
            <span class="day-date">${date}</span>
          </div>
          <table>
            <thead><tr><th class="act-header">Activity</th><th>What happened</th></tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>`;
      }).join('');
      return `<div class="week-section">
        <div class="week-label">Week of ${formatWeekLabel(week.weekStart)}</div>
        ${daysHtml}
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
  .instructions { font-size: 10px; margin-bottom: 14px; line-height: 1.5; border-bottom: 1px solid #000; padding-bottom: 8px; }
  .week-section { margin-bottom: 20px; }
  .week-label { font-size: 12px; font-weight: bold; margin-bottom: 10px; background: #f5f5f5; padding: 4px 8px; border: 1px solid #000; }
  .day-section { margin-bottom: 16px; page-break-inside: avoid; }
  .day-header { display: flex; justify-content: space-between; border: 1px solid #000; background: #fff; padding: 5px 8px; font-weight: bold; font-size: 11px; }
  .day-date { font-weight: normal; font-size: 10px; }
  table { width: 100%; border-collapse: collapse; margin-top: 0; }
  th { border: 1px solid #000; border-top: none; padding: 4px 6px; text-align: left; font-size: 10px; font-weight: bold; background: #fff; }
  th.act-header { width: 35%; }
  td { border: 1px solid #000; padding: 4px 6px; vertical-align: top; font-size: 10px; }
  td.act-cell { width: 35%; font-weight: bold; background: #fff; }
  td.note-cell { min-height: 30px; height: 40px; }
  @media print {
    body { margin: 10mm; }
    .day-section { page-break-inside: avoid; }
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

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `PIP-Weekly-Diary-${new Date().toISOString().slice(0, 10)}.html`;
      link.click();
      showToast('Export downloaded — open the file to print or save as PDF.', 'info');
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  if (!hasPaid) {
    return (
      <div className="flex flex-col h-full bg-stone-50">
        <div className="px-5 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
          <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="font-bold text-stone-900 text-lg">PIP Diary</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center"><Lock className="w-8 h-8 text-teal-600" /></div>
          <div>
            <h2 className="font-bold text-stone-900 text-lg mb-2">Full Access required</h2>
            <p className="text-sm text-stone-500 leading-relaxed">The PIP Diary is available to Full Access users. Unlock for {formatFullAccessPrice()} one-time.</p>
          </div>
          <button onClick={() => navigateTo('upsell')} className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm">Unlock Full Access — {formatFullAccessPrice()}</button>
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
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-stone-900 text-base">PIP Diary</h1>
          <button onClick={() => setShowWeekPicker(!showWeekPicker)} className="text-xs text-teal-600 font-medium hover:text-teal-800 transition-colors">
            {currentWeek ? formatWeekLabel(currentWeek.weekStart) : 'Select week'} ▾
          </button>
        </div>
        <button onClick={exportDiary} className="text-xs font-semibold text-stone-500 hover:text-teal-700 transition-colors flex items-center gap-1"><Download className="w-3.5 h-3.5" />Export</button>
        <button onClick={saveWeek} disabled={isSaving} className="flex items-center gap-1.5 bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-teal-800 transition-colors disabled:opacity-60">
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Week picker dropdown */}
      {showWeekPicker && (
        <div className="bg-white border-b border-stone-200 px-5 py-3 space-y-1 shadow-sm">
          {weeks.map(w => (
            <button key={w.id} onClick={() => { setCurrentWeekId(w.id); setCurrentDayIndex(0); setShowWeekPicker(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${currentWeekId === w.id ? 'bg-teal-50 text-teal-700' : 'text-stone-600 hover:bg-stone-50'}`}>
              {formatWeekLabel(w.weekStart)}
            </button>
          ))}
          <button onClick={addNewWeek} className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-teal-700 hover:bg-teal-50 transition-colors flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />New week
          </button>
        </div>
      )}

      {/* What is the PIP Diary banner */}
      <div className="px-5 py-3 bg-teal-50 border-b border-teal-100">
        <p className="text-xs text-teal-800 leading-relaxed">
          <strong>What is the PIP Diary?</strong> Record how your condition affects you each day. These daily entries are powerful evidence for your assessment — they show the DWP what your life is really like. Fill it in regularly, focusing on your worst days.
        </p>
      </div>

      {/* Day navigation */}
      <div className="bg-white border-b border-stone-100 px-5 py-3 flex items-center justify-between">
        <button onClick={() => setCurrentDayIndex(i => Math.max(0, i - 1))} disabled={currentDayIndex === 0}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 disabled:opacity-30 transition-all">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="font-bold text-stone-900 text-sm">{currentDay}</p>
          <p className="text-xs text-stone-400">{currentWeek ? getDayDate(currentWeek.weekStart, currentDayIndex) : ''}</p>
        </div>
        <button onClick={() => setCurrentDayIndex(i => Math.min(6, i + 1))} disabled={currentDayIndex === 6}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 disabled:opacity-30 transition-all">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day dots */}
      <div className="flex justify-center gap-1.5 py-2 bg-white border-b border-stone-100">
        {DAYS.map((day, i) => {
          const hasContent = currentWeek && Object.keys(currentWeek.notes[day] || {}).some(k => currentWeek.notes[day][k]);
          return (
            <button key={day} onClick={() => setCurrentDayIndex(i)}
              className={`w-6 h-6 rounded-full text-[9px] font-bold transition-colors ${i === currentDayIndex ? 'bg-teal-700 text-white' : hasContent ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
              {day.charAt(0)}
            </button>
          );
        })}
      </div>

      {/* Activities list — vertical */}
      <div className="flex-1 overflow-y-auto pb-10">
        <div className="px-5 py-4 space-y-3">
          {ACTIVITIES.map(act => {
            const note = getDisplayNote(act.id, act.qId);
            const isAuto = !currentWeek?.notes[currentDay]?.[act.id] && !!getAutoNote(act.qId);
            const isExpanded = expandedActivity === act.id;
            const descriptors = getDescriptors(act.qId);
            const showDesc = showDescPanel === act.id;

            // Check if note matches any descriptor
            const matchedDesc = note.length > 15 ? descriptors.find(d => {
              const keywords = d.text.toLowerCase().split(' ').filter((w: string) => w.length > 4);
              return keywords.some((k: string) => note.toLowerCase().includes(k));
            }) : null;

            return (
              <div key={act.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                {/* Activity header */}
                <button onClick={() => { setExpandedActivity(isExpanded ? null : act.id); setShowDescPanel(null); }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${note ? 'bg-emerald-500' : 'bg-stone-200'}`} />
                    <p className="text-sm font-semibold text-stone-900 text-left">{act.label}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {note && !isExpanded && <p className="text-[10px] text-stone-400 max-w-[100px] truncate">{note}</p>}
                    <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t border-stone-100">
                    {/* Descriptor toggle */}
                    <button onClick={() => setShowDescPanel(showDesc ? null : act.id)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-amber-50 hover:bg-amber-100 transition-colors">
                      <p className="text-[11px] font-bold text-amber-800">📋 What scores points for this activity</p>
                      <span className="text-[10px] text-amber-600">{showDesc ? '▲ Hide' : '▼ Show'}</span>
                    </button>

                    {showDesc && (
                      <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 space-y-2">
                        {descriptors.map((d: any) => (
                          <div key={d.code} className="flex items-start gap-2">
                            <span className="text-[10px] font-black text-amber-700 w-5 shrink-0 pt-0.5">{d.points}pt</span>
                            <p className="text-[11px] text-amber-900 leading-relaxed">{d.text}</p>
                          </div>
                        ))}
                        <p className="text-[10px] text-amber-600 pt-1 leading-relaxed border-t border-amber-200 mt-2">Write about which of the above applies to you. Describe real examples from your worst days.</p>
                      </div>
                    )}

                    {/* Text area */}
                    <div className="px-4 pt-3 pb-2">
                      {isAuto && (
                        <p className="text-[10px] text-stone-400 mb-1.5 italic">Pre-filled from your answers — tap to edit</p>
                      )}
                      <textarea
                        value={note}
                        onChange={e => updateNote(act.id, e.target.value)}
                        placeholder="What happened today? Could you do this safely? Did you need help or use any aids? Focus on your worst days."
                        className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[90px]"
                        rows={4}
                      />
                    </div>

                    {/* Why it qualifies */}
                    {note.length > 20 && (
                      <div className="mx-4 mb-3 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] font-bold text-emerald-800 mb-1">Why this could support your claim</p>
                        {matchedDesc ? (
                          <p className="text-[11px] text-emerald-700 leading-relaxed">
                            This suggests you may meet: <strong>{matchedDesc.text}</strong> — worth <strong>{matchedDesc.points} points</strong>.
                          </p>
                        ) : (
                          <p className="text-[11px] text-emerald-600 leading-relaxed">Keep adding detail — mention whether you needed help, used aids, or could not do this safely or reliably.</p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 px-4 pb-3">
                      <button onClick={() => improveNote(act.id, act.qId)} disabled={improvingCell === act.id || !note}
                        className="flex-1 text-[11px] font-bold bg-purple-50 text-purple-700 py-2 rounded-xl hover:bg-purple-100 transition-colors disabled:opacity-40">
                        {improvingCell === act.id ? '✨ Improving...' : '✨ Improve with PIPpal'}
                      </button>
                      <button onClick={() => updateNote(act.id, getAutoNote(act.qId))}
                        className="flex-1 text-[11px] font-bold bg-stone-50 text-stone-600 py-2 rounded-xl hover:bg-stone-100 transition-colors">
                        ↩ Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}