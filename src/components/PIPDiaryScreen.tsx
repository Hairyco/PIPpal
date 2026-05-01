import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Lock,
  Calendar,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Loader2,
  Save,
  BookOpen,
  Download,
} from 'lucide-react';
import { useAppContext } from './AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

interface DiaryEntry {
  id: string;
  date: string;
  tasks: string[];
  tasksNotes: string;
  help: string[];
  helpNotes: string;
  aids: string[];
  aidsNotes: string;
  mood: string;
  energy: string;
  other: string;
}

const TASK_OPTIONS = [
  'Preparing food', 'Eating/drinking', 'Managing medication', 'Washing/bathing',
  'Toilet needs', 'Getting dressed', 'Communicating', 'Reading/understanding',
  'Socialising', 'Budgeting/money', 'Planning journeys', 'Moving around/walking',
  'Concentrating', 'Sleeping', 'Housework', 'Shopping',
];

const HELP_OPTIONS = [
  'Cooking for me', 'Washing/bathing help', 'Getting dressed', 'Reminders to eat',
  'Reminders for medication', 'Emotional support', 'Physical support', 'Supervision',
  'Prompting to do tasks', 'Help getting out', 'Help with money/bills',
];

const AIDS_OPTIONS = [
  'Walking stick', 'Wheelchair', 'Perching stool', 'Grab rails', 'Adapted utensils',
  'Shower seat', 'Microwave only', 'Stairlift', 'Hearing aid', 'Magnifier',
  'Memory aids/alarms', 'None today',
];

const MOOD_OPTIONS = ['😢 Very low', '😔 Low', '😐 Okay', '🙂 Good'];
const ENERGY_OPTIONS = ['⚡ Exhausted', '🔋 Very tired', '🔋 Low energy', '✅ Manageable'];

const emptyEntry = (): DiaryEntry => ({
  id: Date.now().toString(),
  date: new Date().toISOString().split('T')[0],
  tasks: [],
  tasksNotes: '',
  help: [],
  helpNotes: '',
  aids: [],
  aidsNotes: '',
  mood: '',
  energy: '',
  other: '',
});

export function PIPDiaryScreen({ hasPaid = false }: { hasPaid?: boolean }) {
  const { goBack, user, showToast, navigateTo } = useAppContext();
  const [savedEntries, setSavedEntries] = useState<DiaryEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<DiaryEntry>(emptyEntry());
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [improvingId, setImprovingId] = useState<string | null>(null);
  const [improvedSummaries, setImprovedSummaries] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [view, setView] = useState<'new' | 'entries'>('new');

  useEffect(() => {
    if (!user?.id) return;
    const loadEntries = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('diary_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (data && !error && data.length > 0) {
          const loaded: DiaryEntry[] = data.map((row: any) => ({
            id: row.id,
            date: row.date,
            tasks: row.content?.tasks ?? [],
            tasksNotes: row.content?.tasksNotes ?? '',
            help: row.content?.help ?? [],
            helpNotes: row.content?.helpNotes ?? '',
            aids: row.content?.aids ?? [],
            aidsNotes: row.content?.aidsNotes ?? '',
            mood: row.content?.mood ?? '',
            energy: row.content?.energy ?? '',
            other: row.content?.other ?? '',
          }));
          setSavedEntries(loaded);
          if (loaded.length > 0) setView('entries');
        }
      } catch { } finally {
        setIsLoading(false);
      }
    };
    loadEntries();
  }, [user?.id]);

  const saveEntry = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const content = {
        tasks: currentEntry.tasks,
        tasksNotes: currentEntry.tasksNotes,
        help: currentEntry.help,
        helpNotes: currentEntry.helpNotes,
        aids: currentEntry.aids,
        aidsNotes: currentEntry.aidsNotes,
        mood: currentEntry.mood,
        energy: currentEntry.energy,
        other: currentEntry.other,
      };
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(currentEntry.id);
      if (isUUID) {
        await supabase.from('diary_entries').update({ date: currentEntry.date, content, mood: currentEntry.mood }).eq('id', currentEntry.id).eq('user_id', user.id);
        setSavedEntries(prev => prev.map(e => e.id === currentEntry.id ? currentEntry : e));
      } else {
        const { data } = await supabase.from('diary_entries').insert({ user_id: user.id, date: currentEntry.date, content, mood: currentEntry.mood }).select().single();
        if (data) {
          const saved = { ...currentEntry, id: data.id };
          setSavedEntries(prev => [saved, ...prev]);
          setCurrentEntry(emptyEntry());
          setView('entries');
        }
      }
      setLastSaved(new Date());
      showToast('Diary entry saved!', 'success');
    } catch {
      showToast('Saved locally — will sync when connection is restored.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(id);
    if (isUUID && user?.id) {
      await supabase.from('diary_entries').delete().eq('id', id).eq('user_id', user.id);
    }
    setSavedEntries(prev => prev.filter(e => e.id !== id));
    showToast('Entry deleted.', 'info');
  };

  const updateCurrent = (field: keyof DiaryEntry, value: any) => {
    setCurrentEntry(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'tasks' | 'help' | 'aids', item: string) => {
    setCurrentEntry(prev => {
      const arr = prev[field];
      return { ...prev, [field]: arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item] };
    });
  };

  const toggleNote = (field: string) => {
    setExpandedNotes(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const formatList = (items: string[]): string => {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
  };

  const generateSummary = (entry: DiaryEntry): string => {
    const parts: string[] = [];
    const dateStr = entry.date ? new Date(entry.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'today';
    parts.push(`On ${dateStr}:`);
    if (entry.tasks.length > 0) { parts.push(`I struggled with ${formatList(entry.tasks)}.`); if (entry.tasksNotes) parts.push(entry.tasksNotes.trim()); }
    if (entry.help.length > 0) { parts.push(`I needed help with ${formatList(entry.help.map(h => h.toLowerCase()))}.`); if (entry.helpNotes) parts.push(entry.helpNotes.trim()); }
    if (entry.aids.length > 0) {
      if (entry.aids.includes('None today') && entry.aids.length === 1) parts.push('I did not use any aids today.');
      else parts.push(`I used ${formatList(entry.aids.filter(a => a !== 'None today').map(a => a.toLowerCase()))}.`);
      if (entry.aidsNotes) parts.push(entry.aidsNotes.trim());
    }
    if (entry.mood) parts.push(`My mood was ${entry.mood.replace(/^[^\s]+\s/, '').toLowerCase()}.`);
    if (entry.energy) parts.push(`My energy level was ${entry.energy.replace(/^[^\s]+\s/, '').toLowerCase()}.`);
    if (entry.other) parts.push(entry.other.trim());
    return parts.join(' ');
  };

  const improveSummary = (entry: DiaryEntry) => {
    setImprovingId(entry.id);
    setTimeout(() => {
      const parts: string[] = [];
      const dateStr = entry.date ? new Date(entry.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'today';
      parts.push(`On ${dateStr}, my condition was significantly affecting my ability to carry out daily activities.`);
      if (entry.tasks.length > 0) { parts.push(`I struggled with ${formatList(entry.tasks)}. These difficulties meant I could not complete these tasks safely, reliably, repeatedly, or in a reasonable time without assistance.`); if (entry.tasksNotes) parts.push(entry.tasksNotes.trim()); }
      if (entry.help.length > 0) { parts.push(`I required help with ${formatList(entry.help.map(h => h.toLowerCase()))}. Without this support, I would have been unable to manage safely.`); if (entry.helpNotes) parts.push(entry.helpNotes.trim()); }
      if (entry.aids.length > 0) {
        if (entry.aids.includes('None today') && entry.aids.length === 1) parts.push('I did not use any aids today, though I typically rely on them on most days.');
        else parts.push(`I relied on ${formatList(entry.aids.filter(a => a !== 'None today').map(a => a.toLowerCase()))} to manage daily tasks.`);
        if (entry.aidsNotes) parts.push(entry.aidsNotes.trim());
      }
      if (entry.mood) { const m = entry.mood.replace(/^[^\s]+\s/, ''); if (m.toLowerCase().includes('low')) parts.push(`My mood was ${m.toLowerCase()}, which significantly affected my motivation to carry out basic tasks.`); else parts.push(`My mood was ${m.toLowerCase()}.`); }
      if (entry.energy) { const e = entry.energy.replace(/^[^\s]+\s/, ''); if (e.toLowerCase().includes('exhausted') || e.toLowerCase().includes('tired')) parts.push(`My energy level was ${e.toLowerCase()}. The fatigue was debilitating and I needed to rest frequently.`); else parts.push(`My energy level was ${e.toLowerCase()}.`); }
      if (entry.other) parts.push(entry.other.trim());
      parts.push('These difficulties are typical of how my condition affects me on a day-to-day basis.');
      setImprovedSummaries(prev => ({ ...prev, [entry.id]: parts.join(' ') }));
      setImprovingId(null);
    }, 1500);
  };

  const getSummaryText = (entry: DiaryEntry): string => improvedSummaries[entry.id] || generateSummary(entry);
  const hasSummaryContent = (entry: DiaryEntry): boolean => entry.tasks.length > 0 || entry.help.length > 0 || entry.aids.length > 0 || entry.mood !== '' || entry.energy !== '' || entry.other !== '';
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); });
  };

  const downloadTemplate = () => {
    const entriesHtml = savedEntries.map(entry => {
      const dateStr = entry.date ? new Date(entry.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'No date';
      const summary = improvedSummaries[entry.id] || generateSummary(entry);
      const hasSummary = hasSummaryContent(entry);
      const sections = [];
      if (entry.tasks.length > 0) sections.push(`<div class="section"><strong>Struggled with:</strong> ${entry.tasks.join(', ')}${entry.tasksNotes ? '<br/><em>' + entry.tasksNotes + '</em>' : ''}</div>`);
      if (entry.help.length > 0) sections.push(`<div class="section"><strong>Needed help with:</strong> ${entry.help.join(', ')}${entry.helpNotes ? '<br/><em>' + entry.helpNotes + '</em>' : ''}</div>`);
      if (entry.aids.length > 0) sections.push(`<div class="section"><strong>Aids used:</strong> ${entry.aids.join(', ')}${entry.aidsNotes ? '<br/><em>' + entry.aidsNotes + '</em>' : ''}</div>`);
      if (entry.mood) sections.push(`<div class="section"><strong>Mood:</strong> ${entry.mood}</div>`);
      if (entry.energy) sections.push(`<div class="section"><strong>Energy:</strong> ${entry.energy}</div>`);
      if (entry.other) sections.push(`<div class="section"><strong>Other notes:</strong> ${entry.other}</div>`);
      const summaryHtml = hasSummary ? `<div class="summary"><strong>Diary summary:</strong><br/>${summary}</div>` : '';
      return `<div class="entry"><h3>${dateStr}</h3>${sections.join('')}${summaryHtml}</div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>PIP Diary</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1c1917; }
  h1 { font-size: 22px; border-bottom: 2px solid #0f766e; padding-bottom: 10px; margin-bottom: 6px; }
  .subtitle { font-size: 13px; color: #78716c; margin-bottom: 30px; }
  .entry { border: 1px solid #e7e5e4; border-radius: 8px; padding: 16px; margin-bottom: 20px; page-break-inside: avoid; }
  .entry h3 { font-size: 15px; color: #0f766e; margin: 0 0 12px 0; border-bottom: 1px solid #e7e5e4; padding-bottom: 8px; }
  .section { font-size: 13px; line-height: 1.6; margin-bottom: 8px; }
  .summary { font-size: 13px; line-height: 1.7; margin-top: 12px; padding: 12px; background: #f0fdf4; border-left: 3px solid #0f766e; border-radius: 4px; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
<h1>PIP Diary</h1>
<p class="subtitle">This diary records how my health condition affects my daily life. It is provided as supporting evidence for my PIP claim.</p>
${entriesHtml || '<p>No entries recorded yet.</p>'}
</body>
</html>`;

    // Open in new tab — works on both desktop and mobile including iOS
    const newTab = window.open('', '_blank');
    if (newTab) {
      newTab.document.write(html);
      newTab.document.close();
    }
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
            <p className="text-sm text-stone-500 leading-relaxed">The PIP Diary is available to Full Access users. Unlock it along with all PIPpal features for a one-time payment of £12.99.</p>
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
        {lastSaved && <span className="text-[10px] text-stone-400 ml-auto">Saved {lastSaved.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>}
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-stone-100">
        <button onClick={() => setView('new')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${view === 'new' ? 'text-teal-700 border-b-2 border-teal-700' : 'text-stone-500'}`}>
          New Entry
        </button>
        <button onClick={() => setView('entries')} className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${view === 'entries' ? 'text-teal-700 border-b-2 border-teal-700' : 'text-stone-500'}`}>
          My Entries
          {savedEntries.length > 0 && <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full">{savedEntries.length}</span>}
        </button>
      </div>

      {/* New Entry Tab */}
      {view === 'new' && (
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 md:px-8 py-6 space-y-6 pb-10">

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">Date</label>
            <input type="date" value={currentEntry.date} onChange={(e) => updateCurrent('date', e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
          </div>

          {/* Tasks */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">Tasks you struggled with today</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {TASK_OPTIONS.map(task => {
                const isSelected = currentEntry.tasks.includes(task);
                return <button key={task} onClick={() => toggleArrayItem('tasks', task)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isSelected ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-200'}`}>{task}</button>;
              })}
            </div>
            {!expandedNotes['tasks'] ? (
              <button onClick={() => toggleNote('tasks')} className="text-xs text-emerald-600 font-medium hover:text-emerald-700">+ Add details</button>
            ) : (
              <textarea placeholder="Add details about your struggles..." value={currentEntry.tasksNotes} onChange={(e) => updateCurrent('tasksNotes', e.target.value)} rows={2} className="w-full mt-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" />
            )}
          </div>

          {/* Help */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">Help you needed</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {HELP_OPTIONS.map(help => {
                const isSelected = currentEntry.help.includes(help);
                return <button key={help} onClick={() => toggleArrayItem('help', help)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isSelected ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-200'}`}>{help}</button>;
              })}
            </div>
            {!expandedNotes['help'] ? (
              <button onClick={() => toggleNote('help')} className="text-xs text-emerald-600 font-medium hover:text-emerald-700">+ Add details</button>
            ) : (
              <textarea placeholder="Add details about the help you needed..." value={currentEntry.helpNotes} onChange={(e) => updateCurrent('helpNotes', e.target.value)} rows={2} className="w-full mt-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" />
            )}
          </div>

          {/* Aids */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">Aids or adaptations used</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {AIDS_OPTIONS.map(aid => {
                const isSelected = currentEntry.aids.includes(aid);
                return <button key={aid} onClick={() => toggleArrayItem('aids', aid)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isSelected ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-200'}`}>{aid}</button>;
              })}
            </div>
            {!expandedNotes['aids'] ? (
              <button onClick={() => toggleNote('aids')} className="text-xs text-emerald-600 font-medium hover:text-emerald-700">+ Add details</button>
            ) : (
              <textarea placeholder="Add details about the aids you used..." value={currentEntry.aidsNotes} onChange={(e) => updateCurrent('aidsNotes', e.target.value)} rows={2} className="w-full mt-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" />
            )}
          </div>

          {/* Mood & Energy */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">Mood</label>
              <div className="flex flex-wrap gap-2">
                {MOOD_OPTIONS.map(mood => (
                  <button key={mood} onClick={() => updateCurrent('mood', mood)} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${currentEntry.mood === mood ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-200'}`}>{mood}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">Energy</label>
              <div className="flex flex-wrap gap-2">
                {ENERGY_OPTIONS.map(energy => (
                  <button key={energy} onClick={() => updateCurrent('energy', energy)} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${currentEntry.energy === energy ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-200'}`}>{energy}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Other */}
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1.5">Anything else? (optional)</label>
            <textarea placeholder="Any other details about today..." value={currentEntry.other} onChange={(e) => updateCurrent('other', e.target.value)} rows={2} className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none placeholder:text-stone-400" />
          </div>

          {/* Save button */}
          <button onClick={saveEntry} disabled={isSaving} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-base hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
            {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" />Saving…</> : <><Save className="w-5 h-5" />Save Entry</>}
          </button>

        </div>
      )}

      {/* My Entries Tab */}
      {view === 'entries' && (
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 md:px-8 py-6 space-y-3 pb-10">

          <div className="flex gap-2 mb-4">
            <button onClick={() => { setCurrentEntry(emptyEntry()); setView('new'); }} className="flex-1 bg-white border-2 border-dashed border-emerald-200 text-emerald-700 py-3 rounded-xl font-semibold text-sm hover:bg-emerald-50 hover:border-emerald-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Entry
            </button>
            {savedEntries.length > 0 && (
              <button onClick={downloadTemplate} className="bg-white border border-stone-200 text-stone-600 py-3 px-4 rounded-xl text-sm hover:bg-stone-50 active:scale-[0.98] transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            )}
          </div>

          {savedEntries.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-sm text-stone-400">No entries yet. Start by adding your first day.</p>
            </div>
          ) : (
            savedEntries.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedEntryId(expandedEntryId === entry.id ? null : entry.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-stone-900">
                        {entry.date ? new Date(entry.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'No date'}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {[entry.tasks.length > 0 && `${entry.tasks.length} struggle${entry.tasks.length !== 1 ? 's' : ''}`, entry.mood && entry.mood.replace(/^[^\s]+\s/, '')].filter(Boolean).join(' · ') || 'No details added'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform shrink-0 ${expandedEntryId === entry.id ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {expandedEntryId === entry.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="border-t border-stone-100 p-4 space-y-4">

                        {entry.tasks.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Struggled with</p>
                            <div className="flex flex-wrap gap-1.5">
                              {entry.tasks.map(t => <span key={t} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-full">{t}</span>)}
                            </div>
                            {entry.tasksNotes && <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">{entry.tasksNotes}</p>}
                          </div>
                        )}

                        {entry.help.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Needed help with</p>
                            <div className="flex flex-wrap gap-1.5">
                              {entry.help.map(h => <span key={h} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-full">{h}</span>)}
                            </div>
                            {entry.helpNotes && <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">{entry.helpNotes}</p>}
                          </div>
                        )}

                        {entry.aids.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Aids used</p>
                            <div className="flex flex-wrap gap-1.5">
                              {entry.aids.map(a => <span key={a} className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded-full">{a}</span>)}
                            </div>
                          </div>
                        )}

                        {(entry.mood || entry.energy) && (
                          <div className="flex gap-4">
                            {entry.mood && <div><p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Mood</p><p className="text-xs text-stone-700">{entry.mood}</p></div>}
                            {entry.energy && <div><p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Energy</p><p className="text-xs text-stone-700">{entry.energy}</p></div>}
                          </div>
                        )}

                        {entry.other && (
                          <div>
                            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Other notes</p>
                            <p className="text-xs text-stone-600 leading-relaxed">{entry.other}</p>
                          </div>
                        )}

                        {hasSummaryContent(entry) && (
                          <div className={`rounded-xl p-4 border ${improvedSummaries[entry.id] ? 'bg-purple-50 border-purple-200' : 'bg-emerald-50 border-emerald-200'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className={`text-xs font-bold uppercase tracking-wider ${improvedSummaries[entry.id] ? 'text-purple-800' : 'text-emerald-800'}`}>Diary summary</h4>
                                {improvedSummaries[entry.id] && <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full"><Sparkles className="w-3 h-3" />Improved</span>}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => improveSummary(entry)} disabled={improvingId === entry.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${improvingId === entry.id ? 'bg-stone-100 text-stone-400' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
                                  {improvingId === entry.id ? <><RefreshCw className="w-3 h-3 animate-spin" />Improving...</> : <><Sparkles className="w-3 h-3" />Improve</>}
                                </button>
                                <button onClick={() => handleCopy(entry.id, getSummaryText(entry))} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${copiedId === entry.id ? 'bg-emerald-200 text-emerald-800' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                                  {copiedId === entry.id ? <><Check className="w-3 h-3" />Copied!</> : <><Copy className="w-3 h-3" />Copy</>}
                                </button>
                              </div>
                            </div>
                            <p className={`text-xs leading-relaxed ${improvedSummaries[entry.id] ? 'text-purple-900' : 'text-emerald-900'}`}>{getSummaryText(entry)}</p>
                          </div>
                        )}

                        <button onClick={() => deleteEntry(entry.id)} className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete entry
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}